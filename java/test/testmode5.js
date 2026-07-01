const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
    gameRegistry.set(id, {
      id,
      file,
      name: cleanName(file),
      fullPath,
      resolution: extractResolution(file)
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
    hasIcon: false
  }));
  dbg('API /api/jars count=' + games.length);
  res.json({ games, devs: [], profiles: [] });
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
