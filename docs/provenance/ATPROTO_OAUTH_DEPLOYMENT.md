# Duet AT Protocol OAuth deployment

Duet now contains the server-side scaffold for AT Protocol OAuth using the official Node OAuth client. The code is intentionally configuration-gated: gameplay remains available when OAuth secrets are absent, but production authentication is not enabled until the required deployment configuration exists.

## Required production configuration

- `ATPROTO_BASE_URL` — the public HTTPS origin used by the OAuth client metadata and callback.
- `ATPROTO_OAUTH_PRIVATE_KEY` — a private JWK importable by `@atproto/jwk-jose`. Never commit this value.
- `ATPROTO_OAUTH_KEY_ID` — optional key identifier; defaults to `duet-key-1`.
- Google Cloud / Firestore credentials already required by the existing Duet deployment.

The public OAuth endpoints are:

- `/client-metadata.json`
- `/jwks.json`
- `/auth/atproto/login?handle=...`
- `/auth/atproto/callback`
- `/auth/me`
- `/auth/logout`
- `/auth/email/start`
- `/auth/domain/start?domain=...`
- `/auth/domain/verify?domain=...`

## Identity and verification boundaries

1. The person must already have an AT Protocol identity. Duet does not create accounts.
2. AT Protocol OAuth establishes the authenticated DID/session.
3. Email verification is a separate progressive OAuth request using the current `transition:email` scope.
4. Domain verification uses a single-use DNS TXT challenge at `_duet-verify.<domain>`.
5. A verified profile requires at least one verified evidence method.
6. Verified profile does not establish legal identity, authorship, employment, ownership, consent, or invitation.
7. Invitation and participation authorization remain separate human-governance decisions.
8. There is no anonymous response or submission path.

## Deployment boundary

The repository does **not** contain production secrets and does not claim that OAuth is live merely because the code exists. Before a real login can work, the public HTTPS base URL, OAuth client metadata, JWKS, private signing key, Firestore access, and deployment configuration must agree.

The official atproto Node OAuth client handles the protocol mechanics including PKCE and DPoP. Duet uses a server-side/BFF session cookie so OAuth credentials remain server-side.

## Weaver acceptance amendment — 29 October 2026

New runtime routes are `/auth/weaver/capabilities`, `/auth/weaver/session`, `/auth/weaver/invitation`, POST `/auth/weaver/accept`, POST `/auth/weaver/germ`, and POST `/auth/weaver/owner/status`. Private responses are no-store. Every new POST requires the configured exact Origin, JSON content type, an authenticated session and its server-derived CSRF token. OAuth's existing PKCE/DPoP flow remains in use; `flow=weaver` returns to the private guide after sign-in. The existing `/auth/invitation/request` and `/auth/invitation/decide` paths are retired (410), not a back door to issue or approve invitations.

No production configuration, real invitation record or credential was changed. The owner handle/DID/PDS binding is in config/weaver-owner.json and revalidated at runtime. Backend OAuth keys, a matching public origin, accessible private Firestore and authorized versioned invitation/evidence records are prerequisites. Do not deploy acceptance collections with public client access. W Identity is not integrated; Germ has only the documented user-navigation handoff. The existing GitHub Pages deployment remains static and cannot supply this backend.

## Resumed operational review — 29 October 2026

See [operational readiness and release handoff](../deployment/WEAVER_STAGING_REVIEW.md) for fresh hosting/owner/provider observations, the private historical-receipt endpoint, session/logout corrections, isolated test results and exact remaining operator gates. Static preview remains non-operational for authentication and acceptance. Automatic named-person verification remains disabled; no real invitation writes or messages are authorized.
