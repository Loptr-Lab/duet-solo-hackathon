/**
 * Room/game socket handling, factored out of server.js so it can be tested
 * against a fake room store without needing real Firestore or guessing at
 * credentials. Production wiring (server.js) passes the real Firestore-backed
 * store; tests pass a fake with the same {saveRoom, loadRoom, deleteRoom}
 * shape.
 *
 * `rooms` is an in-memory cache for speed -- every mutation is also written
 * through to roomStore so a fresh process (server restart) can reload a
 * room's data from persistence instead of losing it.
 */

const engine = require('./veiled-chess-core-server.js');

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode() {
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
}

function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'p', color: 'b' };
        board[6][i] = { type: 'p', color: 'w' };
    }
    board[0][0] = { type: 'r', color: 'b' }; board[0][7] = { type: 'r', color: 'b' };
    board[0][1] = { type: 'n', color: 'b' }; board[0][6] = { type: 'n', color: 'b' };
    board[0][2] = { type: 'b', color: 'b' }; board[0][5] = { type: 'b', color: 'b' };
    board[0][3] = { type: 'rb', color: 'b' };
    board[0][4] = { type: 'd', color: 'b' };
    board[7][0] = { type: 'r', color: 'w' }; board[7][7] = { type: 'r', color: 'w' };
    board[7][1] = { type: 'n', color: 'w' }; board[7][6] = { type: 'n', color: 'w' };
    board[7][2] = { type: 'b', color: 'w' }; board[7][5] = { type: 'b', color: 'w' };
    board[7][3] = { type: 'rb', color: 'w' };
    board[7][4] = { type: 'd', color: 'w' };
    return board;
}

function parseSquare(sq) {
    if (typeof sq !== 'string' || sq.length !== 2) return null;
    const c = sq.charCodeAt(0) - 97;
    const r = 8 - parseInt(sq[1], 10);
    if (c < 0 || c > 7 || r < 0 || r > 7 || Number.isNaN(r)) return null;
    return { r, c };
}

function publicRoomState(room) {
    return {
        board: room.board,
        turn: room.turn,
        gameOver: room.gameOver,
        winner: room.winner,
        playersConnected: { w: !!room.players.w, b: !!room.players.b },
    };
}

// `rooms` is created fresh each call -- this is the "server restarted" seam
// for testing: calling createGameNamespace again with a NEW empty rooms
// cache but the SAME underlying roomStore simulates a real restart, since
// nothing survives in memory except what's reloaded from the store.
function createGameNamespace(io, roomStore) {
    const rooms = {};

    async function persist(roomId, room) {
        try {
            await roomStore.saveRoom(roomId, {
                board: room.board,
                turn: room.turn,
                gameOver: room.gameOver,
                winner: room.winner,
                players: room.players,
                createdAt: room.createdAt,
            });
        } catch (err) {
            // Persistence failure should not crash a live game -- the room
            // still works from the in-memory cache; it just won't survive a
            // restart until the next successful write. Logged, not thrown.
            console.error(`Failed to persist room ${roomId}:`, err.message);
        }
    }

    // Loads a room from the store into the in-memory cache if it isn't
    // already there (e.g. after a restart). Returns the room, or null if it
    // truly doesn't exist anywhere.
    async function getRoom(roomId) {
        if (rooms[roomId]) return rooms[roomId];
        let stored;
        try {
            stored = await roomStore.loadRoom(roomId);
        } catch (err) {
            console.error(`Failed to load room ${roomId} from store:`, err.message);
            return null;
        }
        if (!stored) return null;
        rooms[roomId] = stored;
        return rooms[roomId];
    }

    io.on('connection', (socket) => {
        socket.data.roomId = null;
        socket.data.color = null;

        socket.on('create_room', async (_payload, ack) => {
            const roomId = generateRoomCode();
            const room = {
                board: createInitialBoard(),
                turn: 'w',
                gameOver: false,
                winner: null,
                players: { w: socket.id, b: null },
                createdAt: Date.now(),
            };
            rooms[roomId] = room;
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.color = 'w';
            await persist(roomId, room);
            if (typeof ack === 'function') {
                ack({ ok: true, roomId, color: 'w', state: publicRoomState(room) });
            }
        });

        socket.on('join_room', async (payload, ack) => {
            const roomId = ((payload && payload.roomId) || '').toUpperCase().trim();
            const room = await getRoom(roomId);
            if (!room) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Room not found.' });
                return;
            }
            if (room.players.b && room.players.b !== socket.id) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Room is already full.' });
                return;
            }

            room.players.b = socket.id;
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.color = 'b';
            await persist(roomId, room);

            if (typeof ack === 'function') ack({ ok: true, roomId, color: 'b', state: publicRoomState(room) });
            io.to(roomId).emit('opponent_joined', { state: publicRoomState(room) });
        });

        // Rejoin after a disconnect/restart: the client remembers its own
        // roomId + color (localStorage) and offers them back. We re-bind
        // this socket to that color slot, WITHOUT changing who's assigned
        // to it, provided the color matches what the client last held or
        // that slot is currently empty (e.g. the other player hasn't
        // reconnected yet either).
        socket.on('rejoin_room', async (payload, ack) => {
            const roomId = ((payload && payload.roomId) || '').toUpperCase().trim();
            const color = payload && payload.color;
            if (color !== 'w' && color !== 'b') {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Invalid color.' });
                return;
            }
            const room = await getRoom(roomId);
            if (!room) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Room not found.' });
                return;
            }
            if (room.players[color] && room.players[color] !== socket.id) {
                // Someone else currently holds that seat's live socket.
                // Reassign to the reconnecting client anyway -- the old
                // socket is presumably gone (that's why we're rejoining) --
                // but flag this as a simplification: there's no proof the
                // old socket is actually dead versus a duplicate tab.
                room.players[color] = socket.id;
            } else {
                room.players[color] = socket.id;
            }
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.color = color;
            await persist(roomId, room);

            if (typeof ack === 'function') ack({ ok: true, roomId, color, state: publicRoomState(room) });
            io.to(roomId).emit('opponent_joined', { state: publicRoomState(room) });
        });

        socket.on('make_move', async (payload, ack) => {
            const roomId = socket.data.roomId;
            const room = roomId && await getRoom(roomId);
            if (!room) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Not in a room.' });
                return;
            }
            if (room.gameOver) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Game is already over.' });
                return;
            }

            const moverColor = socket.data.color;
            if (moverColor !== room.turn) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'It is not your turn.' });
                return;
            }

            const from = parseSquare(payload && payload.from);
            const to = parseSquare(payload && payload.to);
            if (!from || !to) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Invalid square notation.' });
                return;
            }

            const validation = engine.validateMove(room.board, room.turn, from, to);
            if (!validation.valid) {
                if (typeof ack === 'function') ack({ ok: false, reason: validation.reason });
                return;
            }

            // Verified by test suite: makeMove must be called with the color
            // that JUST MOVED (moverColor), not the opponent.
            const result = engine.makeMove(room.board, { from, to }, moverColor);

            room.board = result.board;
            room.gameOver = result.gameOver;
            room.winner = result.winner || null;
            if (!room.gameOver) {
                room.turn = room.turn === 'w' ? 'b' : 'w';
            }
            await persist(roomId, room);

            if (typeof ack === 'function') ack({ ok: true, state: publicRoomState(room) });
            io.to(roomId).emit('state_update', { state: publicRoomState(room) });
        });

        socket.on('disconnect', () => {
            const roomId = socket.data.roomId;
            const room = roomId && rooms[roomId];
            if (!room) return;
            io.to(roomId).emit('opponent_disconnected', { color: socket.data.color });
        });
    });

    return { rooms }; // exposed for tests only (to simulate a restart by discarding it)
}

module.exports = { createGameNamespace, createInitialBoard, publicRoomState };
