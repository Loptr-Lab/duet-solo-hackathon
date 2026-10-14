const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const tv = fs.readFileSync(path.join(root, 'public', 'firetv.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'firetv.css'), 'utf8');

test('Fire TV enhancement is loaded as an opt-in without altering the default page mode', () => {
  assert.match(html, /href="\/firetv\.css"/);
  assert.match(html, /src="\/firetv\.js" defer/);
  assert.match(tv, /params\.get\('firetv'\) !== '1' && params\.get\('tv'\) !== '1'/);
});

test('Fire TV client maps D-pad navigation, board selection, pause, and back behavior', () => {
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) assert.ok(tv.includes(key));
  assert.match(tv, /square\.click\(\)/);
  assert.match(tv, /Number\(from\[1\]\) - delta\[1\]/);
  assert.match(tv, /keyCode === 179/);
  assert.match(tv, /keyCode === 4/);
  assert.match(tv, /aria-modal/);
});

test('Fire TV visuals provide TV scale and a distinct focus indicator', () => {
  assert.match(css, /width: min\(72vh, 84vw\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /outline: 5px solid #fff/);
});
