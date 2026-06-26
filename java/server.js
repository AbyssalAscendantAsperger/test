const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

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

// ==================== BẢO MẬT: CORS + HTTPS ENFORCEMENT ====================
// CORS: chỉ cho phép domain cấu hình (mặc định * cho dev localhost).
// Production: set env ALLOWED_ORIGIN=https://jarnova.com
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // HSTS: bắt buộc HTTPS trong 1 năm (chỉ hiệu lực khi đang chạy HTTPS thật)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Middleware: phục vụ Portal (public/)
app.use(express.static(path.join(__dirname, 'public')));

// ==================== TRÍCH XUẤT ICON TỪ JAR ====================
// JAR = file ZIP. Tự viết bộ đọc Central Directory (Node thuần + zlib).
// Không cần cài thêm thư viện ngoài.
function readZipEntries(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let pos = bytes.length - 22;
  while (pos >= 0) {
    if (view.getUint32(pos, true) === 0x06054b50) break;
    pos--;
  }
  if (pos < 0) return null;
  const numEntries = view.getUint16(pos + 10, true);
  let dirOffset = view.getUint32(pos + 16, true);
  const dir = {};
  for (let i = 0; i < numEntries; i++) {
    if (view.getUint32(dirOffset, true) !== 0x02014b50) break;
    const compressionMethod = view.getUint16(dirOffset + 10, true);
    const compressedLen = view.getUint32(dirOffset + 20, true);
    const uncompressedLen = view.getUint32(dirOffset + 24, true);
    const filenameLen = view.getUint16(dirOffset + 28, true);
    const extraLen = view.getUint16(dirOffset + 30, true);
    const commentLen = view.getUint16(dirOffset + 32, true);
    const localHeaderOffset = view.getUint32(dirOffset + 42, true);
    dirOffset += 46;
    let filename = '';
    for (let n = 0; n < filenameLen; n++) filename += String.fromCharCode(bytes[dirOffset + n]);
    dirOffset += filenameLen + extraLen + commentLen;
    if (filename.endsWith('/')) continue; // thư mục
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + filenameLen + localExtraLen;
    dir[filename] = { compressionMethod, data: Buffer.from(buffer, dataOffset, compressedLen), uncompressedLen };
  }
  return dir;
}
function decompressEntry(entry) {
  if (entry.compressionMethod === 0) return entry.data;                  // stored
  if (entry.compressionMethod === 8) return zlib.inflateRawSync(entry.data); // raw deflate (ZIP chuẩn)
  return null;
}
function mimeOf(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.bmp') return 'image/bmp';
  return 'application/octet-stream';
}
// Trích xuất icon: ưu tiên theo MANIFEST, fallback tìm ảnh đầu tiên (ưu tiên tên có "icon")
function extractIcon(jarPath) {
  let buffer;
  try { buffer = fs.readFileSync(jarPath); } catch (e) { return null; }
  const dir = readZipEntries(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  if (!dir) return null;
  // 1) Đọc MANIFEST.MF để tìm icon chính thức
  let iconPath = null;
  const mf = dir['META-INF/MANIFEST.MF'];
  if (mf) {
    try {
      const text = decompressEntry(mf).toString('latin1');
      // MIDlet-Icon: /icon.png
      const m1 = text.match(/MIDlet-Icon\s*:\s*(.+)/i);
      if (m1) iconPath = m1[1].trim();
      // MIDlet-1: Tên, /icon.png, Class  (lấy field thứ 2)
      if (!iconPath) {
        const m2 = text.match(/MIDlet-\d+\s*:\s*[^,]*,\s*([^,]+)/i);
        if (m2 && m2[1].trim()) iconPath = m2[1].trim();
      }
    } catch (e) {}
  }
  if (iconPath) {
    iconPath = iconPath.replace(/^\//, '');
    if (dir[iconPath]) {
      try { return { mime: mimeOf(iconPath), buffer: decompressEntry(dir[iconPath]) }; } catch (e) {}
    }
  }
  // 2) Fallback: tìm file ảnh đầu tiên (ưu tiên tên chứa icon/logo)
  const imgExt = /\.(png|jpg|jpeg|gif|bmp)$/i;
  const imgs = Object.keys(dir).filter(imgExt.test.bind(imgExt));
  imgs.sort((a, b) => {
    const score = f => (/icon|logo/i.test(f) ? 0 : 1);
    return score(a) - score(b);
  });
  for (const f of imgs) {
    try { return { mime: mimeOf(f), buffer: decompressEntry(dir[f]) }; } catch (e) {}
  }
  return null;
}

// ==================== ANTI-LEAK JAR ====================
// Mục tiêu: tên file JAR thật KHÔNG BAO GIỜ lộ ra ngoài.

// Hàm đoán độ phân giải từ tên file JAR (vd: "Game_240x320_vn.jar" -> 240x320)
// Nếu không tìm được -> mặc định 240x320
function extractResolution(fileName) {
  // Tìm pattern NxM (vd: 240x320, 360x640, 176x220, 640x360)
  const m = fileName.match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/i);
  if (m) {
    const w = parseInt(m[1], 10), h = parseInt(m[2], 10);
    // Lọc giá trị hợp lý (từ 128 đến 800)
    if (w >= 128 && w <= 800 && h >= 128 && h <= 800) return { width: w, height: h };
  }
  return { width: 240, height: 320 }; // mặc định
}

// 1) Registry: ánh xạ gameId mờ -> { file thật, icon, resolution }
const gameRegistry = new Map();
function buildGameRegistry() {
  if (!fs.existsSync(JAR_DIR)) return;
  const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar'));
  files.forEach((file, idx) => {
    const gameId = 'g' + crypto.createHash('sha1').update(file + ':' + idx).digest('hex').slice(0, 14);
    const name = file.replace(/\.jar$/i, '').replace(/[_-]+/g, ' ').trim();
    const fullPath = path.join(JAR_DIR, file);
    let icon = null;
    try { icon = extractIcon(fullPath); } catch (e) {}
    const resolution = extractResolution(file);
    gameRegistry.set(gameId, { name, file, fullPath, icon, resolution });
  });
}
buildGameRegistry();

// 2) RATE LIMITING: chống spam /api/launch
// Giới hạn mỗi session (sid) tối đa 10 lần launch / phút
const launchLog = new Map(); // sid -> array of timestamps
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
function rateLimitCheck(sid) {
  const now = Date.now();
  const arr = launchLog.get(sid) || [];
  // lọc các timestamp còn trong cửa 1 phút
  const recent = arr.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false; // quá giới hạn
  recent.push(now);
  launchLog.set(sid, recent);
  return true;
}
// Dọn log cũ định kỳ
setInterval(() => {
  const now = Date.now();
  for (const [sid, arr] of launchLog) {
    const recent = arr.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) launchLog.delete(sid); else launchLog.set(sid, recent);
  }
}, 120000);

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

// API: Lấy danh sách game (trả gameId, tên, icon, resolution)
app.get('/api/jars', (req, res) => {
  try {
    const games = [...gameRegistry.entries()].map(([id, g]) => ({
      id, name: g.name, hasIcon: !!g.icon, resolution: g.resolution
    }));
    games.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Phục vụ icon của game (cache dài vì icon ít đổi)
app.get('/api/icon/:id', (req, res) => {
  const game = gameRegistry.get(req.params.id);
  if (!game || !game.icon) return res.status(404).send('no icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', game.icon.mime);
  res.send(game.icon.buffer);
});

// API: Khởi chạy game -> phát token + tự set canvasSize từ resolution
app.get('/api/launch', (req, res) => {
  if (!rateLimitCheck(req.sid)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu. Vui lòng đợi một lát.' });
  }
  const { id } = req.query;
  const game = gameRegistry.get(id);
  if (!game) return res.status(400).json({ error: 'Game không hợp lệ' });
  const token = issueToken(id);
  const r = game.resolution;
  const canvasSize = `size-${r.width}x${r.height}`;
  const emulatorUrl = `/emu/main.html?jars=jar/${token}&canvasSize=${canvasSize}`;
  res.json({ success: true, url: emulatorUrl, resolution: r });
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
