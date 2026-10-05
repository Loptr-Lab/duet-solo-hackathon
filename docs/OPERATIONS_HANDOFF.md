# DUET operations handoff

**Updated:** 2026-10-05 (America/Chicago)
**Scope:** Review and deployment ordering for fixed DUET help.

## Recorded evidence

Existing historical observations do not establish the currently serving source or configuration. Preserve operational evidence privately. Historical audit records did not establish operator intent.

On September 29, the owner [reported enabling Cloud Build approval](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68#issuecomment-5890922219) and rejecting a manual build while it awaited approval; nothing deployed. Reconfirm this setting before acting. A main push does not authorize deployment: owner build approval is separate from qualified external review, and an approved deployment can route 100% traffic.

On October 5, 2026 at 07:55 America/Chicago, the owner explicitly authorized an exception to the merge hold on #68/#67/#71 and requested the changes needed to continue development. This waives the merge prerequisite; it does not establish completed external review, accessibility acceptance, Xbox approval or a production deployment. Review evidence remains pending under #69 and hands-on results under #70.

## Key and configuration boundary

Keep `GEMINI_API_KEY` absent. The #67 integration replaces the old Gemini route with eight fixed answers and needs neither a model key nor a live-model test. Verify that the approved build contains this replacement. The earlier experiment is not a production fallback.

Before any merge or build approval, reconfirm the serving source, traffic, environment and secret-reference names, and trigger settings privately. Preserve required Firestore and AT Protocol configuration. Do not publish secret values, audit payloads, room codes, or reconnect tokens. Avoid partial `--set-env-vars` updates or rollback solely to recover historical values.

## Authorized integration and deployment sequence

1. Reconcile operations #68, fixed-help #67 and contributor terms #71 with current main under the owner exception. Preserve the current splash, breathing sigil and ecosystem routes.
2. Run syntax and automated tests, including exact help answers, mixed-input handling and simulated remote completion. Record failures and fix them before merging.
3. Merge the production testing, PDS requirements and Roomy documentation from #75; record PDS saving as unimplemented.
4. Approve only the final combined source build for deployment. A merge can queue a Cloud Build request; verify source SHA, trigger, configuration and serving traffic privately. Avoid approving superseded intermediate builds.
5. After deployment, record the actual serving revision/source and repeat real-client match, help/fallback and accessibility checks. Obtain external review as follow-up work; do not mark the review sheet complete without reviewers.
6. Continue the separate Xbox/Godot access and hardware feasibility gate. This browser release is not a console package.

## Remaining verification

Home page, create/join, spectate, a completed real-client match, announcements, focus/recovery, and Fire TV D-pad/VoiceView require observed results. The owner previously reported spectate working; this does not close acceptance.

DUET's two-player implementation is the rule authority. Review the exact eight answers against it. Veil duration and the already-Veiled piece entering Sanctuary while within opposing Radius need a move-by-move trace. No answer should assert a duration before reconciliation. Four-player Veiled Dominion lore is a separate authority.

**Status:** Owner merge exception recorded; external reviews and production acceptance remain incomplete. See [release status](RELEASE_STATUS.md) for integration evidence.
