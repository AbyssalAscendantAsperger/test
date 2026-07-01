const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const app = express();
const ROOT = __dirname;
const SHARED_ROOT = path.resolve(ROOT, '..');
const JAR_DIR = path.join(SHARED_ROOT, 'jar');
const PUBLIC_DIR = path.join(ROOT, 'public_test');
const ASSETS_DIR = path.join(ROOT, 'assets_test');

const CORE_PORT = Number(process.env.PORT || 3015);
const CORE_ORIGIN = process.env.CORE_ORIGIN || `http://localhost:${CORE_PORT}`;
const MODE5_CORE_ARG = Object.prototype.hasOwnProperty.call(process.env, 'MODE5_CORE_ARG')
  ? String(process.env.MODE5_CORE_ARG || '')
  : '';

const tokenStore = new Map();
const TOKEN_TTL_MS = 30 * 60 * 1000;
const gameRegistry = new Map();
let lastJarChecksum = '';

function dbg(...args) { console.log('[TESTMODE5]', ...args); }
function requestOrigin(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0];
  return proto + '://' + req.get('host');
}
function issueToken(gameId, extra = {}) {
  const token = crypto.randomBytes(18).toString('hex');
  tokenStore.set(token, { gameId, createdAt: Date.now(), ...extra });
  dbg('issueToken', { gameId, token });
  return token;
}
function verifyToken(token) {
  const info = tokenStore.get(token);
  if (!info) return null;
  if (Date.now() - info.createdAt > TOKEN_TTL_MS) {
    tokenStore.delete(token);
    return null;
  }
  return info;
}
setInterval(() => {
  const now = Date.now();
  for (const [t, info] of tokenStore) {
    if (now - info.createdAt > TOKEN_TTL_MS) tokenStore.delete(t);
  }
}, 60000).unref();

// ---------------------------------------------------------------------------
// JAR manifest & icon parsing (bê từ pc.js — đủ dùng cho web test)
// ---------------------------------------------------------------------------
function readZipEntries(buffer) {
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
    if (filename.endsWith('/')) continue;
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + filenameLen + localExtraLen;
    dir[filename] = { compressionMethod, data: Buffer.from(buffer, dataOffset, compressedLen), uncompressedLen };
  }
  return dir;
}
function decompressEntry(entry) {
  if (entry.compressionMethod === 0) return entry.data;
  if (entry.compressionMethod === 8) return zlib.inflateRawSync(entry.data);
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
  return { name: gameName || null, icon, manifest, dev, profile, config, version };
}

function extractResolution(fileName) {
  const m = String(fileName || '').match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/i);
  if (m) {
    const w = parseInt(m[1], 10);
    const h = parseInt(m[2], 10);
    if (w >= 128 && w <= 800 && h >= 128 && h <= 800) return { width: w, height: h };
  }
  return { width: 240, height: 320 };
}
function cleanName(file) {
  return String(file || '').replace(/\.jar$/i, '').replace(/[_-]+/g, ' ').trim();
}
function getJarChecksum() {
  try {
    const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar')).sort();
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
function buildGameRegistry() {
  gameRegistry.clear();
  fs.mkdirSync(JAR_DIR, { recursive: true });
  const files = fs.readdirSync(JAR_DIR).filter(f => f.toLowerCase().endsWith('.jar')).sort();
  for (const file of files) {
    const fullPath = path.join(JAR_DIR, file);
    const id = 'g' + crypto.createHash('sha1').update(file).digest('hex').slice(0, 14);
    let meta = { name: null, icon: null, dev: '', profile: '', config: '', version: '' };
    try { meta = extractJarMetadata(fullPath); } catch (e) { dbg('extractJarMetadata error', file, e && e.message || e); }
    const name = meta.name || cleanName(file);
    gameRegistry.set(id, {
      id,
      file,
      name,
      fullPath,
      resolution: extractResolution(file),
      icon: meta.icon || null,
      dev: meta.dev || 'Unknown',
      profile: meta.profile || 'Unknown',
      config: meta.config || '',
      version: meta.version || ''
    });
  }
  dbg('buildGameRegistry count=' + gameRegistry.size);
}
function rebuildGameRegistryIfNeeded() {
  const checksum = getJarChecksum();
  if (checksum !== lastJarChecksum) {
    dbg('jar checksum changed', { before: lastJarChecksum, after: checksum });
    buildGameRegistry();
    lastJarChecksum = checksum;
  }
}
function walk(dir, base = '') {
  let out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.join(base, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out = out.concat(walk(full, rel));
    else out.push({ path: rel.replace(/\\/g, '/'), size: st.size });
  }
  return out;
}

buildGameRegistry();
lastJarChecksum = getJarChecksum();

app.use((req, res, next) => {
  dbg('REQ', req.method, req.originalUrl, 'range=' + (req.headers.range || 'none'));
  res.setHeader('Origin-Agent-Cluster', '?1');
  next();
});

app.use('/web5', (req, res, next) => {
  const rel = decodeURIComponent((req.path || '').split('?')[0]);
  const full = path.join(ASSETS_DIR, 'web5', rel);
  try {
    if (!fs.existsSync(full)) dbg('WEB5 MISS', rel, '->', full);
    else {
      const st = fs.statSync(full);
      dbg('WEB5 HIT', rel, 'size=' + st.size, 'dir=' + st.isDirectory());
      if (st.size === 0 && req.headers.range) {
        dbg('WEB5 remove range header on zero-byte file', rel);
        delete req.headers.range;
      }
    }
  } catch (e) {
    dbg('WEB5 inspect error', rel, e.message);
  }
  if (rel === '/app/freej2me.jar' || rel === '/app/freej2me-sdl.jar') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  res.on('finish', () => dbg('WEB5 RES', req.method, req.originalUrl, 'status=' + res.statusCode));
  next();
});

app.use('/web5', express.static(path.join(ASSETS_DIR, 'web5'), { acceptRanges: true }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/jars', (req, res) => {
  rebuildGameRegistryIfNeeded();
  const games = [...gameRegistry.values()].map(g => ({
    id: g.id,
    name: g.name,
    file: g.file,
    resolution: g.resolution,
    hasIcon: !!g.icon,
    dev: g.dev,
    profile: g.profile,
    config: g.config,
    version: g.version
  }));
  const devs = [...new Set(games.map(g => g.dev).filter(v => v && v !== 'Unknown'))].sort((a, b) => a.localeCompare(b, 'vi'));
  const profiles = [...new Set(games.map(g => g.profile).filter(v => v && v !== 'Unknown'))].sort();
  dbg('API /api/jars count=' + games.length + ' devs=' + devs.length + ' profiles=' + profiles.length);
  res.json({ games, devs, profiles });
});

// Icon từ JAR (cache dài vì icon ít đổi)
app.get('/api/icon/:id', (req, res) => {
  rebuildGameRegistryIfNeeded();
  const game = gameRegistry.get(String(req.params.id || ''));
  if (!game || !game.icon || !game.icon.buffer) {
    return res.status(404).send('no icon');
  }
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', game.icon.mime || 'application/octet-stream');
  res.send(game.icon.buffer);
});

app.get('/api/launch', (req, res) => {
  rebuildGameRegistryIfNeeded();
  const id = String(req.query.id || '');
  const game = gameRegistry.get(id);
  if (!game) return res.status(400).json({ error: 'Game không hợp lệ' });

  const token = issueToken(id, { jarPath: game.fullPath });
  const r = game.resolution;
  const origin = requestOrigin(req);
  const appJarPath = '/app/emu/jar/' + encodeURIComponent(token) + '.jar';
  const cfgParam = MODE5_CORE_ARG ? '&cfg=' + encodeURIComponent(MODE5_CORE_ARG) : '';
  const runnerPath =
    '/web5/cheerpj_run.html?token=' + encodeURIComponent(token) +
    '&jarUrl=' + encodeURIComponent(appJarPath) +
    '&width=' + encodeURIComponent(r.width) +
    '&height=' + encodeURIComponent(r.height) +
    cfgParam +
    '&debug=1' +
    '&parentOrigin=' + encodeURIComponent(origin) +
    '&file=' + encodeURIComponent(game.file);

  dbg('LAUNCH SAME-PORT game=' + game.file + ' id=' + id + ' res=' + r.width + 'x' + r.height);
  dbg('LAUNCH SAME-PORT appJarPath=' + appJarPath);
  dbg('LAUNCH SAME-PORT cfg=' + (MODE5_CORE_ARG || '<none>'));
  dbg('LAUNCH SAME-PORT url=' + runnerPath);

  res.json({
    success: true,
    engine: 'cheerpj',
    mode: 'mode5-same-port',
    url: runnerPath,
    runnerOrigin: origin,
    resolution: r,
    file: game.file
  });
});

app.get('/api/debug/files', (req, res) => {
  res.json({
    cwd: process.cwd(),
    root: ROOT,
    origin: requestOrigin(req),
    jars: [...gameRegistry.values()],
    web5Files: fs.existsSync(path.join(ASSETS_DIR, 'web5')) ? walk(path.join(ASSETS_DIR, 'web5')) : []
  });
});

app.get('/emu/jar', (req, res) => {
  // CheerpJ may probe the directory with range=0-0. Keep it harmless.
  res.status(404).send('');
});

app.get('/emu/jar/:token', (req, res) => {
  const rawToken = String(req.params.token || '');
  const token = rawToken.replace(/\.(jar|jad)$/i, '');
  const info = verifyToken(token);
  if (!info) {
    dbg('JAR forbidden token', token);
    return res.status(403).send('Forbidden');
  }
  const game = gameRegistry.get(info.gameId);
  const jarPath = info.jarPath || (game && game.fullPath);
  if (!game || !jarPath || !fs.existsSync(jarPath)) {
    dbg('JAR not found', { gameId: info.gameId, jarPath });
    return res.status(404).send('Not found');
  }
  const st = fs.statSync(jarPath);
  dbg('JAR send file=' + path.basename(jarPath) + ' gameId=' + info.gameId + ' size=' + st.size + ' range=' + (req.headers.range || 'none'));
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/java-archive');
  res.sendFile(jarPath);
});

app.post('/api/browser-log', express.text({ type: '*/*', limit: '1mb' }), (req, res) => {
  console.log('[RUNNER-BROWSER]', String(req.body || '').slice(0, 5000));
  res.json({ ok: true });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, role: 'same-port', ts: Date.now() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(CORE_PORT, '0.0.0.0', () => {
  dbg('SAME-PORT UI+Runner started at ' + CORE_ORIGIN);
  dbg('ROOT=' + ROOT);
  dbg('JAR_DIR=' + JAR_DIR);
  dbg('PUBLIC_DIR=' + PUBLIC_DIR);
  dbg('ASSETS_DIR=' + ASSETS_DIR);
  dbg('Mode duy nhất: mode5 same-port 3015');
});
