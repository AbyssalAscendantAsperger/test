// ============================================================================
//  start_all.js — Khởi động cả 3 tiến trình cùng lúc:
//      • mobie.js   (MOBILE, cổng 3001)
//      • pc.js      (PC,     cổng 3002)
//      • server.js  (ROUTER, cổng 3000)
//  Không cần cài thêm thư viện ngoài (dùng child_process thuần).
//  Ctrl+C để tắt cả 3.
// ============================================================================
const { spawn } = require('child_process');
const path = require('path');

const procs = [
  { name: 'MOBILE', file: 'mobie.js',  color: '\x1b[36m' }, // cyan
  { name: 'PC',     file: 'pc.js',     color: '\x1b[33m' }, // yellow
  { name: 'ROUTER', file: 'server.js', color: '\x1b[35m' }, // magenta
];
const RESET = '\x1b[0m';

const children = procs.map(p => {
  const child = spawn(process.execPath, [path.join(__dirname, p.file)], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  const tag = `${p.color}[${p.name}]${RESET} `;
  child.stdout.on('data', d => process.stdout.write(d.toString().replace(/^/gm, tag)));
  child.stderr.on('data', d => process.stderr.write(d.toString().replace(/^/gm, tag)));
  child.on('exit', (code, sig) => {
    console.error(`${tag}đã thoát (code=${code}, sig=${sig}). Đang tắt các tiến trình còn lại...`);
    shutdown();
  });
  return child;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) { try { c.kill('SIGTERM'); } catch (e) {} }
  setTimeout(() => process.exit(0), 300);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
