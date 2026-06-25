// Test API save/load (per-session) tự động.
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');

// Dọn port 3000 nếu còn process cũ (tránh EADDRINUSE khi test crash lần trước)
try {
  const p = execSync("ss -ltnp 'sport = :3000' 2>/dev/null | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2").toString().trim();
  if (p) { process.kill(parseInt(p)); console.log('🧹 dọn port 3000 (pid', p + ')'); }
} catch (e) {}

const SERVER = spawn(process.execPath, ['server.js'], {
  cwd: '/home/user/repo/java', stdio: ['ignore', 'pipe', 'pipe'],
});
// Luôn kill server khi thoát (dù test có lỗi)
const kill = () => { try { SERVER.kill('SIGKILL'); } catch (e) {} };
process.on('exit', kill);
process.on('SIGINT', () => { kill(); process.exit(130); });
process.on('uncaughtException', e => { console.error('UNCAUGHT', e); kill(); process.exit(2); });
let out = '';
SERVER.stdout.on('data', d => out += d);
SERVER.stderr.on('data', d => out += d);
SERVER.on('exit', (c, s) => console.error('SERVER EXIT', c, s));

function req(method, p, { headers = {}, body } = {}) {
  return new Promise(resolve => {
    const r = http.request({ hostname: 'localhost', port: 3000, path: p, method, headers: { ...headers } }, res => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, headers: res.headers }));
    });
    r.on('error', e => resolve({ status: 0, err: e.message }));
    r.setTimeout(5000, () => { r.destroy(); resolve({ status: 0, err: 'timeout' }); });
    if (body) r.write(body);
    r.end();
  });
}
const cookieOf = res => (res.headers['set-cookie'] || [])[0]?.split(';')[0];
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let up = false;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    if ((await req('GET', '/')).status === 200) { up = true; break; }
  }
  console.log('=== SERVER ===\n' + out.trim());
  if (!up) { console.log('❌ server không up'); SERVER.kill('SIGKILL'); process.exit(1); }

  // --- User A ---
  const r1 = await req('GET', '/');
  const cookieA = cookieOf(r1);
  console.log('\n[User A] cookie =', cookieA);

  const rLoad0 = await req('GET', '/api/load', { headers: { Cookie: cookieA } });
  console.log('[User A] load lúc chưa save -> HTTP', rLoad0.status, '(kỳ vọng 404)');

  const saveJSON = JSON.stringify({
    '/Phone': { isDir: true, mtime: 1, parentDir: '/' },
    '/Phone/x.txt': { isDir: false, data: [72, 73], size: 2, pathname: '/Phone/x.txt', parentDir: '/Phone' }
  });
  const rSave = await req('POST', '/api/save', { headers: { Cookie: cookieA, 'Content-Type': 'text/plain' }, body: saveJSON });
  console.log('[User A] save ->', rSave.body);

  const rLoad1 = await req('GET', '/api/load', { headers: { Cookie: cookieA } });
  console.log('[User A] load sau save -> HTTP', rLoad1.status, '| nội dung khớp =', rLoad1.body === saveJSON);

  // --- User B (cookie khác) ---
  const cookieB = 'sid=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const rLoadB = await req('GET', '/api/load', { headers: { Cookie: cookieB } });
  console.log('[User B] load -> HTTP', rLoadB.status, '(kỳ vọng 404, khác user)');

  // --- kiểm tra thư mục saves ---
  console.log('\n[saves dir]', fs.readdirSync('/home/user/repo/java/saves'));

  const ok = rLoad0.status === 404 && rLoad1.status === 200
    && rLoad1.body === saveJSON && rLoadB.status === 404;
  console.log('\n=== TỔNG THỂ ===');
  console.log(ok ? '✅ PASS: save/load round-trip + phân biệt theo session/user'
    : '❌ FAIL: xem chi tiết');

  SERVER.kill('SIGKILL');
  process.exit(0);
})();
