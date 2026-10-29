# Weaver deployment correction — 29 October 2026

Status: provider-independent source correction completed; production invitation acceptance remains unavailable. This supersedes earlier instructions to restore or configure Google services. The owner moved Duet to local/static operation. No current Weaver backend follows from historical imports, example environment values, a source Dockerfile or passing mocked tests.

## Current facts, with evidence boundaries

| Category | Verified evidence | What it establishes / does not establish |
| --- | --- | --- |
| Current owner direction | Correction supplied for PR #105 on 29 October 2026 | Duet is local/static. Do not require restoration of Firestore or Cloud Run. |
| Historical source | `server.js`, `roomStore.js`, `services/atprotoAuth.js`, earlier deployment documents and `.env.example` | Historical Express/Google/OAuth implementation exists in source. No current service, public OAuth origin, storage authorization or operational availability is inferred. Unrelated legacy game code remains. |
| Configured review hosting | Existing Vercel `weaver-reading-review`, project `prj_6zPwr6L5hp6hrEDxWE5ZoTmFylgw`, team `team_FwEiOGBQiwh3TkzOsBwVrBk3`; connected project readback | Static artifact review target. Its current deployment is READY. It supplies no private invitation API or persistence. |
| Configured canonical Companion | Railway describe-service/environment: existing `patient-respect`, production `ea712c96-8716-4fa3-920f-dc70143f58c6`, `pixie-project-companion` service `d0aa9bfc-a683-453d-a775-a22a2e87d0cc`, configured source `Loptr-Lab/pixie-ecosystem-guide@creator-workspace`, pin `ce0202ae6d7cc12b843c7a4a92f69ba35da0125b`, root `/apps/companion` | Existing service in the connected Dominique Devereaux workspace, using the existing Loptr-Lab repository. Configuration is not independent source-to-running-artifact verification. |
| Observed Companion deployment | Railway environment-status reports Online, one running replica, no reported service issues; deployment `cfcba878-ff5e-454d-bcab-63ce475a4fb3` SUCCESS, created 28 October 2026. Domain `https://pixie-project-companion-production.up.railway.app`; mounted `pixie-companion-workspace` volume `90d791cf-67eb-4c69-8e6b-23a29c8ef2e6`, `/data`, 5000 MB, US East | Platform-observed working Companion process and mounted persistence. No user workspace/identity records, backup contents, readiness endpoint or private API was probed. No Weaver acceptance behavior or data durability/restore was verified there. |
| Proposed integration | Provider-independent Weaver storage contract in this PR | No production adapter is implemented or selected. Existing Companion is a candidate for owner review only, not excluded merely because its backend differs from historical Duet. No new provider, infrastructure, application, repository or workflow is chosen. |

Two pre-existing Railway staged changes were observed and left untouched. Only configuration names were read: `HOST`, `NODE_ENV`, `PIXIE_DATA_FILE`, `PIXIE_LOCAL_OWNER`, `PIXIE_MCP_TOKEN`, `PIXIE_SESSION_SECRET`; no values were printed. The managed execution environment reports no ready cloud identity/secret bindings. Neither observation is a requirement to obtain Google credentials.

## Existing PIXIE Companion reuse assessment

Canonical source contract: [RAILWAY.md](https://github.com/Loptr-Lab/pixie-ecosystem-guide/blob/372ad92a17acb18db9e873283bfd8e3beedeb181/apps/companion/deployment/RAILWAY.md) and [AGENTS.md](https://github.com/Loptr-Lab/pixie-ecosystem-guide/blob/372ad92a17acb18db9e873283bfd8e3beedeb181/AGENTS.md). The branch head was `372ad92a17acb18db9e873283bfd8e3beedeb181` when inspected. `lib/workspace-store.mjs`, `server.mjs` and `scripts/start-production.mjs` were also fetched at the configured pin `ce0202ae6d7cc12b843c7a4a92f69ba35da0125b`; their contents match those files at that branch head. This separates source evidence from platform runtime observations.

- Ownership/isolation contract: one Atmosphere sign-in, server-selected hashed DID workspace paths, no assignment of the unowned legacy file, and no cross-DID workspace access. Browser workspace operations require the existing identity and CSRF checks. A machine MCP bearer does not grant blanket private workspace access. Sessions do not automatically cross origins.
- Persistence contract: production launcher requires `PIXIE_DATA_FILE` inside the explicitly mounted persistent volume, checks its real path and disables local-owner bypass. Workspace mutations use an exclusive OS-visible file lock and temporary-write/rename mechanism, with schema validation and private permissions. The identity store is separate. These are source guarantees to assess, not newly verified backup/restore evidence.
- Existing API/schema limitation: `/api/workspace` supports creator project operations; its schema validates known workspace fields. It has no invitation lookup, immutable acceptance-receipt namespace or version-bound cross-record transaction API. An editable project note cannot substitute for an immutable receipt. Do not add fields, write private workspaces or reuse its general MCP token as recipient authentication.
- Supported deployment: the source documents the existing Railway runner and requires explicit release/backup/cutover gates. The observed mounted production service is a real reuse candidate. Extending its schema/API, proving transaction/durability/isolation semantics, adapting its existing authentication origin and releasing it still need owner authorization and separate verification. No Companion source or production behavior was changed here.

Precise blocker: **no existing service/storage boundary has been authorized and verified for Weaver's immutable, atomic private invitation acceptance**. The unresolved decision is whether the owner authorizes extending the existing canonical PIXIE Companion for that purpose, identifies another already authorized existing backend, or keeps Weaver static. This is not a request to restore Google infrastructure.

## Minimal provider-independent storage contract

`services/weaverStore.js` owns the production selection boundary; `productionWeaverStore()` always returns unavailable in this revision. No environment variable, dynamic import, fallback directory or historical database argument can select a backend. There is no production adapter until an actual authorized service has been verified. Availability is not inferred from OAuth initialization. `services/atprotoAuth.js` continues to contain a historical OAuth scaffold; it does not silently connect that database to acceptance. Existing account/authorization rules are preserved without creating another authentication system.

| Operation | Required semantics |
| --- | --- |
| `getInvitation(recipientDid)` | Return the existing issued record or null, with no issuing/editing capability. Caller DID comes from an authenticated server session. |
| `getReceipt(receiptKey)` | Return a committed immutable receipt or null. Key binds invitation ID/version/recipient DID; the service rechecks identity fields before disclosure. Evidence references are not returned to recipients. |
| `transaction(operation)` | Run against a consistent invitation/receipt snapshot, serialize or detect conflicting changes, retry safely if needed, and resolve only after durable commit. Reject/roll back on callback, creation or commit failure. Tests do not prove a future adapter's durability. |
| Transaction `getInvitation`, `getReceipt`, `createReceipt(key, record)` | Recheck current eligibility/version/digest inside the atomic boundary; create-only unique receipt per invitation/version/DID. No update/delete/overwrite operation. Creation is awaited. Duplicate/concurrent attempts return the same committed event; failed commits cannot return success. |

Approval/verification remain in the existing issued-record schema (`id`, `did`, `status`, exact immutable `version`/`text`, digest-bound owner approval, separate reviewed named-person evidence references). No current collection name, provider or file path is prescribed. The service retains exact notice `discuss-v1`, text digest and explicit `accept_to_discuss` action. Receipt lookup after revocation/deletion remains private and independent of current invitation eligibility when authenticated access and a working authorized store exist. Only the authorized owner can view another recipient's invitation status.

`test/helpers/weaverStore.js` is synthetic only, shared by tests and the local browser verifier. It is not imported by production services, has `testOnly: true` and is rejected when `NODE_ENV=production`, even if injected directly. The production factory cannot load it or enable it from environment selectors. No process memory, temporary server file, browser localStorage or simulated response is deployed as durable storage.

When storage is unconfigured, all registered private Weaver routes return no-store HTTP 503 before reading identity/records, and capabilities stay false even if historical OAuth is configured. The UI and response use the exact message:

> Invitation acceptance is not available on this deployment. Nothing has been accepted.

A purely static review has no API; its 404/non-JSON/capabilities-false responses lead to that same UI state. There is no synthetic identity or acceptance success in the preview.

## Exact changed files

`.env.example`, `AGENTS.md`, `package.json`, `server.js`, `services/atprotoAuth.js`, `services/weaverAcceptance.js`, `services/weaverRoutes.js`, new `services/weaverStore.js`, `public/weaver/index.html`, `public/weaver-invitation.js`, generated `site/index.html`, `site/weaver/index.html`, `site/weaver-invitation.js`, `test/weaverAcceptance.test.js`, `test/weaverSession.test.js`, new `test/helpers/weaverStore.js`, `scripts/verify-weaver-browser.cjs`, `docs/BROWSER_RECOVERY_2026-10-20.md`, `docs/deployment/DUET_OAUTH_PRODUCTION.md`, this report, and the four current provenance specifications (`WEAVER_DOOR`, `OPEN_RESPONSE_PROTOCOL`, `VERIFIED_PROFILE_SYSTEM`, `ATPROTO_OAUTH_DEPLOYMENT`). No new workflow or dependency. No unrelated legacy game deletion.

## Preserved workflow and presentation

Only existing issued invitations are eligible. Unsolicited invitations/participation requests remain closed. DID/account control, named-person review, digest/version-bound approval and explicit acceptance remain separate. Social posts, inferred historical responses, verification or issue closure never constitute consent. Unknown evidence stays pending; confirmed mismatch excludes the account. Acceptance to discuss does not establish a relationship, historical agreement, legal terms, rights transfer/waiver or publication permission.

Retain recipient receipt recovery/download, session expiry/logout, sign-out race protection, same-origin JSON/session CSRF checks, cross-account isolation and sanitized failures. Automatic W Identity named-person verification remains disabled; the prior official-source assessment found no implementable authorized provider contract. A human badge is not named-person verification. Optional Germ still checks the documented declaration/permissions and recipient/sender order after a saved acceptance. No automatic sending, prefill, delivery/read status, notification or encrypted-conversation access is added. Earlier real-provider failures are historical observations, not fresh successful checks.

Weaver SVG, breathing/reduced-motion rules, approved Companion icon, Yellow Door destination, narrative, game sources and authoritative `public/style.css` remain unchanged. Only the unavailable status wording changes in the source entrance/script and generated copies.

## Verification and release state

Run existing `npm run check`, `npm test`, `git diff --check`, builder parity and the existing optional `scripts/verify-weaver-browser.cjs` (Playwright/Chromium supplied separately). Syntax checks now cover the acceptance/routes/storage modules. Storage-boundary tests cover concurrent duplicates, asynchronous create failure, commit failure/no false receipt, create-only immutability, recovery after revocation/deletion, wrong-account/owner denial, corrupted adapter isolation, unavailable endpoints/no legacy database reads and production refusal of test stores/environment selectors. Local result: `npm run check` and `git diff --check` pass; Node 22 test runner reports 56 passing entries (55 named tests and the shared fixture module load), zero failures. The local synthetic Chromium journey passes, including the exact unavailable wording, 320/390/820/1440 widths, simulated 200% text, Enter/Escape/focus and reduced motion. The final tested SHA, CI and fresh preview are recorded in PR #105 delivery metadata after upload. This correction starts from verified branch head `757fc17fad0b0e5f93973e6f29e3d4988d5f27bc`, which had not advanced at inspection.

Report evidence separately: local tests and synthetic browser journeys are not deployed-provider acceptance; deployed HTTP/source equality is not browser/device testing; real OAuth, live private storage, W provider and live Germ were not exercised in this correction. Physical iPad Safari and VoiceOver remain untested. No private user record was read or changed.

| State | Owner / next action | Done when |
| --- | --- | --- |
| Completed | Source correction and honest static review on existing PR #105 | Provider-independent service, fail-closed production factory, current docs/AGENTS, tests and preview are preserved |
| Blocked on one hosting decision | Owner states whether Weaver may extend the existing canonical PIXIE Companion, names another authorized existing backend, or remains static | Existing service and scope of authorization are explicit; no provider is chosen by inference |
| Proposed after that decision | Maintainer inspects the selected service's existing identity, persistence, transaction/isolation, backup/restore and retention contract before implementing a production adapter | Authorized target/evidence and release gates are documented, then synthetic integration proves committed receipts and isolation there |
| Unperformed release | Owner separately reviews the exact implementation/target and designated testers perform real-provider/physical-device checks | Relevant gates pass and explicit release authorization exists |

Safe to pause on the existing branch. Ask only for the hosting decision above after finishing this correction. Do not merge, promote production, change domains, provision services, modify real invitations, send messages or apply PIXIE's staged patch.

<details>
<summary>Historical handoff before the owner correction — Google-backend assumptions and setup directions are withdrawn</summary>

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

</details>
