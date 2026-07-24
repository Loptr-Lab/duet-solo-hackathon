/**
 * VEILED DOMINION: DUET — CORE ENGINE
 * Extracted directly from public/index.html (verified against the live source,
 * not reconstructed). Shared by client (rendering, local/AI play) and server
 * (move validation, async storage, ACPL/stats).
 *
 * SCOPE NOTE: this covers the BASE ruleset only — Radius of Ruin (Veil) and
 * standard piece movement. Fog Mode (elevation/vision/HP combat) is a real,
 * separate, currently-optional system in index.html (FogMode, HP_TABLE,
 * ATTACK_TABLE, computeVisionForColor, etc.) and is NOT extracted here.
 * Fog Mode is mutually exclusive with AI opponent mode in the current game,
 * and introduces genuine hidden information between players — if async/live
 * remote play needs to support Fog Mode, that's a separate follow-up, not
 * covered by this module.
 *
 * KNOWN BUG CARRIED OVER FROM SOURCE (flagging, not silently fixing):
 * The live-play path-clearing check (isPathClear) allows a slider to pass
 * through the mover's OWN Death piece. The AI-simulation path-clearing check
 * (isPathClearOnBoard) does NOT have that exception. This module unifies on
 * the MORE PERMISSIVE (live-play) behavior for both, since that's what
 * players actually experience — but this is a real behavior change for the
 * AI's search versus the current index.html, worth testing before relying on
 * AI move choices matching old behavior exactly.
 */

// ---------------------------------------------------------------------------
// PIECE VALUES — verified from index.html line 1741
// p=pawn, n=knight, b=bishop, r=rook, q=queen, rb=Rebirth, d=Death (0 = not
// counted toward material score; Death cannot be captured at all)
// ---------------------------------------------------------------------------
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, rb: 950, d: 0 };

// ---------------------------------------------------------------------------
// VEIL (Radius of Ruin) SYSTEM — verified from index.html lines 1334-1392
// This is a MOVEMENT RESTRICTION, not hidden information. A veiled piece is
// limited to one square forward, cannot capture, for a fixed number of turns.
// Full board state is visible to both players throughout — no fog involved
// in the base ruleset.
// ---------------------------------------------------------------------------
const VeiledStateSystem = {
    DURATION_TURNS: 2,

    apply(piece) {
        piece.veiled = true;
        piece.veiled_turns = this.DURATION_TURNS;
    },

    // Called after the color that just moved, ticks down veil duration on
    // that color's own pieces.
    tickDown(board, justMovedColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.color === justMovedColor && p.veiled) {
                    p.veiled_turns--;
                    if (p.veiled_turns <= 0) {
                        p.veiled = false;
                        delete p.veiled_turns;
                    }
                }
            }
        }
    },
};

// RadiusOfRuinSystem — verified from index.html lines 1334-1368, WITH ONE
// RULE CHANGE (see below). Applies Veil to the active color's own pieces
// standing adjacent to the ENEMY Rebirth, unless shielded by standing
// adjacent to their own Death piece (Sanctuary).
//
// RULE CHANGE FROM index.html: the original code explicitly EXEMPTS a
// player's own Rebirth from ever being veiled (`|| p.type === 'rb'` skip).
// That exemption is REMOVED here. This is intentional and central to the
// win condition (see checkLossCondition below): Death (King-equivalent) is
// uncapturable and irrelevant to winning by design — this is not a
// checkmate-the-strongest-piece game. The daughter (Rebirth/Queen) losing
// control — becoming veiled, unprotected, next to the enemy Rebirth — is
// what ends the game. Removing her exemption from Veil is what makes that
// possible; without this change she could never be veiled at all.
const RadiusOfRuinSystem = {
    resolve(board, activeColor) {
        const enemyColor = activeColor === 'w' ? 'b' : 'w';
        let myDeath = null;
        let enemyRebirth = null;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p) continue;
                if (p.color === activeColor && p.type === 'd') myDeath = { r, c };
                if (p.color === enemyColor && p.type === 'rb') enemyRebirth = { r, c };
            }
        }

        if (!enemyRebirth) return;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p || p.color !== activeColor) continue;

                const inRuin = this._within1(r, c, enemyRebirth) && !(r === enemyRebirth.r && c === enemyRebirth.c);
                const inSanctuary = myDeath ? this._within1(r, c, myDeath) : false;

                if (inRuin && !inSanctuary) {
                    VeiledStateSystem.apply(p);
                }
            }
        }
    },
    _within1(r, c, anchor) {
        return Math.abs(c - anchor.c) <= 1 && Math.abs(r - anchor.r) <= 1;
    },
};

// ---------------------------------------------------------------------------
// WIN / LOSS CONDITION — new. Death is uncapturable by design (verified —
// every branch of isValidMove refuses a Death target) and is NOT the win
// condition; he's the King in name only, structurally irrelevant to victory.
// The game is won or lost on the Rebirth (the daughter/Queen) LOSING CONTROL
// — becoming veiled, unprotected, adjacent to the enemy Rebirth. Because
// RadiusOfRuinSystem refreshes Veil duration continuously while conditions
// hold (it does not count down to a fixed expiry while she's still exposed),
// the loss is triggered the instant she becomes veiled — there is no grace
// period to survive once she's caught unprotected. If a countdown/escape-
// window version is wanted instead, Veil's refresh-on-reapply behavior needs
// to change too (e.g. don't reset veiled_turns if already veiled) — flagging
// this rather than silently choosing it.
// ---------------------------------------------------------------------------
function checkLossCondition(board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'rb' && p.veiled) {
                return { gameOver: true, loser: p.color, winner: p.color === 'w' ? 'b' : 'w', reason: 'rebirth_lost_control' };
            }
        }
    }
    return { gameOver: false, loser: null, winner: null, reason: null };
}

// ---------------------------------------------------------------------------
// MOVE VALIDATION — verified from index.html lines 1394-1452 (live) and
// 1768-1802 (simulation copy). Unified here on the live-play path-clearing
// behavior (see KNOWN BUG note above).
// ---------------------------------------------------------------------------
function isPathClear(board, from, to) {
    let dr = Math.sign(to.r - from.r);
    let dc = Math.sign(to.c - from.c);
    let r = from.r + dr;
    let c = from.c + dc;
    const moverColor = board[from.r][from.c].color;

    while (r !== to.r || c !== to.c) {
        const occupant = board[r][c];
        if (occupant) {
            // Own Death piece does not block the path (matches live-play
            // behavior in index.html's isPathClear).
            if (!(occupant.type === 'd' && occupant.color === moverColor)) {
                return false;
            }
        }
        r += dr;
        c += dc;
    }
    return true;
}

function isValidMove(board, piece, from, to) {
    let dr = to.r - from.r;
    let dc = to.c - from.c;
    let adr = Math.abs(dr);
    let adc = Math.abs(dc);
    let target = board[to.r][to.c];

    if (target && target.color === piece.color && target.type !== 'd') return false;
    if (target && target.type === 'd') return false; // Death is never capturable

    const type = piece.type;

    if (type === 'p') {
        let dir = piece.color === 'w' ? -1 : 1;
        let startRow = piece.color === 'w' ? 6 : 1;
        if (dc === 0 && dr === dir && !target) return true;
        if (dc === 0 && dr === 2 * dir && from.r === startRow && !target && !board[from.r + dir][from.c]) return true;
        if (adc === 1 && dr === dir && target) return true;
        return false;
    }
    if (type === 'n') return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
    if (type === 'b') {
        if (adr !== adc || adr === 0) return false;
        return isPathClear(board, from, to);
    }
    if (type === 'r') {
        if (dr !== 0 && dc !== 0) return false;
        return isPathClear(board, from, to);
    }
    if (type === 'q' || type === 'rb') {
        if (dr === 0 || dc === 0 || adr === adc) return isPathClear(board, from, to);
        return false;
    }
    if (type === 'k' || type === 'd') return adr <= 1 && adc <= 1;
    return false;
}

// Validates a move against full game rules, including veil restriction and
// the "Death cannot be captured" rule. Mirrors onValidateIntent from
// index.html lines 1260-1286.
function validateMove(board, turn, from, to) {
    const piece = board[from.r][from.c];
    if (!piece) return { valid: false, reason: 'No piece at source square.' };
    if (piece.color !== turn) return { valid: false, reason: `It is not ${piece.color === 'w' ? 'White' : 'Black'}'s turn.` };

    if (piece.veiled) {
        if (to.c !== from.c) return { valid: false, reason: 'Veiled pieces may only move 1 square forward.' };
        const wantRow = piece.color === 'w' ? from.r - 1 : from.r + 1;
        if (to.r !== wantRow) return { valid: false, reason: 'Veiled pieces may only move 1 square forward.' };
        if (board[to.r][to.c]) return { valid: false, reason: 'Veiled pieces cannot capture.' };
    } else if (!isValidMove(board, piece, from, to)) {
        return { valid: false, reason: 'Invalid move for this piece.' };
    }

    const target = board[to.r][to.c];
    if (target && target.type === 'd') return { valid: false, reason: 'Death cannot be captured.' };

    return { valid: true, from, to, piece, target };
}

// Full legal-move generator for a color — verified from index.html lines
// 1804-1832, used by both the AI search and (here) server-side anti-cheat.
function generateLegalMoves(board, color) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || piece.color !== color) continue;
            const from = { r, c };
            for (let tr = 0; tr < 8; tr++) {
                for (let tc = 0; tc < 8; tc++) {
                    if (tr === r && tc === c) continue;
                    const to = { r: tr, c: tc };
                    const target = board[tr][tc];
                    if (target && target.type === 'd') continue;

                    if (piece.veiled) {
                        if (tc !== c) continue;
                        const wantRow = piece.color === 'w' ? r - 1 : r + 1;
                        if (tr !== wantRow) continue;
                        if (target) continue;
                    } else if (!isValidMove(board, piece, from, to)) {
                        continue;
                    }
                    moves.push({ from, to });
                }
            }
        }
    }
    return moves;
}

function cloneBoard(board) {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function countPieces(board, color, type) {
    let n = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === color && p.type === type) n++;
        }
    }
    return n;
}

// ---------------------------------------------------------------------------
// PROMOTION — new tiered rule, replacing index.html's unconditional
// pawn->Rebirth promotion. Order of decision:
//   1. No Rebirth of this color yet -> promote to Rebirth (the birth event).
//      Capped at one: the board can't hold multiple power pieces, and
//      narratively there is only one daughter.
//   2. Rebirth already exists, fewer than 2 Knights on board -> promote to
//      Knight (refilling a lost piece back up to the starting complement,
//      not adding beyond it).
//   3. Rebirth exists, 2 Knights already present, fewer than 2 Bishops ->
//      promote to Bishop (same refill logic).
//   4. Rebirth exists, 2 Knights AND 2 Bishops already present -> NO
//      promotion. The pawn stays a pawn on the back rank. This is not a
//      dead end — it's a deliberate "board is overloaded" state, treated
//      as a signal that this player's Rebirth is primed for something
//      further. What that readiness state actually unlocks/triggers is
//      NOT yet defined — isReadyToAdvance() below just detects and
//      exposes the condition so it can be wired to a real mechanic
//      (narrative flag, stats signal, 4-player-mode tie-in, etc.) once
//      that's decided.
// ---------------------------------------------------------------------------
function getPromotionType(board, color) {
    if (countPieces(board, color, 'rb') === 0) return 'rb';
    if (countPieces(board, color, 'n') < 2) return 'n';
    if (countPieces(board, color, 'b') < 2) return 'b';
    return null; // board overloaded — no promotion available
}

// True when this color has already hit the full stop condition: Rebirth
// exists and both minor-piece slots (2 Knights, 2 Bishops) are full, so any
// further promotion is blocked. Exposed for callers (stats/PIXIE/4-player
// transition logic) to react to — not wired to anything yet.
function isReadyToAdvance(board, color) {
    return (
        countPieces(board, color, 'rb') > 0 &&
        countPieces(board, color, 'n') >= 2 &&
        countPieces(board, color, 'b') >= 2
    );
}

// Applies a move to a board and returns a new board (does not mutate input).
// Promotion logic replaces index.html's unconditional pawn->Rebirth (see
// getPromotionType above) — a pawn reaching the back rank when promotion is
// blocked simply remains a pawn there.
function applyMove(board, move) {
    const b = cloneBoard(board);
    const { from, to } = move;
    const piece = b[from.r][from.c];
    b[to.r][to.c] = piece;
    b[from.r][from.c] = null;
    if (piece.type === 'p' && (to.r === 0 || to.r === 7)) {
        const promotion = getPromotionType(b, piece.color);
        if (promotion) {
            piece.type = promotion;
        }
        // else: promotion blocked, pawn remains a pawn — see isReadyToAdvance
    }
    return b;
}

// Resolves Radius of Ruin + Veil tick-down after a move, for the color that
// just moved. Verified from index.html lines 1844-1888 (resolveSystemsOnBoard),
// with the win/loss check now folded in (see checkLossCondition above).
function resolveSystems(board, activeColor) {
    RadiusOfRuinSystem.resolve(board, activeColor);
    VeiledStateSystem.tickDown(board, activeColor);
    return board;
}

// Convenience: apply a move, resolve systems, and check for the win/loss
// condition, all in one step. This is the function servers/clients should
// actually call after a validated move — matches makeSimMove from
// index.html line 1890, extended with the loss check so it's never
// forgotten by a caller.
function makeMove(board, move, activeColor) {
    const applied = applyMove(board, move);
    const resolved = resolveSystems(applied, activeColor);
    const result = checkLossCondition(resolved);
    return { board: resolved, ...result };
}

// ---------------------------------------------------------------------------
// EVALUATION — verified from index.html lines 1895-1924 (evaluateBoard).
// Used by the existing AI opponent's minimax search AND, going forward, by
// server-side ACPL/stats computation. This is NOT a new evaluator — it's the
// same one already scoring AI moves, reused as the stats source of truth.
// ---------------------------------------------------------------------------
function evaluateBoard(board, forColor) {
    let score = 0;
    let myDeath = null;
    let myRebirth = null;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const sign = p.color === forColor ? 1 : -1;
            const value = PIECE_VALUES[p.type] || 0;
            score += sign * value;

            if (p.veiled) score += sign * -40;

            const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
            score += sign * (7 - centerDist) * 1.5;

            if (p.type === 'd' && p.color === forColor) myDeath = { r, c };
            if (p.type === 'rb' && p.color === forColor) myRebirth = { r, c };
        }
    }

    if (myRebirth && myDeath) {
        const dist = Math.max(Math.abs(myRebirth.r - myDeath.r), Math.abs(myRebirth.c - myDeath.c));
        score += Math.max(0, 5 - dist) * 6;
    }

    return score;
}

// ---------------------------------------------------------------------------
// SEVERITY TIERS FOR STATS/PIXIE — new (not in index.html), but named per
// the agreed mercy-first framing rather than deficit language (no
// "blunder"/"mistake"/"inaccuracy"). Thresholds are a starting point in the
// same score units evaluateBoard already produces (a pawn = 100) — tune
// against real game data once you have some.
// ---------------------------------------------------------------------------
function getSeverityTier(evalBefore, evalAfter, moverColor) {
    // Both evals should be computed from the SAME forColor perspective so the
    // diff is meaningful; this function assumes evalBefore/evalAfter were
    // both computed with forColor = moverColor.
    const diff = evalBefore - evalAfter; // positive = position got worse for the mover
    if (diff <= 15) return 'BEST';        // effectively the strongest option, or noise-level
    if (diff <= 50) return 'SOLID';       // minor drift, not worth surfacing by default
    if (diff <= 150) return 'OPPORTUNITY'; // worth a second look
    return 'PIVOTAL';                      // one of the moments that mattered most in the game
}


module.exports = {
    PIECE_VALUES,
    VeiledStateSystem,
    RadiusOfRuinSystem,
    checkLossCondition,
    isValidMove,
    validateMove,
    generateLegalMoves,
    getPromotionType,
    isReadyToAdvance,
    applyMove,
    resolveSystems,
    makeMove,
    evaluateBoard,
    getSeverityTier,
};
