const crypto = require('node:crypto');
const { productionWeaverStore, storeAvailable, unavailableResponse } = require('./weaverStore');
const { createWeaverAcceptance } = require('./weaverAcceptance');
const { providers } = require('./germHandoff');
const OWNER = require('../config/weaver-owner.json');
const SUPPORT_CODES = new Set(['authentication_required', 'invitation_not_found', 'invitation_account_mismatch', 'issued_invitation_required', 'invitation_review_pending', 'invitation_approval_pending', 'named_person_verification_pending', 'confirmed_identity_mismatch', 'owner_verification_pending', 'service_unavailable', 'invitation_version_changed']);
const ERROR_STATUS = { authentication_required: 401, invitation_not_found: 404, invitation_account_mismatch: 403, issued_invitation_required: 403, invitation_review_pending: 409, invitation_approval_pending: 409, named_person_verification_pending: 409, confirmed_identity_mismatch: 403, owner_verification_pending: 409, invitation_version_changed: 409, explicit_acceptance_required: 400, csrf_rejected: 403, owner_access_forbidden: 403, invalid_recipient: 400, invalid_receipt_reference: 400, receipt_not_found: 404 };
function troubleshooting(code) {
  code = SUPPORT_CODES.has(code) ? code : 'service_unavailable';
  const marker = `weaver-support-${crypto.createHash('sha256').update(`flow-v1:${code}`).digest('hex').slice(0, 12)}`;
  const title = `[${marker}] Weaver invitation flow: ${code}`;
  const body = `Component: Weaver invitation flow v1\nTechnical state: ${code}\nExpected: private invitation review can continue when eligible.\nObserved: this technical state prevented continuation.\n\nCheck the linked existing-issue search before creating a duplicate. Do not add DIDs, handles, invitation IDs/text, identity evidence, private correspondence, cookies or tokens. Closing this issue does not approve or accept an invitation.`;
  return { marker, title, body, searchUrl: `https://github.com/Loptr-Lab/duet-solo-hackathon/issues?q=${encodeURIComponent(`is:issue in:title ${marker}`)}`, draftUrl: `https://github.com/Loptr-Lab/duet-solo-hackathon/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}` };
}
function csrf(sessionId) { return crypto.createHmac('sha256', sessionId).update('weaver-csrf-v1').digest('base64url'); }
function requireCsrf(req, identity, origin) {
  const supplied = req.headers['x-csrf-token'];
  if (req.headers.origin !== origin || !req.is('application/json') || typeof supplied !== 'string' || !identity.csrfToken || Buffer.byteLength(supplied) !== Buffer.byteLength(identity.csrfToken) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(identity.csrfToken))) {
    const e = new Error('csrf_rejected'); e.statusCode = 403; throw e;
  }
}
function registerWeaverRoutes(app, { store = productionWeaverStore(), getIdentity, baseUrl, provider = providers(), ownerDid = OWNER.did, acceptance = createWeaverAcceptance({ store, ownerDid }) }) {
  const origin = storeAvailable(store) ? new URL(baseUrl).origin : null;
  function route(method, path, handler) {
    app[method](path, async (req, res) => {
      res.set('Cache-Control', 'no-store').set('Pragma', 'no-cache');
      try {
        if (!storeAvailable(store)) return unavailableResponse(res);
        const identity = await getIdentity(req);
        if (!identity?.did) return res.status(401).json({ error: 'authentication_required', support: troubleshooting('authentication_required') });
        if (method === 'post') requireCsrf(req, identity, origin);
        await handler(req, res, identity);
      } catch (e) {
        if (e?.message === 'acceptance_unavailable') return unavailableResponse(res);
        const status = Object.hasOwn(ERROR_STATUS, e?.message) && ERROR_STATUS[e.message] === e.statusCode ? e.statusCode : 503;
        const code = status === 503 ? 'service_unavailable' : e.message;
        res.status(status).json({ error: code, support: troubleshooting(code) });
      }
    });
  }
  async function ownerBound() {
    if (await provider.ownerAuthorized() !== true) { const e = new Error('owner_verification_pending'); e.statusCode = 409; throw e; }
  }
  route('get', '/auth/weaver/session', async (req, res, identity) => {
    res.json({ authenticated: true, did: identity.did, csrfToken: identity.csrfToken, owner: identity.did === ownerDid && await provider.ownerAuthorized() === true });
  });
  route('get', '/auth/weaver/invitation', async (req, res, identity) => {
    await ownerBound();
    const view = await acceptance.review(identity.did);
    const url = view.receipt ? await provider.germ(identity.did) : null;
    res.json({ ...view, csrfToken: identity.csrfToken, germEligible: Boolean(url) });
  });
  route('get', '/auth/weaver/receipt', async (req, res, identity) => {
    // Historical access to one's own committed receipt is independent of current eligibility.
    res.json({ receipt: await acceptance.savedReceipt(identity.did, req.query.invitationId, req.query.version) });
  });
  route('post', '/auth/weaver/accept', async (req, res, identity) => {
    await ownerBound();
    // Transaction must finish durably before any success response or notification check.
    const saved = await acceptance.accept(identity.did, req.body);
    res.json({ receipt: saved });
  });
  route('post', '/auth/weaver/germ', async (req, res, identity) => {
    await ownerBound();
    const view = await acceptance.review(identity.did);
    if (!view.receipt) return res.status(409).json({ error: 'acceptance_required' });
    const url = await provider.germ(identity.did);
    if (!url) return res.status(409).json({ error: 'germ_handoff_unavailable', acceptanceUnchanged: true });
    // No message/delivery status is created. User decides whether to send in Germ.
    res.json({ url, acceptanceUnchanged: true });
  });
  route('post', '/auth/weaver/owner/status', async (req, res, identity) => {
    if (identity.did !== ownerDid) return res.status(403).json({ error: 'owner_access_forbidden' });
    await ownerBound();
    res.json(await acceptance.ownerStatus(identity.did, req.body?.recipientDid));
  });
}
module.exports = { registerWeaverRoutes, requireCsrf, csrf, troubleshooting };
