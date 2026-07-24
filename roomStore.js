/**
 * ROOM PERSISTENCE LAYER
 *
 * Wraps Firestore behind a tiny interface (save/load/delete) so the rest of
 * server.js doesn't need to know about Firestore directly, and so this can
 * be swapped for a fake implementation in tests (see roomStore.test.js).
 *
 * Uses Application Default Credentials -- no explicit project ID or key
 * file. On Cloud Run this resolves automatically from the attached service
 * account, matching the existing GCP-native setup for this project. Locally
 * (e.g. testing on a laptop), this requires `gcloud auth application-default
 * login` or a GOOGLE_APPLICATION_CREDENTIALS env var pointing at a service
 * account key -- flagging this now since it's the one part of this file
 * that cannot be verified without a real GCP project to connect to.
 */

const { Firestore } = require('@google-cloud/firestore');

const COLLECTION = 'veiled_dominion_rooms';

function createFirestoreRoomStore() {
    const db = new Firestore();

    return {
        async saveRoom(roomId, roomData) {
            await db.collection(COLLECTION).doc(roomId).set({
                ...roomData,
                updatedAt: Date.now(),
            });
        },

        async loadRoom(roomId) {
            const snap = await db.collection(COLLECTION).doc(roomId).get();
            if (!snap.exists) return null;
            return snap.data();
        },

        async deleteRoom(roomId) {
            await db.collection(COLLECTION).doc(roomId).delete();
        },
    };
}

module.exports = { createFirestoreRoomStore, COLLECTION };
