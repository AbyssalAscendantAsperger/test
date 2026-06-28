/*
 * J2ME-For-Web Run Entry
 */

const { Launcher } = require('../../dist/src/game-modules/launcher/Launcher');
const { Display } = require('../../dist/src/game-modules/ui/Display');

async function runGame() {
    const params = new URLSearchParams(window.location.search);
    const jarUrl = params.get('jar');
    
    if (!jarUrl) {
        console.error("No JAR specified in URL parameters! Use ?jar=path/to/game.jar");
        const errDiv = document.createElement('div');
        errDiv.style.color = 'red';
        errDiv.style.padding = '20px';
        errDiv.innerHTML = '<h3>Error: No JAR specified!</h3><p>Please specify a JAR file with <code>?jar=...</code></p>';
        document.body.appendChild(errDiv);
        return;
    }

    console.log("Loading game from: " + jarUrl);

    try {
        const launcher = new Launcher({
            jarUrl: jarUrl
        });

        await launcher.load();
        launcher.start();

        console.log("Game started successfully!");
    } catch (e) {
        console.error("Failed to start game:", e);
        const errDiv = document.createElement('div');
        errDiv.style.color = 'red';
        errDiv.style.padding = '20px';
        errDiv.innerHTML = '<h3>Failed to load/run the JAR file:</h3><pre>' + e.toString() + '\n' + (e.stack || '') + '</pre>';
        document.body.appendChild(errDiv);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', runGame);
}
