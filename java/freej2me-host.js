/**
 * FreeJ2ME-Web Host Server (Random High Port) - PATCHED isolated
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT) || (49152 + Math.floor(Math.random() * 16383));
const JAR_PATH = process.env.JAR_PATH || null;
const APP_ID = process.env.APP_ID || null;
const WEB_DIR = path.join(__dirname, 'web');

// CORS + iframe allow - ISOLATED ORIGIN
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  // Prevent caching of dynamic run
  if (req.path.includes('run.html')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// Serve both / and /app for compatibility with legacy freej2me-web paths
const staticOpts = { 
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
};
app.use(express.static(WEB_DIR, staticOpts));
app.use('/app', express.static(WEB_DIR, staticOpts));
app.use('/web', express.static(WEB_DIR, staticOpts));

// debug: list available bundles
app.get('/debug/apps', (req,res)=>{
  try {
    const appsDir = path.join(WEB_DIR, 'apps');
    const files = fs.existsSync(appsDir) ? fs.readdirSync(appsDir).filter(f=>f.endsWith('.zip')) : [];
    res.json({ok:true, port:PORT, appsDir, count:files.length, files:files.slice(0,50)});
  } catch(e){ res.status(500).json({error:String(e)});}
});

app.get('/api/info', (req, res) => {
    res.json({ 
      port: PORT, 
      jar: JAR_PATH ? path.basename(JAR_PATH) : null,
      appId: APP_ID,
      pid: process.pid,
      uptime: process.uptime()
    });
});

app.get('/api/health', (req,res)=> res.json({ok:true, port:PORT}));

app.get('/run', (req, res) => {
    const appParam = APP_ID ? `app=${encodeURIComponent(APP_ID)}` : (req.query.app ? `app=${encodeURIComponent(req.query.app)}` : '');
    const extra = appParam ? `?${appParam}&fractionScale=1&nokeypad=1&isolated=1` : '?fractionScale=1&nokeypad=1&isolated=1';
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FreeJ2ME Isolated:${PORT}</title>
        <style>html,body{margin:0;height:100%;background:#000;color:#0f0;font-family:monospace}iframe{border:none;width:100%;height:100%;background:#000}#info{position:fixed;top:2px;left:4px;font-size:10px;color:#0a0;z-index:9999;opacity:.7}</style>
        </head><body><div id="info">freej2me-web :${PORT} app=${APP_ID||'-'}</div><iframe src="run.html${extra}" allow="cross-origin-isolated" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"></iframe>
        <script>
          window.addEventListener('message', e=>{
            if(e.data && e.data.type==='freej2me-exit'){
              try{ parent.postMessage(e.data, '*'); }catch(err){}
              document.body.innerHTML='<div style="color:#f66;padding:20px;text-align:center">Game exited - you can close</div>';
            }
          });
        </script>
        </body></html>`);
});

// graceful shutdown endpoint for manager
app.post('/__shutdown', (req,res)=>{
  res.json({ok:true, shuttingDown:true});
  setTimeout(()=>process.exit(0), 200);
});

app.get('*', (req, res, next) => {
  // fallback to run.html for SPA
  const requested = path.join(WEB_DIR, req.path);
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) return next();
  res.sendFile(path.join(WEB_DIR, 'run.html'));
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`[FreeJ2ME-Host] Running on http://127.0.0.1:${PORT}`);
});

process.on('SIGTERM', ()=>{ server.close(()=>process.exit(0)); setTimeout(()=>process.exit(0),1500);});
