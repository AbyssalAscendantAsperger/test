/** 
 * FreeJ2ME Manager - PATCHED isolated random port
 */
const { spawn } = require('child_process');
const path = require('path');

const activeHosts = new Map();

function getRandomPort() {
    return 49152 + Math.floor(Math.random() * 16383);
}

function startFreej2meHost(jarPath, appId) {
    return new Promise((resolve, reject) => {
        const port = getRandomPort();
        const env = { ...process.env, PORT: port, JAR_PATH: jarPath || '', APP_ID: appId || '' };

        const host = spawn('node', [path.join(__dirname, 'freej2me-host.js')], {
            env,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let started = false;

        host.stdout.on('data', (data) => {
            if (data.toString().includes('Running on') && !started) {
                started = true;
                activeHosts.set(port, { host, appId, jarPath, startedAt: Date.now() });
                console.log(`[FreeJ2ME-Manager] Started on port ${port} app=${appId}`);
                resolve({ port, url: `http://127.0.0.1:${port}` });
            }
        });

        host.stderr.on('data', d => console.error('[FreeJ2ME-Host]', d.toString()));

        host.on('exit', code => {
            activeHosts.delete(port);
            if (!started) reject(new Error(`FreeJ2ME host exited with code ${code}`));
        });

        setTimeout(() => {
            if (!started) {
                try { host.kill('SIGTERM'); } catch(e){}
                reject(new Error('FreeJ2ME host failed to start'));
            }
        }, 8000);
    });
}

function stopFreej2meHost(port) {
    port = Number(port);
    const entry = activeHosts.get(port);
    if (!entry) return false;
    try {
        entry.host.kill('SIGTERM');
        setTimeout(() => {
            try { entry.host.kill('SIGKILL'); } catch(e){}
        }, 800);
    } catch(e){}
    activeHosts.delete(port);
    console.log(`[FreeJ2ME-Manager] Stopped port ${port}`);
    return true;
}

function stopAllFreej2meHosts() {
    for (const [port, entry] of activeHosts) {
        try { entry.host.kill('SIGTERM'); } catch(e){}
    }
    activeHosts.clear();
}

// auto cleanup idle hosts > 10 phút
setInterval(() => {
    const now = Date.now();
    for (const [port, entry] of activeHosts) {
        if (now - entry.startedAt > 10 * 60 * 1000) {
            console.log(`[FreeJ2ME-Manager] Auto-clean idle port ${port}`);
            stopFreej2meHost(port);
        }
    }
}, 60000);

process.on('exit', stopAllFreej2meHosts);
process.on('SIGINT', () => { stopAllFreej2meHosts(); process.exit(0); });
process.on('SIGTERM', () => { stopAllFreej2meHosts(); process.exit(0); });

module.exports = { startFreej2meHost, stopFreej2meHost, stopAllFreej2meHosts, activeHosts };
