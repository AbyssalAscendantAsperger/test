/**
 * KEYMAP PC -> VIRTUAL NOKIA v7.2 — PC-ONLY (đã tách khỏi mobile)
 * - Layout desktop CỐ ĐỊNH: keypad trái / màn hình phải (KHÔNG @media, KHÔNG dò touch).
 * - Route ALL PC keys -> virtual button [data-code] -> sendKeyRaw().
 * - KHÔNG còn nhánh tương thích mobile (không có "if(!isPC)return", không pointer:fine gate).
 *   Đây là frontend RIÊNG của PC nên luôn coi như đang chạy trên PC.
 */
(function(){
'use strict';
if (window.__keymap_v7) return;
window.__keymap_v7 = true;
console.log('%c[Keymap v7 PC] init (PC-only, layout cố định)', 'color:#9f9');

/* ---- Desktop left/right CSS — ÁP DỤNG VÔ ĐIỀU KIỆN (không @media) ---- */
var css = document.createElement('style');
css.textContent = `
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
#gameView .soft-row{
  display:flex!important;width:100%!important;max-width:100%!important;
  justify-content:space-between!important;align-items:center!important;
  gap:4px!important;padding:0 4px!important;flex-wrap:nowrap!important;
  box-sizing:border-box;overflow:visible!important;
}
#gameView .soft-key{
  flex:1 1 0 !important;min-width:0 !important;max-width:78px !important;width:auto !important;
  height:34px !important;font-size:13px !important;border-radius:8px !important;
  letter-spacing:0 !important;padding:0 4px !important;display:flex !important;
  visibility:visible !important;opacity:1 !important;box-sizing:border-box;
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
#padToggle { background:#3a5a2a !important; color:#9fff7c !important; }
/* đảm bảo soft keys không bao giờ bị ẩn */
#gameView .soft-key[data-code="-6"],
#gameView .soft-key[data-code="122"],
#gameView .soft-key[data-code="99"],
#gameView .soft-key[data-code="-7"]{
  display:flex !important;visibility:visible !important;opacity:1 !important;
}
`;
document.head.appendChild(css);
console.log('%c[Keymap v7 PC] CSS desktop injected (vô điều kiện)', 'color:#9f9');

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
window.setupKeyboardMapping = function(iframe){
  console.log('%c[Keymap v7 PC] setupKeyboardMapping – VIRTUAL ONLY', 'color:#8f8');
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
  ['keydown','keyup'].forEach(function(t){
    document.removeEventListener(t, pcHandler, true);
    window.removeEventListener(t, pcHandler, true);
    document.addEventListener(t, pcHandler, true);
    window.addEventListener(t, pcHandler, true);
  });
  window.keyListener = pcHandler;

  // PC: luôn hiện keypad (layout cố định, không dò pointer/touch)
  try { if (typeof showGamepad === 'function') showGamepad(); } catch(e){}

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
    try { fr.removeAttribute('sandbox'); } catch(e){}
    fr.addEventListener('load', function(){ setTimeout(function(){inject(fr,0)}, 180); });
    setTimeout(function(){inject(fr,0)}, 350);
    setTimeout(function(){inject(fr,0)}, 1200);
  }
};

window.addEventListener('message', function(ev){
  if (!ev.data) return;
  if (ev.data.type === 'pc-key-bridge'){
    var code = PC_TO_MIDP[ev.data.code] ?? FALLBACK[(ev.data.key||'').toLowerCase()];
    if (code !== undefined) triggerVirtual(code, ev.data.isDown);
    return;
  }
}, false);

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

console.log('%c[Keymap v7 PC] ready – PC → virtual button (layout desktop cố định)', 'color:#8f8');
})();
