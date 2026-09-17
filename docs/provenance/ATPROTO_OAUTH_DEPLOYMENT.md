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
