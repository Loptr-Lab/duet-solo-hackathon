# Weaver operational readiness — 29 October 2026

Status: source corrections and isolated synthetic verification completed; live private acceptance blocked. This is a review-branch handoff for PR #105, not a release authorization.

## Existing hosting path

| Surface | Source / observed state | Decision |
| --- | --- | --- |
| Duet backend | `Loptr-Lab/duet-solo-hackathon`, `server.js`, existing Express/Socket.IO/Firestore application; documented Cloud Run project `adept-crossing-106819` | Reuse this application's OAuth and private APIs. An isolated existing staging revision/database has not been identified or authorized. Do not redeploy the stable game to demonstrate acceptance. |
| Public OAuth origin | Documented production `https://duet.loptrlab.com`; metadata `/client-metadata.json`, public keys `/jwks.json`, callback `/auth/atproto/callback` | Documentation is not proof of live configuration. All three attempted public metadata/JWKS/capabilities reads were blocked with proxy tunnel HTTP 403. No production write was attempted. |
| Weaver review | Existing Vercel project `weaver-reading-review`, `prj_6zPwr6L5hp6hrEDxWE5ZoTmFylgw`, team `team_FwEiOGBQiwh3TkzOsBwVrBk3` | Static `/duet/`, `/duet/weaver/`, and game artifact only. Environment inventory returned no variables. Keep all private APIs unavailable; no proxy to production data. |
| PIXIE Companion | Railway `patient-respect`, production only, existing `pixie-project-companion`, source `Loptr-Lab/pixie-ecosystem-guide@creator-workspace`, `/data` volume | Separate existing Companion runtime. It has its own OAuth/session and DID workspace file model, not Duet's Firestore acceptance service. Two pre-existing staged changes were observed and left untouched. Do not repurpose this service or accept its staged patch. |
| GitHub Pages | Existing static workflow/artifact | No OAuth routes or private storage. |

Railway variable **names only** were inspected. They include `PIXIE_SESSION_SECRET`, `PIXIE_MCP_TOKEN`, `PIXIE_DATA_FILE`, `PIXIE_LOCAL_OWNER`, and hosting variables; the returned inventory contains no `ATPROTO_BASE_URL`, `ATPROTO_OAUTH_PRIVATE_KEY` or `GOOGLE_CLOUD_PROJECT`. Absence of a name does not establish all runtime capabilities. No values were retrieved or changed. The managed execution environment reported no ready secret bindings, runtime variables or cloud identities; no `gcloud` executable is installed. Cloud Run service name, deployed revision, IAM, signing-key readiness, Firestore rules, backup and retention cannot be established with available access.

## Configuration checklist for the existing backend operator

1. Identify an **already authorized isolated staging environment** for the Duet source. Record service name, revision, project/database, staging public HTTPS origin, source SHA and rollback revision. If none exists, stop: choosing/provisioning staging is a separate owner decision. Do not copy production invitations or change production domains.
2. Inspect names and readiness privately: `ATPROTO_BASE_URL`, `PUBLIC_URL`, `ATPROTO_OAUTH_PRIVATE_KEY`, `ATPROTO_OAUTH_KEY_ID`, and Google Cloud project/credential selectors. The two origins must agree with the staging origin. The key must import as ES256; never print private material. Public metadata/JWKS must reference the same origin, key ID and exact `/auth/atproto/callback`. Existing human sign-in uses `atproto`; the historical email path is separate and is not named-person proof.
3. Inspect both Firestore IAM and client rules. Server SDK access uses IAM and bypasses client rules: rules alone cannot isolate a broadly privileged backend identity. Verify the operator-approved runtime principal and database contain synthetic records only. Verify direct unauthenticated/client access to `duet_auth`, `verified_profiles` and `weaver_acceptances` is denied, including list/query paths. Verify OAuth state/session storage is private. No new database/rules/IAM policy is supplied or applied by this review.
4. Record an authorized retention schedule and deletion authority for issued versions, minimal opaque review references, immutable acceptance receipts, browser sessions, OAuth sessions/state and backups. Numeric `expiresAt` application checks are not proof of Firestore TTL deletion; OAuth session records have no configured TTL in this source. Do not invent a retention period or apply TTL to immutable receipts. Obtain a verified encrypted backup and perform an isolated restore/count/integrity/access check before any real-data release. Neither a backup nor retention configuration was inspected here.
5. Deploy only the reviewed commit to that existing staging target after its operator approves the target. Check `/auth/weaver/capabilities`, metadata and JWKS; run synthetic account A/B sign-in, logout/expiry, exact-text acceptance, concurrent duplicate and storage failure tests. Check wrong account and owner status denial, then matching owner OAuth access with fresh bidirectional binding. Physical iPad Safari and VoiceOver remain separate acceptance gates.
6. Save staging evidence privately. Done means the tested SHA serves the expected HTTPS origin and callbacks, only synthetic isolated data is written, one immutable receipt survives retries, account B cannot read account A's records, and the operator has verified backup/restore and retention. Static preview or mocked tests alone do not satisfy this gate.

## Current identity/provider evidence

Fresh HTTP 200 responses from `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=ibloud.wsocial.eu` and `https://plc.directory/did:plc:wa3u3bat5knu2hguqmq7siq4` confirmed the forward DID, reverse `at://ibloud.wsocial.eu` alias and `https://pds.wsocial.network` PDS on 29 October 2026. This matches the existing owner config; no change was needed. No real owner OAuth login occurred. Public account binding and present account control establish neither legal identity nor historical control. Runtime owner status still requires the exact OAuth DID and fresh binding checks; failures deny privileged access.

Official W sources reviewed: [W Social FAQ](https://wsocial.news/faq), [W Identity terms](https://widentity.eu/terms), [W Identity support](https://widentity.eu/support), and [W Identity homepage](https://widentity.eu/). Their public descriptions do not supply an implementable relying-party protocol. The targeted official-domain search did not locate endpoint/authentication documentation, trusted issuer/key-discovery/rotation rules, signed assertion schema, audience/nonce/expiry/replay validation, consented named-attribute semantics, DID/session binding or a sandbox. This is a bounded assessment, not proof no private partner integration exists. World ID and WeIdentity are different providers and are not substitutes. Automatic named-person verification remains disabled.

The owner/provider must supply that official integration contract and authorized sandbox access before implementation. A human/uniqueness flag cannot prove the intended named recipient. Do not read a public badge or inferred historical response as verified identity or acceptance.

### Manual review procedure — prepared, not executed

Only the configured owner or separately authorized reviewer may review an existing issued invitation, using the project's existing private evidence channel. Confirm the authenticated DID independently, explain the exact purpose and minimal evidence needed, obtain the participant's permission for any disclosure, and privately assess whether evidence establishes the intended recipient for that exact invitation. Preserve disagreement and uncertainty; historical responses and similar names/handles are not authentication.

An unresolved case remains `pending`; a confirmed mismatch excludes that account. A reviewer records only the minimal authorized opaque evidence references, reviewer DID/time and subject DID, and a separate approval bound to the immutable invitation version and SHA-256 text digest. Changes require the operator's authorized private review procedure; this PR provides no issuing, approval or evidence-editing API. No real records were read or edited in this session. Even confirmed review and approval require the recipient's separate explicit action to save acceptance to discuss. They do not establish agreement with disputed history, rights transfers, publication permission, legal terms or relationship consent.

### Germ, verified independently

The owner config and fresh DID document identify `https://pds.wsocial.network`. A read of its `com.germnetwork.declaration/self` failed with **proxy tunnel HTTP 403** on 29 October 2026. No declaration or actionable destination was obtained. An earlier exploratory request to `eurosky.social` returned HTTP 400; that is not the configured owner PDS and is not evidence about the owner's current declaration. No policy, follow relationship, destination availability or live handoff is claimed.

The three official sources in WEAVER_DOOR were reread. Existing tests verify `messageMe`, `showButtonTo`, owner/recipient-follows-sender direction, recipient-DID + sender-DID ordering, allowed destination, and unavailable/revoked permissions without acceptance writes. Live verification still requires access to the current owner PDS and the declared supported destination; never fabricate a link. Germ remains optional external navigation after a saved acceptance. No automatic sending, prefill, bot, alert, delivery/read receipt or conversation access exists.

## Corrections and verification

- Added authenticated `GET /auth/weaver/receipt?invitationId=...&version=...`: the authenticated DID selects the receipt key; no caller-supplied recipient selector is accepted. Prior receipts survive current invitation revocation/deletion and owner-binding/provider outages **when the participant's OAuth session can still be authenticated**. OAuth restoration outages still fail closed. No evidence references are returned.
- The guide can retrieve an earlier receipt and download its JSON on explicit action. This creates a user-selected local download; no automatic browser persistence is added.
- Ignore stale invitation responses after sign-out; no private content is restored by a delayed response. Reject malformed/missing/nonfinite/expired session expiry. Malformed cookies fail as unauthenticated. Failed logout storage deletion returns a sanitized unavailable state rather than a false success. Only allowlisted service errors reach Weaver clients; provider/database `statusCode` properties cannot expose private error text.
- Source authority remains `public/style.css`; SVG, CSS, PIXIE icon, Yellow Door, game sources and narrative are unchanged. Builder refreshed only the generated invitation script.

`npm run check` and `npm test`: **51 tests pass**, synthetic sessions/store/providers only. The session test creates an ephemeral key in memory and instantiates the existing official OAuth BFF; it verifies public metadata/JWKS, secure HttpOnly SameSite cookie, expiry, DID mismatch, provider outage, malformed cookie and failed/successful logout. It does not perform external OAuth.

Reproducible optional browser check: `PLAYWRIGHT_MODULE=<installed playwright module> CHROMIUM_PATH=<installed Chromium> node scripts/verify-weaver-browser.cjs`. No new production dependency. It starts only local HTTP servers with synthetic identities/in-memory storage and blocks external browser requests. It passed exact-text/no-script-execution, explicit action, failed storage/no success, retry/one write, receipt download/recovery and delayed-response logout. Static fail-closed, Enter/Escape/focus return, 320/390/820/1440 widths and simulated 200% text reflow, plus reduced motion, passed local Chromium. These are local checks, not deployed-browser or physical-device checks. CSS and generated script bytes match their authorities; `git diff --check` passes.

## Release ownership and observable closure

| State | Owner / next action | Finished-state evidence |
| --- | --- | --- |
| Blocked: operational staging | Duet backend operator identifies authorized existing isolated staging target and grants scoped runtime/cloud read access | Recorded service/revision/origin/database plus metadata/JWKS/callback agreement and private IAM/restore evidence |
| Blocked: real owner authentication | Designated owner tests existing OAuth in that staging target | Exact DID session, fresh bidirectional binding, private owner status allowed; all other accounts denied |
| Blocked: automatic provider | Owner obtains official W integration contract or retains manual review | Reviewed protocol/sandbox before any implementation; automatic path remains off meanwhile |
| Blocked: live Germ | Operator permits supported read access to current owner PDS/destination; synthetic participant then checks handoff | Real declaration/permissions observed and correctly ordered external link after saved synthetic acceptance; no automatic alert claim |
| Untested: physical accessibility | Designated iPad/VoiceOver tester checks the reviewed preview and later staging flow | Device/browser/OS and keyboard/screen-reader findings recorded |
| Ready for review only | Owner reviews PR #105 and static preview | A separate release decision after all relevant gates; no merge/promotion/domain change is authorized by this report |

Safe to pause with this branch/report preserved. The first next action belongs to the existing Duet backend operator: identify the authorized isolated staging target and provide its non-secret identifiers/access. Do not provision another application, repurpose PIXIE production, modify real invitations, post private evidence, send messages, merge or promote production from these checks.

## Exact tested source and changed files

Tested implementation commit: `703d4ee12483a9283ef5642aec96bcf64b7efefd`, parent `2f15eeec81de0aad4835d4a4025e6d7ecdd05b83`. The following handoff commit changes documentation only; PR #105 records its final head, CI and fresh static deployment. The optional browser script and 51-test suite were run against the implementation contents above. The official OAuth client warns that no lock mechanism was provided; multi-instance OAuth refresh locking remains an operator/deployment assessment gate, not a verified capability.

Implementation files: `public/weaver-invitation.js`, generated `site/weaver-invitation.js`, `services/atprotoAuth.js`, `services/weaverAcceptance.js`, `services/weaverRoutes.js`, `test/weaverAcceptance.test.js`, `test/weaverSession.test.js`, `scripts/verify-weaver-browser.cjs`.

Documentation files: this report, `docs/BROWSER_RECOVERY_2026-10-20.md`, `docs/deployment/DUET_OAUTH_PRODUCTION.md`, `docs/provenance/ATPROTO_OAUTH_DEPLOYMENT.md`, `docs/provenance/OPEN_RESPONSE_PROTOCOL.md`, `docs/provenance/VERIFIED_PROFILE_SYSTEM.md`, `docs/provenance/WEAVER_DOOR.md`.

CI compatibility correction: the new official-BFF integration test exposed that the old CI Node 20 runtime cannot load the existing OAuth dependency graph (`undici_v8` requires Node >=22.19). The existing Dockerfile already uses `node:22-alpine`; `.github/workflows/ci.yml` now tests Node 22 to match it. No production runtime was changed. The initial resumed CI failure was not an acceptance/security failure; the corrected head must pass both CI events before delivery. This adds `.github/workflows/ci.yml` to the changed-file list. The final tested head is recorded in PR #105; the earlier implementation SHA above remains its source predecessor.
