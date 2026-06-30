/**
 * KEYMAP PC -> VIRTUAL NOKIA v7.4 — PUBLIC_PC HYBRID LAYOUT
 * ----------------------------------------------------------------------------
 * Mục tiêu bản này:
 * - Nếu mở public_pc / cổng 3002 bằng PC: GIỮ NGUYÊN giao diện PC hiện tại
 *   (bàn phím Nokia nằm bên trái, màn hình game bên phải) và GIỮ NGUYÊN xử lý phím.
 * - Nếu mở trực tiếp cổng 3002 bằng mobile/tablet: CHỈ đổi layout bàn phím ảo về
 *   kiểu mobile giống public_mobile/public_mobie (màn hình trên, keypad Nokia dưới).
 * - Phần xử lý input vẫn là logic public_pc hiện tại: PC key -> virtual button -> sendKeyRaw().
 */
(function(){
'use strict';
if (window.__keymap_v7) return;
window.__keymap_v7 = true;

function isMobileClient(){
  var ua = navigator.userAgent || '';
  var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone|KaiOS|Nokia|Series ?60|SymbianOS|J2ME|MIDP|Profile\//i.test(ua);
  var coarse = false;
  try { coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch(e){}
  var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0 || (navigator.msMaxTouchPoints || 0) > 0;
  var smallViewport = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) <= 820;
  // UA mobile là chắc chắn. Nếu bật "desktop site" làm UA mất chữ Mobile, vẫn nhận qua touch + viewport nhỏ/coarse.
  return !!(uaMobile || (touch && (coarse || smallViewport)));
}

var MOBILE_LAYOUT_ON_PC_PORT = isMobileClient();
document.documentElement.classList.toggle('pc-port-mobile-layout', MOBILE_LAYOUT_ON_PC_PORT);
document.documentElement.classList.toggle('pc-port-desktop-layout', !MOBILE_LAYOUT_ON_PC_PORT);
console.log('%c[Keymap v7.4 PC] init – layout=' + (MOBILE_LAYOUT_ON_PC_PORT ? 'MOBILE keypad on public_pc:3002' : 'DESKTOP PC'), 'color:#9f9');

var css = document.createElement('style');
css.id = '__pc_keymap_v73_layout_css';
if (MOBILE_LAYOUT_ON_PC_PORT) {
  /*
   * Mobile truy cập thẳng cổng PC 3002:
   * Không dùng desktop left/right CSS. Ép lại các điểm quan trọng về layout gốc
   * của index.html/public_mobile: game-body column, screen-area trên, gamepad dưới.
   */
  css.textContent = `
#gameView .game-body{
  flex-direction:column!important;
  align-items:stretch!important;
}
#gameView .screen-area{
  flex:1 1 auto!important;
  order:0!important;
  width:100%!important;
  min-height:0!important;
}
#gameView .gamepad, #gameView .gamepad.visible{
  display:flex!important;
  order:1!important;
  flex:0 0 auto!important;
  width:100%!important;
  max-width:none!important;
  min-width:0!important;
  height:auto!important;
  max-height:none!important;
  overflow:visible!important;
  border-right:none!important;
  border-top:1px solid #1a1a22!important;
  background:#0a0a0f!important;
  padding:1.5vw 0 2vw!important;
  box-sizing:border-box!important;
}
#gameView .nokia-body{
  width:100%!important;
  padding:1vw 0 1.5vw!important;
  gap:1vw!important;
}
#gameView .soft-row{
  display:flex!important;
  width:100%!important;
  justify-content:center!important;
  align-items:center!important;
  gap:2vw!important;
  padding:0!important;
  flex-wrap:nowrap!important;
  overflow:visible!important;
}
#gameView .soft-key{
  flex:0 1 auto!important;
  min-width:12vw!important;
  max-width:none!important;
  width:auto!important;
  height:5.5vw!important;
  border-radius:3vw!important;
  font-size:2.4vw!important;
  letter-spacing:.5vw!important;
  padding:0!important;
  display:flex!important;
  visibility:visible!important;
  opacity:1!important;
}
#gameView .dpad-wheel-wrap{
  width:44vw!important;
  height:44vw!important;
  max-width:180px!important;
  max-height:180px!important;
  margin:1vw 0!important;
}
#gameView .dpad-seg .seg-icon{font-size:4vw!important;}
#gameView .dpad-seg .seg-key{font-size:1.8vw!important;}
#gameView .dpad-ok .ok-label{font-size:2.8vw!important;}
#gameView .dpad-ok .wasd-label{font-size:1.6vw!important;}
#gameView .numpad{
  width:75vw!important;
  max-width:280px!important;
  gap:1.2vw!important;
  margin:0 auto!important;
}
#gameView .num-btn{
  height:7.5vw!important;
  border-radius:2vw!important;
  font-size:3.2vw!important;
}
#gameView .nokia-brand{font-size:1.6vw!important;letter-spacing:1vw!important;}
#gameView .nokia-sep{margin:.5vw 0!important;}
#pcKeyHint{display:none!important;}
#padToggle{background:#3a5a2a!important;color:#9fff7c!important;}
@media (min-width: 700px){
  #gameView .soft-key{min-width:84px!important;height:38px!important;font-size:16px!important;border-radius:20px!important;letter-spacing:2px!important;}
  #gameView .dpad-seg .seg-icon{font-size:28px!important;}
  #gameView .dpad-seg .seg-key{font-size:12px!important;}
  #gameView .dpad-ok .ok-label{font-size:20px!important;}
  #gameView .dpad-ok .wasd-label{font-size:11px!important;}
  #gameView .num-btn{height:52px!important;font-size:22px!important;border-radius:14px!important;}
  #gameView .nokia-brand{font-size:11px!important;letter-spacing:7px!important;}
}
`;
  console.log('%c[Keymap v7.4 PC] Mobile layout injected for direct 3002 access', 'color:#9cf');
} else {
  /* ---- Desktop left/right CSS — chỉ áp dụng cho PC thật ---- */
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
  console.log('%c[Keymap v7.4 PC] Desktop CSS injected', 'color:#9f9');
}
document.head.appendChild(css);

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



/* ---- Mobile-on-3002 touch bridge ----
 * public_pc gốc đã có bindGamepadButtons(), nhưng bản patch PC cũng có keyboard
 * bridge riêng cho desktop. Khi mobile vào thẳng 3002, ta chặn nhánh keyboard/iframe
 * injection và dùng touch/pointer trực tiếp trên các nút [data-code]. Vẫn gọi đúng
 * sendKeyRaw() của public_pc, nên xử lý game/save/runtime vẫn là PC.
 */
var __mobileTouchBridgeInstalled = false;
var __mobileActiveCodes = new Map();
function installMobileTouchBridge(){
  if (!MOBILE_LAYOUT_ON_PC_PORT || __mobileTouchBridgeInstalled) return;
  __mobileTouchBridgeInstalled = true;
  function buttonFromEvent(e){
    var t = e.target;
    if (!t) return null;
    if (t.closest) return t.closest('#gamepad [data-code]');
    while (t && t !== document) {
      if (t.getAttribute && t.getAttribute('data-code') != null) return t;
      t = t.parentNode;
    }
    return null;
  }
  function pressBtn(btn, id, e){
    if (!btn) return;
    var code = parseInt(btn.getAttribute('data-code'), 10);
    if (isNaN(code)) return;
    var key = String(id || 'touch') + ':' + code;
    if (__mobileActiveCodes.has(key)) return;
    __mobileActiveCodes.set(key, { btn: btn, code: code });
    btn.classList.add('pressed');
    try { if (typeof sendKeyRaw === 'function') sendKeyRaw(code, true); } catch(err){}
  }
  function releaseKey(key){
    var rec = __mobileActiveCodes.get(key);
    if (!rec) return;
    __mobileActiveCodes.delete(key);
    try { rec.btn.classList.remove('pressed'); } catch(e){}
    try { if (typeof sendKeyRaw === 'function') sendKeyRaw(rec.code, false); } catch(err){}
  }
  function releaseAll(){
    Array.from(__mobileActiveCodes.keys()).forEach(releaseKey);
  }
  function swallow(e){
    try { e.preventDefault(); } catch(_){}
    try { e.stopPropagation(); } catch(_){}
    try { if (e.stopImmediatePropagation) e.stopImmediatePropagation(); } catch(_){}
  }
  function onPointerDown(e){
    var btn = buttonFromEvent(e); if (!btn) return;
    swallow(e);
    try { btn.setPointerCapture && btn.setPointerCapture(e.pointerId); } catch(_){}
    pressBtn(btn, 'p' + e.pointerId, e);
  }
  function onPointerUp(e){
    var had = __mobileActiveCodes.has('p' + e.pointerId + ':' + (buttonFromEvent(e) && buttonFromEvent(e).getAttribute('data-code')));
    swallow(e);
    // pointerup có thể xảy ra ngoài nút, nên release theo pointerId bất kể code.
    Array.from(__mobileActiveCodes.keys()).forEach(function(k){ if (k.indexOf('p' + e.pointerId + ':') === 0) releaseKey(k); });
  }
  function onTouchStart(e){
    var touches = e.changedTouches || [];
    var used = false;
    for (var i=0;i<touches.length;i++) {
      var t = touches[i];
      var el = document.elementFromPoint(t.clientX, t.clientY);
      var btn = el && el.closest && el.closest('#gamepad [data-code]');
      if (btn) { used = true; pressBtn(btn, 't' + t.identifier, e); }
    }
    if (used) swallow(e);
  }
  function onTouchEnd(e){
    var touches = e.changedTouches || [];
    var used = false;
    for (var i=0;i<touches.length;i++) {
      var prefix = 't' + touches[i].identifier + ':';
      Array.from(__mobileActiveCodes.keys()).forEach(function(k){ if (k.indexOf(prefix) === 0) { used = true; releaseKey(k); } });
    }
    if (used) swallow(e);
  }
  function bind(root){
    if (!root || root.__pc3002MobileTouchBound) return;
    root.__pc3002MobileTouchBound = true;
    if (window.PointerEvent) {
      root.addEventListener('pointerdown', onPointerDown, true);
      root.addEventListener('pointerup', onPointerUp, true);
      root.addEventListener('pointercancel', onPointerUp, true);
      root.addEventListener('lostpointercapture', onPointerUp, true);
    } else {
      root.addEventListener('touchstart', onTouchStart, { capture:true, passive:false });
      root.addEventListener('touchend', onTouchEnd, { capture:true, passive:false });
      root.addEventListener('touchcancel', onTouchEnd, { capture:true, passive:false });
    }
  }
  function tryBind(){ bind(document.getElementById('gamepad') || document); }
  tryBind();
  setTimeout(tryBind, 250);
  setTimeout(tryBind, 1000);
  window.addEventListener('blur', releaseAll, true);
  document.addEventListener('visibilitychange', function(){ if (document.hidden) releaseAll(); }, true);
  console.log('%c[Keymap v7.4 PC] mobile touch bridge installed (touch -> public_pc sendKeyRaw)', 'color:#9cf');
}

/* ---- override setupKeyboardMapping ---- */
window.setupKeyboardMapping = function(iframe){
  console.log('%c[Keymap v7.4 PC] setupKeyboardMapping – layout=' + (MOBILE_LAYOUT_ON_PC_PORT ? 'mobile-touch' : 'desktop-keyboard'), 'color:#8f8');

  // Mobile/tablet vào thẳng cổng 3002: bàn phím ảo là CẢM ỨNG, không inject
  // keyboard bridge vào iframe. Iframe/runtime và sendKeyRaw vẫn là public_pc.
  if (MOBILE_LAYOUT_ON_PC_PORT) {
    try { if (typeof showGamepad === 'function') showGamepad(); } catch(e){}
    installMobileTouchBridge();
    return;
  }

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

  // public_pc: vẫn luôn hiện keypad. Chỉ layout thay đổi theo thiết bị.
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
    if (fr.src && fr.src.includes('cheerpj_run.html')) { console.log('[Keymap v7.4] CheerpJ Mode 5 detected – allowing direct keyboard hook for Java AWT'); return; }
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

console.log('%c[Keymap v7.4 PC] ready – desktop dùng keyboard, mobile-3002 dùng touch, layout=' + (MOBILE_LAYOUT_ON_PC_PORT ? 'mobile keypad' : 'desktop keypad'), 'color:#8f8');
})();
