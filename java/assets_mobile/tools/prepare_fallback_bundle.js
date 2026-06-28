const path = require('path');
const { rebuildGameRegistryIfNeeded, gameRegistry, ensureFallbackBundleForGame } = require('../server');

rebuildGameRegistryIfNeeded();
const gameId = process.argv[2];
if (!gameId) {
  console.error('Usage: node tools/prepare_fallback_bundle.js <gameId>');
  process.exit(1);
}
if (!gameRegistry.get(gameId)) {
  console.error('Unknown gameId:', gameId);
  console.error('Available:', Array.from(gameRegistry.keys()).join(', '));
  process.exit(2);
}
const result = ensureFallbackBundleForGame(gameId);
console.log(JSON.stringify({ ok: true, gameId, ...result, relBundle: path.relative(process.cwd(), result.bundlePath) }, null, 2));
