/**
 * ROOM PERSISTENCE LAYER
 *
 * Wraps Firestore behind a tiny interface (save/load/delete) so the rest of
 * server.js doesn't need to know about Firestore directly, and so this can
 * be swapped for a fake implementation in tests (see roomStore.test.js).
 */

const { Firestore } = require('@google-cloud/firestore');

const COLLECTION = 'veiled_dominion_rooms';

function createFirestoreRoomStore() {
    let db;
    try {
        db = new Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'adept-crossing-106819',
        });
    } catch (err) {
        console.error('⚠️ Failed to initialize Firestore client:', err.message);
        db = null;
    }

    return {
        async saveRoom(roomId, roomData) {
            if (!db) return;
            try {
                await db.collection(COLLECTION).doc(roomId).set({
                    ...roomData,
                    updatedAt: Date.now(),
                });
            } catch (err) {
                console.error(`Error saving room ${roomId}:`, err.message);
            }
        },

        async loadRoom(roomId) {
            if (!db) return null;
            try {
                const snap = await db.collection(COLLECTION).doc(roomId).get();
                if (!snap.exists) return null;
                return snap.data();
            } catch (err) {
                console.error(`Error loading room ${roomId}:`, err.message);
                return null;
            }
        },

        async deleteRoom(roomId) {
            if (!db) return;
            try {
                await db.collection(COLLECTION).doc(roomId).delete();
            } catch (err) {
                console.error(`Error deleting room ${roomId}:`, err.message);
            }
        },

        async verifyAccess() {
            if (!db) {
                console.error('Firestore client unavailable during verifyAccess check.');
                return false;
            }
            try {
                const ref = db.collection('_healthcheck').doc('ping');
                await ref.set({ timestamp: Date.now() }, { merge: true });
                console.log('Firestore read/write permissions verified.');
                return true;
            } catch (err) {
                console.error('Firestore permission check failed:', err.message);
                if (err.code === 7 || /PERMISSION_DENIED/.test(err.message || '')) {
                    console.error('Check that the Cloud Run service account has roles/datastore.user on adept-crossing-106819.');
                }
                return false;
            }
        },
    };
}

module.exports = { createFirestoreRoomStore, COLLECTION };
