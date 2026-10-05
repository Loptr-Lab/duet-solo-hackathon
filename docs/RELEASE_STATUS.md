# DUET release state and owner exception

Updated October 5, 2026 (America/Chicago).

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
