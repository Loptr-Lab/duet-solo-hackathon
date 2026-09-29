const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveTestUrl } = require('../scripts/verify-agent-live.js');

test('ordinary production service URLs are refused in both Cloud Run formats', () => {
  for (const host of [
    'duet-solo-hackathon-381121522073.us-central1.run.app',
    'duet-solo-hackathon-abc123-uc.a.run.app',
    'duet.loptrlab.com'
  ]) {
    assert.throws(() => resolveTestUrl(`https://${host}`), /ordinary production endpoint/, host);
  }
});

test('tagged revisions in both Cloud Run formats remain usable for the live check', () => {
  for (const host of [
    'pixie-check---duet-solo-hackathon-381121522073.us-central1.run.app',
    'pixie-check---duet-solo-hackathon-abc123-uc.a.run.app'
  ]) {
    assert.equal(resolveTestUrl(`https://${host}`).href, `https://${host}/api/agent`);
  }
});
