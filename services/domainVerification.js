const dns = require('dns').promises;
const crypto = require('crypto');

const CHALLENGE_TTL_MS = 1000 * 60 * 30;

function normalizeDomain(value) {
  const domain = String(value || '').trim().toLowerCase().replace(/\.$/, '');
  if (!domain || domain.length > 253 || domain.includes('/') || domain.includes('@')) return null;
  if (!/^[a-z0-9.-]+$/.test(domain) || domain.startsWith('.') || domain.endsWith('.')) return null;
  return domain;
}

function createDomainVerifier(collection) {
  async function start(did, domainInput) {
    const domain = normalizeDomain(domainInput);
    if (!domain) throw new Error('invalid_domain');
    const token = `duet-verify=${crypto.randomBytes(24).toString('hex')}`;
    const id = crypto.createHash('sha256').update(`${did}:${domain}`).digest('hex');
    await collection.doc(`domain_${id}`).set({ did, domain, token, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + CHALLENGE_TTL_MS });
    return { domain, recordType: 'TXT', host: '_duet-verify', value: token, expiresAt: Date.now() + CHALLENGE_TTL_MS };
  }

  async function verify(did, domainInput) {
    const domain = normalizeDomain(domainInput);
    if (!domain) throw new Error('invalid_domain');
    const id = crypto.createHash('sha256').update(`${did}:${domain}`).digest('hex');
    const ref = collection.doc(`domain_${id}`);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('challenge_not_found');
    const challenge = snap.data();
    if (challenge.did !== did) throw new Error('challenge_not_owned');
    if (Number(challenge.expiresAt) < Date.now()) throw new Error('challenge_expired');

    const records = await dns.resolveTxt(`${challenge.host || '_duet-verify'}.${domain}`);
    const values = records.map((parts) => parts.join(''));
    if (!values.includes(challenge.token)) throw new Error('challenge_not_found_in_dns');

    await ref.set({ status: 'verified', verifiedAt: Date.now() }, { merge: true });
    return { domain, status: 'verified', verifiedAt: Date.now() };
  }

  return { start, verify };
}

module.exports = { createDomainVerifier, normalizeDomain };
