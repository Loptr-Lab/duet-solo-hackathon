const test = require('node:test');
const assert = require('node:assert/strict');

// Completion posts a public match result in production. Replace that boundary
// before loading the namespace so this local integration check stays private.
const posterPath = require.resolve('../atprotoPoster.js');
const posted = [];
require.cache[posterPath] = {
  id: posterPath,
  filename: posterPath,
  loaded: true,
  exports: { postMatchResult: result => posted.push(result) },
};
const { createGameNamespace } = require('../gameNamespace.js');

const moves = [
  'a2a3', 'e7e5', 'e2e4', 'h7h5', 'f1b5', 'f7f6', 'f2f3', 'c7c5',
  'b5a4', 'b8a6', 'e1e2', 'f8d6', 'c2c4', 'd8e7', 'd2d4', 'f6f5',
  'a4c2', 'd6c7', 'a3a4', 'h8h6', 'd1f1', 'c5d4', 'c1h6', 'e7e6',
  'c4c5', 'a6b8', 'f3f4', 'e6f7', 'b2b4', 'f7f8', 'f1f2', 'e8f7',
  'f2d4', 'f8c5',
];

function socket(id) {
  const handlers = {};
  return {
    id, data: {}, handlers, join() {},
    on(event, handler) { handlers[event] = handler; },
    async request(event, payload) {
      let reply;
      await handlers[event](payload, value => { reply = value; });
      return reply;
    },
  };
}

test('two players create, join, finish a match, and receive a final state', async () => {
  posted.length = 0;
  const sockets = [];
  const emissions = [];
  const persisted = new Map();
  const roomStore = {
    async saveRoom(id, state) { persisted.set(id, structuredClone(state)); },
    async loadRoom(id) { return persisted.get(id) || null; },
  };
  const io = {
    on(event, handler) { if (event === 'connection') this.connect = handler; },
    to(roomId) { return { emit(event, payload) { emissions.push({ roomId, event, payload }); } }; },
  };
  const game = createGameNamespace(io, roomStore);
  const white = socket('white');
  const black = socket('black');
  for (const player of [white, black]) { io.connect(player); sockets.push(player); }

  const created = await white.request('create_room', {});
  assert.equal(created.ok, true);
  assert.equal(created.color, 'w');
  assert.match(created.roomId, /^[A-HJ-NP-Z2-9]{5}$/);
  const joined = await black.request('join_room', { roomId: created.roomId });
  assert.equal(joined.ok, true);
  assert.equal(joined.color, 'b');
  assert.deepEqual(joined.state.playersConnected, { w: true, b: true });
  assert.equal((await black.request('make_move', { from: 'e7', to: 'e5' })).ok, false);

  let final;
  for (const [index, move] of moves.entries()) {
    const player = sockets[index % 2];
    const reply = await player.request('make_move', { from: move.slice(0, 2), to: move.slice(2) });
    assert.equal(reply.ok, true, `move ${index + 1}: ${move}: ${reply.reason || ''}`);
    assert.equal(reply.state.gameOver, index === moves.length - 1);
    final = reply.state;
  }

  assert.equal(final.winner, 'w');
  assert.equal(final.turn, 'b');
  assert.ok(final.feedback.anonymousMatchId);
  assert.ok(final.feedback.prompt.id);
  assert.equal(persisted.get(created.roomId).moveCount, moves.length);
  assert.equal(emissions.filter(entry => entry.event === 'state_update').length, moves.length);
  assert.deepEqual(posted, [{ winner: 'w' }]);
  const rejected = await black.request('make_move', { from: 'a7', to: 'a6' });
  assert.equal(rejected.ok, false);
  assert.match(rejected.reason, /already over/);
  assert.equal(game.rooms[created.roomId].gameOver, true);
});
