const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function browserGame() {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const source = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(script => script.includes('const GameState ='));
  const elements = new Map();
  const timers = [];
  function element() {
    return { innerText: '', innerHTML: '', value: '', children: [], attributes: {}, dataset: {},
      style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} },
      appendChild(child) { this.children.push(child); }, addEventListener() {}, focus() {},
      setAttribute(key, value) { this.attributes[key] = value; },
    };
  }
  const get = id => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const context = vm.createContext({ window: {},
    document: { getElementById: get, createElement: element, querySelectorAll: () => [] },
    SiteNavigation: { selectPlayPage() {} },
    setTimeout(callback) { timers.push(callback); },
  });
  vm.runInContext(source, context);
  return { run: code => vm.runInContext(code, context), get, timers };
}

test('local two-player opening waits for Black and accepts the second player move', () => {
  const game = browserGame();
  game.run("enterRealm('local'); submitPlayerIntent({type:'MOVE',from:'e2',to:'e4'})");
  assert.equal(game.run('GameState.turn'), 'b');
  assert.match(game.get('play-mode-status').innerText, /pass the device to Black/);
  assert.equal(game.timers.length, 0, 'no computer reply scheduled');
  game.run("submitPlayerIntent({type:'MOVE',from:'e7',to:'e5'})");
  assert.equal(game.run('GameState.turn'), 'w');
  assert.equal(game.run('GameState.board[3][4].color'), 'b');
});

test('computer choice enables Black, replies, and restores player turn feedback', () => {
  const game = browserGame();
  game.run("enterRealm('computer'); submitPlayerIntent({type:'MOVE',from:'e2',to:'e4'})");
  assert.equal(game.get('ds-ai-toggle').attributes['aria-pressed'], 'true');
  assert.match(game.get('play-mode-status').innerText, /computer is thinking/);
  assert.equal(game.timers.length, 1);
  game.timers.shift()();
  assert.equal(game.run('GameState.turn'), 'w');
  assert.match(game.get('play-mode-status').innerText, /Your turn/);
  game.run("enterRealm('local')");
  assert.equal(game.run("isAIControlled('b')"), false);
  assert.equal(game.get('ds-ai-toggle').attributes['aria-pressed'], 'false');
});
