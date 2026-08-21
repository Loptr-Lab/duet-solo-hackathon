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
 *
 * Reconnection is gated by a per-seat token (see `tokens` on the room and
 * `generateToken()` below) generated on create/join and required on
 * rejoin_room, so a room code alone is no longer enough to take over a
 * player's seat.
 *
 * Issue 1 — Player Profile System v1:
 * Move telemetry is logged to Firestore matchLogs/{roomId} on every confirmed
 * make_move. playerStorage is passed in from server.js alongside roomStore,
 * using the same dependency-injection pattern. All logging is fire-and-forget
 * (not awaited where it would delay the ack/emit to players) and never throws
 * into the game flow — a logging failure must never affect a live match.
 */

const crypto = require('crypto');
const engine = require('./veiled-chess-core-server.js');
const { postMatchResult } = require('./atprotoPoster.js');

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode() {
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
}

function generateToken() {
    return crypto.randomBytes(16).toString('hex');
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

/**
 * Detects which opponent squares became newly veiled after a move.
 * Returns true if any opponent piece transitioned from unveiled to veiled.
 *
 * @param {Array} boardBefore  board snapshot before engine.makeMove
 * @param {Array} boardAfter   board returned by engine.makeMove
 * @param {string} moverColor  the color that just moved ('w' or 'b')
 */
function didVeilOpponent(boardBefore, boardAfter, moverColor) {
    const opponentColor = moverColor === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const before = boardBefore[r][c];
            const after = boardAfter[r][c];
            if (
                before && before.color === opponentColor && !before.veiled &&
                after && after.color === opponentColor && after.veiled
            ) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Deep-clones a board so the before-snapshot is not mutated by engine.makeMove.
 */
function cloneBoard(board) {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

// `rooms` is created fresh each call -- this is the "server restarted" seam
// for testing: calling createGameNamespace again with a NEW empty rooms
// cache but the SAME underlying roomStore simulates a real restart, since
// nothing survives in memory except what's reloaded from the store.
function createGameNamespace(io, roomStore, playerStorage) {
    const rooms = {};

    async function persist(roomId, room) {
        try {
            await roomStore.saveRoom(roomId, {
                board: room.board,
                turn: room.turn,
                gameOver: room.gameOver,
                winner: room.winner,
                players: room.players,
                tokens: room.tokens,
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
            const token = generateToken();
            const room = {
                board: createInitialBoard(),
                turn: 'w',
                gameOver: false,
                winner: null,
                players: { w: socket.id, b: null },
                tokens: { w: token, b: null },
                createdAt: Date.now(),
                moveCount: 0,
                lastMoveAt: Date.now(),
            };
            rooms[roomId] = room;
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.color = 'w';
            await persist(roomId, room);
            if (typeof ack === 'function') {
                ack({ ok: true, roomId, color: 'w', reconnectToken: token, state: publicRoomState(room) });
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

            const token = generateToken();
            room.players.b = socket.id;
            room.tokens = room.tokens || {};
            room.tokens.b = token;
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.color = 'b';
            await persist(roomId, room);

            if (typeof ack === 'function') ack({ ok: true, roomId, color: 'b', reconnectToken: token, state: publicRoomState(room) });
            io.to(roomId).emit('opponent_joined', { state: publicRoomState(room) });
        });

        // Rejoin after a disconnect/restart: the client remembers its own
        // roomId, color, AND reconnectToken (localStorage). The token --
        // not the roomId/color alone -- is what proves this client actually
        // owns that seat, since a room code is only 5 characters and would
        // otherwise let anyone claim either seat mid-game.
        socket.on('rejoin_room', async (payload, ack) => {
            const roomId = ((payload && payload.roomId) || '').toUpperCase().trim();
            const color = payload && payload.color;
            const reconnectToken = payload && payload.reconnectToken;

            if (color !== 'w' && color !== 'b') {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Invalid color.' });
                return;
            }
            const room = await getRoom(roomId);
            if (!room) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Room not found.' });
                return;
            }

            const expectedToken = room.tokens && room.tokens[color];
            if (!expectedToken || expectedToken !== reconnectToken) {
                if (typeof ack === 'function') ack({ ok: false, reason: 'Invalid or missing reconnect token.' });
                return;
            }

            room.players[color] = socket.id;
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

            // --- Issue 1: capture pre-move state for telemetry ---
            const boardBefore = cloneBoard(room.board);
            const pieceBeforeMove = boardBefore[from.r][from.c];
            const capturedPiece = boardBefore[to.r][to.c];
            const evalBefore = engine.evaluateBoard(boardBefore, moverColor);
            const moveTimestamp = Date.now();
            const timeSinceLastMove = moveTimestamp - (room.lastMoveAt || moveTimestamp);
            const isFirstMove = room.moveCount === 0;
            // -----------------------------------------------------

            // Verified by test suite: makeMove must be called with the color
            // that JUST MOVED (moverColor), not the opponent.
            const result = engine.makeMove(room.board, { from, to }, moverColor);

            // --- Issue 1: capture post-move state for telemetry ---
            const evalAfter = engine.evaluateBoard(result.board, moverColor);
            const movedPieceAfter = result.board[to.r][to.c];
            const veiledSelf = !!(movedPieceAfter && movedPieceAfter.veiled);
            const veiledOpponent = didVeilOpponent(boardBefore, result.board, moverColor);
            const sacrifice = !capturedPiece && veiledSelf;
            const promotedTo = (
                pieceBeforeMove.type === 'p' &&
                movedPieceAfter &&
                movedPieceAfter.type !== 'p'
            ) ? movedPieceAfter.type : null;
            // -----------------------------------------------------

            room.board = result.board;
            room.gameOver = result.gameOver;
            room.winner = result.winner || null;
            room.moveCount = (room.moveCount || 0) + 1;
            room.lastMoveAt = moveTimestamp;
            if (!room.gameOver) {
                room.turn = room.turn === 'w' ? 'b' : 'w';
            }
            await persist(roomId, room);

            if (typeof ack === 'function') ack({ ok: true, state: publicRoomState(room) });
            io.to(roomId).emit('state_update', { state: publicRoomState(room) });

            // --- Issue 1: fire-and-forget match log writes ---
            // Never awaited — logging must never delay the ack/emit above.
            // Never throws into game flow — a Firestore failure here is logged
            // and swallowed, not surfaced to the player.
            if (playerStorage) {
                const moveEntry = {
                    moveNum: room.moveCount,
                    color: moverColor,
                    from: payload.from,
                    to: payload.to,
                    piece: pieceBeforeMove.type,
                    capturedPiece: capturedPiece ? capturedPiece.type : null,
                    evalBefore,
                    evalAfter,
                    severity: engine.getSeverityTier(evalBefore, evalAfter, moverColor),
                    veiled: veiledSelf,
                    veiledOpponent,
                    sacrifice,
                    inversionClause: null,
                    promotedTo,
                    timeMs: timeSinceLastMove,
                    timestamp: moveTimestamp,
                };

                if (isFirstMove) {
                    // Both tokens are set by the time the first move is made:
                    // white token is set at create_room, black at join_room.
                    playerStorage.createMatchLog(roomId, room.tokens).catch((err) => {
                        console.error(`[telemetry] createMatchLog failed for ${roomId}:`, err.message);
                    });
                }

                playerStorage.appendMove(roomId, moveEntry).catch((err) => {
                    console.error(`[telemetry] appendMove failed for ${roomId} move ${room.moveCount}:`, err.message);
                });

                if (room.gameOver && room.winner) {
                    playerStorage.finalizeMatchLog(roomId, room.winner).catch((err) => {
                        console.error(`[telemetry] finalizeMatchLog failed for ${roomId}:`, err.message);
                    });
                }
            }
            // -------------------------------------------------

            // AT Proto event posting — additive only, fire-and-forget. This is
            // the one place a real (server-authoritative) remote match's
            // gameOver flips from false to true, so it's the correct trigger
            // for "post a real match result." Not awaited: a slow or failed
            // post to Bluesky must never delay or affect the ack/emit above,
            // which have already gone out to the players by this point.
            if (room.gameOver && room.winner) {
                postMatchResult({ winner: room.winner });
            }
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
