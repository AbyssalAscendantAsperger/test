const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const http = require('http');
const https = require('https');

// ============================================================================
//  PC / DESKTOP SERVER  (pc.js)  —  cổng 3002
//  ----------------------------------------------------------------------------
//  Đây là BẢN LOGIC RIÊNG cho nền tảng PC (web desktop). KHÔNG dùng chung logic
//  với mobie.js. Bạn có thể sửa gần như toàn bộ logic ở file này mà KHÔNG ảnh
//  hưởng tới web Mobile.
//  - DÙNG CHUNG: thư mục jar/ (kho game) và saves/ (tiến trình lưu game).
//  - KHÔNG DÙNG CHUNG: bất kỳ logic server nào (toàn bộ nằm trong file này).
// ============================================================================
const PLATFORM = 'pc';

const app = express();
const PORT = process.env.PORT || process.env.PC_PORT || 3002;

// === CẤU HÌNH ĐƯỜNG DẪN ===
// SHARED_ROOT = thư mục java/ -> CHỈ jar/ và saves/ được DÙNG CHUNG giữa mobie.js & pc.js.
const SHARED_ROOT = __dirname;
// ASSETS_DIR = bản sao tài nguyên RIÊNG cho PC (emu, web, bld, libs, style, config...).
// Tách hoàn toàn khỏi Mobile -> sửa emulator/runtime bên PC không ảnh hưởng Mobile.
const ASSETS_DIR = path.join(__dirname, 'assets_pc');
const JAVA_DIR = ASSETS_DIR; // tương thích tên cũ: mọi tài nguyên emu lấy từ assets riêng
const JAR_DIR = path.join(SHARED_ROOT, 'jar');          // DÙNG CHUNG (kho JAR)
const SAVES_DIR = path.join(SHARED_ROOT, 'saves');      // DÙNG CHUNG (save theo phiên/user)
fs.mkdirSync(SAVES_DIR, { recursive: true });
const FALLBACK_APPS_DIR = path.join(ASSETS_DIR, 'web', 'apps'); // legacy Mode 4 cũ (không còn dùng sau khi xoá Mode 4)
fs.mkdirSync(FALLBACK_APPS_DIR, { recursive: true });
// Cache JAR đã chuẩn hoá riêng cho Mode 5/CheerpJ. Không đụng file JAR gốc.
const MODE5_JAR_CACHE_DIR = path.join(ASSETS_DIR, 'web5', 'mode5_jars');
fs.mkdirSync(MODE5_JAR_CACHE_DIR, { recursive: true });
// Tắt mặc định JAR normalizer vì một số game obfuscate/encrypted chạy kém hơn sau khi repack.
// Chỉ bật thử nghiệm bằng: set MODE5_JAR_NORMALIZE=1
const MODE5_JAR_NORMALIZE_ENABLED = String(process.env.MODE5_JAR_NORMALIZE || '') === '1';


// ==================== MODE 5 CONFIG OVERRIDE (java/config/config.json) ====================
const MODE5_CONFIG_PATH = path.join(SHARED_ROOT, 'config', 'config.json');
const MODE5_ALLOWED_SETTING_KEYS = new Set([
  'scrwidth','scrheight','sound','phone','backlightcolor','rotate','fps','soundfont','textfont','fontoffset',
  'spdhacknoalpha','compatnonfatalnullimage','compattranstooriginonreset','compatimmediaterepaints','fpshack'
]);
const MODE5_ALLOWED_SYS_KEYS = new Set([
  'fpsCounterPosition','logLevel','M3GWireframe','M3GUntextured','deleteTempKJXFiles','dumpAudioStreams','dumpGraphicsObjects',
  'input_LeftSoft','input_RightSoft','input_ArrowUp','input_ArrowLeft','input_Fire','input_ArrowRight','input_ArrowDown',
  'input_Num7','input_Num8','input_Num9','input_Num4','input_Num5','input_Num6','input_Num1','input_Num2','input_Num3',
  'input_Star','input_Num0','input_Pound','input_FastForward','input_Screenshot','input_PauseResume'
]);
function readMode5ConfigFile() {
  try {
    if (!fs.existsSync(MODE5_CONFIG_PATH)) return null;
    const raw = fs.readFileSync(MODE5_CONFIG_PATH, 'utf8').replace(/^\uFEFF/, '');
    if (!raw.trim()) return null;
    const cfg = JSON.parse(raw);
    if (cfg && cfg.enabled === false) return null;
    return cfg || null;
  } catch (e) {
    console.log('[MODE5-CONFIG][PC] ⚠️ Không đọc được config/config.json:', e.message);
    return null;
  }
}
function mode5ShallowMergeConfig(a, b) {
  const out = {
    runtime: Object.assign({}, a && a.runtime || {}, b && b.runtime || {}),
    settings: Object.assign({}, a && a.settings || {}, b && b.settings || {}),
    sysSettings: Object.assign({}, a && a.sysSettings || {}, b && b.sysSettings || {})
  };
  return out;
}
function mode5GameMatches(rule, id, game, r) {
  if (!rule || rule.enabled === false) return false;
  const m = rule.match || rule;
  if (m.id && String(m.id) !== String(id)) return false;
  if (m.name && String(m.name).toLowerCase() !== String(game.name || '').toLowerCase()) return false;
  if (m.nameContains && !String(game.name || '').toLowerCase().includes(String(m.nameContains).toLowerCase())) return false;
  if (m.resolution && String(m.resolution) !== (r.width + 'x' + r.height)) return false;
  if (m.width && Number(m.width) !== Number(r.width)) return false;
  if (m.height && Number(m.height) !== Number(r.height)) return false;
  return true;
}
function getMode5OverrideForGame(id, game, r) {
  const cfg = readMode5ConfigFile();
  if (!cfg) return { runtime: {}, settings: {}, sysSettings: {} };
  let out = mode5ShallowMergeConfig({}, cfg.defaults || {});
  const games = Array.isArray(cfg.games) ? cfg.games : Object.keys(cfg.games || {}).map(k => Object.assign({ match: { id: k } }, cfg.games[k] || {}));
  for (const rule of games) {
    if (mode5GameMatches(rule, id, game, r)) out = mode5ShallowMergeConfig(out, rule);
  }
  // aliases: runtime width/height also set FreeJ2ME scrwidth/scrheight unless explicitly set
  if (out.runtime.width != null && out.settings.scrwidth == null) out.settings.scrwidth = String(out.runtime.width);
  if (out.runtime.height != null && out.settings.scrheight == null) out.settings.scrheight = String(out.runtime.height);
  return out;
}
function buildMode5CoreArg(ovr) {
  const parts = [];
  const add = (prefix, obj, allow) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v === undefined || v === null || typeof v === 'object') continue;
      if (allow && !allow.has(k)) { console.log('[MODE5-CONFIG][PC] bỏ qua key không hỗ trợ:', prefix + k); continue; }
      const val = String(v).replace(/[;\r\n]/g, ' ').replace(/=/g, ':').trim();
      parts.push(prefix + k + '=' + val);
    }
  };
  add('settings.', ovr.settings, MODE5_ALLOWED_SETTING_KEYS);
  add('sysSettings.', ovr.sysSettings, MODE5_ALLOWED_SYS_KEYS);
  return parts.join(';');
}

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
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ==================== V9 TỰ ĐỘNG DỌN DẸP TỆP RỖNG 0-BYTE TỪ BẢN CŨ ====================
try {
  const badFiles = [
    path.join(ASSETS_DIR, 'web5', 'cheerpj', '4.3', '8', 'lib', 'tzdb.dat'),
    path.join(ASSETS_DIR, 'web5', 'cheerpj', '4.3', '8', 'lib', 'fonts', 'index.list'),
    path.join(ASSETS_DIR, 'web5', 'cheerpj', '4.3', '8', 'lib', 'accessibility.properties'),
    path.join(ASSETS_DIR, 'web5', 'cheerpj', '4.3', 'etc', 'localtime'),
    path.join(ASSETS_DIR, 'web5', 'cheerpj', '4.3', 'fc', 'ttf', '.uuid')
  ];
  badFiles.forEach(f => {
    if (fs.existsSync(f) && fs.statSync(f).size === 0) {
      fs.unlinkSync(f);
      console.log('[V9-PC][CLEANUP] Đã xóa tệp rỗng 0-byte gây lỗi EOFException:', f);
    }
  });
} catch(e){}

// Endpoint cầu nối nhận log trình duyệt gửi về Terminal
app.post('/api/browser-log', express.text({ type: '*/*', limit: '1mb' }), (req, res) => {
  console.log('[V9-BROWSER-VM] ' + String(req.body || '').slice(0, 3000));
  res.json({ ok: true });
});

// Middleware phục vụ Portal
const PUBLIC_DIR = path.join(__dirname, 'public_pc');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}



// ==================== V9 MIDDLEWARE KIỂM SOÁT TỆP TĨNH /web5 ====================
app.use('/web5', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.on('finish', () => {
      console.log('[V9-PC][STATIC] ' + req.method + ' /web5' + req.url + ' -> ' + res.statusCode);
    });
    try {
      const cleanPath = decodeURIComponent(req.path.split('?')[0]);
      const fullP = path.join(ASSETS_DIR, 'web5', cleanPath);
      if (!fs.existsSync(fullP)) {
        return res.status(404).send('');
      }
      const stat = fs.statSync(fullP);
      if (stat.isDirectory()) {
        return res.status(200).send('');
      }
      if (stat.size === 0 && req.headers.range) {
        delete req.headers.range;
      }
    } catch (e) {}
  }
  next();
});
app.use('/web5', express.static(path.join(ASSETS_DIR, 'web5'), { acceptRanges: true }));

// Legacy runtime classes
app.use('/emu/java', express.static(path.join(SHARED_ROOT, 'java'), { acceptRanges: true }));

// ==================== V9 ENDPOINT PHỤC VỤ ROM JAR & JAD ====================
app.get('/emu/jar/:token', (req, res) => {
  res.on('finish', () => {
    console.log('[V9-PC][JAR] ' + req.method + ' ' + req.originalUrl + ' (Range: ' + (req.headers.range || 'none') + ') -> ' + res.statusCode);
  });
  const rawToken = req.params.token;
  let token = rawToken;
  const isJad = rawToken.endsWith('.jad');
  if (token.endsWith('.jar') || token.endsWith('.jad')) {
    token = token.slice(0, -4);
  }
  const info = verifyToken(token);
  if (!info) {
    console.log('[V9-PC][JAR] ❌ Token hết hạn hoặc không hợp lệ: ' + token);
    return res.status(403).send('Forbidden');
  }
  const game = gameRegistry.get(info.gameId);
  const jarPath = info.jarPath || (game && game.fullPath);
  if (!game || !jarPath || !fs.existsSync(jarPath)) {
    console.log('[V9-PC][JAR] ❌ Không tìm thấy file ROM game: ' + info.gameId);
    return res.status(404).send('Not found');
  }
  if (isJad) {
    const jadPath = game.fullPath.slice(0, -4) + '.jad';
    if (fs.existsSync(jadPath)) {
      res.setHeader('Content-Type', 'text/vnd.sun.j2me.app-descriptor');
      return res.sendFile(jadPath);
    }
    console.log('[V9-PC][JAR] ℹ️ Game không có tệp .jad đi kèm, trả về 404 rỗng chuẩn');
    return res.status(404).send('');
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/java-archive');
  res.sendFile(jarPath);
});

// Thăm dò thư mục /emu/jar trả về 200 OK rỗng
app.use('/emu/jar', (req, res) => res.status(200).send(''));

// Phục vụ emulator
app.use('/emu', express.static(JAVA_DIR));

// ==================== TRÍCH XUẤT ICON TỪ JAR ====================
// JAR = file ZIP. Tự viết bộ đọc Central Directory (Node thuần + zlib).
// Không cần cài thêm thư viện ngoài.
function readZipEntries(buffer) {
  // Hỗ trợ cả Node Buffer lẫn ArrayBuffer. DataView yêu cầu ArrayBuffer thật;
  // fs.readFileSync() trả về Buffer nên phải slice đúng byteOffset/byteLength.
  if (Buffer.isBuffer(buffer)) {
    buffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } else if (ArrayBuffer.isView(buffer)) {
    buffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
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
  let config = '';
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
      config = cleanManifestText(manifest['microedition-configuration'] || '');
      const cm = config.match(/CLDC-\d+(?:\.\d+)?/i);
      if (cm) config = cm[0].toUpperCase();
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
  return { name: gameName || null, icon, manifest, dev, profile, config, version, duplicateKey: normalizeDuplicateKey(gameName || '') };
}
function extractIcon(jarPath) {
  return extractJarMetadata(jarPath).icon;
}

function crc32ForZip(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC32_TABLE_MODE5[(c ^ buf[i]) & 0xFF];
  return (c ^ (-1)) >>> 0;
}
const CRC32_TABLE_MODE5 = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function dosDateTimeForZip(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosTime: ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((Math.floor(date.getSeconds() / 2)) & 31),
    dosDate: (((year - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31)
  };
}
function createMode5ZipBuffer(entries) {
  const localParts = [], centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTimeForZip();
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const dataBuf = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data || '');
    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = crc32ForZip(dataBuf);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names, no encryption
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(dataBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28); central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34); central.writeUInt16LE(0, 36); central.writeUInt32LE(0, 38); central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);
    offset += local.length + nameBuf.length + compressed.length;
  }
  const centralDir = Buffer.concat(centralParts);
  const localDir = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDir.length, 12); end.writeUInt32LE(localDir.length, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([localDir, centralDir, end]);
}
function normalizeJarEntryNameForMode5(name) {
  return String(name || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/(^|\/)\.\//g, '$1')
    .normalize('NFC');
}
function shouldAddLowercaseResourceAlias(name) {
  const n = String(name || '');
  if (!n || n.endsWith('/')) return false;
  if (/\.class$/i.test(n)) return false;
  if (/^meta-inf\//i.test(n)) return false;
  return /[A-Z]/.test(n);
}
function ensureMode5CompatibleJar(gameId, game) {
  const st = fs.statSync(game.fullPath);
  const key = crypto.createHash('sha1').update(gameId + '|' + game.fullPath + '|' + st.size + '|' + st.mtimeMs).digest('hex').slice(0, 20);
  const outPath = path.join(MODE5_JAR_CACHE_DIR, sanitizeFileComponent(gameId) + '-' + key + '.jar');
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) return { path: outPath, normalized: true, cached: true };
  try {
    const dir = readZipEntries(fs.readFileSync(game.fullPath));
    if (!dir) return { path: game.fullPath, normalized: false, error: 'bad zip central directory' };
    const added = new Set();
    const entries = [];
    const addEntry = (name, data, aliasOf) => {
      name = normalizeJarEntryNameForMode5(name);
      if (!name || added.has(name)) return;
      added.add(name);
      entries.push({ name, data, aliasOf });
    };
    for (const rawName of Object.keys(dir)) {
      const e = dir[rawName];
      if (!rawName || rawName.endsWith('/')) continue;
      let data;
      try { data = decompressEntry(e); }
      catch (err) {
        console.log('[MODE5-JAR][PC] ⚠️ Không giải nén được entry, giữ JAR gốc cho gameId=' + gameId + ' entry=' + rawName + ' err=' + err.message);
        return { path: game.fullPath, normalized: false, error: err.message };
      }
      const norm = normalizeJarEntryNameForMode5(rawName);
      addEntry(norm, data, null);
      // Alias slash/lowercase giúp Mode 5/CheerpJ/Java JarFile tìm resource trong các JAR obfuscate
      // dùng backslash hoặc case không khớp với getResourceAsStream("data/...").
      if (shouldAddLowercaseResourceAlias(norm)) addEntry(norm.toLowerCase(), data, norm);
    }
    if (!entries.length) return { path: game.fullPath, normalized: false, error: 'empty zip' };
    fs.writeFileSync(outPath, createMode5ZipBuffer(entries));
    console.log('[MODE5-JAR][PC] ✅ Đã chuẩn hoá JAR cho Mode 5: gameId=' + gameId + ' entries=' + entries.length + ' file=' + outPath);
    return { path: outPath, normalized: true, cached: false, entries: entries.length };
  } catch (e) {
    console.log('[MODE5-JAR][PC] ⚠️ Không chuẩn hoá được JAR, dùng JAR gốc gameId=' + gameId + ': ' + e.message);
    return { path: game.fullPath, normalized: false, error: e.message };
  }
}
function sanitizeFileComponent(s) {
  return String(s || 'x').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) || 'x';
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
    let meta = { name: null, icon: null, dev: '', profile: '', config: '', version: '', duplicateKey: '' };
    try { meta = extractJarMetadata(fullPath); } catch (e) {}
    const name = meta.name || cleanManifestText(fileNameFallback);
    const resolution = extractResolution(file);
    const duplicateKey = meta.duplicateKey || normalizeDuplicateKey(name);
    gameRegistry.set(gameId, { name, file, fullPath, icon: meta.icon, resolution, dev: meta.dev || 'Unknown', profile: meta.profile || 'Unknown', config: meta.config || '', version: meta.version || '', duplicateKey });
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

function issueToken(gameId, extra = {}) {
  const token = crypto.randomBytes(18).toString('hex');
  tokenStore.set(token, { gameId, createdAt: Date.now(), ...extra });
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
  const jarPath = info.jarPath || (game && game.fullPath);
  if (!game || !jarPath || !fs.existsSync(jarPath)) return res.status(404).send('Not found');
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/java-archive');
  res.sendFile(jarPath);
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
      id, name: g.name, dev: g.dev, profile: g.profile, config: g.config, version: g.version,
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

  if (modeParam === 'enginemode5-cheerpj-vm') {
    console.log('[V9-PC][LAUNCH] 🚀 Khởi chạy gameId=' + id + ' ở Mode 5 (CheerpJ VM v9)');
    console.log('[V9-PC][LAUNCH] 🎟️ Sinh token=' + token);
    const mode5Override = getMode5OverrideForGame(id, game, r);
    const effectiveWidth = Number(mode5Override.settings.scrwidth || mode5Override.runtime.width || r.width);
    const effectiveHeight = Number(mode5Override.settings.scrheight || mode5Override.runtime.height || r.height);
    const mode5CoreArg = buildMode5CoreArg(mode5Override);
    console.log('[MODE5-CONFIG][PC] gameId=' + id + ' base=' + r.width + 'x' + r.height + ' effective=' + effectiveWidth + 'x' + effectiveHeight + (mode5CoreArg ? ' arg=' + mode5CoreArg : ' arg=<none>'));
    let mode5Jar = { path: game.fullPath, normalized: false, disabled: true };
    if (MODE5_JAR_NORMALIZE_ENABLED) {
      mode5Jar = ensureMode5CompatibleJar(id, game);
    } else {
      console.log('[MODE5-JAR][PC] JAR normalizer đang TẮT (an toàn mặc định) — dùng JAR gốc cho gameId=' + id + '. Muốn thử bật: set MODE5_JAR_NORMALIZE=1');
    }
    try {
      const tokenInfo = tokenStore.get(token);
      if (tokenInfo && mode5Jar && mode5Jar.path) tokenInfo.jarPath = mode5Jar.path;
    } catch(e) {}
    const cfgParam = mode5CoreArg ? '&cfg=' + encodeURIComponent(mode5CoreArg) : '';
    const cheerpUrl = '/web5/cheerpj_run.html?token=' + encodeURIComponent(token) + '&width=' + effectiveWidth + '&height=' + effectiveHeight + cfgParam;
    return res.json({ success: true, url: cheerpUrl, resolution: { width: effectiveWidth, height: effectiveHeight }, engine: 'cheerpj', mode5Override: !!mode5CoreArg, mode5JarNormalized: !!(mode5Jar && mode5Jar.normalized) });
  }


  // Legacy engine 1/2/3 của emulator tự tải JAR bằng XHR tương đối từ main.html.
  // Vì main.html nằm dưới /emu/, tham số jars=jar/<token> sẽ bị resolve thành
  // /emu/jar/<token>. Nếu route thực tế không nằm đúng origin/path đó, emulator sẽ
  // treo ở màn hình "Downloading MIDlet". Để ổn định qua HTTPS/ngrok, truyền URL
  // tuyệt đối theo root của site để XHR luôn trỏ chính xác vào endpoint tokenized.
  const emulatorUrl = `/emu/main.html?jars=${encodeURIComponent(`/emu/jar/${token}`)}&canvasSize=${canvasSize}&enginemode=${modeParam}`;
  
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


// Đánh dấu nền tảng vào MỌI response (giúp router/kiểm thử biết server nào trả lời)
app.use((req, res, next) => { res.setHeader('X-Platform', PLATFORM); next(); });

// API nhận diện nền tảng (router port 3000 và frontend có thể gọi để xác nhận)
app.get('/api/platform', (req, res) => {
  res.json({ platform: PLATFORM, port: PORT });
});

app.post('/api/legacy-log', express.text({ type: '*/*', limit: '256kb' }), (req, res) => {
  const line = String(req.body || '').slice(0, 2000);
  console.log(`[PC][LEGACY] ${line}`);
  res.json({ ok: true });
});

// Trang chính
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// V9 Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.log('[V9-PC][ERR] ' + (err.status || 500) + ': ' + (err.message || err));
  if (err && (err.status === 416 || err.statusCode === 416)) return res.status(200).send('');
  res.status(err.status || 500).send('');
});

// === KHỞI ĐỘNG SERVER (chỉ 1 server ở port 3000) ===
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🖥️  [PC] J2ME Portal (pc.js) đang chạy tại http://localhost:${PORT}`);
    console.log(`🔒 Anti-leak: ${gameRegistry.size} game đã đăng ký (tên file được ẩn)`);
    console.log(`💾 Save (DÙNG CHUNG) tại: ${SAVES_DIR}`);
    console.log(`📦 JAR  (DÙNG CHUNG) tại: ${JAR_DIR}`);
    console.log(`🎨 Assets RIÊNG (emu/web/style...) tại: ${ASSETS_DIR}`);
    console.log(`🚀 Logic + tài nguyên RIÊNG cho PC — sửa thoải mái không ảnh hưởng Mobile.`);
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
  gameRegistry
};
