# Duet OAuth — Production Configuration

This is the deployment checklist for the controlled Weaver participation system.

## Canonical public origin

The production OAuth origin is:

`https://duet.loptrlab.com`

Set both of these values to that exact origin, with no trailing slash:

```text
PUBLIC_URL=https://duet.loptrlab.com
ATPROTO_BASE_URL=https://duet.loptrlab.com
```

The Cloud Run service URL remains an infrastructure endpoint. It should not be used as the public OAuth client origin once the custom domain is serving the application.

## Required production secrets / configuration

Set these in the Cloud Run service configuration or an appropriate secret-management system. Do not commit values to GitHub.

```text
ATPROTO_OAUTH_PRIVATE_KEY=<confidential ES256 private key material>
ATPROTO_OAUTH_KEY_ID=duet-key-1
INVITATION_APPROVER_DID=<DID of the human who may approve invitations>
```

The OAuth client publishes public client metadata at:

`https://duet.loptrlab.com/client-metadata.json`

and its public JWKS at:

`https://duet.loptrlab.com/jwks.json`

The OAuth callback is:

`https://duet.loptrlab.com/auth/atproto/callback`

## Firestore

The application uses the existing Google Cloud project configured for Duet:

```text
GOOGLE_CLOUD_PROJECT=adept-crossing-106819
```

The Cloud Run service identity must have the required Firestore access. No database credentials belong in the repository.

## Controlled participation flow

```text
READ
  ↓
EXISTING AT PROTOCOL IDENTITY
  ↓
AUTHENTICATE
  ↓
VERIFY EMAIL AND/OR DOMAIN
  ↓
REQUEST INVITATION
  ↓
HUMAN DECISION
  ↓
INVITED RESPONSE PATH
```

There is no anonymous response path.

A verified profile is an application-level provenance signal. It is not a legal identity, authorship determination, ownership statement, consent, or invitation by itself.

## Domain verification

A participant who chooses domain verification receives a single-use TXT challenge at:

`_duet-verify.<their-domain>`

The challenge expires after 30 minutes. The domain path is allowed to establish the first verified-profile credential; it does not require an already-verified profile.

## Deployment gate

Do not describe production OAuth as live until all of these have been tested against `https://duet.loptrlab.com`:

- `/client-metadata.json` returns HTTP 200 JSON.
- `/jwks.json` returns HTTP 200 JSON.
- AT Protocol login completes and returns to `/auth/atproto/callback`.
- The browser receives the secure, HTTP-only `duet_at_session` cookie.
- `/auth/me` returns the authenticated DID.
- Email verification works when the account-email permission is granted and the account reports a confirmed email.
- Domain challenge creation and DNS verification work.
- A verified profile can request an invitation.
- Only the configured approver DID can decide an invitation.
- An approved participant reaches the controlled response path.
- Logout removes the browser session.

Gameplay must remain available when OAuth is not configured.

## Separate actor authentication

`BLUESKY_HANDLE` / `BLUESKY_APP_PASSWORD` in `atprotoPoster.js` are the game’s existing app-actor posting credentials. They are separate from human AT Protocol OAuth and should not be conflated with participant identity or the Original Collaborator pathway.

## Credential hygiene

If a secret has ever been displayed in a screenshot, terminal capture, log, issue, pull request, or other public/shared surface, rotate it before production use. Never paste replacement secrets into GitHub source files or this document.
