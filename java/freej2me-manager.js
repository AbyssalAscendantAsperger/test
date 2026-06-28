/**
 * FreeJ2ME Manager
 */
const { spawn } = require('child_process');
const path = require('path');

const activeHosts = new Map();

function getRandomPort() {
    return 49152 + Math.floor(Math.random() * 16383);
}

function startFreej2meHost(jarPath) {
    return new Promise((resolve, reject) => {
        const port = getRandomPort();
        const env = { ...process.env, PORT: port, JAR_PATH: jarPath || '' };

        const host = spawn('node', [path.join(__dirname, 'freej2me-host.js')], {
            env,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let started = false;

        host.stdout.on('data', (data) => {
            if (data.toString().includes('Running on') && !started) {
                started = true;
                activeHosts.set(port, host);
                console.log(`[FreeJ2ME-Manager] Started on port ${port}`);
                resolve({ port, url: `http://127.0.0.1:${port}/run` });
            }
        });

        host.stderr.on('data', d => console.error('[FreeJ2ME-Host]', d.toString()));

        host.on('exit', code => {
            activeHosts.delete(port);
            if (!started) reject(new Error(`FreeJ2ME host exited with code ${code}`));
        });

        setTimeout(() => {
            if (!started) {
                host.kill();
                reject(new Error('FreeJ2ME host failed to start'));
            }
        }, 8000);
    });
}

function stopAllFreej2meHosts() {
    for (const [port, host] of activeHosts) host.kill();
    activeHosts.clear();
}

module.exports = { startFreej2meHost, stopAllFreej2meHosts };
