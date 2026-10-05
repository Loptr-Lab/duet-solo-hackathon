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

## Next release steps
Finish reconciliation, run checks, merge the combined source, then approve one final Cloud Build revision. Record its source and serving revision in the production testing release card. Run two-player completion/reconnect, all eight PIXIE topics, mixed/off-topic fallback and keyboard/screen-reader tests. Resolve blockers before calling the build stable.
