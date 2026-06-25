const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 3000;

// === CẤU HÌNH ĐƯỜNG DẪN ===
const JAVA_DIR = path.join(__dirname, '..', 'java');   // Thư mục emulator gốc
const JAR_DIR = path.join(JAVA_DIR, 'jar');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

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

  // URL đến emulator gốc (port 8080)
  const emulatorUrl = `http://localhost:8080/main.html?jars=jar/${encodeURIComponent(jar)}`;
  res.json({ success: true, url: emulatorUrl, jar });
});

// Trang chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === CHẠY 2 SERVER CÙNG LÚC ===
function startEmulatorServer() {
  const emulatorApp = express();
  emulatorApp.use(express.static(JAVA_DIR));

  const server = http.createServer(emulatorApp);
  server.listen(8080, () => {
    console.log('✅ Emulator server đang chạy tại http://localhost:8080');
  });
}

// Khởi động cả hai server
startEmulatorServer();

app.listen(PORT, () => {
  console.log(`✅ J2ME Portal (3000) đang chạy tại http://localhost:${PORT}`);
  console.log(`📁 Quét JAR từ: ${JAR_DIR}`);
  console.log(`🚀 Chỉ cần gõ: npm start`);
});