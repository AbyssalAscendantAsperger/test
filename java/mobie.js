const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const http = require('http');
const https = require('https');

// ============================================================================
//  MOBILE SERVER  (mobie.js)  —  cổng 3001
//  ----------------------------------------------------------------------------
//  Đây là BẢN LOGIC RIÊNG cho nền tảng MOBILE. KHÔNG dùng chung logic với pc.js.
//  Bạn có thể sửa gần như toàn bộ logic ở file này mà KHÔNG ảnh hưởng tới web PC.
//  - DÙNG CHUNG: thư mục jar/ (kho game) và saves/ (tiến trình lưu game).
//  - KHÔNG DÙNG CHUNG: bất kỳ logic server nào (toàn bộ nằm trong file này).
// ============================================================================
const PLATFORM = 'mobile';

const app = express();
const PORT = process.env.PORT || process.env.MOBILE_PORT || 3001;

// === CẤU HÌNH ĐƯỜNG DẪN ===
// __dirname = thư mục java/ -> jar/ và saves/ được DÙNG CHUNG giữa mobie.js & pc.js.
const JAVA_DIR = __dirname;   // Thư mục emulator gốc (chính là project/java)
const JAR_DIR = path.join(JAVA_DIR, 'jar');            // DÙNG CHUNG (kho JAR)
const SAVES_DIR = path.join(JAVA_DIR, 'saves');        // DÙNG CHUNG (save theo phiên/user)
fs.mkdirSync(SAVES_DIR, { recursive: true });
const FALLBACK_APPS_DIR = path.join(JAVA_DIR, 'web', 'apps');
fs.mkdirSync(FALLBACK_APPS_DIR, { recursive: true });

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

// Middleware: phục vụ Portal — FRONTEND RIÊNG cho MOBILE (public_mobile/)
// (Không dùng chung public/ với PC -> giao diện 2 nền tảng tách biệt hoàn toàn)
const PUBLIC_DIR = path.join(__dirname, 'public_mobile');
app.use(express.static(PUBLIC_DIR));
// Fallback web runtime (freej2me-web)
app.use('/web', express.static(path.join(__dirname, 'web'), { acceptRanges: true }));

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
// Đọc metadata từ JAR: tên game theo MANIFEST + icon.
// Ưu tiên MIDlet-Name/MIDlet-1 để tránh hiển thị tên file JAR xấu.
function unfoldManifest(text) {
  return text.replace(/\r\n[ \t]|\n[ \t]|\r[ \t]/g, '');
}
function parseManifest(text) {
  const attrs = {};
  unfoldManifest(text).split(/\r\n|\n|\r/).forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) attrs[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  });
  return attrs;
}
function scoreManifestText(text) {
  let score = 0;
  score += (text.match(/\uFFFD/g) || []).length * 20;
  score += (text.match(/[ÃÂ][\x80-\xBF\w]?/g) || []).length * 4;
  score += (text.match(/â[\x80-\xBF]/g) || []).length * 4;
  return score;
}
function decodeManifestBuffer(buf) {
  const utf8 = buf.toString('utf8');
  const latin1 = buf.toString('latin1');
  return scoreManifestText(utf8) <= scoreManifestText(latin1) ? utf8 : latin1;
}
function cleanManifestText(value) {
  let s = String(value || '');
  s = s.replace(/https?:\/\/(?:www\.)?waptai\.com\/?/gi, ' ');
  s = s.replace(/\b(?:www\.)?waptai\.com\b/gi, ' ');
  s = s.replace(/\[(?:\s|\]|\[|\(|\))*\]/g, ' ');
  s = s.replace(/[\[\]()]+/g, ' ');
  s = s.replace(/\s*[-–—_|]+\s*$/g, '');
  s = s.replace(/^\s*[-–—_|]+\s*/g, '');
  s = s.replace(/[\x00-\x1F]+/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}
function normalizeDuplicateKey(name) {
  return cleanManifestText(name)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function extractJarMetadata(jarPath) {
  let buffer;
  try { buffer = fs.readFileSync(jarPath); } catch (e) { return { name: null, icon: null, manifest: {} }; }
  const dir = readZipEntries(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  if (!dir) return { name: null, icon: null, manifest: {} };

  let iconPath = null;
  let gameName = null;
  let manifest = {};
  let dev = '';
  let profile = '';
  let version = '';
  const mf = dir['META-INF/MANIFEST.MF'] || dir['meta-inf/manifest.mf'];
  if (mf) {
    try {
      const text = decodeManifestBuffer(decompressEntry(mf));
      manifest = parseManifest(text);
      if (manifest['midlet-name']) gameName = manifest['midlet-name'];
      const midlet1 = manifest['midlet-1'];
      if (!gameName && midlet1) {
        const parts = midlet1.split(',').map(x => x.trim());
        if (parts[0]) gameName = parts[0];
      }
      dev = cleanManifestText(manifest['midlet-vendor'] || '');
      profile = cleanManifestText(manifest['microedition-profile'] || '');
      const pm = profile.match(/MIDP-\d+(?:\.\d+)?/i);
      if (pm) profile = pm[0].toUpperCase();
      version = cleanManifestText(manifest['midlet-version'] || '');
      iconPath = manifest['midlet-icon'] || null;
      if (!iconPath && midlet1) {
        const parts = midlet1.split(',').map(x => x.trim());
        if (parts[1]) iconPath = parts[1];
      }
    } catch (e) {}
  }

  let icon = null;
  if (iconPath) {
    iconPath = iconPath.replace(/^\//, '');
    if (dir[iconPath]) {
      try { icon = { mime: mimeOf(iconPath), buffer: decompressEntry(dir[iconPath]) }; } catch (e) {}
    }
  }
  if (!icon) {
    const imgExt = /\.(png|jpg|jpeg|gif|bmp)$/i;
    const imgs = Object.keys(dir).filter(imgExt.test.bind(imgExt));
    imgs.sort((a, b) => {
      const score = f => (/icon|logo/i.test(f) ? 0 : 1);
      return score(a) - score(b);
    });
    for (const f of imgs) {
      try { icon = { mime: mimeOf(f), buffer: decompressEntry(dir[f]) }; break; } catch (e) {}
    }
  }
  if (gameName) gameName = cleanManifestText(gameName);
  return { name: gameName || null, icon, manifest, dev, profile, version, duplicateKey: normalizeDuplicateKey(gameName || '') };
}
function extractIcon(jarPath) {
  return extractJarMetadata(jarPath).icon;
}

function sanitizeFallbackAppId(gameId) {
  return String(gameId || '').replace(/[^A-Za-z0-9_-]/g, '_');
}
function crc32(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ CRC32_TABLE[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((Math.floor(date.getSeconds() / 2)) & 31);
  const dosDate = (((year - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31);
  return { dosTime, dosDate };
}
function createZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const dataBuf = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = crc32(dataBuf);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(dataBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + compressed.length;
  }
  const centralDir = Buffer.concat(centralParts);
  const localDir = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(localDir.length, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([localDir, centralDir, end]);
}
function ensureFallbackBundleForGame(gameId) {
  const game = gameRegistry.get(gameId);
  if (!game) return null;
  const appId = sanitizeFallbackAppId(gameId);
  const bundlePath = path.join(FALLBACK_APPS_DIR, `${appId}.zip`);
  if (fs.existsSync(bundlePath)) return { appId, bundlePath, created: false };
  const settings = [
    `width:${game.resolution.width}`,
    `height:${game.resolution.height}`,
    `phone:Nokia`
  ].join('\n') + '\n';
  const zipBuffer = createZipBuffer([
    { name: 'app.jar', data: fs.readFileSync(game.fullPath) },
    { name: 'settings.txt', data: Buffer.from(settings, 'utf8') },
    { name: 'name.txt', data: Buffer.from(String(game.name || appId) + '\n', 'utf8') },
    { name: 'id.txt', data: Buffer.from(appId + '\n', 'utf8') }
  ]);
  fs.writeFileSync(bundlePath, zipBuffer);
  return { appId, bundlePath, created: true };
}
function getFallbackBundleStatus(gameId) {
  const appId = sanitizeFallbackAppId(gameId);
  const bundlePath = path.join(FALLBACK_APPS_DIR, `${appId}.zip`);
  return { appId, bundlePath, exists: fs.existsSync(bundlePath) };
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
let lastJarChecksum = '';

function buildGameRegistry() {
  if (!fs.existsSync(JAR_DIR)) return;
  const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar') && !/^classes(\d+|old)?\.jar$/i.test(f));
  gameRegistry.clear();
  files.forEach((file) => {
    // gameId ổn định theo tên file, không phụ thuộc vào thứ tự/số lượng file
    const gameId = 'g' + crypto.createHash('sha1').update(file).digest('hex').slice(0, 14);
    const fileNameFallback = file.replace(/\.jar$/i, '').replace(/[_-]+/g, ' ').trim();
    const fullPath = path.join(JAR_DIR, file);
    let meta = { name: null, icon: null, dev: '', profile: '', version: '', duplicateKey: '' };
    try { meta = extractJarMetadata(fullPath); } catch (e) {}
    const name = meta.name || cleanManifestText(fileNameFallback);
    const resolution = extractResolution(file);
    const duplicateKey = meta.duplicateKey || normalizeDuplicateKey(name);
    gameRegistry.set(gameId, { name, file, fullPath, icon: meta.icon, resolution, dev: meta.dev || 'Unknown', profile: meta.profile || 'Unknown', version: meta.version || '', duplicateKey });
  });
}

// Tính checksum nhanh của thư mục jar (số lượng + tổng size + tổng mtime)
// để phát hiện thêm/xóa/đổi tên/overwrite file mà không cần restart server.
function getJarChecksum() {
  try {
    const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar') && !/^classes(\d+|old)?\.jar$/i.test(f)).sort();
    let totalSize = 0;
    let totalMtime = 0;
    for (const f of files) {
      const st = fs.statSync(path.join(JAR_DIR, f));
      totalSize += st.size;
      totalMtime += st.mtimeMs;
    }
    return `${files.length}:${totalSize}:${totalMtime}`;
  } catch (e) {
    return '';
  }
}

function rebuildGameRegistryIfNeeded() {
  const checksum = getJarChecksum();
  if (checksum !== lastJarChecksum) {
    buildGameRegistry();
    lastJarChecksum = checksum;
  }
}

buildGameRegistry();
lastJarChecksum = getJarChecksum();

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
  const rawToken = req.params.token;
  // Bóc tách token từ abc.jar hoặc abc
  const token = rawToken.endsWith('.jar') ? rawToken.slice(0, -4) : rawToken;
  
  const info = verifyToken(token);
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


// ==================== DEDOMIL SEARCH + DOWNLOAD ====================
// Ghi chú: Dedomil yêu cầu từ khóa >= 3 ký tự. Website có bộ đếm "Today search"
// nhưng không công bố quota/rate-limit chính thức; vì vậy server giới hạn nhẹ để tránh spam.
const DEDOMIL_BASE = 'http://dedomil.net';
const dedomilLog = new Map();
function dedomilRateLimit(sid) {
  const now = Date.now();
  const arr = (dedomilLog.get(sid) || []).filter(t => now - t < 60 * 1000);
  if (arr.length >= 20) return false;
  arr.push(now); dedomilLog.set(sid, arr); return true;
}
function htmlDecode(str) {
  return String(str || '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function stripTags(str) { return htmlDecode(String(str || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }
function absoluteDedomilUrl(u) { return new URL(u, DEDOMIL_BASE).toString(); }
function fetchUrlBuffer(url, opts = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(u, {
      method: opts.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (J2ME Portal; Dedomil downloader)',
        'Accept': opts.accept || '*/*',
        'Referer': opts.referer || DEDOMIL_BASE + '/games',
        ...(opts.headers || {})
      },
      timeout: opts.timeout || 20000
    }, res => {
      const code = res.statusCode || 0;
      if ([301,302,303,307,308].includes(code) && res.headers.location && redirectCount < 5) {
        res.resume();
        return resolve(fetchUrlBuffer(new URL(res.headers.location, url).toString(), opts, redirectCount + 1));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: code, url, finalUrl: res.responseUrl || url, headers: res.headers, buffer: Buffer.concat(chunks) }));
    });
    req.on('timeout', () => req.destroy(new Error('Timeout')));
    req.on('error', reject);
    req.end();
  });
}
async function fetchUrlText(url, opts = {}) {
  const r = await fetchUrlBuffer(url, { ...opts, accept: 'text/html,application/xhtml+xml' });
  if (r.status < 200 || r.status >= 300) throw new Error(`HTTP ${r.status}`);
  return r.buffer.toString('utf8');
}
function parseDedomilSearch(html, query, page) {
  const results = [];
  const seen = new Set();
  const re = /<a\s+[^>]*href=["']\/games\/(\d+)\/screens["'][^>]*>([\s\S]*?)<\/a>\s*([^<\n\r]*)/gi;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({ id, title: stripTags(m[2]), date: stripTags(m[3]), url: `${DEDOMIL_BASE}/games/${id}` });
  }
  const hasNext = new RegExp(`/games/search/${escapeRegExp(encodeURIComponent(query)).replace(/%20/g, '(?:%20|\\+)')}/page/${Number(page)+1}`, 'i').test(html) || />\s*next»\s*<\/a>/i.test(html);
  const lastPageMatch = html.match(/\/games\/search\/[^"']+\/page\/(\d+)["'][^>]*>»»/i);
  return { results, page: Number(page), hasNext, lastPage: lastPageMatch ? Number(lastPageMatch[1]) : null };
}
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function parseDedomilVersions(html, gameId) {
  const versions = [];
  const titleMatch = html.match(/<div[^>]+class=["']NHRY["'][^>]*>([\s\S]*?)<\/div>/i) || html.match(/<title>Download\s+([\s\S]*?)\s+Java Game/i);
  const gameTitle = titleMatch ? stripTags(titleMatch[1]) : `Dedomil ${gameId}`;
  const blockRe = /<div[^>]+class=["']MODELS["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]+class=["']LOAD["'][^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = blockRe.exec(html))) {
    const modelText = stripTags(m[1]);
    const loadHtml = m[2];
    const resMatch = modelText.match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/i);
    if (!resMatch) continue;
    const width = parseInt(resMatch[1], 10), height = parseInt(resMatch[2], 10);
    const links = [];
    loadHtml.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      links.push({ href: absoluteDedomilUrl(href), text: stripTags(text) }); return '';
    });
    const jarLink = links.find(l => /download-jar/i.test(l.href) || /^jar$/i.test(l.text));
    const anyDownload = links.find(l => /download/i.test(l.href) || /download/i.test(l.text));
    const sizeMatch = stripTags(loadHtml).match(/([\d.]+)\s*(kB|MB)/i);
    versions.push({
      width, height, resolution: `${width}x${height}`, model: modelText.replace(/\s*\(\s*\d{2,4}\s*[x×]\s*\d{2,4}\s*\)\s*$/, ''),
      jarUrl: jarLink ? jarLink.href : null,
      downloadUrl: (jarLink || anyDownload || links[0] || {}).href || null,
      size: sizeMatch ? sizeMatch[0] : ''
    });
  }
  return { gameTitle, versions };
}
const DEDOMIL_SUPPORTED_RES = new Set(['240x320','320x240','360x640','640x360','320x480','480x320','240x400','400x240','176x220','220x176','128x160','160x128']);
const DEDOMIL_RES_PREF = ['240x320','320x240','360x640','640x360','320x480','480x320','240x400','400x240','176x220','220x176','128x160','160x128'];
function chooseDedomilVersion(versions) {
  const supported = versions.filter(v => DEDOMIL_SUPPORTED_RES.has(v.resolution));
  const pool = supported.length ? supported : versions.filter(v => v.width >= 128 && v.width <= 800 && v.height >= 128 && v.height <= 800);
  for (const res of DEDOMIL_RES_PREF) {
    const found = pool.find(v => v.resolution === res && v.downloadUrl);
    if (found) return found;
  }
  return pool.filter(v => v.downloadUrl).sort((a,b) => (b.width*b.height) - (a.width*a.height))[0] || null;
}
function safeFileName(name) {
  return String(name || 'game').replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^\.+/, '').slice(0, 120) || 'game';
}
function uniqueJarPath(baseName) {
  let name = safeFileName(baseName).replace(/\.jar$/i, '') + '.jar';
  let full = path.join(JAR_DIR, name);
  let i = 2;
  while (fs.existsSync(full)) {
    name = safeFileName(baseName).replace(/\.jar$/i, '') + `_${i}.jar`;
    full = path.join(JAR_DIR, name);
    i++;
  }
  return { name, full };
}
function contentDispositionFilename(cd) {
  if (!cd) return null;
  const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  return m ? decodeURIComponent(m[1] || m[2]) : null;
}
function extractFirstJarFromZip(buffer) {
  const dir = readZipEntries(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  if (!dir) return null;
  const jarName = Object.keys(dir).find(f => /\.jar$/i.test(f));
  if (!jarName) return null;
  return { name: path.basename(jarName), buffer: decompressEntry(dir[jarName]) };
}
async function searchDedomil(query, page = 1, opts = {}) {
  query = String(query || '').trim();
  page = Math.max(1, Math.min(50, parseInt(page, 10) || 1));
  if (query.length < 3) throw new Error('Dedomil yêu cầu từ khóa ít nhất 3 ký tự');
  const url = `${DEDOMIL_BASE}/games/search/${encodeURIComponent(query)}/page/${page}`;
  const html = await fetchUrlText(url);
  const parsed = parseDedomilSearch(html, query, page);
  // Enrich kết quả bằng cách đọc trang chi tiết: nhiều kết quả Dedomil có trang mô tả
  // nhưng không còn link JAR. Với Portal, ẩn các mục không tải được để người dùng
  // không gặp lỗi "Không tìm thấy bản tải có độ phân giải được hỗ trợ" ngay khi bấm Tải.
  if (opts.downloadableOnly !== false) {
    const enriched = await Promise.all(parsed.results.map(async r => {
      try {
        const detailHtml = await fetchUrlText(`${DEDOMIL_BASE}/games/${r.id}`);
        const versions = parseDedomilVersions(detailHtml, r.id).versions;
        const best = chooseDedomilVersion(versions);
        return { ...r, downloadable: !!best, bestResolution: best ? best.resolution : null, versionCount: versions.length };
      } catch (e) {
        return { ...r, downloadable: false, bestResolution: null, versionCount: 0 };
      }
    }));
    parsed.totalFound = parsed.results.length;
    parsed.results = enriched.filter(r => r.downloadable);
    parsed.filteredUnsupported = parsed.totalFound - parsed.results.length;
  }
  return parsed;
}
async function downloadDedomilGame(gameId) {
  if (!/^\d{1,10}$/.test(String(gameId))) throw new Error('gameId không hợp lệ');
  const pageUrl = `${DEDOMIL_BASE}/games/${gameId}`;
  const html = await fetchUrlText(pageUrl);
  const parsed = parseDedomilVersions(html, gameId);
  const selected = chooseDedomilVersion(parsed.versions);
  if (!selected) throw new Error('Không tìm thấy bản tải có độ phân giải được hỗ trợ');
  const downloadUrl = selected.jarUrl || selected.downloadUrl;
  const r = await fetchUrlBuffer(downloadUrl, { referer: pageUrl });
  if (r.status < 200 || r.status >= 300) throw new Error(`Tải thất bại HTTP ${r.status}`);
  let jarBuffer = r.buffer;
  let remoteName = contentDispositionFilename(r.headers['content-disposition']);
  const ctype = String(r.headers['content-type'] || '').toLowerCase();
  if (!/\.jar$/i.test(remoteName || '') && (ctype.includes('zip') || (jarBuffer[0] === 0x50 && jarBuffer[1] === 0x4b))) {
    const inner = extractFirstJarFromZip(jarBuffer);
    if (inner) { jarBuffer = inner.buffer; remoteName = inner.name; }
  }
  if (!jarBuffer || jarBuffer.length < 4 || jarBuffer[0] !== 0x50 || jarBuffer[1] !== 0x4b) {
    throw new Error('File tải về không phải JAR/ZIP hợp lệ');
  }
  const baseName = remoteName || `${parsed.gameTitle}_${selected.resolution}.jar`;
  const target = uniqueJarPath(baseName);
  fs.mkdirSync(JAR_DIR, { recursive: true });
  fs.writeFileSync(target.full, jarBuffer);
  rebuildGameRegistryIfNeeded();
  return { ok: true, gameId: String(gameId), title: parsed.gameTitle, file: target.name, resolution: selected.resolution, model: selected.model, size: jarBuffer.length };
}

app.get('/api/dedomil/search', async (req, res) => {
  try {
    if (!dedomilRateLimit(req.sid)) return res.status(429).json({ error: 'Tìm kiếm quá nhanh, vui lòng đợi một lát.' });
    res.json(await searchDedomil(req.query.q, req.query.page));
  } catch (err) { res.status(400).json({ error: err.message }); }
});
app.post('/api/dedomil/download', express.json({ limit: '32kb' }), async (req, res) => {
  try {
    if (!dedomilRateLimit(req.sid)) return res.status(429).json({ error: 'Tải quá nhanh, vui lòng đợi một lát.' });
    res.json(await downloadDedomilGame(req.body && req.body.id));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Nhận body save dạng text (JSON)
app.use('/api/save', express.text({ type: 'text/plain', limit: '200mb' }));

// API: Lấy danh sách game (trả gameId, tên, icon, resolution)
app.get('/api/jars', (req, res) => {
  try {
    rebuildGameRegistryIfNeeded(); // cập nhật nếu có game mới/xóa
    const counts = new Map();
    for (const g of gameRegistry.values()) counts.set(g.duplicateKey, (counts.get(g.duplicateKey) || 0) + 1);
    const games = [...gameRegistry.entries()].map(([id, g]) => ({
      id, name: g.name, dev: g.dev, profile: g.profile, version: g.version,
      duplicateKey: g.duplicateKey, duplicateCount: counts.get(g.duplicateKey) || 1,
      hasIcon: !!g.icon, resolution: g.resolution
    }));
    games.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    const devs = [...new Set(games.map(g => g.dev).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'vi'));
    const profiles = [...new Set(games.map(g => g.profile).filter(Boolean))].sort();
    res.json({ games, devs, profiles });
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
  rebuildGameRegistryIfNeeded(); 
  const { id, enginemode } = req.query;
  const game = gameRegistry.get(id);
  if (!game) return res.status(400).json({ error: 'Game không hợp lệ' });
  
  const token = issueToken(id);
  const r = game.resolution;
  const canvasSize = `size-${r.width}x${r.height}`;
  
  // Trình giả lập cần chính xác định dạng enginemodeX-classesY.jar
  let modeParam = enginemode; 
  if (!modeParam) modeParam = 'enginemode2-classes2.jar';

  if (modeParam === 'enginemode4-freej2me-web') {
    try {
      const bundle = ensureFallbackBundleForGame(id);
      if (bundle && bundle.appId) {
        const debugKeys = String(req.query.debugkeys || '') === '1' ? '&debugkeys=1' : '';
      const fallbackUrl = `/web/run.html?app=${encodeURIComponent(bundle.appId)}&fractionScale=1&nokeypad=1${debugKeys}`; 
        return res.json({ success: true, url: fallbackUrl, resolution: r, engine: 'freej2me-web', appId: bundle.appId, bundleCreated: !!bundle.created });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Không thể tạo fallback bundle', detail: String(e && e.message || e) });
    }
    const launcherUrl = `/web/index.html?mobile=1&fractionScale=1`;
    return res.json({ success: true, url: launcherUrl, resolution: r, engine: 'freej2me-web', appId: null, warning: 'fallback bundle missing' });
  }

  // Quay lại URL đơn giản nhất (Phương pháp ban đầu bạn xác nhận là ổn định)
  const emulatorUrl = `/emu/main.html?jars=jar/${token}&canvasSize=${canvasSize}&enginemode=${modeParam}`;
  
  res.json({ success: true, url: emulatorUrl, resolution: r, engine: 'legacy' });
});

// API: Tải save của 1 game trong phiên/user hiện tại
app.get('/api/load', (req, res) => {
  const sid = req.sid;
  const gameId = req.query.gameId;
  if (!gameId || !/^[A-Za-z0-9_-]{1,64}$/.test(gameId)) {
    return res.status(400).json({ error: 'gameId không hợp lệ' });
  }
  const userDir = path.join(SAVES_DIR, sid);
  const file = path.join(userDir, gameId + '.fs');
  if (!fs.existsSync(file)) return res.status(404).json({ nosave: true });
  const text = fs.readFileSync(file, 'utf8');
  res.type('text/plain').send(text);
});

// API: Lưu save của 1 game trong phiên/user hiện tại
app.post('/api/save', (req, res) => {
  const sid = req.sid;
  const gameId = req.query.gameId;
  if (!gameId || !/^[A-Za-z0-9_-]{1,64}$/.test(gameId)) {
    return res.status(400).json({ error: 'gameId không hợp lệ' });
  }
  const body = req.body || '';
  if (typeof body !== 'string') return res.status(400).json({ error: 'body phải là text' });
  const userDir = path.join(SAVES_DIR, sid);
  fs.mkdirSync(userDir, { recursive: true });
  const file = path.join(userDir, gameId + '.fs');
  fs.writeFileSync(file, body);
  res.json({ ok: true, sid, gameId, size: Buffer.byteLength(body) });
});

app.post('/api/fallback/prepare', (req, res) => {
  if (!rateLimitCheck(req.sid)) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu. Vui lòng đợi một lát.' });
  }
  rebuildGameRegistryIfNeeded();
  const gameId = req.query.id;
  const game = gameRegistry.get(gameId);
  if (!game) return res.status(400).json({ error: 'Game không hợp lệ' });
  try {
    const bundle = ensureFallbackBundleForGame(gameId);
    return res.json({ ok: true, gameId, appId: bundle.appId, bundlePath: path.relative(JAVA_DIR, bundle.bundlePath), created: !!bundle.created, status: getFallbackBundleStatus(gameId) });
  } catch (e) {
    return res.status(500).json({ error: 'Không thể tạo fallback bundle', detail: String(e && e.message || e) });
  }
});

app.get('/api/fallback/status', (req, res) => {
  rebuildGameRegistryIfNeeded();
  const gameId = req.query.id;
  const game = gameRegistry.get(gameId);
  if (!game) return res.status(400).json({ error: 'Game không hợp lệ' });
  return res.json({ ok: true, gameId, ...getFallbackBundleStatus(gameId) });
});

// Đánh dấu nền tảng vào MỌI response (giúp router/kiểm thử biết server nào trả lời)
app.use((req, res, next) => { res.setHeader('X-Platform', PLATFORM); next(); });

// API nhận diện nền tảng (router port 3000 và frontend có thể gọi để xác nhận)
app.get('/api/platform', (req, res) => {
  res.json({ platform: PLATFORM, port: PORT });
});

// Trang chính
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// === KHỞI ĐỘNG SERVER (chỉ 1 server ở port 3000) ===
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📱 [MOBILE] J2ME Portal (mobie.js) đang chạy tại http://localhost:${PORT}`);
    console.log(`🔒 Anti-leak: ${gameRegistry.size} game đã đăng ký (tên file được ẩn)`);
    console.log(`💾 Save (DÙNG CHUNG) tại: ${SAVES_DIR}`);
    console.log(`📦 JAR  (DÙNG CHUNG) tại: ${JAR_DIR}`);
    console.log(`🚀 Logic RIÊNG cho MOBILE — sửa thoải mái không ảnh hưởng PC.`);
  });
}

module.exports = {
  app,
  PLATFORM,
  PORT,
  extractJarMetadata,
  extractResolution,
  parseDedomilSearch,
  parseDedomilVersions,
  chooseDedomilVersion,
  searchDedomil,
  downloadDedomilGame,
  rebuildGameRegistryIfNeeded,
  gameRegistry,
  ensureFallbackBundleForGame,
  getFallbackBundleStatus,
  sanitizeFallbackAppId
};
