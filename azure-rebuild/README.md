# Duet Azure fresh rebuild foundation

This directory is an isolated, portable Node.js foundation for the Azure rebuild. It does not replace the current production app and is not yet a playable game.

## Scope and invariants

- Preserve the existing two-player rules, contracts, accessibility behavior, and identity/provenance requirements.
- Use a replaceable storage interface; PostgreSQL is the proposed durable adapter, not a Firestore API emulator.
- PIXIE help stays deterministic and model-free.
- Models never decide legal moves, outcomes, invitations, verification, or consent.
- Keep the production domain and Google Cloud resources unchanged until staging acceptance and explicit cutover approval.
- Do not import short-lived OAuth/session secrets. Re-authenticate players and preserve only data approved by the migration inventory and retention policy.
- Initial multiplayer pilot target: one active server replica and one active revision while room ownership, reconnect, and restart recovery are validated.

## Local development

Requires Node.js 22 or newer.

```sh
npm install
npm test
npm start
```

The app listens on `PORT` (default 8080). `GET /healthz` is a process health check. `GET /readyz` reports readiness and checks PostgreSQL only when `DATABASE_URL` is configured. Do not expose a database connection string in logs or commit it to source.

## Implementation sequence

1. Establish CI and prove the scaffold tests pass.
2. Define versioned room, match, player-profile, feedback, and verification/invitation persistence contracts.
3. Implement transactional PostgreSQL storage and concurrency controls.
4. Port the actual two-player game rules and socket events from the production source; add contract and two-client tests.
5. Implement AT Protocol OAuth against the stable public origin, with staging metadata on the staging origin.
6. Add accessibility regression tests and manual screen-reader/device checks.
7. Build the container and deploy isolated staging only after subscription/credit and cost checks.
8. Securely export, restore-test, and reconcile approved Firestore data.
9. Present test results, cost estimate, reconciliation, rollback, and a cutover checklist for approval.

## Status

Foundation scaffold only. No Azure resources are provisioned; no production data has been migrated; no live traffic or DNS has been changed. Runtime tests must be run in CI or a Node.js 22 environment before this scaffold is considered verified.
