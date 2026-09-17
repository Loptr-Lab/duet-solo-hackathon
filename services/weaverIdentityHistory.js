const crypto = require('crypto');

/**
 * Append-only provenance record for the specifically configured Weaver
 * collaborator DID. Verification does not imply consent, authorship,
 * ownership, or agreement; this records only the authentication/verification
 * event so a later verified state cannot erase the earlier account history.
 */
function createWeaverIdentityHistory(collection) {
  const targetDid = String(process.env.WEAVER_ORIGINAL_COLLABORATOR_DID || '').trim();

  function isTargetDid(did) {
    return Boolean(targetDid) && did === targetDid;
  }

  async function append(did, event) {
    if (!isTargetDid(did)) return null;

    const eventId = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const ref = collection.doc(`weaver_identity_history_${targetDid}`).collection('events').doc(eventId);
    const record = {
      id: eventId,
      did,
      recordedAt: Date.now(),
      ...event,
    };
    await ref.create(record);
    return record;
  }

  async function recordAuthentication(did, handle) {
    return append(did, {
      type: 'authenticated',
      handle: handle || null,
      note: 'Historical account observation; authentication is not consent to Weaver participation.',
    });
  }

  async function recordDomainVerification(did, domain, verifiedAt) {
    return append(did, {
      type: 'domain_verified',
      domain,
      verifiedAt,
      evidence: 'dns_txt_challenge',
      note: 'Domain control was verified for the configured collaborator DID. This is provenance evidence, not consent, authorship, ownership, or legal identity.',
    });
  }

  return { isTargetDid, recordAuthentication, recordDomainVerification };
}

module.exports = { createWeaverIdentityHistory };
