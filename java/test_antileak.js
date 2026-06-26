// Test anti-leak JAR (v3): token không cần cookie, không test cross-session (đã bỏ sid-binding).
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

try {
  const p = execSync("ss -ltnp 'sport = :3000' 2>/dev/null | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2").toString().trim();
  if (p) { process.kill(parseInt(p)); console.log('🧹 dọn port 3000'); }
} catch (e) {}

const SERVER = spawn(process.execPath, ['server.js'], {
  cwd: '/home/user/repo/java', stdio: ['ignore', 'pipe', 'pipe'],
});
const kill = () => { try { SERVER.kill('SIGKILL'); } catch (e) {} };
process.on('exit', kill);
process.on('uncaughtException', e => { console.error('UNCAUGHT', e); kill(); process.exit(2); });

let out = '';
SERVER.stdout.on('data', d => out += d);
SERVER.stderr.on('data', d => out += d);

function req(method, urlPath, headers) {
  headers = headers || {};
  return new Promise(resolve => {
    const r = http.request({ hostname: 'localhost', port: 3000, path: urlPath, method, headers }, res => {
      let chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
    });
    r.on('error', e => resolve({ status: 0, err: e.message }));
    r.setTimeout(5000, () => { r.destroy(); resolve({ status: 0, err: 'timeout' }); });
    r.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let up = false;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    if ((await req('GET', '/')).status === 200) { up = true; break; }
  }
  console.log('=== SERVER ===\n' + out.trim());
  if (!up) { console.log('❌ server không up'); kill(); process.exit(1); }

  console.log('\n========== KIỂM TRA ANTI-LEAK JAR ==========\n');

  const rJars = await req('GET', '/api/jars');
  const games = JSON.parse(rJars.body.toString()).games || [];
  const leakedName = games.some(g => g.name && /\.jar$/i.test(g.name));
  const realFiles = fs.readdirSync('/home/user/repo/java/../java/jar').filter(f => f.endsWith('.jar'));
  console.log('1) /api/jars: ' + games.length + ' games | Lộ tên .jar? ' + (leakedName ? 'CÓ ❌' : 'KHÔNG ✅'));

  const gameId = games[0]?.id;
  const rLaunch = await req('GET', '/api/launch?id=' + gameId);
  const launchData = JSON.parse(rLaunch.body.toString());
  const url = launchData.url || '';
  const token = url ? url.split('jars=jar/')[1].split('&')[0] : null;
  console.log('2) /api/launch: token ' + (token ? token.slice(0, 16) + '... ✅' : 'KHÔNG ❌'));

  let tokenOk = false;
  if (token) {
    const rToken = await req('GET', '/emu/jar/' + token, {});
    tokenOk = rToken.status === 200 && rToken.body.length > 1000;
    const cc = (rToken.headers['cache-control'] || '').includes('no-store');
    console.log('3) GET /emu/jar/<token> KHÔNG cookie: HTTP ' + rToken.status + ' | ' + rToken.body.length + ' bytes | no-store ' + (cc ? '✅' : '❌') + ' ' + (tokenOk ? '✅' : '❌'));
  }

  const rDirect = await req('GET', '/emu/jar/' + encodeURIComponent(realFiles[0]), {});
  console.log('4) Tên thật → HTTP ' + rDirect.status + ' ' + (rDirect.status === 403 ? '✅' : '❌'));

  const rFake = await req('GET', '/emu/jar/deadbeefdeadbeef', {});
  console.log('5) Token giả → HTTP ' + rFake.status + ' ' + (rFake.status === 403 ? '✅' : '❌'));

  const rMain = await req('GET', '/emu/main.html', {});
  const rJs = await req('GET', '/emu/bld/main-all.js', {});
  console.log('6) main.html ' + rMain.status + ' | main-all.js ' + rJs.status + ' ' + (rMain.status === 200 && rJs.status === 200 ? '✅' : '❌'));

  const pass = !leakedName && tokenOk && rDirect.status === 403 && rFake.status === 403 && rMain.status === 200;
  console.log('\n=== KẾT LUẬN ===');
  console.log(pass ? '✅ PASS: Anti-leak hoạt động' : '❌ FAIL');

  kill();
  process.exit(0);
})();
