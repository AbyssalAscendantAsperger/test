const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// === CẤU HÌNH ĐƯỜNG DẪN ===
const JAVA_DIR = path.join(__dirname, '..', 'java');   // Thư mục emulator gốc
const JAR_DIR = path.join(JAVA_DIR, 'jar');
const SAVES_DIR = path.join(__dirname, 'saves');        // Lưu save game theo phiên/user
fs.mkdirSync(SAVES_DIR, { recursive: true });

// === SESSION: mỗi trình duyệt/user 1 sid (cookie) -> 1 file save riêng ===
function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach(c => {
    const parts = c.split('=');
    list[parts[0].trim()] = decodeURIComponent((parts[1] || '').trim());
  });
  return list;
}
// sid chỉ chứa ký tự an toàn để dùng làm tên file (chống path traversal)
function getOrCreateSid(req, res) {
  const cookies = parseCookies(req);
  if (cookies.sid && /^[A-Za-z0-9_-]{8,64}$/.test(cookies.sid)) return cookies.sid;
  const sid = crypto.randomBytes(16).toString('hex'); // 32 hex chars
  res.setHeader('Set-Cookie', `sid=${sid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`);
  return sid;
}
// Áp dụng session cho MỌI request
app.use((req, res, next) => { req.sid = getOrCreateSid(req, res); next(); });

// Middleware: phục vụ Portal (public/)
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ANTI-LEAK JAR ====================
// Mục tiêu: tên file JAR thật KHÔNG BAO GIỜ lộ ra ngoài.
// Trình tự route RẤT QUAN TRỌNG: /emu/jar/* phải bị chặn TRƯỚC static /emu.

// 1) Registry: ánh xạ gameId mờ -> file thật (không lộ tên file)
const gameRegistry = new Map(); // gameId -> { name, file, fullPath }
function buildGameRegistry() {
  if (!fs.existsSync(JAR_DIR)) return;
  const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar'));
  files.forEach((file, idx) => {
    // gameId là hash mờ, KHÔNG chứa tên file thật (chống đoán)
    const gameId = 'g' + crypto.createHash('sha1').update(file + ':' + idx).digest('hex').slice(0, 14);
    const name = file.replace(/\.jar$/i, '').replace(/[_-]+/g, ' ').trim();
    gameRegistry.set(gameId, { name, file, fullPath: path.join(JAR_DIR, file) });
  });
}
buildGameRegistry();

// 2) Token store: token tạm thời (có hạn) -> gameId
//    KHÔNG gắn cookie/sid: XHR trong iframe đôi khi không gửi cookie ->
//    gây 403 -> game kẹt ở "download midlet". Token tự nó (36 ký tự hex, TTL 5 phút)
//    đã đủ khó đoán cho bảo vệ cấp độ cơ bản.
const tokenStore = new Map(); // token -> { gameId, createdAt }
const TOKEN_TTL_MS = 5 * 60 * 1000; // token chỉ sống 5 phút

function issueToken(gameId) {
  const token = crypto.randomBytes(18).toString('hex');
  tokenStore.set(token, { gameId, createdAt: Date.now() });
  return token;
}
function verifyToken(token) {
  const info = tokenStore.get(token);
  if (!info) return null;
  if (Date.now() - info.createdAt > TOKEN_TTL_MS) { tokenStore.delete(token); return null; }
  return info; // trả gameId
}
// Dọn token hết hạn định kỳ
setInterval(() => {
  const now = Date.now();
  for (const [t, info] of tokenStore) if (now - info.createdAt > TOKEN_TTL_MS) tokenStore.delete(t);
}, 60000);

// 3) Endpoint phục vụ JAR duy nhất: /emu/jar/:token
app.get('/emu/jar/:token', (req, res) => {
  const info = verifyToken(req.params.token);
  if (!info) return res.status(403).send('Forbidden');
  const game = gameRegistry.get(info.gameId);
  if (!game || !fs.existsSync(game.fullPath)) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/java-archive');
  res.sendFile(game.fullPath);
});

// 4) Chặn MỌI truy cập khác vào /emu/jar/ (không token = từ chối)
app.use('/emu/jar', (req, res) => res.status(403).send('Forbidden'));

// 5) Phục vụ emulator (các file bld/, libs/, style/, config/...)
//    QUAN TRỌNG: đặt SAU các route /emu/jar/* ở trên -> thư mục jar/ thật không bị static phục vụ trực tiếp
app.use('/emu', express.static(JAVA_DIR));

// Nhận body save dạng text (JSON)
app.use('/api/save', express.text({ type: 'text/plain', limit: '200mb' }));

// API: Lấy danh sách game (chỉ trả gameId mờ + tên hiển thị, KHÔNG trả tên file)
app.get('/api/jars', (req, res) => {
  try {
    const games = [...gameRegistry.entries()].map(([id, g]) => ({ id, name: g.name }));
    games.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Khởi chạy game -> phát token tạm thời, trả URL iframe
app.get('/api/launch', (req, res) => {
  const { id } = req.query;
  if (!id || !gameRegistry.has(id)) return res.status(400).json({ error: 'Game không hợp lệ' });
  const token = issueToken(id);
  const emulatorUrl = `/emu/main.html?jars=jar/${token}`;
  res.json({ success: true, url: emulatorUrl });
});

// API: Tải save của phiên/user hiện tại
app.get('/api/load', (req, res) => {
  const sid = req.sid;
  const file = path.join(SAVES_DIR, sid + '.fs');
  if (!fs.existsSync(file)) return res.status(404).json({ nosave: true });
  const text = fs.readFileSync(file, 'utf8');
  res.type('text/plain').send(text);
});

// API: Lưu save của phiên/user hiện tại
app.post('/api/save', (req, res) => {
  const sid = req.sid;
  const body = req.body || '';
  if (typeof body !== 'string') return res.status(400).json({ error: 'body phải là text' });
  const file = path.join(SAVES_DIR, sid + '.fs');
  fs.writeFileSync(file, body);
  res.json({ ok: true, sid, size: Buffer.byteLength(body) });
});

// Trang chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === KHỞI ĐỘNG SERVER (chỉ 1 server ở port 3000) ===
app.listen(PORT, () => {
  console.log(`✅ J2ME Portal đang chạy tại http://localhost:${PORT}`);
  console.log(`🔒 Anti-leak: ${gameRegistry.size} game đã đăng ký (tên file được ẩn)`);
  console.log(`💾 Save theo phiên/user tại: ${SAVES_DIR}`);
  console.log(`🚀 Chỉ cần gõ: npm start`);
});
