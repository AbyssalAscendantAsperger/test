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
// Lỗi localhost: router KHÔNG được mặc định host = 'localhost' nữa
if (/MOBILE_HOST = process\.env\.MOBILE_HOST \|\| null/.test(serverSrc) &&
    /PC_HOST\s*=\s*process\.env\.PC_HOST\s*\|\|\s*null/.test(serverSrc))
  ok('server.js KHÔNG hardcode localhost (dùng host client truy cập — sửa lỗi LAN/public)');
else bad('server.js vẫn mặc định host = localhost (lỗi Mode4 trắng màn hình trên IP)');
if (/clientHostname/.test(serverSrc)) ok('server.js có clientHostname() lấy host từ Host/X-Forwarded-Host');
else bad('server.js thiếu clientHostname()');

// ---- 4) jar/ & saves/ DÙNG CHUNG -------------------------------------------
head('4) jar/ và saves/ được DÙNG CHUNG (cùng SHARED_ROOT = __dirname)');
const sharePat = [/JAR_DIR = path\.join\(SHARED_ROOT, 'jar'\)/, /SAVES_DIR = path\.join\(SHARED_ROOT, 'saves'\)/, /SHARED_ROOT = __dirname/];
const bothShare = sharePat.every(re => re.test(mobieSrc)) && sharePat.every(re => re.test(pcSrc));
if (bothShare) ok('mobie.js & pc.js trỏ jar/ và saves/ vào cùng SHARED_ROOT (dùng chung)');
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

// ---- 4c) TÁCH HOÀN TOÀN tài nguyên emu/web, chỉ chung jar/ & saves/ ----------
head('4c) Tách hết emu/web (assets riêng); chỉ jar/ & saves/ dùng chung');
// Mỗi server trỏ ASSETS_DIR riêng
if (/assets_mobile/.test(mobieSrc) && !/assets_pc/.test(mobieSrc)) ok('mobie.js dùng assets_mobile/ (không đụng assets_pc)');
else bad('mobie.js không trỏ đúng assets_mobile/');
if (/assets_pc/.test(pcSrc) && !/assets_mobile/.test(pcSrc)) ok('pc.js dùng assets_pc/ (không đụng assets_mobile)');
else bad('pc.js không trỏ đúng assets_pc/');

// jar/ & saves/ trỏ SHARED_ROOT (__dirname), KHÔNG nằm trong assets_*
const sharedOk = src =>
  /JAR_DIR = path\.join\(SHARED_ROOT, 'jar'\)/.test(src) &&
  /SAVES_DIR = path\.join\(SHARED_ROOT, 'saves'\)/.test(src) &&
  /SHARED_ROOT = __dirname/.test(src);
if (sharedOk(mobieSrc) && sharedOk(pcSrc)) ok('jar/ & saves/ trỏ SHARED_ROOT (dùng chung), KHÔNG nằm trong assets_*');
else bad('jar/ hoặc saves/ không trỏ SHARED_ROOT đúng cách');

// /emu và /web phải lấy từ ASSETS_DIR (không phải __dirname/web hay __dirname root)
const emuFromAssets = src => /express\.static\(JAVA_DIR\)/.test(src) && /const JAVA_DIR = ASSETS_DIR/.test(src);
const webFromAssets = src => /express\.static\(path\.join\(ASSETS_DIR, 'web'\)/.test(src);
if (emuFromAssets(mobieSrc) && emuFromAssets(pcSrc)) ok('/emu phục vụ từ assets riêng của từng nền tảng');
else bad('/emu không phục vụ từ ASSETS_DIR');
if (webFromAssets(mobieSrc) && webFromAssets(pcSrc)) ok('/web phục vụ từ assets riêng của từng nền tảng');
else bad('/web không phục vụ từ ASSETS_DIR');

// FALLBACK cache nằm trong assets riêng (không chung)
if (/FALLBACK_APPS_DIR = path\.join\(ASSETS_DIR, 'web', 'apps'\)/.test(mobieSrc) &&
    /FALLBACK_APPS_DIR = path\.join\(ASSETS_DIR, 'web', 'apps'\)/.test(pcSrc))
  ok('Fallback bundle (web/apps) RIÊNG theo từng nền tảng');
else bad('Fallback bundle không tách riêng');

// Tồn tại 2 cây assets độc lập, mỗi cây có đủ emu assets
const need = ['bld', 'libs', 'style', 'config', 'web', 'main.html', 'keymap.js'];
for (const base of ['assets_mobile', 'assets_pc']) {
  const missing = need.filter(n => !fs.existsSync(path.join(DIR, base, n)));
  if (missing.length === 0) ok(`${base}/ có đủ tài nguyên emu (bld, libs, style, config, web, main.html, keymap.js)`);
  else bad(`${base}/ thiếu: ${missing.join(', ')}`);
}
// jar/ & saves/ KHÔNG bị nhân bản vào assets (tránh nhầm là dùng chung)
for (const base of ['assets_mobile', 'assets_pc']) {
  const leaked = ['jar', 'saves'].filter(n => fs.existsSync(path.join(DIR, base, n)));
  if (leaked.length === 0) ok(`${base}/ KHÔNG chứa bản sao jar/ hay saves/ (đúng: chỉ dùng chung ở root)`);
  else bad(`${base}/ lỡ chứa: ${leaked.join(', ')} (phải dùng chung, không sao chép)`);
}

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

function req(opts, body) {
  return new Promise(resolve => {
    const r = http.request(opts, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    r.on('error', e => resolve({ status: 0, err: e.message }));
    r.setTimeout(4000, () => { r.destroy(); resolve({ status: 0, err: 'timeout' }); });
    if (body != null) r.write(body);
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

  // emu/web assets phục vụ độc lập trên từng nền tảng
  const me = await get(3001, '/emu/main.html');
  if (me.status === 200) ok('mobie.js (3001) phục vụ /emu/main.html từ assets_mobile'); else bad('mobie /emu/main.html -> ' + me.status);
  if (me.status === 200 && /JARDownloader/.test(me.body) && /handleEvent/.test(me.body)) ok('mobie legacy main.html có DumbPipe bridge nội bộ cho JARDownloader/mobileInfo');
  else bad('mobie legacy main.html thiếu DumbPipe bridge nội bộ');
  const mclasses = await get(3001, '/emu/java/classesold.jar');
  if (mclasses.status === 200) ok('mobie.js (3001) phục vụ shared legacy classes jar qua /emu/java/classesold.jar'); else bad('mobie /emu/java/classesold.jar -> ' + mclasses.status);
  const mw = await get(3001, '/web/run.html');
  if (mw.status === 200) ok('mobie.js (3001) phục vụ /web/run.html từ assets_mobile'); else bad('mobie /web/run.html -> ' + mw.status);
  const pe = await get(3002, '/emu/main.html');
  if (pe.status === 200) ok('pc.js (3002) phục vụ /emu/main.html từ assets_pc'); else bad('pc /emu/main.html -> ' + pe.status);
  if (pe.status === 200 && /JARDownloader/.test(pe.body) && /handleEvent/.test(pe.body)) ok('pc legacy main.html có DumbPipe bridge nội bộ cho JARDownloader/mobileInfo');
  else bad('pc legacy main.html thiếu DumbPipe bridge nội bộ');
  const pclasses = await get(3002, '/emu/java/classesold.jar');
  if (pclasses.status === 200) ok('pc.js (3002) phục vụ shared legacy classes jar qua /emu/java/classesold.jar'); else bad('pc /emu/java/classesold.jar -> ' + pclasses.status);
  const pw = await get(3002, '/web/run.html');
  if (pw.status === 200) ok('pc.js (3002) phục vụ /web/run.html từ assets_pc'); else bad('pc /web/run.html -> ' + pw.status);

  // Regression mobile/ngrok: nếu client hủy upload save giữa chừng thì server mobile
  // phải xử lý êm, không crash vì raw-body "request aborted".
  const abortedReq = await new Promise(resolve => {
    const rq = http.request({ host: 'localhost', port: 3001, path: '/api/save?gameId=abortedcheck', method: 'POST', headers: { 'Content-Type': 'text/plain', 'Content-Length': '999999' } });
    rq.on('error', () => resolve({ ok: true }));
    rq.write('partial-save-data');
    setTimeout(() => { try { rq.destroy(); } catch (e) {} resolve({ ok: true }); }, 30);
  });
  await new Promise(r => setTimeout(r, 150));
  const aliveAfterAbort = await get(3001, '/api/platform');
  try {
    if (aliveAfterAbort.status === 200 && JSON.parse(aliveAfterAbort.body).platform === 'mobile') ok('mobie.js sống bình thường sau khi client abort /api/save (không crash vì raw-body request aborted)');
    else bad('mobie.js lỗi sau aborted save request: ' + JSON.stringify(aliveAfterAbort));
  } catch { bad('mobie.js không phản hồi được sau aborted save request'); }

  // JAR & SAVE dùng chung: lưu save qua mobile, đọc lại qua PC (cùng sid cookie)
  const launchCheckJson = JSON.parse((await get(3001, '/api/jars')).body || '{}');
  const launchCheckGame = (launchCheckJson.games || [])[0];
  if (launchCheckGame) {
    const launchLegacy = await get(3001, '/api/launch?id=' + launchCheckGame.id + '&enginemode=enginemode2-classes2.jar');
    try {
      const launchData = JSON.parse(launchLegacy.body || '{}');
      if (launchLegacy.status === 200 && /jars=%2Femu%2Fjar%2F/.test(launchData.url || '')) ok('mobie.js tạo URL legacy với jars=/emu/jar/<token> (không còn path tương đối dễ treo Downloading MIDlet)');
      else bad('mobie.js launch legacy vẫn dùng jars path cũ: ' + JSON.stringify(launchData));
    } catch {
      bad('mobie.js trả launch legacy không hợp lệ');
    }
  }

  // JAR & SAVE dùng chung: lưu save qua mobile, đọc lại qua PC (cùng sid cookie)
  const jarsJson = JSON.parse((await get(3001, '/api/jars')).body || '{}');
  const firstGame = (jarsJson.games || [])[0];
  if (firstGame) {
    const sid = 'sharedcheck' + Date.now().toString(16);
    const payload = 'SAVE_SHARED_' + Date.now();
    const post = await req({ host: 'localhost', port: 3001, path: '/api/save?gameId=' + firstGame.id, method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Cookie': 'sid=' + sid } }, payload);
    const load = await req({ host: 'localhost', port: 3002, path: '/api/load?gameId=' + firstGame.id, method: 'GET',
      headers: { 'Cookie': 'sid=' + sid } });
    if (load.status === 200 && load.body === payload)
      ok('SAVE DÙNG CHUNG: lưu qua mobile(3001) đọc lại đúng qua pc(3002)');
    else bad('Save không dùng chung giữa 2 nền tảng: ' + JSON.stringify({ status: load.status, body: (load.body||'').slice(0,40) }));
  } else {
    console.log('  (bỏ qua test save dùng chung: không có JAR trong jar/)');
  }

  const rm = await get(3000, '/', { 'user-agent': UA_MOBILE });
  if (rm.status === 302 && /:3001/.test(rm.headers.location || '')) ok('router: UA mobile -> 302 :3001  (' + rm.headers.location + ')');
  else bad('router mobile sai: ' + JSON.stringify({ status: rm.status, loc: rm.headers && rm.headers.location }));

  const rp = await get(3000, '/', { 'user-agent': UA_DESKTOP });
  if (rp.status === 302 && /:3002/.test(rp.headers.location || '')) ok('router: UA desktop -> 302 :3002  (' + rp.headers.location + ')');
  else bad('router desktop sai: ' + JSON.stringify({ status: rp.status, loc: rp.headers && rp.headers.location }));

  const rf = await get(3000, '/?platform=mobile', { 'user-agent': UA_DESKTOP });
  if (rf.status === 302 && /:3001/.test(rf.headers.location || '')) ok('router: ?platform=mobile ép buộc -> :3001');
  else bad('router ép buộc sai: ' + JSON.stringify({ status: rf.status, loc: rf.headers && rf.headers.location }));

  // === REGRESSION: lỗi localhost trên IP LAN/public (Mode4 màn hình trắng) ===
  // Giả lập client truy cập qua IP LAN: header Host = 192.168.1.50:3000
  const lan = await get(3000, '/', { 'user-agent': UA_MOBILE, 'host': '192.168.1.50:3000' });
  if (lan.status === 302 && /^https?:\/\/192\.168\.1\.50:3001\//.test(lan.headers.location || ''))
    ok('IP LAN: Host 192.168.1.50:3000 -> redirect 192.168.1.50:3001 (KHÔNG còn localhost)  (' + lan.headers.location + ')');
  else bad('LAN redirect sai (vẫn localhost?): ' + JSON.stringify({ status: lan.status, loc: lan.headers && lan.headers.location }));

  // Giả lập client truy cập qua domain/public: Host = play.example.com
  const pub = await get(3000, '/?platform=pc', { 'user-agent': UA_DESKTOP, 'host': 'play.example.com' });
  if (pub.status === 302 && /^https?:\/\/play\.example\.com:3002\//.test(pub.headers.location || ''))
    ok('Public: Host play.example.com -> redirect play.example.com:3002 (giữ đúng domain)  (' + pub.headers.location + ')');
  else bad('Public redirect sai: ' + JSON.stringify({ status: pub.status, loc: pub.headers && pub.headers.location }));

  // Phải KHÔNG xuất hiện 'localhost' khi client dùng IP/domain khác
  const lanLoc = (lan.headers && lan.headers.location) || '';
  const pubLoc = (pub.headers && pub.headers.location) || '';
  if (lan.status === 302 && pub.status === 302 && !/localhost/.test(lanLoc) && !/localhost/.test(pubLoc))
    ok('Redirect KHÔNG bao giờ ép localhost khi client dùng IP/domain thật');
  else bad('Redirect vẫn lòi ra localhost khi client dùng IP/domain thật');

  // X-Forwarded-Host (sau reverse proxy) cũng phải được tôn trọng
  const fwd = await get(3000, '/', { 'user-agent': UA_MOBILE, 'host': 'internal:3000', 'x-forwarded-host': '10.0.0.7:3000' });
  if (fwd.status === 302 && /^https?:\/\/10\.0\.0\.7:3001\//.test(fwd.headers.location || ''))
    ok('Sau proxy: X-Forwarded-Host 10.0.0.7 được dùng -> 10.0.0.7:3001');
  else bad('X-Forwarded-Host không được tôn trọng: ' + JSON.stringify({ status: fwd.status, loc: fwd.headers && fwd.headers.location }));

  // dọn dẹp
  servers.forEach(s => { try { s.kill('SIGKILL'); } catch {} });
  await new Promise(r => setTimeout(r, 200));

  head(failed === 0 ? '✅ BUILD CHECK PASSED' : `❌ BUILD CHECK FAILED (${failed} lỗi)`);
  if (failed && serverErr) console.log('\n--- server stderr ---\n' + serverErr.slice(0, 2000));
  process.exit(failed === 0 ? 0 : 1);
})();
