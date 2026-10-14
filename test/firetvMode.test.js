const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const tv = fs.readFileSync(path.join(root, 'public', 'firetv.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'firetv.css'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'firetv', 'README.md'), 'utf8');

test('TV mode is opt-in and the main DUET page links to the same-domain TV experience', () => {
  assert.match(html, /href="\/firetv\.css"/);
  assert.match(html, /src="\/firetv\.js" defer/);
  assert.match(tv, /params\.get\('firetv'\) !== '1' && params\.get\('tv'\) !== '1'/);
  assert.match(html, /href="\/\?firetv=1#home"/);
  assert.match(html, /\.firetv-open \{ display:inline-flex;[^}]*white-space:nowrap/);
});

test('TV input covers D-pad navigation, selection, pause, and return for both game boards', () => {
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) assert.ok(tv.includes(key));
  assert.match(tv, /cross \* 0\.75/);
  assert.match(tv, /square\.click\(\)/);
  assert.match(tv, /Number\(from\[1\]\) - delta\[1\]/);
  assert.match(tv, /keyCode === 179/);
  assert.match(tv, /keyCode === 4/);
  assert.match(tv, /aria-modal/);
  assert.match(tv, /event\.key === 'Tab'/);
  assert.match(tv, /SiteNavigation\.showLobby\(\)/);
  assert.match(html, /div\.dataset\.square = sq/);
  assert.match(tv, /attachBoard\(remoteBoard\)/);
});

test('Standard Gamepad API maps D-pad/stick, A, B/Back, and Start for menus and boards', () => {
  assert.match(tv, /navigator\.getGamepads/);
  assert.match(tv, /pad\.mapping === 'standard'/);
  for (const button of ['\[0, 1, 8, 9\]', '\[12, \'ArrowUp\'\]', '\[13, \'ArrowDown\'\]', '\[14, \'ArrowLeft\'\]', '\[15, \'ArrowRight\'\]']) {
    assert.ok(new RegExp(button).test(tv), `missing gamepad mapping ${button}`);
  }
  assert.match(tv, /gamepad\.axes\?\.\[0\]/);
  assert.match(tv, /0\.55/);
  assert.match(readme, /accessibility switches/i);
});

test('TV mode exposes labeled, roving-focus board squares and high-contrast focus styling', () => {
  assert.match(tv, /removeAttribute\('aria-hidden'\)/);
  assert.match(tv, /setAttribute\('aria-label'/);
  assert.match(tv, /square\.tabIndex = name === activeSquare \? 0 : -1/);
  assert.match(css, /width: min\(72vh, 84vw\)/);
  assert.match(css, /#remote-board \{/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /outline: 5px solid #fff/);
});
