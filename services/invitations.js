const crypto = require('crypto');

function createInvitationService(collection) {
  async function request(did) {
    const ref = collection.doc(`invitation_${did}`);
    const existing = await ref.get();
    if (existing.exists) return existing.data();
    const record = {
      id: crypto.randomBytes(16).toString('hex'),
      did,
      status: 'requested',
      requestedAt: Date.now(),
    };
    await ref.set(record);
    return record;
  }

  async function get(did) {
    const snap = await collection.doc(`invitation_${did}`).get();
    return snap.exists ? snap.data() : null;
  }

  async function decide(did, status, decidedBy) {
    if (!['invited', 'declined'].includes(status)) throw new Error('invalid_invitation_status');
    const ref = collection.doc(`invitation_${did}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('invitation_request_not_found');
    const decision = { status, decidedBy, decidedAt: Date.now() };
    await ref.set(decision, { merge: true });
    return { ...snap.data(), ...decision };
  }

  return { request, get, decide };
}

module.exports = { createInvitationService };
