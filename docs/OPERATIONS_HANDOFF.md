# DUET operations handoff

**Updated:** 2026-10-03 (America/Chicago)
**Scope:** Review and deployment ordering for fixed DUET help.

## Recorded evidence

Existing historical observations do not establish the currently serving source or configuration. Preserve operational evidence privately. Historical audit records did not establish operator intent.

On September 29, the owner [reported enabling Cloud Build approval](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68#issuecomment-5890922219) and rejecting a manual build while it awaited approval; nothing deployed. Reconfirm this setting before acting. A main push does not authorize deployment: owner build approval is separate from qualified external review, and an approved deployment can route 100% traffic.

**External-review hold:** Keep #68, #67, and #71 in draft until qualified rules and screen-reader feedback has been received and triaged under [#69](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/69). Hands-on observations remain tracked in [#70](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70). CI, AI review, recruitment, and the October 16 checkpoint do not waive the gate. Eventual order: #68, then rebased/reviewed #67, then rebased/reviewed #71. No merge or production deployment is authorized by these documentation changes.

## Key and configuration boundary

Keep `GEMINI_API_KEY` absent. Existing main can send raw player text to Gemini when a key is attached. Draft #67 replaces this route with eight proposed fixed answers and needs neither a model key nor a live-model test. The earlier experiment is not a production fallback.

Before any merge or build approval, reconfirm the serving source, traffic, environment and secret-reference names, and trigger settings privately. Preserve required Firestore and AT Protocol configuration. Do not publish secret values, audit payloads, room codes, or reconnect tokens. Avoid partial `--set-env-vars` updates or rollback solely to recover historical values.

## Eventual reconciliation order

1. Obtain qualified external rules and screen-reader feedback and record its disposition under #69. Record hands-on results under #70; CI and simulated matches cannot substitute.
2. Reconcile and review docs-only #68 first. A main push may queue an approval-gated build. Merging does not authorize owner build approval.
3. Rebase/review #67 onto the resulting main, preserving this handoff and resolving README overlap. Check latest-head CI, exact answer text, and reviewer/date entries before an owner merge decision.
4. Deployment requires separate owner approval. After an approved #67 deployment, verify the serving source, all eight answers, mixed/off-topic fallback, and absence of the model key.
5. Rebase/review docs-only #71 last. Preserve mission and participation terms; consolidate README and Devpost wording against the actual implementation and verified serving state.
6. Reissue the version-pinned review packet whenever its reviewed contents change. Production gameplay review and proposed answer-sheet review are separate. Coordinate consent before production matches because completion may publicly post a result.

## Remaining verification

Home page, create/join, spectate, a completed real-client match, announcements, focus/recovery, and Fire TV D-pad/VoiceView require observed results. The owner previously reported spectate working; this does not close acceptance.

DUET's two-player implementation is the rule authority. Review the exact eight answers against it. Veil duration and the already-Veiled piece entering Sanctuary while within opposing Radius need a move-by-move trace. No answer should assert a duration before reconciliation. Four-player Veiled Dominion lore is a separate authority.

**Status:** All three PRs remain drafts. This document records no new production inspection, merge, deployment, external approval, or acceptance result.

