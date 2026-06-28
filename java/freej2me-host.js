/**
 * FreeJ2ME-Web Host Server (Random High Port)
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT) || (49152 + Math.floor(Math.random() * 16383));
const JAR_PATH = process.env.JAR_PATH || null;
const WEB_DIR = path.join(__dirname, 'web');

app.use(express.static(WEB_DIR, { maxAge: '1h' }));

app.get('/api/info', (req, res) => {
    res.json({ port: PORT, jar: JAR_PATH ? path.basename(JAR_PATH) : null });
});

app.get('/run', (req, res) => {
    const jarParam = JAR_PATH ? `?jar=/emu/jar/${path.basename(JAR_PATH)}` : '';
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FreeJ2ME</title>
        <style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh}</style>
        </head><body><iframe src="run.html${jarParam}" style="border:none;width:100%;max-width:360px;height:640px;background:#000"></iframe></body></html>`);
});

app.get('*', (req, res) => res.sendFile(path.join(WEB_DIR, 'run.html')));

app.listen(PORT, '127.0.0.1', () => {
    console.log(`[FreeJ2ME-Host] Running on http://127.0.0.1:${PORT}`);
});
