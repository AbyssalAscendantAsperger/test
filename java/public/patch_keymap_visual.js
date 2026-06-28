/**
 * Patch Keymap Visual v3 – 1155ad0 compatible
 * - Giữ UI Nokia + keymap modal gốc từ index.html (1155ad0)
 * - Thêm CSS desktop left/right đã inject trực tiếp vào index.html
 * - File này CHỈ làm: PC keyboard → virtual button sáng (visual feedback)
 *   KHÔNG chặn input, KHÔNG override setupKeyboardMapping, KHÔNG inject iframe
 *   → Mode 4 freej2me-web chạy nguyên bản, PC + mobile đều OK
 */
(function(){
'use strict';
console.log('%c[Keymap Visual v3] PC key → virtual button highlight only (no input hijack)', 'color:#9f9');

// PC key → MIDP code map (giống patch_keymap_v7, để highlight đúng nút)
const PC_TO_MIDP = {
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
  'Minus':42,'NumpadMultiply':42,
  'Equal':35,'NumpadDivide':35,'Slash':35
};
const FALLBACK = {w:-1,a:-3,s:-2,d:-4,q:-6,e:-7,z:122,c:99,' ':-5,
  '0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'*':42,'#':35};

function findBtn(code){
  return document.querySelector('#gamepad [data-code="'+code+'"]');
}

function setPressed(code, on){
  const btn = findBtn(code);
  if(btn) btn.classList.toggle('pressed', !!on);
}

function pcVisualHandler(e){
  const gv = document.getElementById('gameView');
  if (!gv || !gv.classList.contains('visible')) return;
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  if (tag==='input'||tag==='textarea'||tag==='select') return;
  // KHÔNG preventDefault, KHÔNG stopPropagation – để keyListener gốc trong index.html xử lý
  const code = PC_TO_MIDP[e.code] ?? FALLBACK[(e.key||'').toLowerCase()];
  if (code === undefined) return;
  setPressed(code, e.type === 'keydown');
}

// Passive visual only – để keyListener gốc (setupKeyboardMapping) xử lý game input
document.addEventListener('keydown', pcVisualHandler, true);
document.addEventListener('keyup', pcVisualHandler, true);

console.log('%c[Keymap Visual v3] ready', 'color:#8f8');
})();
