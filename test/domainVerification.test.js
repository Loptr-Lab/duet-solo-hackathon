const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDomain } = require('../services/domainVerification.js');

test('normalizes valid domains', () => {
  assert.equal(normalizeDomain('Example.COM.'), 'example.com');
});

test('rejects non-domain input', () => {
  assert.equal(normalizeDomain('person@example.com'), null);
  assert.equal(normalizeDomain('https://example.com'), null);
  assert.equal(normalizeDomain(''), null);
});
