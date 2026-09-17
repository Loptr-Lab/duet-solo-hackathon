const crypto = require('crypto');
const { Agent } = require('@atproto/api');
const { JoseKey } = require('@atproto/jwk-jose');
const { NodeOAuthClient } = require('@atproto/oauth-client-node');
const { createDomainVerifier } = require('./domainVerification.js');

const SESSION_COOKIE = 'duet_at_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const STATE_TTL_MS = 1000 * 60 * 60;

function baseUrlFromEnv() {
  const value = process.env.ATPROTO_BASE_URL || process.env.PUBLIC_URL;
  if (!value) throw new Error('ATPROTO_BASE_URL is required for AT Protocol OAuth');
  return value.replace(/\/$/, '');
}

function parseCookie(header, name) {
  if (!header) return null;
  const match = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function appendSetCookie(res, value) {
  const current = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', current ? [...current, value] : [value]);
}

function setSessionCookie(res, token) {
  appendSetCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`);
}

function clearSessionCookie(res) {
  appendSetCookie(res, `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for production AT Protocol OAuth`);
  return value;
}

async function createAtprotoAuth({ db }) {
  const baseUrl = baseUrlFromEnv();
  const privateKey = requireEnv('ATPROTO_OAUTH_PRIVATE_KEY');
  const keyset = [await JoseKey.fromImportable(privateKey, process.env.ATPROTO_OAUTH_KEY_ID || 'duet-key-1')];
  const collection = db.collection('duet_auth');
  const profiles = db.collection('verified_profiles');
  const domainVerifier = createDomainVerifier(collection);

  const stateStore = {
    async set(key, value) {
      await collection.doc(`state_${key}`).set({ value, expiresAt: Date.now() + STATE_TTL_MS });
    },
    async get(key) {
      const snap = await collection.doc(`state_${key}`).get();
      if (!snap.exists || Number(snap.data().expiresAt) < Date.now()) return undefined;
      return snap.data().value;
    },
    async del(key) {
      await collection.doc(`state_${key}`).delete().catch(() => {});
    },
  };

  const sessionStore = {
    async set(did, session) {
      await collection.doc(`oauth_${did}`).set({ session, updatedAt: Date.now() });
    },
    async get(did) {
      const snap = await collection.doc(`oauth_${did}`).get();
      return snap.exists ? snap.data().session : undefined;
    },
    async del(did) {
      await collection.doc(`oauth_${did}`).delete().catch(() => {});
    },
  };

  const client = new NodeOAuthClient({
    clientMetadata: {
      client_id: `${baseUrl}/client-metadata.json`,
      client_name: 'Duet: Solo',
      client_uri: baseUrl,
      redirect_uris: [`${baseUrl}/auth/atproto/callback`],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      scope: 'atproto transition:email',
      application_type: 'web',
      token_endpoint_auth_method: 'private_key_jwt',
      token_endpoint_auth_signing_alg: 'ES256',
      dpop_bound_access_tokens: true,
      jwks_uri: `${baseUrl}/jwks.json`,
    },
    keyset,
    stateStore,
    sessionStore,
  });

  async function getIdentity(sessionId) {
    if (!sessionId) return null;
    const snap = await collection.doc(`browser_${sessionId}`).get();
    if (!snap.exists) return null;
    const data = snap.data();
    if (Number(data.expiresAt) < Date.now()) {
      await collection.doc(`browser_${sessionId}`).delete().catch(() => {});
      return null;
    }
    const session = await client.restore(data.did);
    return { did: data.did, session, verified: data.verified || null };
  }

  async function saveVerifiedProfile(did, patch) {
    const ref = profiles.doc(did);
    await ref.set({ did, ...patch, updatedAt: Date.now() }, { merge: true });
    const snap = await ref.get();
    return snap.data();
  }

  async function getVerifiedProfile(did) {
    const snap = await profiles.doc(did).get();
    return snap.exists ? snap.data() : null;
  }

  async function attachIdentity(res, did, verified = null) {
    const profile = verified ? await saveVerifiedProfile(did, verified) : await getVerifiedProfile(did);
    const sessionId = crypto.randomBytes(32).toString('base64url');
    await collection.doc(`browser_${sessionId}`).set({
      did,
      verified: profile ? { status: 'VERIFIED PROFILE', methods: profile.methods || [] } : null,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    setSessionCookie(res, sessionId);
  }

  async function emailEvidence(session) {
    const agent = new Agent(session);
    const account = await agent.com.atproto.server.getSession();
    return {
      status: account.data.emailConfirmed ? 'verified' : 'unverified',
      verifiedAt: account.data.emailConfirmed ? Date.now() : null,
    };
  }

  async function getBrowserIdentity(req) {
    return getIdentity(parseCookie(req.headers.cookie, SESSION_COOKIE));
  }

  function routes(app) {
    app.get('/client-metadata.json', (req, res) => res.json(client.clientMetadata));
    app.get('/jwks.json', (req, res) => res.json(client.jwks));

    app.get('/auth/atproto/login', async (req, res, next) => {
      try {
        const handle = typeof req.query.handle === 'string' ? req.query.handle.trim() : '';
        if (!handle) return res.status(400).json({ error: 'handle_required' });
        const state = crypto.randomBytes(24).toString('base64url');
        const url = await client.authorize(handle, { state, scope: 'atproto' });
        res.redirect(url);
      } catch (err) {
        next(err);
      }
    });

    app.get('/auth/email/start', async (req, res, next) => {
      try {
        const identity = await getBrowserIdentity(req);
        if (!identity) return res.status(401).json({ error: 'authentication_required' });
        const agent = new Agent(identity.session);
        const profile = await agent.getProfile({ actor: identity.did });
        const state = `email:${crypto.randomBytes(24).toString('base64url')}`;
        const url = await client.authorize(profile.data.handle, { state, scope: 'atproto transition:email' });
        res.redirect(url);
      } catch (err) {
        next(err);
      }
    });

    app.get('/auth/domain/start', async (req, res, next) => {
      try {
        const identity = await getBrowserIdentity(req);
        if (!identity) return res.status(401).json({ error: 'authentication_required' });
        const challenge = await domainVerifier.start(identity.did, req.query.domain);
        res.json({ ...challenge, instructions: 'Create this TXT record, then call /auth/domain/verify?domain=YOUR_DOMAIN.' });
      } catch (err) {
        next(err);
      }
    });

    app.get('/auth/domain/verify', async (req, res, next) => {
      try {
        const identity = await getBrowserIdentity(req);
        if (!identity) return res.status(401).json({ error: 'authentication_required' });
        const result = await domainVerifier.verify(identity.did, req.query.domain);
        const existing = await getVerifiedProfile(identity.did);
        const methods = new Set(existing?.methods || []);
        methods.add('DOMAIN VERIFIED');
        const profile = await saveVerifiedProfile(identity.did, { methods: [...methods], domain: result.domain, domainVerifiedAt: result.verifiedAt });
        await collection.doc(`browser_${parseCookie(req.headers.cookie, SESSION_COOKIE)}`).set({ verified: { status: 'VERIFIED PROFILE', methods: profile.methods } }, { merge: true });
        res.json({ status: 'VERIFIED PROFILE', methods: profile.methods });
      } catch (err) {
        next(err);
      }
    });

    app.get('/auth/atproto/callback', async (req, res, next) => {
      try {
        const params = new URLSearchParams(req.url.split('?')[1] || '');
        const { session, state } = await client.callback(params);
        let verified = null;
        if (typeof state === 'string' && state.startsWith('email:')) {
          const evidence = await emailEvidence(session);
          if (evidence.status === 'verified') {
            const existing = await getVerifiedProfile(session.did);
            const methods = new Set(existing?.methods || []);
            methods.add('EMAIL VERIFIED');
            verified = { methods: [...methods], emailVerifiedAt: evidence.verifiedAt };
          }
        }
        await attachIdentity(res, session.did, verified);
        res.redirect('/weaver/?auth=success');
      } catch (err) {
        next(err);
      }
    });

    app.get('/auth/me', async (req, res, next) => {
      try {
        const identity = await getBrowserIdentity(req);
        if (!identity) return res.status(401).json({ authenticated: false });
        const agent = new Agent(identity.session);
        const profile = await agent.getProfile({ actor: identity.did });
        return res.json({
          authenticated: true,
          did: identity.did,
          handle: profile.data.handle,
          displayName: profile.data.displayName || null,
          verification: identity.verified || { status: 'UNVERIFIED', methods: [] },
        });
      } catch (err) {
        next(err);
      }
    });

    app.post('/auth/logout', async (req, res, next) => {
      try {
        const sessionId = parseCookie(req.headers.cookie, SESSION_COOKIE);
        if (sessionId) await collection.doc(`browser_${sessionId}`).delete().catch(() => {});
        clearSessionCookie(res);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    });
  }

  return { client, routes, getIdentity, attachIdentity };
}

module.exports = { createAtprotoAuth, SESSION_COOKIE };
