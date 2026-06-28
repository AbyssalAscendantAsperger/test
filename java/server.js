// ============================================================================
//  ROUTER SERVER  (server.js)  —  cổng 3000
//  ----------------------------------------------------------------------------
//  Nhiệm vụ DUY NHẤT của file này: nhận diện client là MOBILE hay PC, rồi
//  CHUYỂN HƯỚNG (HTTP 302) sang đúng cổng:
//      - MOBILE  ->  cổng 3001  (mobie.js)
//      - PC      ->  cổng 3002  (pc.js)
//
//  File này KHÔNG chứa bất kỳ logic game/emulator nào nữa. Toàn bộ logic đã
//  được tách ra 2 file RIÊNG, KHÔNG dùng chung logic:
//      - mobie.js  (logic riêng cho Mobile)
//      - pc.js     (logic riêng cho PC)
//
//  Hai server con DÙNG CHUNG thư mục jar/ (kho game) và saves/ (tiến trình),
//  nhưng KHÔNG dùng chung logic phía server.
//
//  Cách chạy 3 tiến trình (xem thêm package.json / startserver.bat):
//      node mobie.js     # cổng 3001
//      node pc.js        # cổng 3002
//      node server.js    # cổng 3000 (router)
//  Hoặc:  npm start      # chạy cả 3 cùng lúc
// ============================================================================
const express = require('express');

const app = express();
const PORT = process.env.PORT || process.env.ROUTER_PORT || 3000;

// Cấu hình host/port đích cho từng nền tảng (có thể override bằng biến môi trường).
const MOBILE_HOST = process.env.MOBILE_HOST || 'localhost';
const MOBILE_PORT = process.env.MOBILE_PORT || 3001;
const PC_HOST     = process.env.PC_HOST     || 'localhost';
const PC_PORT     = process.env.PC_PORT     || 3002;

// --- Nhận diện thiết bị ------------------------------------------------------
// Mặc định dựa trên User-Agent. Cho phép ép buộc bằng:
//   1) query  ?platform=mobile  hoặc  ?platform=pc   (ưu tiên cao nhất, đồng thời ghi cookie)
//   2) cookie platform=mobile|pc                      (đã ép trước đó)
//   3) User-Agent                                     (mặc định)
const MOBILE_UA_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone|KaiOS|Nokia|Series ?60|SymbianOS|J2ME|MIDP|Profile\//i;

function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  header.split(';').forEach(c => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

function detectPlatform(req) {
  // 1) Ép buộc qua query (?platform=mobile | pc | mobie)
  const q = String(req.query.platform || '').toLowerCase();
  if (q === 'mobile' || q === 'mobie') return { platform: 'mobile', forced: true };
  if (q === 'pc' || q === 'desktop') return { platform: 'pc', forced: true };

  // 2) Ép buộc đã lưu trong cookie
  const cookies = parseCookies(req);
  if (cookies.platform === 'mobile') return { platform: 'mobile', forced: false };
  if (cookies.platform === 'pc') return { platform: 'pc', forced: false };

  // 3) Mặc định: dựa vào User-Agent
  const ua = req.headers['user-agent'] || '';
  return { platform: MOBILE_UA_RE.test(ua) ? 'mobile' : 'pc', forced: false };
}

function targetBase(platform, req) {
  // Giữ nguyên giao thức (http/https) mà client đang dùng.
  const proto = (req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')).split(',')[0].trim();
  if (platform === 'mobile') return `${proto}://${MOBILE_HOST}:${MOBILE_PORT}`;
  return `${proto}://${PC_HOST}:${PC_PORT}`;
}

// --- Endpoint kiểm tra nhanh (không chuyển hướng) ---------------------------
// Dùng để debug: cho biết server sẽ chuyển hướng client tới đâu.
app.get('/__whoami', (req, res) => {
  const { platform, forced } = detectPlatform(req);
  res.json({
    router: true,
    detectedPlatform: platform,
    forced,
    redirectTo: targetBase(platform, req),
    userAgent: req.headers['user-agent'] || null,
    mobile: { host: MOBILE_HOST, port: Number(MOBILE_PORT) },
    pc: { host: PC_HOST, port: Number(PC_PORT) },
  });
});

// --- Router chính: chuyển hướng MỌI request sang đúng cổng -------------------
app.use((req, res) => {
  const { platform, forced } = detectPlatform(req);

  // Nếu client ép buộc qua ?platform=..., ghi nhớ vào cookie cho các lần sau.
  if (forced) {
    res.setHeader('Set-Cookie', `platform=${platform}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }

  // Bỏ ?platform=... khỏi URL khi chuyển hướng để tránh lặp lại, giữ các query khác.
  const url = new URL(req.originalUrl, 'http://placeholder');
  url.searchParams.delete('platform');
  const pathAndQuery = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');

  const location = targetBase(platform, req) + pathAndQuery;
  res.setHeader('X-Router-Platform', platform);
  // 302: tạm thời, để lần sau vẫn đi qua router (cookie/UA có thể đổi).
  res.redirect(302, location);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('============================================================');
    console.log(`🔀 [ROUTER] J2ME Portal router đang chạy tại http://localhost:${PORT}`);
    console.log(`   • MOBILE  -> http://${MOBILE_HOST}:${MOBILE_PORT}  (mobie.js)`);
    console.log(`   • PC      -> http://${PC_HOST}:${PC_PORT}  (pc.js)`);
    console.log('   • Nhận diện: User-Agent (ép buộc: ?platform=mobile | ?platform=pc)');
    console.log('   • Server này CHỈ chuyển hướng — không chứa logic game.');
    console.log('   • Debug nhanh: GET /__whoami');
    console.log('============================================================');
  });
}

module.exports = { app, detectPlatform, MOBILE_UA_RE };
