/**
 * PATCH MODE4 - CLEAN RESET - 2026-06-28
 * - Fix DOM corruption (iframe append to #screenFrame)
 * - Await IndexedDB delete
 * - Separate save for freej2me-web (no exportSave)
 * - Reset previousEngineKind correctly
 * - Support isolated random-port host
 * - postMessage cross-origin exit
 * - Portal port 3000 never reloads
 */
(function(){
'use strict';
console.log('%c[Patch Mode4] loading…', 'color:#0ff;font-weight:bold');

// ----- STATE PATCH -----
window.currentEngineKind = window.currentEngineKind || 'legacy';
window.currentFallbackAppId = window.currentFallbackAppId || null;
window.currentFreej2mePort = window.currentFreej2mePort || null;
let previousEngineKindPatch = 'legacy';

// ----- UTIL -----
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function deleteIDB(name){
  return new Promise(resolve=>{
    try{
      const del = indexedDB.deleteDatabase(name);
      del.onsuccess = del.onerror = del.onblocked = ()=>resolve();
      setTimeout(resolve, 800); // safety timeout
    }catch(e){ resolve(); }
  });
}

async function cleanResetEmulator(isFreej2me){
  console.log('%c[Patch] cleanReset isFreej2me='+isFreej2me, 'color:#fa0');
  try { if (typeof stopAutosave==='function') stopAutosave(); }catch(e){}
  try { if (typeof stopAutoFit==='function') stopAutoFit(); }catch(e){}
  try { if (typeof stopAutoRotate==='function') stopAutoRotate(); }catch(e){}
  try { if (typeof cancelAutoRotatePrompt==='function') cancelAutoRotatePrompt(); }catch(e){}
  try { if (typeof stopAutoRotateInteractionWatch==='function') stopAutoRotateInteractionWatch(); }catch(e){}
  try { if (typeof stopExitWatcher==='function') stopExitWatcher(); }catch(e){}

  if (window.keyListener) {
    try { document.removeEventListener('keydown', keyListener); } catch(e){}
    try { document.removeEventListener('keyup', keyListener); } catch(e){}
    keyListener = null;
  }

  // Kill isolated freej2me host if any
  if (window.currentFreej2mePort) {
    try {
      fetch('/api/freej2me/stop', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({port: currentFreej2mePort})
      }).catch(()=>{});
    } catch(e){}
    currentFreej2mePort = null;
  }

  // Proper iframe teardown
  const screenFrame = document.getElementById('screenFrame');
  const oldFrame = document.getElementById('emulatorFrame');
  if (oldFrame) {
    try { oldFrame.onload = null; oldFrame.src = 'about:blank'; } catch(e){}
    try { if (oldFrame.parentNode) oldFrame.parentNode.removeChild(oldFrame); } catch(e){}
  }
  // Ensure screenFrame exists and is clean
  if (screenFrame) {
    screenFrame.innerHTML = '';
    screenFrame.style.width = '';
    screenFrame.style.height = '';
    const newFrame = document.createElement('iframe');
    newFrame.id = 'emulatorFrame';
    newFrame.className = 'emulator-frame';
    // PATCH v7.3: NO sandbox – keep exactly like original index.html to avoid CheerpJ break
    // newFrame.setAttribute('allow', 'cross-origin-isolated');
    // newFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads');
    newFrame.setAttribute('tabindex', '0');
    newFrame.setAttribute('allowfullscreen', 'true');
    // important: append INTO screenFrame, NOT screenArea
    screenFrame.appendChild(newFrame);
    // reset fit cache
    newFrame._fitW = null;
    newFrame._fitH = null;
  }

  // Reset globals
  currentFrame = document.getElementById('emulatorFrame');
  currentGameId = null;
  currentEngineKind = 'legacy';
  currentFallbackAppId = null;
  gameReady = false;
  closing = false;
  pendingSavePromise = null;

  // IndexedDB clean – ONLY for legacy, await properly
  if (!isFreej2me) {
    // legacy needs clean asyncStorage
    await deleteIDB('asyncStorage');
  } else {
    // freej2me isolated – do NOT nuke asyncStorage (keep legacy saves safe)
    // Optionally clean freej2me DBs in isolated origin – not needed because host is isolated port
  }

  // DO NOT wipe localStorage keymap!
  // keep freej2meActionBindings intact

  const status = document.getElementById('saveStatus');
  if (status) status.textContent = '⏳';

  console.log('%c[Patch] cleanReset done', 'color:#0f0');
  await sleep(60);
}

// ----- OVERRIDE launchGame -----
const _origLaunchGame = window.launchGame;
window.launchGame = async function(gameId, gameName){
  const engineModeEl = document.getElementById('engineModeSelect');
  const engineMode = engineModeEl ? engineModeEl.value : 'enginemode2-classes2.jar';
  const isFreej2me = engineMode.includes('freej2me') || engineMode.includes('mode4');

  console.log('%c[Patch] launchGame '+gameId+' mode='+engineMode+' freej2me='+isFreej2me, 'color:#0af');

  // wait previous close
  if (closing) {
    let wait=0;
    while(closing && wait<2500){ await sleep(50); wait+=50; }
  }
  if (pendingSavePromise) {
    try { await Promise.race([pendingSavePromise, sleep(1200)]); } catch(e){}
    pendingSavePromise = null;
  }

  // ALWAYS clean reset before launch – fixes Mode4 pollution
  await cleanResetEmulator(isFreej2me);
  previousEngineKindPatch = isFreej2me ? 'freej2me' : 'legacy';

  // Call original launch, but with save-skip wrapper for freej2me
  if (isFreej2me) {
    // Monkey-patch loadSave/exportSave temporarily to NO-OP for freej2me
    window.__freej2me_save_bypass = true;
  } else {
    window.__freej2me_save_bypass = false;
  }

  try {
    if (typeof _origLaunchGame === 'function') {
      return await _origLaunchGame.call(this, gameId, gameName);
    }
  } finally {
    // still keep bypass flag until game actually starts – cleared in onload
  }
};

// ----- PATCH loadSave / exportSave to skip freej2me -----
const _origLoadSave = window.loadSaveFromServer;
window.loadSaveFromServer = async function(gameId){
  if (window.__freej2me_save_bypass || currentEngineKind==='freej2me') {
    const status = document.getElementById('saveStatus');
    if (status) status.textContent = '🚫'; // freej2me separate save
    console.log('[Patch] skip loadSave for freej2me');
    return;
  }
  return _origLoadSave.call(this, gameId);
};

const _origExportSave = window.exportSave;
window.exportSave = async function(win, gameId, finalWipe){
  if (window.__freej2me_save_bypass || currentEngineKind==='freej2me') {
    // freej2me-web self-contained save inside isolated origin
    const status = document.getElementById('saveStatus');
    if (status) status.textContent = '✓';
    return;
  }
  return _origExportSave.call(this, win, gameId, finalWipe);
};

// ----- PATCH autosave start -----
const _origStartAutosave = window.startAutosave;
window.startAutosave = function(){
  if (currentEngineKind === 'freej2me') {
    console.log('[Patch] autosave disabled for freej2me');
    return;
  }
  return _origStartAutosave.call(this);
};

// ----- PATCH hookExit to support cross-origin isolated -----
const _origHookExit = window.hookExit;
window.hookExit = function(iframe){
  // for freej2me isolated cross-origin, skip aggressive polling
  if (currentEngineKind === 'freej2me') {
    console.log('[Patch] hookExit freej2me isolated – using postMessage only');
    stopExitWatcher();
    // still set a very light watcher that does NOT trigger cross-origin error
    exitWatcher = setInterval(()=>{
      if (!currentFrame || closing) { stopExitWatcher(); return; }
      // do NOT access contentWindow.location – would throw cross-origin
      // rely on postMessage exit only
    }, 2000);
    return;
  }
  return _origHookExit.call(this, iframe);
};

// ----- postMessage exit bridge -----
window.addEventListener('message', function(e){
  // accept from any origin (isolated random port)
  if (!e.data || e.data.type !== 'freej2me-exit') return;
  console.log('[Patch] postMessage freej2me-exit received', e.origin, e.data);
  if (currentEngineKind === 'freej2me' && !closing) {
    handleGameExit('postMessage-isolated');
  }
}, false);

// ----- PATCH closeEmulator -----
const _origCloseEmulator = window.closeEmulator;
window.closeEmulator = async function(){
  const wasFreej2me = (currentEngineKind === 'freej2me');
  const savedPort = window.currentFreej2mePort;
  console.log('[Patch] closeEmulator wasFreej2me='+wasFreej2me);
  if (typeof _origCloseEmulator === 'function') {
    await _origCloseEmulator.call(this);
  }
  // reset engine kind tracking
  previousEngineKindPatch = 'legacy';
  window.__freej2me_save_bypass = false;

  // stop isolated host
  if (wasFreej2me && savedPort) {
    try {
      await fetch('/api/freej2me/stop', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({port: savedPort})
      });
    } catch(e){}
  }
  // clean reset again to ensure pristine DOM for next launch
  await cleanResetEmulator(false);
  console.log('[Patch] closeEmulator fully cleaned, portal stays on :3000');
};

// ----- PATCH handleGameExit similarly -----
const _origHandleGameExit = window.handleGameExit;
window.handleGameExit = async function(reason){
  const wasFreej2me = (currentEngineKind === 'freej2me');
  const savedPort = window.currentFreej2mePort;
  const res = await _origHandleGameExit.call(this, reason);
  previousEngineKindPatch = 'legacy';
  window.__freej2me_save_bypass = false;
  if (wasFreej2me && savedPort) {
    fetch('/api/freej2me/stop', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({port:savedPort})}).catch(()=>{});
  }
  await cleanResetEmulator(false);
  return res;
};

// ----- PATCH launch onload to capture isolated port -----
(function patchLaunchOnload(){
  // Monkey-patch fetch /api/launch response handling – easier: wrap original launchGame onload part
  // We already overrode launchGame, now patch the onload assignment inside origLaunch
  // Simplest: after iframe src set, detect cross-origin port
  const origSetInterval = window.setInterval;
  // Instead, listen to load event globally
  document.addEventListener('load', function(e){
    // capture
  }, true);
})();

// Safer: override the part where currentFrame.src is set – we do via MutationObserver
const observer = new MutationObserver(muts=>{
  muts.forEach(m=>{
    if(m.type==='attributes' && m.attributeName==='src'){
      const f = m.target;
      if(f.id==='emulatorFrame' && f.src){
        try {
          const url = new URL(f.src, location.origin);
          if(url.port && url.port !== location.port){
            window.currentFreej2mePort = Number(url.port);
            console.log('[Patch] detected isolated freej2me port', currentFreej2mePort);
          } else {
            window.currentFreej2mePort = null;
          }
          // detect engine kind from url
          if(f.src.includes('run.html') || url.pathname.includes('run.html')){
            currentEngineKind = 'freej2me';
            window.__freej2me_save_bypass = true;
            // disable legacy timers that break cross-origin
            stopAutoRotate();
            stopAutosave();
          }
        } catch(e){}
      }
    }
  });
});
// start observing after DOM ready
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{
    const fr = document.getElementById('emulatorFrame');
    if(fr) observer.observe(fr, {attributes:true, attributeFilter:['src']});
  });
} else {
  const fr = document.getElementById('emulatorFrame');
  if(fr) observer.observe(fr, {attributes:true, attributeFilter:['src']});
}

// Also patch fitFrame to be cross-origin safe
const _origFitFrame = window.fitFrame;
window.fitFrame = function(){
  try {
    if (currentEngineKind === 'freej2me') {
      // isolated cross-origin – cannot access canvas – do CSS responsive fit
      const frame = document.getElementById('emulatorFrame');
      const screenFrame = document.getElementById('screenFrame');
      const screenArea = document.getElementById('screenArea');
      if (!frame || !screenFrame || !screenArea) return;
      // use resolution from current game registry? fallback 240x320
      let cw = 240, ch = 320;
      // try to get from game list
      try {
        if (window.currentGameId && window.allGames) {
          const g = allGames.find(x=>x.id===currentGameId);
          if (g && g.resolution) { cw = g.resolution.width; ch = g.resolution.height; }
        }
      } catch(e){}
      const maxW = screenArea.clientWidth - 8;
      const maxH = screenArea.clientHeight - 8;
      if (maxW<=0||maxH<=0) return;
      const scale = Math.min(maxW / cw, maxH / ch);
      const realW = Math.floor(cw * scale);
      const realH = Math.floor(ch * scale);
      screenFrame.style.width = realW + 'px';
      screenFrame.style.height = realH + 'px';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.transform = 'none';
      return;
    }
  } catch(e){}
  return _origFitFrame.apply(this, arguments);
};

console.log('%c[Patch Mode4] READY – isolated random port, clean DOM, save separated', 'color:#0f0;font-weight:bold');
})();
