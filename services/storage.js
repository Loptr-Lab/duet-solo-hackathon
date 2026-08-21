/**
 * PLAYER PROFILE STORAGE
 *
 * Firestore-backed persistence for the Player Profile System v1.
 * Covers two collections:
 *
 *   matchLogs/{roomId}      — append-only per-move telemetry, written during
 *                             live play by gameNamespace.js (Issue 1)
 *
 *   playerProfiles/{token}  — aggregated post-game stats, deck selection, and
 *                             archetype tags, written by the post-game
 *                             aggregator (Issue 2) and deck persistence
 *                             handler (Issue 3)
 *
 * Follows the same pattern as roomStore.js: Firestore is wrapped behind a
 * narrow interface so callers don't touch the DB client directly, and so
 * tests can swap in a fake with the same shape.
 *
 * Phase 1 identity key: reconnect token (playerToken) — a 32-char hex string
 * generated in gameNamespace.js. The `did` field on every profile document is
 * initialized to null and populated by the Phase 2 OAuth/PKCE write-back.
 *
 * Cloud Run note: this module uses Firestore, NOT the local filesystem.
 * services/storage.js previously used fs.writeFileSync to a local data/
 * directory — that approach does not survive Cloud Run deployments (ephemeral
 * filesystem). All persistence here goes through Firestore project
 * adept-crossing-106819, the same project used by roomStore.js.
 */

const { Firestore } = require('@google-cloud/firestore');

const MATCH_LOGS_COLLECTION = 'matchLogs';
const PLAYER_PROFILES_COLLECTION = 'playerProfiles';

function createPlayerStorage() {
    let db;
    try {
        db = new Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT ||
                       process.env.GCP_PROJECT ||
                       'adept-crossing-106819',
        });
    } catch (err) {
        console.error('⚠️ Failed to initialize Firestore client (storage):', err.message);
        db = null;
    }

    // -----------------------------------------------------------------------
    // MATCH LOGS
    // -----------------------------------------------------------------------

    /**
     * Creates the matchLog document for a new remote match.
     * Called once at the start of a match (first confirmed make_move).
     *
     * @param {string} roomId
     * @param {{ w: string, b: string }} playerTokens  reconnect tokens
     */
    async function createMatchLog(roomId, playerTokens) {
        if (!db) return;
        try {
            await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).set({
                roomId,
                playerTokens,
                playerDIDs: { w: null, b: null },
                startedAt: Date.now(),
                completedAt: null,
                winner: null,
                moves: [],
            });
        } catch (err) {
            console.error(`Error creating matchLog for room ${roomId}:`, err.message);
        }
    }

    /**
     * Appends a single MoveEntry to the match log.
     * Uses Firestore FieldValue.arrayUnion so concurrent writes don't
     * overwrite each other (moves are ordered by moveNum, not arrival time).
     *
     * MoveEntry shape (all fields required):
     * {
     *   moveNum, color, from, to, piece, capturedPiece,
     *   evalBefore, evalAfter, severity,
     *   veiled, veiledOpponent, sacrifice,
     *   inversionClause, promotedTo,
     *   timeMs, timestamp
     * }
     *
     * @param {string} roomId
     * @param {object} moveEntry
     */
    async function appendMove(roomId, moveEntry) {
        if (!db) return;
        try {
            await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).update({
                moves: Firestore.FieldValue.arrayUnion(moveEntry),
            });
        } catch (err) {
            // If the document doesn't exist yet (race on first move), create it
            // with this move already in the array.
            if (err.code === 5) { // NOT_FOUND
                console.warn(`matchLog ${roomId} not found on appendMove — creating.`);
                try {
                    await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).set({
                        roomId,
                        playerTokens: { w: null, b: null },
                        playerDIDs: { w: null, b: null },
                        startedAt: moveEntry.timestamp,
                        completedAt: null,
                        winner: null,
                        moves: [moveEntry],
                    });
                } catch (innerErr) {
                    console.error(`Error creating matchLog on fallback for ${roomId}:`, innerErr.message);
                }
            } else {
                console.error(`Error appending move to matchLog ${roomId}:`, err.message);
            }
        }
    }

    /**
     * Marks a match log as complete. Called when gameOver flips true.
     *
     * @param {string} roomId
     * @param {'w'|'b'} winner
     */
    async function finalizeMatchLog(roomId, winner) {
        if (!db) return;
        try {
            await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).update({
                completedAt: Date.now(),
                winner,
            });
        } catch (err) {
            console.error(`Error finalizing matchLog for room ${roomId}:`, err.message);
        }
    }

    /**
     * Reads a completed match log. Used by the post-game aggregator (Issue 2).
     *
     * @param {string} roomId
     * @returns {object|null}
     */
    async function getMatchLog(roomId) {
        if (!db) return null;
        try {
            const snap = await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).get();
            if (!snap.exists) return null;
            return snap.data();
        } catch (err) {
            console.error(`Error reading matchLog for room ${roomId}:`, err.message);
            return null;
        }
    }

    // -----------------------------------------------------------------------
    // PLAYER PROFILES
    // -----------------------------------------------------------------------

    /**
     * Returns an existing player profile, or creates and returns a blank one.
     * Called by the post-game aggregator before writing stats.
     *
     * @param {string} playerToken  reconnect token (Phase 1 identity key)
     * @returns {object}
     */
    async function getOrCreatePlayerProfile(playerToken) {
        if (!db) return null;
        try {
            const ref = db.collection(PLAYER_PROFILES_COLLECTION).doc(playerToken);
            const snap = await ref.get();
            if (snap.exists) return snap.data();

            // Warn on unexpected collision (negligible probability but worth logging)
            const blank = defaultProfile(playerToken);
            await ref.set(blank);
            return blank;
        } catch (err) {
            console.error(`Error getting/creating profile for token ${playerToken}:`, err.message);
            return null;
        }
    }

    /**
     * Merges updated fields into an existing player profile.
     * Used by the post-game aggregator (Issue 2) and deck persistence (Issue 3).
     *
     * @param {string} playerToken
     * @param {object} updates     partial profile fields to merge
     */
    async function updatePlayerProfile(playerToken, updates) {
        if (!db) return;
        try {
            await db.collection(PLAYER_PROFILES_COLLECTION).doc(playerToken).set(
                { ...updates, updatedAt: Date.now() },
                { merge: true }
            );
        } catch (err) {
            console.error(`Error updating profile for token ${playerToken}:`, err.message);
        }
    }

    /**
     * Reads a player profile directly. Used by matchmaking (Issue 3).
     *
     * @param {string} playerToken
     * @returns {object|null}
     */
    async function getPlayerProfile(playerToken) {
        if (!db) return null;
        try {
            const snap = await db.collection(PLAYER_PROFILES_COLLECTION).doc(playerToken).get();
            if (!snap.exists) return null;
            return snap.data();
        } catch (err) {
            console.error(`Error reading profile for token ${playerToken}:`, err.message);
            return null;
        }
    }

    // -----------------------------------------------------------------------
    // HELPERS
    // -----------------------------------------------------------------------

    /**
     * Returns a blank player profile document.
     * All trait fields are null — normalization formulas are defined in
     * Issue 4 (Trait System RFC) and must not be written before that merges.
     *
     * @param {string} playerToken
     * @returns {object}
     */
    function defaultProfile(playerToken) {
        return {
            playerToken,
            did: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            stats: {
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                acpl: 0,
                veilRate: 0,
                opponentVeilRate: 0,
                sacrificeRate: 0,
                comebackWins: 0,
                rebirthAdvances: 0,
                rebirthReady: false,
                inversionClause: { total: 0, blind: 0, seal: 0 },
            },
            traits: {
                // Reserved — written as null until Issue 4 (Trait RFC) merges.
                // Do not write non-null values here before that.
                riskOrientation: null,
                veilIntimacy: null,
                deliberation: null,
                resilience: null,
            },
            deck: {
                primarySuit: null,
                cards: [],
                savedAt: null,
            },
            archetype: null,
            researchConsent: false,
        };
    }

    return {
        // Match logs
        createMatchLog,
        appendMove,
        finalizeMatchLog,
        getMatchLog,
        // Player profiles
        getOrCreatePlayerProfile,
        updatePlayerProfile,
        getPlayerProfile,
    };
}

module.exports = { createPlayerStorage };
