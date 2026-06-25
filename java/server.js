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

// Session TRƯỚC static -> cookie sid được set ngay cả khi phục vụ trang / tĩnh
app.use((req, res, next) => { req.sid = getOrCreateSid(req, res); next(); });

// Middleware: phục vụ Portal (public/)
app.use(express.static(path.join(__dirname, 'public')));

// Phục vụ emulator CÙNG ORIGIN (port 3000) ở tiền tố /emu
// -> iframe /emu/main.html cùng origin với Portal -> không bị chặn cross-origin
//    khi Portal gọi iframe.contentWindow.MIDP.sendKeyPress(...) / fs.exportStore(...)
// LƯU Ý: đã BỎ hẳn server :8080 (trước đây nó lộ giao diện emulator ra ngoài).
app.use('/emu', express.static(JAVA_DIR));

// Nhận body save dạng text (JSON), cho phép lớn (toàn bộ fs có thể vài MB)
app.use('/api/save', express.text({ type: 'text/plain', limit: '200mb' }));

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

// API: Lấy danh sách JAR
app.get('/api/jars', (req, res) => {
  try {
    if (!fs.existsSync(JAR_DIR)) {
      return res.json({ error: 'Thư mục jar/ không tồn tại' });
    }
    const files = fs.readdirSync(JAR_DIR)
      .filter(f => f.toLowerCase().endsWith('.jar'))
      .sort();
    res.json({ jars: files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Trả về URL iframe
app.get('/api/launch', (req, res) => {
  const { jar } = req.query;
  if (!jar) return res.status(400).json({ error: 'Thiếu jar' });
  const emulatorUrl = `/emu/main.html?jars=jar/${encodeURIComponent(jar)}`;
  res.json({ success: true, url: emulatorUrl, jar });
});

// API: TẢI save của phiên/user hiện tại (nạp vào fs trước khi mở game)
app.get('/api/load', (req, res) => {
  const sid = req.sid;
  const file = path.join(SAVES_DIR, sid + '.fs');
  if (!fs.existsSync(file)) return res.status(404).json({ nosave: true });
  const text = fs.readFileSync(file, 'utf8');
  res.type('text/plain').send(text);
});

// API: LƯU save của phiên/user hiện tại (xuất fs khi đóng game)
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
  console.log(`🎮 Emulator (cùng origin): http://localhost:${PORT}/emu/main.html`);
  console.log(`📁 Quét JAR từ: ${JAR_DIR}`);
  console.log(`💾 Save theo phiên/user tại: ${SAVES_DIR}`);
  console.log(`🚀 Chỉ cần gõ: npm start`);
});
