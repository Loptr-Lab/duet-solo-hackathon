# DUET release state and owner exception

Updated October 30, 2026 (Europe/London).

## Live Railway demo — October 30, 20:10 London

[Play the multiplayer demo](https://duet-multiplayer-production.up.railway.app).
Railway deployment `f3f92daf-60a5-4cb7-a807-3944910d7bf8` succeeded, pinned to
`7a1e8b81ae4b59e30030c2acf46009730867effc`. Public `/api/runtime` returned that
SHA and `memory-demo`. Dockerfile.demo built successfully. Configuration: one
replica, 0.5 GB memory limit, one vCPU, sleep enabled, 10 rooms and 30-minute idle
expiry. No existing service, subscription, DNS or pending project change was altered.

Public simulated-client WebSockets passed anonymous creation/joining in two
rooms, synchronized state, wrong-turn/illegal-move rejection, invalid-token
rejection, disconnect/rejoin, a completed 34-move game and post-game rejection.
The second room received no first-room move broadcasts. The served page exposes
the remote entry and rules without the stale outage splash. These are not
physical-device, visual-browser or independent accessibility acceptance results.

The owner authorized this metered deployment despite the account warning, to
observe usage before the subscription ends November 18. Screenshots showed
$0.26 current usage against $5 included. An initial runtime snapshot showed
0.0171 GB RAM and 0.0039 vCPU; the one-hour average includes time before launch
and must not be used as an operating-cost estimate. Actual incremental charges
and account-wide billing impact remain unverified. No renewal was performed.

Not submitted. Physical-device acceptance and entrant/project qualification
remain open. The historical preparation note below records the earlier state;
this live record supersedes its deployment status. Current-state page source is
updated in PR #106; publication on the existing Pages site awaits merge.

## Handshake multiplayer preparation — October 30

PR [#106](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/106) adds an
explicit, bounded memory-demo runtime for the existing Node/Socket.IO server.
The initial PR head passed GitHub CI and all 40 local tests, including real local
WebSockets in two rooms, token recovery, expiry and a completed 34-move game.
Follow-up preparation makes the demo's remote-play entry and rules visible,
labels its inputs and adds deployment/submission instructions. All 41 local tests
passed after those changes. Final-head CI must
be checked separately; automated clients are not physical-device acceptance.

**Not deployed or submitted.** No public multiplayer URL or account-specific
no-additional-cost hosting has been verified. The static recovery remains local
play. Do not use its URL as evidence of separate-device multiplayer.

Use [the demo run instructions](MEMORY_MULTIPLAYER_DEMO.md) and
[Handshake submission draft](HANDSHAKE_SUBMISSION_2026-10.md). Continue hands-on
acceptance under #70; no replacement assignment is created. The official-rules
PDF deadline is October 30, 11:59 p.m. PT (October 31, 06:59 London), earlier than
the mission screenshot. Entrant eligibility and OpenAI-mission qualification
remain unconfirmed; code completion does not establish either.

## Browser recovery accessibility testing

A separate static recovery serves local Classic play after the cloud trial ended.
The audio/keyboard test revision is prepared on
`test/local-audio-keyboard-accessibility`; branch preparation is not deployment
or independent accessibility acceptance. It adds optional local-voice narration,
audio controls, remappable keyboard board input, and larger board/pieces.
All 13 focused Node VM recovery checks passed during preparation. Audible output,
iPad/VoiceOver, adaptive hardware, and TV/controller acceptance remain pending.
See [the recovery record and test checklist](BROWSER_RECOVERY_2026-10-20.md).
The historical cloud release record below is retained as evidence, not a current
claim of cloud availability.

## Historical cloud release record — October 5

## Authorization
On October 5, 2026 at 07:55 America/Chicago, the owner explicitly authorized an exception to the merge hold on #68/#67/#71 and requested the changes needed to continue development. This waives the merge prerequisite; it does not establish completed external review, accessibility acceptance, Xbox approval or a production deployment. Review evidence remains pending under #69 and hands-on results under #70.

## Evidence boundaries
- Automated checks are developer evidence, not a real-client or accessibility acceptance result.
- Production source, traffic, persistence, posting and authentication require current operator evidence.
- Player-PDS game saving remains unimplemented. Signing in does not create game records.
- Xbox/Godot access, hardware deployment and platform acceptance remain separate unfinished gates.
- No reviewer/date should be filled in without actual review. No invitation is sent by merging documentation.

## Integrated changes
- #77: splash navigation, Get involved beside remote play, breathing sigil preserved.
- #68: operations handoff and owner exception; merge `359edb3f05bf128180d519a9596ce1a62c6a14ef`.
- #67: fixed PIXIE endpoint and tests; merge `ac6883282f053464b04ef4119a7b8e5505cd7e48`.
- #71: mission/contributor terms and pinned review packet; merge `daae2661b1a6de224091c672be573e4d6fb5cd7b`.
- #75: reconciled production testing, PDS requirements, verified Roomy setup and architecture direction. Confirm its merge and final main SHA in GitHub before selecting a build.

## Validation
The reconciled runtime passed syntax checks and all 21 local automated tests. GitHub CI on #67 head `e4c15873112282151e120c4c613084416cb253fb` completed successfully. These are source checks, not production, screen-reader, PDS or Xbox acceptance.

## Next release steps
Select one final combined main source and approve only its Cloud Build revision. Record its source and serving revision in the production testing release card. Run two-player completion/reconnect, all eight PIXIE topics, mixed/off-topic fallback and keyboard/screen-reader tests. Resolve blockers before calling the build stable.
