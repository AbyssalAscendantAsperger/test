const fs = require('fs');
const path = require('path');
const assert = require('assert');
const srv = require('./server');

(async () => {
  // 1) Parse search thật với từ khóa Ninja.
  const search = await srv.searchDedomil('Ninja', 1);
  assert(search.results.length > 0, 'Ninja search should return downloadable results');
  assert(search.results.every(r => r.downloadable && r.bestResolution), 'Search API should hide non-downloadable/unsupported results');
  assert(search.results.some(r => /ninja/i.test(r.title)), 'Search results should contain Ninja title');
  assert.strictEqual(search.page, 1);

  // 2) Parse version thật của game có nhiều bản, chọn ưu tiên 240x320.
  const html = await new Promise((resolve, reject) => {
    require('http').get('http://dedomil.net/games/6476', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
  const parsed = srv.parseDedomilVersions(html, '6476');
  assert(parsed.versions.length > 0, 'Should parse Dedomil versions');
  const selected = srv.chooseDedomilVersion(parsed.versions);
  assert(selected, 'Should choose a version');
  assert.strictEqual(selected.resolution, '240x320', 'Should prefer 240x320 when available');

  // 3) Test metadata JAR: tải tạm 1 JAR nhỏ, đọc tên từ MANIFEST.
  const before = new Set(fs.readdirSync(path.join(__dirname, 'jar')).filter(f => f.endsWith('.jar')));
  const result = await srv.downloadDedomilGame('6476');
  assert(result.ok, 'Download should succeed');
  assert.strictEqual(result.resolution, '240x320', 'Downloader should pick 240x320');
  const full = path.join(__dirname, 'jar', result.file);
  assert(fs.existsSync(full), 'Downloaded JAR should exist');
  const meta = srv.extractJarMetadata(full);
  assert(meta.name && meta.name.length >= 2, 'JAR manifest name should be extracted');

  // Cleanup downloaded test file so test is repeatable and does not pollute jar list.
  const after = fs.readdirSync(path.join(__dirname, 'jar')).filter(f => f.endsWith('.jar'));
  for (const f of after) if (!before.has(f)) fs.unlinkSync(path.join(__dirname, 'jar', f));
  srv.rebuildGameRegistryIfNeeded();

  console.log('✅ Dedomil search/download/metadata tests passed');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
