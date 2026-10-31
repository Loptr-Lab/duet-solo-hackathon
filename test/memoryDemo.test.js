const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const { io: client } = require('socket.io-client');
const { createGameNamespace } = require('../gameNamespace');
const { createDemoRuntime } = require('../demoRuntime');

function request(socket, event, payload = {}) {
  return new Promise((resolve, reject) => socket.timeout(2000).emit(event, payload, (err, value) => err ? reject(err) : resolve(value)));
}

test('memory demo validates bounded settings', () => {
  assert.equal(createDemoRuntime().options.maxRooms, 10);
  assert.throws(() => createDemoRuntime({ DUET_DEMO_MAX_ROOMS: '0' }));
  assert.throws(() => createDemoRuntime({ DUET_DEMO_IDLE_MINUTES: '121' }));
});

test('real WebSockets isolate two rooms, reconnect seats, bound capacity and expire rooms', async t => {
  const server = http.createServer();
  const io = new Server(server);
  const demo = createDemoRuntime();
  let now = 100;
  const game = createGameNamespace(io, demo.roomStore, null, { ...demo.options, maxRooms: 2, idleMs: 1000, now: () => now });
  const sockets = [];
  t.after(async () => { sockets.forEach(s => s.disconnect()); game.close(); await new Promise(resolve => io.close(resolve)); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  async function connect() {
    const s = client(`http://127.0.0.1:${server.address().port}`, { transports: ['websocket'], reconnection: false });
    sockets.push(s);
    await new Promise((resolve, reject) => { s.once('connect', resolve); s.once('connect_error', reject); });
    return s;
  }
  const [a, b, c, d, extra] = await Promise.all(Array.from({ length: 5 }, connect));
  const first = await request(a, 'create_room');
  const second = await request(c, 'create_room');
  assert.equal(first.ok, true); assert.equal(second.ok, true);
  assert.notEqual(first.roomId, second.roomId);
  assert.equal((await request(a, 'join_room', { roomId: first.roomId })).ok, false);
  const joined = await request(b, 'join_room', { roomId: first.roomId });
  assert.equal(joined.ok, true);
  assert.equal((await request(d, 'join_room', { roomId: second.roomId })).ok, true);
  assert.equal((await request(extra, 'create_room')).ok, false);
  assert.equal((await request(b, 'make_move', { from: 'e7', to: 'e5' })).ok, false);
  assert.equal((await request(a, 'make_move', { from: 'e2', to: 'e5' })).ok, false);
  const update = new Promise(resolve => b.once('state_update', resolve));
  const moved = await request(a, 'make_move', { from: 'e2', to: 'e4' });
  assert.equal(moved.ok, true);
  assert.deepEqual((await update).state, moved.state);
  assert.equal(game.rooms[second.roomId].turn, 'w');
  b.disconnect();
  const replacement = await connect();
  assert.equal((await request(replacement, 'rejoin_room', { roomId: first.roomId, color: 'b', reconnectToken: 'wrong' })).ok, false);
  const recovered = await request(replacement, 'rejoin_room', { roomId: first.roomId, color: 'b', reconnectToken: joined.reconnectToken });
  assert.equal(recovered.ok, true);
  assert.deepEqual(recovered.state.board, moved.state.board);
  assert.equal((await request(replacement, 'make_move', { from: 'e7', to: 'e5' })).ok, true);
  now += 1001;
  const expired = new Promise(resolve => a.once('room_expired', resolve));
  game.expireRooms();
  await expired;
  assert.equal(Object.keys(game.rooms).length, 0);
  assert.equal((await request(a, 'make_move', { from: 'd2', to: 'd4' })).ok, false);
  assert.equal((await request(extra, 'join_room', { roomId: first.roomId })).ok, false);
  const finalRoom = await request(extra, 'create_room');
  assert.equal(finalRoom.ok, true);
  assert.equal((await request(replacement, 'join_room', { roomId: finalRoom.roomId })).ok, true);
  const moves = ['a2a3','e7e5','e2e4','h7h5','f1b5','f7f6','f2f3','c7c5','b5a4','b8a6','e1e2','f8d6','c2c4','d8e7','d2d4','f6f5','a4c2','d6c7','a3a4','h8h6','d1f1','c5d4','c1h6','e7e6','c4c5','a6b8','f3f4','e6f7','b2b4','f7f8','f1f2','e8f7','f2d4','f8c5'];
  let final;
  for (const [i, move] of moves.entries()) {
    const reply = await request(i % 2 ? replacement : extra, 'make_move', { from: move.slice(0, 2), to: move.slice(2) });
    assert.equal(reply.ok, true, move);
    final = reply.state;
  }
  assert.equal(final.gameOver, true);
  assert.equal(final.winner, 'w');
  assert.equal(final.feedback, undefined);
  assert.equal((await request(extra, 'make_move', { from: 'a1', to: 'a2' })).ok, false);
  assert.equal(require.cache[require.resolve('../atprotoPoster')], undefined);
});

test('demo startup never loads Google, identity or public posting modules', async t => {
  const { spawn } = require('node:child_process');
  const source = `const Module = require('module'); const original = Module._load;
    Module._load = function(name, ...args) {
      if (/firestore|atproto|services\\/storage|roomStore/.test(name)) throw new Error('Forbidden demo dependency: ' + name);
      return original.call(this, name, ...args);
    }; require('./server.js');`;
  const child = spawn(process.execPath, ['-e', source], { cwd: require('node:path').join(__dirname, '..'), env: { ...process.env, DUET_STORAGE_MODE: 'memory-demo', PORT: '0' } });
  t.after(() => child.kill());
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('startup timeout')), 5000);
    child.stdout.on('data', chunk => { const match = chunk.toString().match(/Server listening on http:\/\/0.0.0.0:(\d+)/); if (match) { clearTimeout(timeout); resolve(Number(match[1])); } });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error('early exit: ' + code)); });
  });
  const origin = `http://127.0.0.1:${port}`;
  assert.equal(await (await fetch(origin + '/healthz')).text(), 'ok');
  const runtime = await (await fetch(origin + '/api/runtime')).json();
  assert.equal(runtime.mode, 'memory-demo');
  assert.equal(runtime.sourceSha, null);
  const html = await (await fetch(origin)).text();
  assert.match(html, /onclick="RemoteMode.enterLobby\(\)"/);
  assert.match(html, /How to play Classic Duet/);
  assert.match(html, /for="remote-join-code"/);
  assert.doesNotMatch(html, /GAME STATUS · TEMPORARILY UNAVAILABLE/);
  assert.doesNotMatch(html, /href="\/signin.html"/);
  assert.equal(await (await fetch(origin + '/index.html')).text(), html);
});
