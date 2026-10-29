const OWNER = require('../config/weaver-owner.json');
const didPattern = /^did:(?:plc|web):[a-zA-Z0-9._:%-]+$/;
function destination(base, recipient, sender) {
  try {
    if (typeof base !== 'string' || /[#\s]/.test(base) || !didPattern.test(recipient) || !didPattern.test(sender)) return null;
    const u = new URL(base);
    // Only destination documented by Germ's current implementation guidance.
    if (u.protocol !== 'https:' || u.hostname !== 'landing.ger.mx' || u.port || u.username || u.password || u.search || u.hash || !/^\/newUser(?:\/(?:android|iOS|web))?$/.test(u.pathname)) return null;
    u.hash = `${recipient}+${sender}`;
    return u.href;
  } catch { return null; }
}
async function germHandoff({ declaration, recipientDid, senderDid, follows, reachable }) {
  try {
    const value = declaration?.value;
    if (!value || value.$type !== 'com.germnetwork.declaration' || !/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(value.version || '') || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.currentKey?.$bytes || '')) return null;
    const m = value.messageMe;
    if (!m || !['everyone', 'usersIFollow'].includes(m.showButtonTo)) return null;
    if (m.showButtonTo === 'usersIFollow' && await follows(recipientDid, senderDid) !== true) return null;
    const url = destination(m.messageMeUrl, recipientDid, senderDid);
    if (!url || await reachable(new URL(url).origin + new URL(url).pathname) !== true) return null;
    return url;
  } catch { return null; }
}
async function json(url, fetcher = fetch) {
  const r = await fetcher(url, { signal: AbortSignal.timeout(8000), redirect: 'error', headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('provider_unavailable');
  const text = await r.text(); if (text.length > 262144) throw new Error('invalid_provider_response');
  return JSON.parse(text);
}
function providers(fetcher = fetch, owner = OWNER) {
  async function ownerAuthorized() {
    try {
      const [handle, doc] = await Promise.all([
        json(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${owner.handle}`, fetcher),
        json(`https://plc.directory/${owner.did}`, fetcher),
      ]);
      return handle.did === owner.did && doc.id === owner.did && doc.alsoKnownAs?.includes(`at://${owner.handle}`) && doc.service?.some(s => s.id === '#atproto_pds' && s.serviceEndpoint === owner.pds);
    } catch { return false; }
  }
  async function germ(senderDid) {
    if (!await ownerAuthorized()) return null;
    try {
      const declaration = await json(`${owner.pds}/xrpc/com.atproto.repo.getRecord?repo=${owner.did}&collection=com.germnetwork.declaration&rkey=self`, fetcher);
      if (declaration.uri !== `at://${owner.did}/com.germnetwork.declaration/self`) return null;
      return germHandoff({ declaration, recipientDid: owner.did, senderDid,
        follows: async (actor, other) => {
          const r = await json(`https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships?actor=${encodeURIComponent(actor)}&others=${encodeURIComponent(other)}`, fetcher);
          return r.actor === actor && r.relationships?.some(x => x.did === other && typeof x.following === 'string' && x.following.startsWith(`at://${actor}/app.bsky.graph.follow/`)) === true;
        },
        reachable: async url => {
          const r = await fetcher(url, { method: 'HEAD', signal: AbortSignal.timeout(8000), redirect: 'manual' });
          return r.ok;
        },
      });
    } catch { return null; }
  }
  return { ownerAuthorized, germ };
}
module.exports = { destination, germHandoff, providers };
