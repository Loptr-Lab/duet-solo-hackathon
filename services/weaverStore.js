// Provider-independent contract. No production storage service is authorized/configured.
// In-memory implementations live under test/ only; environment variables cannot load one.
const UNAVAILABLE_MESSAGE = 'Invitation acceptance is not available on this deployment. Nothing has been accepted.';
function unavailable() { throw Object.assign(new Error('acceptance_unavailable'), { statusCode: 503 }); }
const unavailableStore = Object.freeze({
  contractVersion: 1, available: false, testOnly: false,
  getInvitation: unavailable, getReceipt: unavailable, transaction: unavailable,
});
function productionWeaverStore() { return unavailableStore; }
function storeAvailable(store, runtime = process.env.NODE_ENV) {
  return store?.contractVersion === 1 && store.available === true &&
    typeof store.testOnly === 'boolean' && !(store.testOnly && runtime === 'production') &&
    ['getInvitation', 'getReceipt', 'transaction'].every(name => typeof store[name] === 'function');
}
function requireStore(store) { if (!storeAvailable(store)) unavailable(); return store; }
function capabilities(store, authenticationReady) {
  const backend = authenticationReady === true && storeAvailable(store);
  return { backend, automaticNamedVerification: false, wIdentity: false, ...(!backend ? { message: UNAVAILABLE_MESSAGE } : {}) };
}
function unavailableResponse(res) {
  return res.status(503).set('Cache-Control', 'no-store').set('Pragma', 'no-cache')
    .json({ error: 'acceptance_unavailable', message: UNAVAILABLE_MESSAGE });
}
module.exports = { productionWeaverStore, storeAvailable, requireStore, capabilities, unavailableResponse, UNAVAILABLE_MESSAGE };
