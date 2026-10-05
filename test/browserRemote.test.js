const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('actual browser assets initialize the remote lobby and send a room request', async () => {
  const root = path.join(__dirname, '../public');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { style: {}, focus() {}, addEventListener() {} });
    return elements.get(id);
  };
  const requests = [];
  const socket = { connected: false, connect() { this.connected = true; }, disconnect() {}, on() {}, off() {}, emit(message, payload, reply) { requests.push({ message, payload }); reply({ ok: false }); } };
  const context = vm.createContext({ window: {}, document: { getElementById: element }, localStorage: { getItem() { return null; } }, io: () => socket, SiteNavigation: { showLobby() {} } });
  context.window = context;
  for (const name of ['ITransport', 'SocketTransport', 'DuetClient']) vm.runInContext(fs.readFileSync(path.join(root, 'client', name + '.js'), 'utf8'), context);
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).find(source => source.includes('const RemoteState ='));
  assert.ok(script, 'remote inline script exists');
  vm.runInContext(script, context);
  vm.runInContext('RemoteMode.enterLobby()', context);
  assert.equal(socket.connected, true);
  assert.equal(element('remote-lobby').style.display, '');
  await vm.runInContext('RemoteState.client.createRoom()', context);
  assert.equal(requests[0].message, 'create_room');
});
