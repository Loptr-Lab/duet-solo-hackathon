const crypto = require('node:crypto');
const owner = require('../config/weaver-owner.json');
const ACCEPTANCE_NOTICE = 'Acceptance opens discussion of Weaver, differing interpretations, contributions and possible rights or obligations. It does not itself confirm disputed history, establish a relationship, transfer rights, waive rights, authorize publication or accept separate collaboration terms.';
function fail(code, status = 403) { const e = new Error(code); e.statusCode = status; throw e; }
function invitationDigest(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function validate(inv, did, version, ownerDid = owner.did) {
  if (!inv) fail('invitation_not_found', 404);
  if (inv.did !== did) fail('invitation_account_mismatch');
  if (inv.status !== 'invited') fail('issued_invitation_required');
  if (typeof inv.id !== 'string' || !inv.id || typeof inv.version !== 'string' || !inv.version || typeof inv.text !== 'string' || !inv.text.trim()) fail('invitation_review_pending', 409);
  if (version !== undefined && inv.version !== version) fail('invitation_version_changed', 409);
  if (inv.approval?.status !== 'approved' || inv.approval.by !== ownerDid || inv.approval.version !== inv.version || inv.approval.invitationDigest !== invitationDigest(inv.text)) fail('invitation_approval_pending', 409);
  const v = inv.verification;
  if (v?.status === 'mismatch') fail('confirmed_identity_mismatch');
  if (v?.status !== 'confirmed' || v.subjectDid !== did || v.reviewedBy !== ownerDid || !Number.isFinite(v.reviewedAt) || !Array.isArray(v.evidenceRefs) || !v.evidenceRefs.length || v.evidenceRefs.length > 20 || !v.evidenceRefs.every(x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(x))) fail('named_person_verification_pending', 409);
}
function acceptanceId(inv, did) { return crypto.createHash('sha256').update(JSON.stringify([inv.id, inv.version, did])).digest('hex'); }
function receipt(record) { return { invitationId: record.invitationId, version: record.version, acceptedAt: record.acceptedAt, recipientDid: record.recipientDid, noticeVersion: record.noticeVersion, invitationDigest: record.invitationDigest, status: 'accepted_to_discuss' }; }
function createWeaverAcceptance({ db, now = Date.now, ownerDid = owner.did }) {
  const invitations = db.collection('duet_auth');
  const acceptances = db.collection('weaver_acceptances');
  const invRef = did => invitations.doc(`invitation_${did}`);
  async function savedReceipt(did, invitationId, version) {
    if (typeof invitationId !== 'string' || !invitationId || invitationId.length > 500 || typeof version !== 'string' || !version || version.length > 500) fail('invalid_receipt_reference', 400);
    // The authenticated DID is always part of the key; callers cannot select another recipient.
    const saved = await acceptances.doc(acceptanceId({ id: invitationId, version }, did)).get();
    if (!saved.exists) fail('receipt_not_found', 404);
    const record = saved.data();
    if (record.recipientDid !== did || record.invitationId !== invitationId || record.version !== version) fail('receipt_not_found', 404);
    return receipt(record);
  }
  async function review(did) {
    const snap = await invRef(did).get(); const inv = snap.exists ? snap.data() : null;
    validate(inv, did, undefined, ownerDid);
    const saved = await acceptances.doc(acceptanceId(inv, did)).get();
    if (saved.exists && saved.data().invitationDigest !== invitationDigest(inv.text)) fail('invitation_version_changed', 409);
    return { invitationId: inv.id, version: inv.version, invitationDigest: invitationDigest(inv.text), text: inv.text, notice: ACCEPTANCE_NOTICE, noticeVersion: 'discuss-v1', verification: 'confirmed_for_this_invitation', receipt: saved.exists ? receipt(saved.data()) : null };
  }
  async function accept(did, body) {
    if (body?.action !== 'accept_to_discuss' || body.noticeVersion !== 'discuss-v1') fail('explicit_acceptance_required', 400);
    return db.runTransaction(async tx => {
      const snap = await tx.get(invRef(did)); const inv = snap.exists ? snap.data() : null;
      validate(inv, did, body.version, ownerDid);
      if (typeof body.version !== 'string' || inv.id !== body.invitationId || body.invitationDigest !== invitationDigest(inv.text)) fail('invitation_version_changed', 409);
      const ref = acceptances.doc(acceptanceId(inv, did)); const previous = await tx.get(ref);
      if (previous.exists) {
        if (previous.data().invitationDigest !== invitationDigest(inv.text)) fail('invitation_version_changed', 409);
        return receipt(previous.data());
      }
      const record = { recipientDid: did, invitationId: inv.id, version: inv.version, acceptedAt: now(), invitationDigest: invitationDigest(inv.text), noticeVersion: 'discuss-v1', verificationEvidenceRefs: [...inv.verification.evidenceRefs] };
      tx.create(ref, record);
      return receipt(record);
    });
  }
  async function ownerStatus(actor, recipientDid) {
    if (actor !== ownerDid) fail('owner_access_forbidden');
    if (!/^did:(plc|web):[a-zA-Z0-9._:%-]+$/.test(recipientDid || '')) fail('invalid_recipient', 400);
    const s = await invRef(recipientDid).get(); const inv = s.exists ? s.data() : null;
    if (!inv) fail('invitation_not_found', 404);
    const saved = inv.version ? await acceptances.doc(acceptanceId(inv, recipientDid)).get() : null;
    return { invitationId: inv.id, version: inv.version || null, issued: inv.status === 'invited', approval: inv.approval?.status || 'pending', verification: inv.verification?.status || 'pending', receipt: saved?.exists ? receipt(saved.data()) : null };
  }
  return { review, accept, ownerStatus, savedReceipt };
}
module.exports = { createWeaverAcceptance, validate, acceptanceId, ACCEPTANCE_NOTICE, invitationDigest, fail };
