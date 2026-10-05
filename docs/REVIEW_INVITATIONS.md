# DUET external review invitations

**Status:** Ready-to-use invitations. Recruitment does not close #69/#70, authorize a merge, or authorize deployment. Record the exact source commit and answer-sheet blob in the packet before sending; reissue it when reviewed contents or commit change.

Current open review and contribution opportunities are voluntary and unpaid. Before work begins, agree in writing on scope, time, what will be public, credit preferences, and an exit path. You can stop at any point. Participation does not promise employment, ownership, revenue share, academic credit, or future pay. Any paid commission or other formal arrangement requires a separate signed agreement before work begins. External assistance or benefits belong to the participant and are not compensation from Loptr Lab.

## Version-pinned review packet — 2026-10-05

- Integrated #67 source commit: `ac6883282f053464b04ef4119a7b8e5505cd7e48`.
- [Exact answer sheet](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/ac6883282f053464b04ef4119a7b8e5505cd7e48/docs/PIXIE_LIVE_CHECK.md), blob `b16db809695b24ac46e7d0b313186f59cb28452c`.
- [Two-player server rules](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/ac6883282f053464b04ef4119a7b8e5505cd7e48/veiled-chess-core-server.js), [web implementation](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/ac6883282f053464b04ef4119a7b8e5505cd7e48/public/index.html), and [proposed help gate](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/ac6883282f053464b04ef4119a7b8e5505cd7e48/agentScope.js).
- Fixed-help implementation is integrated into main under the owner exception; this packet does not assert deployment or completed external review.
- Before a gameplay session, record the independently observed production source/build, client versions, scope/time, publication and credit preferences, consent, and exit path. Do not substitute this proposed commit for an unverified serving build.
- Reissue the packet if source or answer-sheet contents change, including after rebase. Record actual reviewer/date entries only after review. Do not send invitations without separate outreach authorization.

Return one verdict per answer (correct, incorrect, ambiguous), reasoning, relevant experience, release blockers, and the separate Veil/Sanctuary/Radius turn-by-turn trace. Record hands-on speech, focus, recovery, and fallback observations only against the build actually tested. Browser checks do not certify Fire TV.

On October 5, 2026 at 07:55 America/Chicago, the owner explicitly authorized an exception to the merge hold on #68/#67/#71 and requested the changes needed to continue development. This waives the merge prerequisite; it does not establish completed external review, accessibility acceptance, Xbox approval or a production deployment. Review evidence remains pending under #69 and hands-on results under #70.

## Rules review — issue #69

We are looking for a person with experience reviewing game rules; shipped design work helps but is not required. Review eight short DUET help answers against the two-player implementation at the packet's source commit. Mark each correct, incorrect, or ambiguous, with reasoning.

Separately trace a piece that is already Veiled entering its own Death's Sanctuary while still within one square of the opposing Rebirth. For each move, identify which player moves, the Veil counter before and after, whether Sanctuary blocks refresh, and when movement becomes unrestricted. The timer is not covered by the eight answers. Flag whether “restricted movement” explains enough for a player.

Receive an accessible document and reply by email to questions@loptrlab.com or on [#69](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/69). Return the answer verdicts, scenario trace, source commit, relevant experience, and any release blockers. Terms: voluntary and unpaid; agree on scope and time in writing first, and stop at any point.

## Screen-reader review — issue #70

We are looking for an experienced screen-reader user who plays games. Play a short guided two-player sequence on the current production build and review the eight proposed fixed answers separately from an accessible document. Deployment is unverified. Confirm the serving source before testing built-in fixed help or fallback; a baseline build without this integration cannot validate those controls.

Report confusing wording, unexpected game behavior, spoken announcements, focus or recovery problems, and possible rules errors. Return browser, OS and screen-reader versions, observed production build/source commit, separate answer-sheet revision, steps, observations, and release blockers. Reply by email to questions@loptrlab.com or on [#70](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70). Recording is optional and requires consent. Terms: voluntary and unpaid; agree on scope and time in writing first, and stop at any point.

Coordinate timing and consent before a production match: completion may publicly post a result to the-rift. Do not publish room codes or reconnect tokens. Fixed-help interaction checks remain open until the serving source is confirmed and the integrated help is exercised. Fire TV D-pad/VoiceView checks require observed device/emulator results; browser checks do not certify them.
