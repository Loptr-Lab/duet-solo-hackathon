# Duet Azure transition and rebuild handoff
Recorded 2026-10-20. Status: PREPARATION ONLY. Owner requests Google Cloud → Azure and prefers rebuilding the application from scratch. This supersedes the earlier host preference, not the acceptance requirements.

## Verified access and source
- Microsoft SharePoint connector successfully reads the connected personal Microsoft profile and OneDrive. It does NOT establish Azure tenant, subscription, credits, resource permissions or billing access.
- OneDrive Duet search returned no relevant deployment/source package. The architecture lab is not production.
- Production source: Loptr-Lab/duet-solo-hackathon, inspected main 2667a8933e8febb258110c01f7fa1fd441516ca1.
- Node/Express + Socket.IO on port 8080, existing Dockerfile; /healthz checks HTTP only.
- server.js /api/agent returns bounded fixed answers from agentScope.js. No Gemini inference is needed. Keep GEMINI_API_KEY absent.
- Firestore dependencies: roomStore.js; services/storage.js; services/atprotoAuth.js and collection-based domain verification/invitations. Hosting-only migration leaves Google dependence in place.
- Live Google revision, billing deadline, database contents/TTL/backups, DNS control and Azure subscription are UNVERIFIED. No cloud resources, DNS, secrets, billing terms or production traffic changed.
- Earlier conversational claims that current Duet required Gemini were stale. Current source is not proof of the serving revision.

## Preferred rebuild
Build a fresh portable Duet implementation in a separate branch/workspace, using the existing two-player rules, client contracts, accessibility behavior and provenance as acceptance references. Do not replace it with the separate four-player canonical engine or silently overwrite the architecture lab.
Rebuild application code, not a foundation model. Preserve licensed content and attribution. Keep deterministic rules and the custom opponent independent of language models.

### Target architecture
1. Accessible browser frontend: keyboard/command input, screen-reader announcements, focus recovery, reduced motion and optional audio; preserve guest play.
2. Authoritative Node server with replaceable transport and storage interfaces. Azure Container Apps is the proposed runtime.
3. Portable PostgreSQL operational adapter, proposed on Azure Database for PostgreSQL after subscription/price validation. Separate rooms, versioned moves, profiles, auth/session state, verification and invitation records. Do not emulate the entire Firestore API.
4. Version-checked transactions and serialized moves per room. Start with one active game-server replica and one active revision for the pilot; no multi-replica claim until event delivery AND room ownership are proven. A rolling revision can still split rooms: drain and restart intentionally.
5. Keep fixed PIXIE help as the default and complete model-free gameplay/help during outages.
6. Player-owned AT Protocol game records remain required separate work; operator PostgreSQL is not a PDS. Preserve explicit permission/consent, identity-to-seat binding, save/readback, retry/export/delete contracts.

## Gemini replacement recommendation
For current help: no replacement model is necessary; fixed answers already replace Gemini.
For future optional narrative or explanation: evaluate Azure OpenAI gpt-5-mini through Microsoft Foundry behind an application-owned provider interface. It supports structured outputs, but must pass Duet-specific tests for grounded rules, latency, accessibility wording, refusal and cost. Deployment availability, lifecycle, quota, region and price must be checked in the actual subscription before provisioning.
Do not grant a model authority over legal moves, game outcomes, invitations, verification or consent. Bound request/output size, concurrency, retries and daily application usage; keep a deterministic fallback.
An open-weight model on dedicated Azure compute is a later alternative if measured usage/ownership requirements justify its operational and GPU cost. Training a foundation model from scratch is not part of this rebuild.
No prompts, keys or personal records should be placed in public source. Decide whether any optional inference is worth enabling at all after a usable model-free build exists.

## Google exit and data handling
Before losing access, inventory actual serving revision, Firestore databases/collections, auth stores, environment/secret reference names, images and deployment triggers privately. Export data securely with counts, checksums, timestamps and schema notes; test a restore. Never put exports, room codes, reconnect tokens, DIDs, emails, keys or session records in this repository or a public issue.
Select a cutover policy for active rooms (finish/drain or explicit restart); do not promise seamless transfer of live sockets.
Migrate needed durable records with idempotent scripts, verify counts and sampled semantics privately. Reconcile timestamps, merge/append semantics, transactions and expiration. Preserve the 30-day anonymous telemetry/feedback expiry as an absolute deadline; implement deletion and verify it. Reauthenticate users rather than copy short-lived OAuth/session credentials by default. Preserve invitation/verification decisions only where required and appropriate.
Test restore and deletion before production acceptance. Retain Google resources until approved cutover and write reconciliation; do not delete anything under this preparation task.

## Deployment and cutover checklist
- [ ] Azure subscription/tenant and operator identity confirmed; resource creation permissions, region, costs and any credit eligibility recorded privately.
- [ ] Google operational export and restore verified before trial-related data loss.
- [ ] New implementation preserves rules and existing routes/splash/ecosystem navigation or documents intentional differences.
- [ ] PostgreSQL adapters cover room, player, OAuth, domain-verification and invitation operations; persistence errors are observable rather than silent success.
- [ ] CI runs unit/integration tests and a real database round-trip/restore test. Docker build and deployment are verified in an available execution environment.
- [ ] Container Apps HTTP ingress/WebSockets, port 8080, startup/liveness/readiness, one-replica pilot, single revision and graceful draining configured and tested.
- [ ] GitHub Actions authenticates to Azure using workload identity/OIDC; runtime uses managed identity where supported; secrets transferred privately.
- [ ] Retain https://duet.loptrlab.com as canonical PUBLIC_URL and ATPROTO_BASE_URL. Verify client-metadata.json, jwks.json, OAuth callback, cookie, /auth/me and logout. Stage origin must use its own correct OAuth metadata.
- [ ] Two real clients create/join, move simultaneously, spectate, reconnect after network loss and restart, finish a match and reload durable results.
- [ ] Fixed help answers/fallback, keyboard/focus/screen reader, reduced motion and Fire TV D-pad/VoiceView checks recorded. Human acceptance is not implied by CI.
- [ ] Optional model integration tested separately; no Gemini key required.
- [ ] Cost baseline covers compute, database, logs, builds, image registry, network and optional inference. Budget alerts are not hard spending caps.
- [ ] Drain old writes, migrate final delta, verify Azure, switch DNS/TLS, record serving SHA/revision and observe.
- [ ] Rollback specifies the single authoritative writer and reconciliation of Azure writes; do not reactivate stale Google data as an independent authority.
- [ ] Only after acceptance and owner instruction, retire Google services and remove obsolete credentials.

## Access limitation
The available Microsoft connector operates files, not Azure Resource Manager. There is no callable Azure management connection and no usable local execution environment in this session. Source inspection and this handoff can proceed; Azure provisioning, database exports, executable rebuild tests and live cutover cannot be truthfully reported complete. Azure subscription access must be provided through an Azure-capable environment/integration; a OneDrive connection alone cannot do this.

## Primary references
- https://learn.microsoft.com/en-us/azure/container-apps/github-actions
- https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview
- https://learn.microsoft.com/en-us/azure/container-apps/sticky-sessions
- https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/structured-outputs
- https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy
- https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule
- https://cloud.google.com/signup-faqs

This document is a reviewable handoff, not deployed infrastructure, a completed rebuild or proof of Azure entitlement.
