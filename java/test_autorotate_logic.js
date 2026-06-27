const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const testCode = `
(function runAutoRotateTests(){
  function assert(cond, msg) { if (!cond) throw new Error(msg); }

  currentFrame = {
    src: 'http://localhost/emu/main.html?jars=jar/t&canvasSize=size-240x320&enginemode=x',
    contentWindow: {
      document: {
        getElementById(id) {
          if (id !== 'canvas') return null;
          return {
            width: 240,
            height: 320,
            getContext() {
              return {
                getImageData(x, y) {
                  const isContent = y < 80;
                  return { data: isContent ? [80, 80, 80, 255] : [0, 0, 0, 255] };
                }
              };
            }
          };
        }
      },
      addEventListener() {},
      removeEventListener() {}
    }
  };
  closing = false;
  autoRotateDisabled = false;
  autoRotatePending = false;

  // 1) Detection must not rotate immediately; it must show countdown prompt.
  autoDetectOrientation();
  assert(currentFrame.src.includes('size-240x320'), 'Detection rotated immediately; expected countdown first');
  assert(autoRotatePending === true, 'Detection did not mark autoRotatePending');
  assert(document.getElementById('rotatePrompt').classList.contains('visible'), 'Rotate prompt is not visible');
  assert(/5 giây/.test(document.getElementById('rotatePromptText').textContent), 'Prompt does not show 5-second countdown text');

  // 2) Any browser interaction cancels pending auto-rotate and disables future auto-rotate.
  disableAutoRotateByUser();
  assert(autoRotatePending === false, 'User interaction did not cancel pending rotate');
  assert(autoRotateDisabled === true, 'User interaction did not disable auto rotate');
  assert(!document.getElementById('rotatePrompt').classList.contains('visible'), 'Prompt still visible after user interaction');
  assert(currentFrame.src.includes('size-240x320'), 'Frame rotated despite user cancellation');

  // 3) If no interaction happens, the final rotate path changes only canvasSize and disables auto-rotate after one auto rotation.
  autoRotateDisabled = false;
  autoRotatePending = true;
  const result = rotateGame(false);
  assert(result && result.before === '240x320' && result.after === '320x240', 'rotateGame(false) did not report expected rotation');
  assert(currentFrame.src.includes('size-320x240'), 'Auto rotate did not update iframe src canvasSize');
  assert(autoRotateDisabled === true, 'Auto rotate should disable itself after one automatic rotation');
})();
`;

function makeTarget() {
  return { addEventListener() {}, removeEventListener() {} };
}
const elements = {};
function el(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      textContent: '',
      classList: {
        values: new Set(),
        add(c) { this.values.add(c); },
        remove(c) { this.values.delete(c); },
        contains(c) { return this.values.has(c); }
      },
      style: {}
    };
  }
  return elements[id];
}

const context = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  document: Object.assign(makeTarget(), {
    getElementById: el,
    querySelectorAll: () => [],
    fullscreenElement: null,
    webkitFullscreenElement: null,
    exitFullscreen() {}
  }),
  window: Object.assign(makeTarget(), {
    navigator: { maxTouchPoints: 0 },
    localStorage: { getItem: () => null, setItem: () => {} }
  }),
  navigator: { maxTouchPoints: 0 },
  localStorage: { getItem: () => null, setItem: () => {} },
  indexedDB: { open() { throw new Error('not used'); } },
  fetch: async () => ({ json: async () => ({}) }),
  FileReader: function() {},
  Blob: function() {}
};
context.window.window = context.window;
context.window.document = context.document;

vm.runInNewContext(script + '\n' + testCode, context, { filename: 'public/index.html' });
console.log('✅ Auto-rotate countdown logic tests passed');
process.exit(0);
