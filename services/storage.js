/**
 * PLAYER PROFILE STORAGE
 *
 * Firestore-backed persistence for the Player Profile System v1.
 * Covers match logs, player profiles, and explicitly time-limited anonymous
 * game telemetry/feedback collections used by the current game contract.
 *
 * Cloud Run note: persistence uses Firestore, not the local filesystem.
 * GOOGLE_CLOUD_PROJECT / GCP_PROJECT may override the configured project.
 */

const { Firestore, FieldValue } = require('@google-cloud/firestore');

const MATCH_LOGS_COLLECTION = 'matchLogs';
const PLAYER_PROFILES_COLLECTION = 'playerProfiles';
const ANONYMOUS_GAMES_COLLECTION = 'anonymousCompletedGames';
const ANONYMOUS_FEEDBACK_COLLECTION = 'anonymousGameFeedback';
const DEFAULT_GCP_PROJECT_ID = 'adept-crossing-106819';

function createPlayerStorage() {
    let db;
     try {
        db = new Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT ||
                       process.env.GCP_PROJECT ||
                       DEFAULT_GCP_PROJECT_ID,
            databaseId: process.env.FIRESTORE_DATABASE || '(default)',
        });
    } catch (err) {
       console.error('⚠️ Failed to initialize Firestore client (storage):', err.message);
        db = null;
    }

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

    async function appendMove(roomId, moveEntry) {
        if (!db) return;
        try {
            await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).update({
                moves: FieldValue.arrayUnion(moveEntry),
            });
        } catch (err) {
            if (err.code === 5) {
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

    async function finalizeMatchLog(roomId, winner) {
        if (!db) return;
        try {
            await db.collection(MATCH_LOGS_COLLECTION).doc(roomId).update({
                completedAt: Date.now(),
                winner,
            });
        } catch (err) {
            console.error(`Error finalizing matchLog ${roomId}:`, err.message);
        }
    }

    async function saveAnonymousFeedback(feedback) {
        if (!db) return;
        try {
            await db.collection(ANONYMOUS_FEEDBACK_COLLECTION).add({
                ...feedback,
                expiresAt: new Date(feedback.submittedAt + 30 * 24 * 60 * 60 * 1000),
            });
        } catch (err) {
            console.error('Error saving anonymous post-game feedback:', err.message);
            throw err;
        }
    }

    async function saveAnonymousCompletedGame(summary) {
        if (!db) return;
        try {
            await db.collection(ANONYMOUS_GAMES_COLLECTION).doc(summary.anonymousMatchId).set({
                ...summary,
                expiresAt: new Date(summary.completedAt + 30 * 24 * 60 * 60 * 1000),
            });
        } catch (err) {
            console.error('Error saving anonymous completed-game telemetry:', err.message);
            throw err;
        }
    }

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

    async function getOrCreatePlayerProfile(playerToken) {
        if (!db) return null;
        try {
            const ref = db.collection(PLAYER_PROFILES_COLLECTION).doc(playerToken);
            const snap = await ref.get();
            if (snap.exists) return snap.data();

            const blank = defaultProfile(playerToken);
            await ref.set(blank);
            return blank;
        } catch (err) {
            console.error(`Error getting/creating profile for token ${playerToken}:`, err.message);
            return null;
        }
    }

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
        createMatchLog,
        appendMove,
        finalizeMatchLog,
        getMatchLog,
        saveAnonymousCompletedGame,
        saveAnonymousFeedback,
        getOrCreatePlayerProfile,
        updatePlayerProfile,
        getPlayerProfile,
    };
}

module.exports = {
    createPlayerStorage,
    MATCH_LOGS_COLLECTION,
    PLAYER_PROFILES_COLLECTION,
    ANONYMOUS_GAMES_COLLECTION,
    ANONYMOUS_FEEDBACK_COLLECTION,
};
