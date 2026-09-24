const test = require('node:test');
const assert = require('node:assert/strict');
const { DuetClient } = require('../client/DuetClient.js');

class FakeTransport {
  constructor() {
    this.handlers = new Map();
    this.requests = [];
    this.connected = false;
  }

  connect() {
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
  }

  request(message, payload) {
    this.requests.push({ message, payload });
    return Promise.resolve(this.responses.shift() || { ok: true });
  }

  on(message, handler) {
    if (!this.handlers.has(message)) this.handlers.set(message, new Set());
    this.handlers.get(message).add(handler);
  }

  off(message, handler) {
    this.handlers.get(message)?.delete(handler);
  }

  isConnected() {
    return this.connected;
  }

  emit(message, payload) {
    for (const handler of this.handlers.get(message) || []) handler(payload);
  }
}

function roomResult(overrides = {}) {
  return {
    ok: true,
    roomId: 'ABCD',
    color: 'w',
    reconnectToken: 'token-1',
    state: { turn: 'w', board: [] },
    ...overrides,
  };
}

test('DuetClient requires a transport', () => {
  assert.throws(() => new DuetClient(), /requires a transport/);
});

test('DuetClient delegates connection lifecycle to transport', () => {
  const transport = new FakeTransport();
  const client = new DuetClient({ transport });

  client.connect();
  assert.equal(transport.isConnected(), true);

  client.disconnect();
  assert.equal(transport.isConnected(), false);
});

test('createRoom stores room identity and publishes the authoritative snapshot', async () => {
  const transport = new FakeTransport();
  transport.responses = [roomResult()];
  const client = new DuetClient({ transport, identity: { duetPlayerId: 'p1' } });
  const states = [];
  client.onStateUpdate((state) => states.push(state));

  const result = await client.createRoom();

  assert.equal(result.roomId, 'ABCD');
  assert.equal(client.roomCode, 'ABCD');
  assert.equal(client.color, 'w');
  assert.equal(client.reconnectToken, 'token-1');
  assert.deepEqual(client.snapshot, result.state);
  assert.deepEqual(states, [result.state]);
  assert.deepEqual(transport.requests[0], { message: 'create_room', payload: {} });
});

test('joinRoom sends the room code through the client contract', async () => {
  const transport = new FakeTransport();
  transport.responses = [roomResult({ color: 'b' })];
  const client = new DuetClient({ transport });

  await client.joinRoom('ROOM9');

  assert.deepEqual(transport.requests[0], {
    message: 'join_room',
    payload: { roomId: 'ROOM9' },
  });
  assert.equal(client.color, 'b');
});

test('rejoinRoom preserves the reconnect contract', async () => {
  const transport = new FakeTransport();
  transport.responses = [roomResult()];
  const client = new DuetClient({ transport });

  await client.rejoinRoom('ABCD', 'w', 'token-1');

  assert.deepEqual(transport.requests[0], {
    message: 'rejoin_room',
    payload: { roomId: 'ABCD', color: 'w', reconnectToken: 'token-1' },
  });
});

test('sendMove delegates player intent and publishes returned authoritative state', async () => {
  const transport = new FakeTransport();
  const state = { turn: 'b', board: ['after-move'] };
  transport.responses = [{ ok: true, state }];
  const client = new DuetClient({ transport });
  const states = [];
  client.onStateUpdate((snapshot) => states.push(snapshot));

  const result = await client.sendMove({ from: 'a1', to: 'b2' });

  assert.deepEqual(transport.requests[0], {
    message: 'make_move',
    payload: { from: 'a1', to: 'b2' },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(client.snapshot, state);
  assert.deepEqual(states, [state]);
});

test('server state_update events flow through DuetClient', () => {
  const transport = new FakeTransport();
  const client = new DuetClient({ transport });
  const states = [];
  client.onStateUpdate((state) => states.push(state));

  const state = { turn: 'b', board: ['server-event'] };
  transport.emit('state_update', { state });

  assert.deepEqual(client.snapshot, state);
  assert.deepEqual(states, [state]);
});

test('opponent_joined updates state and emits the client event', () => {
  const transport = new FakeTransport();
  const client = new DuetClient({ transport });
  const states = [];
  const joins = [];
  client.onStateUpdate((state) => states.push(state));
  client.on('opponent_joined', (state) => joins.push(state));

  const state = { turn: 'w', board: ['joined'] };
  transport.emit('opponent_joined', { state });

  assert.deepEqual(states, [state]);
  assert.deepEqual(joins, [state]);
});

test('failed room and move requests surface through onError', async () => {
  const transport = new FakeTransport();
  transport.responses = [
    { ok: false, reason: 'Room not found.' },
    { ok: false, reason: 'Invalid move.' },
  ];
  const client = new DuetClient({ transport });
  const errors = [];
  client.onError((error) => errors.push(error));

  await client.joinRoom('NOPE');
  await client.sendMove({ from: 'a1', to: 'b2' });

  assert.equal(errors.length, 2);
  assert.equal(errors[0].reason, 'Room not found.');
  assert.equal(errors[1].reason, 'Invalid move.');
});

test('listener unsubscribe stops client callbacks', () => {
  const transport = new FakeTransport();
  const client = new DuetClient({ transport });
  const states = [];
  const unsubscribe = client.onStateUpdate((state) => states.push(state));

  unsubscribe();
  transport.emit('state_update', { state: { turn: 'w' } });

  assert.deepEqual(states, []);
});
