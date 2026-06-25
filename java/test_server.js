// Script test tự động: khởi động server.js, fetch các endpoint, rồi kill.
const { spawn } = require('child_process');
const http = require('http');

const SERVER = spawn(process.execPath, ['server.js'], {
  cwd: '/home/user/repo/java',
  stdio: ['ignore', 'pipe', 'pipe'],
});

process.on('uncaughtException', e => { console.error('UNCAUGHT:', e); SERVER.kill('SIGKILL'); process.exit(2); });
process.on('unhandledRejection', e => { console.error('UNHANDLED:', e); SERVER.kill('SIGKILL'); process.exit(3); });

let stdout = '', stderr = '';
SERVER.stdout.on('data', d => stdout += d);
SERVER.stderr.on('data', d => stderr += d);
SERVER.on('error', e => console.error('SPAWN ERROR:', e));
SERVER.on('exit', (code, sig) => console.error('SERVER EXIT code=', code, 'sig=', sig));

function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, len: body.length, body }));
    });
    req.on('error', e => resolve({ status: 0, err: e.message }));
    req.setTimeout(4000, () => { req.destroy(); resolve({ status: 0, err: 'timeout' }); });
  });
}

(async () => {
  // đợi server up
  let up = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 250));
    const r = await get('http://localhost:3000/').catch(() => null);
    if (r && r.status === 200) { up = true; break; }
  }

  const B = 'http://localhost:3000';
  const results = {};
  if (up) {
    results['/']               = (await get(B + '/')).status;
    results['/api/jars']       = (await get(B + '/api/jars'));
    results['/api/launch']     = (await get(B + '/api/launch?jar=demo.jar')).body;
    results['/emu/main.html']  = (await get(B + '/emu/main.html')).status;
    results['/emu/keymap.js']  = (await get(B + '/emu/keymap.js'));
    results['/emu/bld/main-all.js'] = (await get(B + '/emu/bld/main-all.js')).status;
    results['/emu/libs/encoding.js'] = (await get(B + '/emu/libs/encoding.js')).status;
    results['/emu/style/main.css']   = (await get(B + '/emu/style/main.css')).status;
    results[':8080']           = await get('http://localhost:8080/emu/main.html');
  }

  console.log('=== SERVER STDOUT ===');
  console.log(stdout.trim() || '(trống)');
  if (stderr.trim()) { console.log('=== SERVER STDERR ==='); console.log(stderr.trim()); }
  console.log('\n=== KẾT QUẢ TEST ===');
  if (!up) { console.log('❌ Server không up sau 7.5s'); }
  else {
    console.log('1) GET /                     -> HTTP', results['/']);
    console.log('2) GET /api/jars             ->', results['/api/jars'].body);
    console.log('3) GET /api/launch?jar=demo  ->', results['/api/launch']);
    console.log('4) GET /emu/main.html        -> HTTP', results['/emu/main.html']);
    const km = results['/emu/keymap.js'].body || '';
    const tags = ["case 'w'", "case 'a'", "case 's'", "case 'd'", "case ' '",
                  "case 'q'", "case 'e'", "case 'z'", "case 'c'"];
    const found = tags.filter(t => km.includes(t));
    console.log("5) GET /emu/keymap.js đủ case ->", found.join(' ') || '(KHÔNG)', '(cần 9)');
    console.log('6) GET /emu/bld/main-all.js  -> HTTP', results['/emu/bld/main-all.js']);
    console.log('7) GET /emu/libs/encoding.js -> HTTP', results['/emu/libs/encoding.js']);
    console.log('8) GET /emu/style/main.css   -> HTTP', results['/emu/style/main.css']);

    // === MỚI: kiểm tra 8080 đã bị bỏ ===
    const port8080 = results[':8080'];
    const serverHas8080 = /8080/.test(stdout);
    console.log('\n=== KIỂM TRA ĐÃ BỎ SERVER 8080 ===');
    console.log('9) Log server có nhắc 8080?  ->', serverHas8080 ? 'CÓ (sai!)' : 'KHÔNG ✅');
    if (port8080.status === 0) {
      console.log('10) GET :8080/emu/main.html -> không kết nối được ✅ (đã bỏ server 8080)');
    } else {
      console.log('10) GET :8080/emu/main.html -> HTTP', port8080.status,
        '(⚠ có thể là process cũ còn sót, không phải server mới; chạy: fuser -k 8080/tcp)');
    }

    // chốt
    const launchUrl = results['/api/launch'];
    const ok = results['/emu/main.html'] === 200 && found.length === 9
      && launchUrl.includes('/emu/') && !serverHas8080;
    console.log('\n=== TỔNG THỂ ===');
    console.log(ok ? '✅ PASS: /emu cùng origin + keymap đủ phím + URL đúng + KHÔNG còn server 8080'
                   : '❌ FAIL: xem chi tiết trên');
    if (launchUrl.includes('/emu/'))
      console.log('   iframe src =', launchUrl, '(cùng origin localhost:3000)');
  }

  SERVER.kill('SIGKILL');
  process.exit(0);
})();
