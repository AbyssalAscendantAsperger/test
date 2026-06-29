const assert = require('assert');
const fs = require('fs');
const path = require('path');
const srv = require('./mobie');
const src = path.join(__dirname, 'jar/Asphalt_-_Urban_GT_240x320-1.0-646693-mobiles24.jar');
const dst = path.join(__dirname, 'jar/Asphalt_copy_240x320.jar');
try {
  const meta = srv.extractJarMetadata(src);
  assert(meta.name && !/waptai/i.test(meta.name), 'name should be cleaned');
  assert(meta.dev, 'dev/vendor should be extracted');
  assert(/^MIDP-/.test(meta.profile), 'profile should be extracted');
  assert(/^CLDC-/.test(meta.config), 'config should be extracted');
  fs.copyFileSync(src, dst);
  srv.rebuildGameRegistryIfNeeded();
  const dups = [...srv.gameRegistry.values()].filter(g => g.duplicateKey === meta.duplicateKey);
  assert(dups.length >= 2, 'duplicate MIDlet-Name should group by duplicateKey');
  console.log('✅ metadata/dev/profile/duplicate grouping tests passed');
} finally {
  try { fs.unlinkSync(dst); } catch(e) {}
  srv.rebuildGameRegistryIfNeeded();
  process.exit(0);
}
