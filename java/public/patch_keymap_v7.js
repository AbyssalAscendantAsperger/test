/**
 * KEYMAP PC -> VIRTUAL NOKIA v7.2 – CLEAN
 * - Block direct PC keyboard hook
 * - Route ALL PC keys through virtual button [data-code] -> sendKeyRaw()
 * - Desktop layout: left keypad / right screen
 * - No pc-active flashy effects
 * - Allow synthetic events (isTrusted===false)
 * - Works with Mode 1-2-3 (legacy) + Mode4 (freej2me-web)
 */
(function(){
'use strict';
if (window.__keymap_v7) return;
window.__keymap_v7 = true;
console.log('%c[Keymap v7] init', 'color:#9f9');

/* ---- minimal desktop left/right CSS, no flashy effects ---- */
var css = document.createElement('style');
css.textContent = `
@media (min-width: 900px), (pointer:fine) {
  #gameView .game-body{flex-direction:row!important;align-items:stretch}
  #gameView .gamepad, #gameView .gamepad.visible{
    display:flex!important;order:-1;
    flex:0 0 340px!important;width:340px!important;max-width:360px;min-width:300px;
    height:100%!important;max-height:100vh;overflow-y:auto;overflow-x:hidden;
    border-top:none!important;border-right:1px solid #22273a;
    background:#0b0b14;padding:10px 8px;
    box-sizing:border-box;
  }
  #gameView .screen-area{flex:1 1 auto!important;order:2}
  #gameView .nokia-body{width:100%!important;padding:4px 0;gap:8px}
  /* —— SOFT KEYS FIX: force 4 buttons visible —— */
  #gameView .soft-row{
    display:flex!important;
    width:100%!important;
    max-width:100%!important;
    justify-content:space-between!important;
    align-items:center!important;
    gap:4px!important;
    padding:0 4px!important;
    flex-wrap:nowrap!important;
    box-sizing:border-box;
    overflow:visible!important;
  }
  #gameView .soft-key{
    flex:1 1 0 !important;
    min-width:0 !important;
    max-width:78px !important;
    width:auto !important;
    height:34px !important;
    font-size:13px !important;
    border-radius:8px !important;
    letter-spacing:0 !important;
    padding:0 4px !important;
    display:flex !important;
    visibility:visible !important;
    opacity:1 !important;
    box-sizing:border-box;
  }
  #gameView .dpad-wheel-wrap{width:160px!important;height:160px!important;max-width:160px;max-height:160px;margin:6px auto}
  #gameView .dpad-seg .seg-icon{font-size:18px!important}
  #gameView .dpad-seg .seg-key{font-size:10px!important}
  #gameView .dpad-ok .ok-label{font-size:14px!important}
  #gameView .dpad-ok .wasd-label{font-size:10px!important}
  #gameView .numpad{width:260px!important;max-width:260px!important;gap:6px!important;margin:0 auto}
  #gameView .num-btn{height:40px!important;font-size:15px!important;border-radius:8px!important}
  #gameView .nokia-brand{font-size:10px!important;letter-spacing:6px!important}
  #gameView .nokia-sep{margin:4px 0!important}
  #pcKeyHint{font-size:10px;color:#6a8a9a;text-align:center;margin-top:6px;display:block; line-height:1.4}
}
/* always show gamepad toggle active on desktop */
@media (pointer:fine) {
  #padToggle { background:#3a5a2a !important; color:#9fff7c !important; }
}
/* emergency – ensure soft keys never hidden */
#gameView .soft-key[data-code="-6"],
#gameView .soft-key[data-code="122"],
#gameView .soft-key[data-code="99"],
#gameView .soft-key[data-code="-7"]{
  display:flex !important;
  visibility:visible !important;
  opacity:1 !important;
}
`;
document.head.appendChild(css);

console.log('%c[Keymap v7] CSS injected', 'color:#9f9');

// ----- MOBILE GUARD – Mode4 freeze fix -----
// patch_keymap_v7 keyboard hook làm treo freej2me-web trên Android
// → chỉ bật trên PC thật (pointer:fine + no touch)
// mobile: giữ nguyên input gốc 1155ad0 → chạy mượt
var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
var isFinePointer = false;
try { isFinePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches; } catch(e){}
var isPC = isFinePointer && !isTouchDevice;

if (!isPC) {
  console.log('%c[Keymap v7] Mobile/touch detected – PC key bridge DISABLED, using native 1155ad0 input (fixes Mode4 freeze)', 'color:#fa0');
  return;
}

console.log('%c[Keymap v7] PC mode – enabling virtual key bridge', 'color:#9f9');

/* ---- PC -> MIDP map ---- */
var PC_TO_MIDP = {
  'ArrowUp':-1,'KeyW':-1,'Numpad8':-1,
  'ArrowDown':-2,'KeyS':-2,'Numpad2':-2,
  'ArrowLeft':-3,'KeyA':-3,'Numpad4':-3,
  'ArrowRight':-4,'KeyD':-4,'Numpad6':-4,
  'Enter':-5,'NumpadEnter':-5,'Space':-5,'KeyF':-5,'Numpad5':-5,
  'KeyQ':-6,'F1':-6,
  'KeyE':-7,'KeyR':-7,'F2':-7,'Escape':-7,
  'KeyZ':122,'Tab':122,
  'KeyC':99,'Delete':99,'Backspace':99,
  'Digit0':48,'Numpad0':48,
  'Digit1':49,'Numpad1':49,
  'Digit2':50,
  'Digit3':51,'Numpad3':51,
  'Digit4':52,
  'Digit5':53,
  'Digit6':54,
  'Digit7':55,'Numpad7':55,
  'Digit8':56,
  'Digit9':57,'Numpad9':57,
  'Minus':42,'NumpadMultiply':42,'ShiftLeft':42,'ShiftRight':42,
  'Equal':35,'NumpadDivide':35,'Slash':35
};
var FALLBACK = {w:-1,a:-3,s:-2,d:-4,q:-6,e:-7,z:122,c:99,' ':-5,
  '0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'*':42,'#':35};

function findBtn(code){
  return document.querySelector('#gamepad [data-code="'+code+'"]');
}
function triggerVirtual(code, down){
  var btn = findBtn(code);
  if (btn) btn.classList.toggle('pressed', !!down);
  try { if (typeof sendKeyRaw === 'function') sendKeyRaw(code, !!down); } catch(e){}
}
var pcDown = new Set();
function pcHandler(e){
  var gv = document.getElementById('gameView');
  if (!gv || !gv.classList.contains('visible')) return;
  var tag = (e.target && e.target.tagName || '').toLowerCase();
  if (tag==='input'||tag==='textarea'||tag==='select'|| (e.target && e.target.isContentEditable)) return;
  // allow synthetic events to pass through (sendKeyRaw / CheerpJ internal)
  if (e.isTrusted === false) return;
  var code = PC_TO_MIDP[e.code] ?? FALLBACK[(e.key||'').toLowerCase()];
  if (code === undefined) return;
  e.preventDefault(); e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  var isDown = e.type === 'keydown';
  var id = (e.code||e.key)+':'+code;
  if (isDown){ if (pcDown.has(id)) return; pcDown.add(id); }
  else { pcDown.delete(id); }
  triggerVirtual(code, isDown);
}

/* ---- override setupKeyboardMapping ---- */
var _origSetupKB = window.setupKeyboardMapping;
window.setupKeyboardMapping = function(iframe){
  console.log('%c[Keymap v7] setupKeyboardMapping – VIRTUAL ONLY, block direct', 'color:#8f8');
  // kill legacy listeners
  try {
    if (window.keyListener) {
      ['keydown','keyup'].forEach(function(t){
        document.removeEventListener(t, keyListener, true);
        document.removeEventListener(t, keyListener, false);
        window.removeEventListener(t, keyListener, true);
        window.removeEventListener(t, keyListener, false);
      });
    }
  } catch(e){}
  // install our bridge on parent
  ['keydown','keyup'].forEach(function(t){
    document.removeEventListener(t, pcHandler, true);
    window.removeEventListener(t, pcHandler, true);
    document.addEventListener(t, pcHandler, true);
    window.addEventListener(t, pcHandler, true);
  });
  window.keyListener = pcHandler; // so closeEmulator cleans correctly

  // auto show keypad on desktop
  try {
    if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
      if (typeof showGamepad === 'function') showGamepad();
    }
  } catch(e){}
  
  // inject blocker into iframe – SAME ORIGIN ONLY
  function inject(ifr, tries){
    tries = tries || 0;
    if (tries > 30) return;
    try {
      var iw = ifr.contentWindow;
      var idoc = iw.document;
      if (!idoc || !idoc.body) throw 0;
      if (idoc.getElementById('__pc_v7')) return;
      var s = idoc.createElement('script');
      s.id = '__pc_v7';
      s.textContent = "(function(){"+
        "if(window.__pc_v7_installed)return;window.__pc_v7_installed=true;"+
        "function send(t,c,k){try{parent.postMessage({type:'pc-key-bridge',code:c||'',key:k||'',isDown:t==='keydown'},'*')}catch(e){}}"+
        "function block(e){if(e.isTrusted===false)return;send(e.type,e.code,e.key);e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return false;}"+
        "['keydown','keyup'].forEach(function(ev){window.addEventListener(ev,block,true);document.addEventListener(ev,block,true)});"+
        "console.log('[iframe v7] key bridge installed');"+
      "})();";
      (idoc.head||idoc.body).appendChild(s);
    } catch(err){
      setTimeout(function(){ inject(ifr, tries+1); }, 250);
    }
  }
  var fr = iframe || document.getElementById('emulatorFrame');
  if (fr) {
    if (fr.src && fr.src.includes('cheerpj_run.html')) { console.log('[Keymap v7] CheerpJ Mode 5 detected – allowing direct keyboard hook for Java AWT'); return; }
    // remove sandbox if present (can break CheerpJ)
    try { fr.removeAttribute('sandbox'); } catch(e){}
    fr.addEventListener('load', function(){ setTimeout(function(){inject(fr,0)}, 180); });
    setTimeout(function(){inject(fr,0)}, 350);
    setTimeout(function(){inject(fr,0)}, 1200);
  }
};

// receive keys from iframe
window.addEventListener('message', function(ev){
  if (!ev.data) return;
  if (ev.data.type === 'pc-key-bridge'){
    var e = {
      type: ev.data.isDown ? 'keydown' : 'keyup',
      code: ev.data.code || '',
      key: ev.data.key || '',
      preventDefault:function(){}, stopPropagation:function(){}, stopImmediatePropagation:function(){},
      target:{tagName:''},
      isTrusted: true
    };
    // run through same pcHandler logic (but bypass isTrusted check)
    var code = PC_TO_MIDP[e.code] ?? FALLBACK[(e.key||'').toLowerCase()];
    if (code !== undefined) {
      triggerVirtual(code, e.type==='keydown');
    }
    return;
  }
}, false);

// cleanup legacy listener on load
setTimeout(function(){
  try {
    if (window.keyListener && window.keyListener !== pcHandler) {
      ['keydown','keyup'].forEach(function(t){
        document.removeEventListener(t, window.keyListener, true);
        document.removeEventListener(t, window.keyListener, false);
      });
    }
  } catch(e){}
}, 600);

console.log('%c[Keymap v7] ready – PC → virtual button, no direct engine hook, no visual flash', 'color:#8f8');
})();
