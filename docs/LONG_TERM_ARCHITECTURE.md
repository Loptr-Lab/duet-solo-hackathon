# DUET long-term architecture direction
Recorded October 5, 2026. Proposed development direction; no host migration,
production setting change or new runtime integration is implemented by this document.

## Evidence and origin
BUILD_PLAN.md explicitly selected Cloud Run/Google Cloud and Gemini for the earlier
Build with Gemini XPRIZE submission plan. This is evidence of the project's planning
choice, not independent verification of official contest requirements.

Current main uses Node/Express/Socket.IO, @google-cloud/firestore and AT Proto OAuth
packages. PR #67 is merged: PIXIE selects fixed answers without a model call. Keep Gemini
credentials absent; deployment of the integrated source remains unverified.
Firestore stores rooms, logs and auth/session/profile data; player PDS saving is not
implemented. No Anthropic API/SDK integration was found in inspected runtime code.
Claude references in design documents are drafting prompts, not game dependencies.
No Firebase SDK or Firebase Hosting deployment was established by this inspection;
Firestore is the database actually referenced by the server.

## Recommended direction
Keep the existing production host while obtaining real-client acceptance evidence.
Build a portable authoritative game server and player-owned AT Proto records. Choose
hosting by demonstrated reliability, operating burden and cost, not hackathon branding
or an assumption that Xbox requires Azure. No provider is declared cheaper without
measurements of this workload and current entitlements.

| Layer | Target | Immediate boundary |
| --- | --- | --- |
| Rules/game authority | Deterministic engine behind the existing client contract | One authoritative outcome; do not require an LLM |
| Live multiplayer | Portable Node container, explicit room ownership and recovery | Host can change after testing; PDS is not a live game coordinator |
| Durable player game records | Player's resolved PDS with specific OAuth permission | Public sanitized records, disclosure and consent; implementation pending |
| Operational storage | Adapter for room/auth/cache data; retain Firestore initially | Add a Postgres adapter only with parity, backup/restore and migration evidence |
| PIXIE help | Fixed answers integrated in source; human review pending | Owner merge exception recorded; deployment and acceptance require evidence |
| Community/training | Roomy onboarding/discussion plus GitHub issue/release evidence | Twelve channels provisioned; normal-member access pending; no automatic bridges |
| Xbox/Godot client | Separate platform adapter/proof with applicable GDK/console tooling | Hosting choice is independent; preserve M0 hardware/accessibility gates |

Decentralization comes from portable identity/data and replaceable services.
AT Proto is federated server architecture, not a requirement that all gameplay
runs peer-to-peer. Existing PDS providers can be used; operating our own PDS adds
backup, upgrade, moderation and recovery responsibilities and is not required
to save a player's records to their existing PDS.

## Reliability concern to resolve before scaling
gameNamespace.js has a per-process room cache and instance-local Socket.IO emits.
Firestore snapshots alone do not prove synchronization or atomic move ownership
across instances. Two players in one room can land on different replicas; session
affinity follows clients, not a shared room. This is a source-derived risk, not
evidence that a particular production match failed.

First verify the actual serving configuration privately and exercise reconnect,
revision restart and simultaneous moves. Establish a supported pilot capacity and
room-ownership strategy. Before multiple replicas, add cross-instance event delivery
and serialized/atomic room updates (or explicit routing to one room owner).
A broker alone does not prevent conflicting moves. Do not assume moving to Azure
fixes this application-level requirement.

Cloud Run supports WebSockets but request timeouts and best-effort affinity make
reconnect and state synchronization necessary. Azure Container Apps also supports
WebSockets/affinity; it still requires a correct application design.

## Host alternatives and decision criteria
| Option | Reason to evaluate | Condition before adoption |
| --- | --- | --- |
| Current Cloud Run | Already deployed; avoids a simultaneous infrastructure rewrite | Verify timeout/reconnect, room ownership, durability, rollback and measured cost |
| Azure Container Apps | Managed container deployment; Microsoft operations/credits may fit | Prove same container, OAuth callback, storage adapter and reconnect behavior |
| Railway/container platform | Possible simpler deploy/DB operations for a small team | Verify actual WebSocket limits, region, backups/restore, pricing and portability |
| Managed VM/VPS | Explicit persistent server process and control | Assign patching, backups, monitoring and recovery ownership; avoid unsupported solo operations |

Use the same designated two-client match, accessibility, PDS write/readback and
restart/restore acceptance cases for any host evaluation. Migration must have a
rollback and reconciled writes; never allow two independent game authorities for
the same room during cutover. Move only if the pilot demonstrates a concrete benefit.

## Xbox conclusion
Azure is a valid backend option, not established as a prerequisite for this port.
Microsoft documents use of custom multiplayer/session services alongside Xbox
integration. Xbox invite/join, identity, privacy and accessibility requirements
still need platform-specific work. PlayFab can be adopted selectively if needed;
it must not silently replace the player-PDS ownership requirement.

Microsoft's public Godot sample currently describes Xbox on PC. It is useful
reference code, not proof that DUET has a working console build. Approved console
developers can use Godot console port providers; exact compatibility, access and
physical dev-kit evidence remain unresolved for DUET. Reverify those facts rather
than migrate the backend as a proxy for console progress.

## Development sequence
1. Confirm serving source/configuration, operator access/recovery, retention and
   backup/restore; use the production playtest packet for the current baseline.
2. Resolve live match/reconnect/storage defects before claiming stability; verify
   room ownership and capacity before horizontal scaling.
3. Deploy the reconciled #68/#67/#71 source only after owner build approval,
   verify the serving source, and test fixed help. Human rules/accessibility review
   remains pending under #69/#70 despite the owner merge exception.
4. Implement the player-PDS schema, identity/seat binding, save/readback, status,
   retry/export/delete slice in a separate reviewed code PR.
5. Establish operational storage interfaces and a tested restore path; evaluate
   Postgres portability without an immediate data migration.
6. Verify normal-member Roomy joining/posting and accessibility; finish sidebar
   grouping and use actual tester reports to choose fixes.
7. Resolve Xbox/Godot access/toolchain facts and test the applicable sample/hardware.
8. Evaluate Azure or another host only against measured reliability/cost/operating
   improvements. Keep existing production stable until the replacement passes.

None of these future steps are marked complete by documentation or CI alone.
PRs #68/#67/#71 are merged under the October 5 owner exception. Human review and
production acceptance remain unfinished; merging does not manufacture that evidence.

## Primary references checked October 5, 2026
- Cloud Run WebSockets: https://docs.cloud.google.com/run/docs/triggering/websockets
- Azure Container Apps ingress: https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview
- Xbox custom multiplayer: https://learn.microsoft.com/en-us/gaming/gdk/docs/services/multiplayer/overviews/multiplayer-intro
- Microsoft Godot sample: https://github.com/microsoft/XBOX-Godot-Sample
- Godot console support: https://godotengine.org/consoles/
- AT Proto architecture: https://atproto.com/guides/overview
- Public repository/PDS: https://atproto.com/specs/repository
- Self-hosting responsibilities: https://atproto.com/guides/going-to-production
- Railway backup/restore: https://docs.railway.com/guides/postgres-backups-restores

## Trial-expiry transition checklist
Do not treat remaining promotional credit as permanent hosting or as a monthly
cost estimate. Google documents that workloads stop when an unupgraded trial ends.

Before expiry, the owner records the exact billing deadline and resource/usage costs
privately, exports operational data and configuration without exposing secrets, and
checks restore capability. Compare keeping the current service with a paid billing
account/free-tier allowances versus a measured alternative. Free-tier eligibility
does not guarantee a zero bill; WebSockets, builds, image storage, network traffic
and Firestore retention/deletes must be included.

Do not click Upgrade, accept new paid terms or purchase another provider as part
of this documentation task. Owner financial approval is separate. Alerts-only
budgets are not hard spending caps; check actual eligibility/coverage before relying
on a spend-cap budget. Maximum instances alone is not a complete billing cap.

If migration is selected, first run the same container on the replacement with
verified room coordination, operational storage/auth settings, two-client match,
reconnect, restore and PDS tests. Plan the authoritative cutover and rollback before
changing production DNS or retiring the current service. Do not leave two writable
authorities for the same room. GitHub Pages can retain static/local gameplay and
instructions, but does not replace this app's Node/Socket.IO remote-game backend.

Billing references:
- https://cloud.google.com/signup-faqs
- https://docs.cloud.google.com/free/docs/free-cloud-features
- https://cloud.google.com/run/pricing
- https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps
