// ============================================================================
//  build_check.js — "Build thử" + kiểm chứng kiến trúc tách logic.
//  Chạy:  node build_check.js   (hoặc: npm run build)
//
//  Kiểm tra:
//   1) Cú pháp 3 file (node --check) — coi như "build" cho dự án Node thuần.
//   2) mobie.js và pc.js KHÔNG require lẫn nhau và KHÔNG require server.js
//      (đảm bảo không dùng chung logic từ phía server).
//   3) server.js (router) KHÔNG chứa logic game (không require express.static
//      của emulator, không có /api/jars, /api/launch, ...).
//   4) Smoke test: bật mobie(3001) + pc(3002) + router(3000), kiểm tra:
//        - /api/platform của mobie trả {platform:'mobile'}
//        - /api/platform của pc    trả {platform:'pc'}
//        - router 302 redirect UA mobile -> :3001, UA desktop -> :3002
//        - jar/ và saves/ dùng chung (cùng đường dẫn tuyệt đối ở cả 2 file).
// ============================================================================
const { spawnSync, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
let failed = 0;
function ok(msg)   { console.log('  \x1b[32m✔\x1b[0m ' + msg); }
function bad(msg)  { console.log('  \x1b[31m\u2717\x1b[0m ' + msg); failed++; }
function head(msg) { console.log('\n\x1b[1m' + msg + '\x1b[0m'); }

// ---- 1) Build/syntax check --------------------------------------------------
head('1) Kiểm tra cú pháp (build thử) các file');
for (const f of ['mobie.js', 'pc.js', 'server.js', 'start_all.js']) {
  const r = spawnSync(process.execPath, ['--check', path.join(DIR, f)], { encoding: 'utf8' });
  if (r.status === 0) ok(`${f} cú pháp hợp lệ`);
  else bad(`${f} LỖI cú pháp:\n${r.stderr}`);
}

// ---- 2) Không dùng chung logic giữa mobie.js và pc.js -----------------------
head('2) mobie.js & pc.js KHÔNG dùng chung logic server');
const mobieSrc = fs.readFileSync(path.join(DIR, 'mobie.js'), 'utf8');
const pcSrc    = fs.readFileSync(path.join(DIR, 'pc.js'), 'utf8');
const serverSrc = fs.readFileSync(path.join(DIR, 'server.js'), 'utf8');

const crossRefs = [/require\(['"]\.\/pc(\.js)?['"]\)/, /require\(['"]\.\/server(\.js)?['"]\)/];
if (!crossRefs.some(re => re.test(mobieSrc))) ok('mobie.js KHÔNG require pc.js / server.js');
else bad('mobie.js đang require pc.js hoặc server.js (dùng chung logic!)');

const crossRefs2 = [/require\(['"]\.\/mobie(\.js)?['"]\)/, /require\(['"]\.\/server(\.js)?['"]\)/];
if (!crossRefs2.some(re => re.test(pcSrc))) ok('pc.js KHÔNG require mobie.js / server.js');
else bad('pc.js đang require mobie.js hoặc server.js (dùng chung logic!)');

// Không có module logic chung nào (vd ./core, ./shared) được cả 2 import.
const sharedReq = src => (src.match(/require\(['"]\.\/[^'"]+['"]\)/g) || [])
  .filter(r => !/express|tools\//.test(r));  // express là thư viện ngoài; tools/ là script độc lập
const mShared = sharedReq(mobieSrc), pShared = sharedReq(pcSrc);
const common = mShared.filter(r => pShared.includes(r));
if (common.length === 0) ok('Không có module logic nội bộ nào được CẢ HAI import');
else bad('Cả hai cùng import module nội bộ (logic chung): ' + common.join(', '));

// Mỗi file phải có PLATFORM riêng.
if (/const PLATFORM = 'mobile'/.test(mobieSrc)) ok("mobie.js đánh dấu PLATFORM = 'mobile'");
else bad("mobie.js thiếu PLATFORM = 'mobile'");
if (/const PLATFORM = 'pc'/.test(pcSrc)) ok("pc.js đánh dấu PLATFORM = 'pc'");
else bad("pc.js thiếu PLATFORM = 'pc'");

// ---- 3) server.js là router thuần (không chứa logic game) -------------------
head('3) server.js (cổng 3000) là ROUTER thuần — không chứa logic game');
const gameLeaks = ['/api/jars', '/api/launch', 'gameRegistry', 'extractJarMetadata', 'searchDedomil'];
const leaked = gameLeaks.filter(s => serverSrc.includes(s));
if (leaked.length === 0) ok('server.js KHÔNG còn logic game (chỉ chuyển hướng)');
else bad('server.js vẫn còn logic game: ' + leaked.join(', '));
if (/res\.redirect\(/.test(serverSrc)) ok('server.js có chuyển hướng (res.redirect)');
else bad('server.js không thấy res.redirect');

// ---- 4) jar/ & saves/ DÙNG CHUNG -------------------------------------------
head('4) jar/ và saves/ được DÙNG CHUNG (cùng __dirname)');
const sharePat = [/JAR_DIR = path\.join\(JAVA_DIR, 'jar'\)/, /SAVES_DIR = path\.join\(JAVA_DIR, 'saves'\)/, /JAVA_DIR = __dirname/];
const bothShare = sharePat.every(re => re.test(mobieSrc)) && sharePat.every(re => re.test(pcSrc));
if (bothShare) ok('mobie.js & pc.js trỏ jar/ và saves/ vào cùng thư mục java/ (dùng chung)');
else bad('Đường dẫn jar/ hoặc saves/ không khớp giữa 2 file');

// ---- 4b) FRONTEND tách riêng, không "cố tương thích" chéo -------------------
head('4b) Frontend tách riêng (public_mobile/ vs public_pc/), không tương thích chéo');
const fe = p => fs.readFileSync(path.join(DIR, p), 'utf8');
// mobie.js phải trỏ public_mobile, pc.js phải trỏ public_pc
if (/public_mobile/.test(mobieSrc) && !/public_pc/.test(mobieSrc)) ok('mobie.js phục vụ public_mobile/ (không đụng public_pc)');
else bad('mobie.js không trỏ đúng public_mobile/');
if (/public_pc/.test(pcSrc) && !/public_mobile/.test(pcSrc)) ok('pc.js phục vụ public_pc/ (không đụng public_mobile)');
else bad('pc.js không trỏ đúng public_pc/');

// PC: không còn cờ mobile=1 trong URL (chỉ tính khi nằm trong chuỗi URL, bỏ qua comment)
const pcUrlHasMobile = /index\.html\?[^`'"]*mobile=1/.test(pcSrc);
const mobUrlHasMobile = /index\.html\?[^`'"]*mobile=1/.test(mobieSrc);
if (!pcUrlHasMobile) ok('pc.js KHÔNG còn cờ ?mobile=1 trong URL (đã bỏ tương thích mobile)');
else bad('pc.js vẫn còn ?mobile=1 trong URL');
if (mobUrlHasMobile) ok('mobie.js giữ cờ ?mobile=1 trong URL (đúng cho mobile)');
else bad('mobie.js thiếu ?mobile=1 trong URL');

// PC index.html: không auto-rotate theo orientation, không dò touch để hiện keypad
const pcHtml = fe('public_pc/index.html');
if (!/startAutoRotate\(\)|startAutoRotateInteractionWatch\(loadedFrame\)/.test(pcHtml.split('currentFrame.onload')[1] ? pcHtml.split('currentFrame.onload')[1].slice(0,600) : ''))
  ok('public_pc: KHÔNG gọi auto-rotate khi nạp game (bỏ logic xoay tự động kiểu mobile)');
else bad('public_pc vẫn auto-rotate khi nạp game');
if (!/'ontouchstart' in window/.test(pcHtml)) ok('public_pc: KHÔNG dò touch để hiện keypad (luôn hiện, layout cố định)');
else bad('public_pc vẫn dò ontouchstart để hiện keypad');

// PC keymap patch: bỏ guard "if(!isPC)return" và bỏ @media (bỏ qua comment khi kiểm tra)
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const pcPatch = stripComments(fe('public_pc/patch_keymap_v7.js'));
if (!/if\s*\(\s*!\s*isPC\s*\)/.test(pcPatch)) ok('public_pc keymap: bỏ guard mobile (if(!isPC)return)');
else bad('public_pc keymap vẫn còn guard mobile if(!isPC)');
if (!/@media\s*\(/.test(pcPatch)) ok('public_pc keymap: CSS desktop áp dụng vô điều kiện (không @media)');
else bad('public_pc keymap vẫn dùng @media (tương thích co giãn)');

// Mobile keymap patch: là no-op, không chứa PC key-bridge
const mobPatch = fe('public_mobile/patch_keymap_v7.js');
if (!/pc-key-bridge|PC_TO_MIDP|setupKeyboardMapping/.test(mobPatch)) ok('public_mobile keymap: no-op, KHÔNG còn code PC key-bridge');
else bad('public_mobile keymap vẫn còn code PC');

// ---- 5) Smoke test runtime --------------------------------------------------
head('5) Smoke test: bật mobie(3001) + pc(3002) + router(3000)');
const env = { ...process.env };
const servers = [
  spawn(process.execPath, ['mobie.js'], { cwd: DIR, env, stdio: ['ignore', 'ignore', 'pipe'] }),
  spawn(process.execPath, ['pc.js'],    { cwd: DIR, env, stdio: ['ignore', 'ignore', 'pipe'] }),
  spawn(process.execPath, ['server.js'],{ cwd: DIR, env, stdio: ['ignore', 'ignore', 'pipe'] }),
];
let serverErr = '';
servers.forEach(s => s.stderr.on('data', d => serverErr += d));

function req(opts) {
  return new Promise(resolve => {
    const r = http.request(opts, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    r.on('error', e => resolve({ status: 0, err: e.message }));
    r.setTimeout(4000, () => { r.destroy(); resolve({ status: 0, err: 'timeout' }); });
    r.end();
  });
}
const get = (port, pathStr, headers = {}) =>
  req({ host: 'localhost', port, path: pathStr, method: 'GET', headers });

const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 13; Pixel) AppleWebKit/537.36 Mobile';
const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  await new Promise(r => setTimeout(r, 1200)); // chờ server sẵn sàng

  const m = await get(3001, '/api/platform');
  try {
    if (m.status === 200 && JSON.parse(m.body).platform === 'mobile') ok('mobie.js (3001) trả platform=mobile');
    else bad('mobie.js (3001) sai: ' + JSON.stringify(m));
  } catch { bad('mobie.js (3001) không phản hồi JSON: ' + JSON.stringify(m)); }

  const p = await get(3002, '/api/platform');
  try {
    if (p.status === 200 && JSON.parse(p.body).platform === 'pc') ok('pc.js (3002) trả platform=pc');
    else bad('pc.js (3002) sai: ' + JSON.stringify(p));
  } catch { bad('pc.js (3002) không phản hồi JSON: ' + JSON.stringify(p)); }

  const mh = await get(3001, '/');
  if (mh.status === 200 && /content="mobile"/.test(mh.body)) ok('mobie.js (3001) phục vụ frontend MOBILE (x-platform=mobile)');
  else bad('mobie.js (3001) không phục vụ frontend mobile: ' + JSON.stringify({ status: mh.status }));

  const ph = await get(3002, '/');
  if (ph.status === 200 && /content="pc"/.test(ph.body)) ok('pc.js (3002) phục vụ frontend PC (x-platform=pc)');
  else bad('pc.js (3002) không phục vụ frontend pc: ' + JSON.stringify({ status: ph.status }));

  const rm = await get(3000, '/', { 'user-agent': UA_MOBILE });
  if (rm.status === 302 && /:3001/.test(rm.headers.location || '')) ok('router: UA mobile -> 302 :3001  (' + rm.headers.location + ')');
  else bad('router mobile sai: ' + JSON.stringify({ status: rm.status, loc: rm.headers && rm.headers.location }));

  const rp = await get(3000, '/', { 'user-agent': UA_DESKTOP });
  if (rp.status === 302 && /:3002/.test(rp.headers.location || '')) ok('router: UA desktop -> 302 :3002  (' + rp.headers.location + ')');
  else bad('router desktop sai: ' + JSON.stringify({ status: rp.status, loc: rp.headers && rp.headers.location }));

  const rf = await get(3000, '/?platform=mobile', { 'user-agent': UA_DESKTOP });
  if (rf.status === 302 && /:3001/.test(rf.headers.location || '')) ok('router: ?platform=mobile ép buộc -> :3001');
  else bad('router ép buộc sai: ' + JSON.stringify({ status: rf.status, loc: rf.headers && rf.headers.location }));

  // dọn dẹp
  servers.forEach(s => { try { s.kill('SIGKILL'); } catch {} });
  await new Promise(r => setTimeout(r, 200));

  head(failed === 0 ? '✅ BUILD CHECK PASSED' : `❌ BUILD CHECK FAILED (${failed} lỗi)`);
  if (failed && serverErr) console.log('\n--- server stderr ---\n' + serverErr.slice(0, 2000));
  process.exit(failed === 0 ? 0 : 1);
})();
