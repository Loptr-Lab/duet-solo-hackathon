# Codex working instructions — Duet

Read CONTRIBUTING.md, docs/RELEASE_STATUS.md, docs/PRODUCTION_PLAYTEST.md, docs/BROWSER_RECOVERY_2026-10-20.md and relevant current source before proposing changes. Respect any more-specific project instructions. Confirm source-of-truth paths and deployed state; do not infer that historical/cloud components are running.

## Non-negotiable workflow
1. Audit existing files, tests, branches, documentation, reusable components and current services **before** creating a file, module, repository, dependency, integration or automation. Reuse and repair the current solution; avoid duplicates.
2. Work on a review branch; do not change, merge, deploy or publish to main/production without explicit maintainer approval. Preserve the stable offline recovery and production post-mortem.
3. Report baseline, changed files, tests, limitations, and a readable diff **before** requesting permission to merge. Do not claim a test ran if it did not.
4. Keep code and configuration minimal. Use the existing web/JavaScript stack unless evidence justifies an architectural change. No external keys, model APIs, accounts, telemetry, persistence or cloud requirement in local recovery.
5. Treat contributor time and service credits as finite. Research narrowly; avoid speculative installations, sweeping refactors and repeated builds.
6. Accessibility is a release gate: keyboard, focus, screen reader, announcements, zoom/reflow, larger text and controls, contrast, touch and adaptive input. Independent screen-reader/iPad/hardware acceptance remains PENDING unless actually performed. Do not claim it as passed.
7. Follow project-wide design consistency: inspect the existing CSS architecture before touching styles; work toward one authoritative site-wide stylesheet, avoid per-page drift, preserve responsive board placement and keep the game board visible rather than pushing it down.
8. Keep privacy-first and open-source disclosures accurate. No personal data, secrets or third-party content introduced without review.

## Targeted prior-art review: Battle for Wesnoth (2026-10-26)
- References: https://wiki.wesnoth.org/Wesnoth_AI , https://wiki.wesnoth.org/Wesnoth_AI_Framework , https://github.com/wesnoth/wesnoth .
- Wesnoth demonstrates configurable, modular offline turn-based opponent behavior; this is **design prior art, not a dependency recommendation**.
- Duet already has a custom local minimax/alpha-beta computer opponent. Audit that implementation and its recovery copy before doing anything else.
- Assess whether candidate-move ordering, separated evaluation criteria, difficulty controls, deterministic seeded scenarios, bounded calculation time and regression tests would improve the current implementation. Implement only a measurable improvement on a dedicated branch, with no new language runtime or game engine.
- Verify both local two-player and computer modes, input announcements, error handling and keyboard operation; preserve existing game-specific rules and stable behavior.
- Never copy Wesnoth GPL source, art, music, maps, characters or WML/Lua implementations. A license and attribution review is required before any code reuse.
- The OpenAltFinder score was 55/100 on 2026-10-26; its metadata is discovery context only. Verify technical claims against official sources.
- Do not add the broader campaign/modding framework, server infrastructure or data sync as a consequence of this comparison.

## Acceptance checklist for any proposed AI change
- Existing recovery behavior and no-cloud guarantee remain intact.
- AI always makes legal moves under the active Duet rules; terminal states and special rules remain covered.
- Fixed board-state fixtures yield repeatable results; worst-case computation remains bounded and UI stays responsive.
- Two-player and versus-computer controls are clearly distinguished and keyboard/screen-reader announcements remain usable.
- Existing tests/build checks pass; record exact commands and results.
- Unverified physical-device and independent accessibility acceptance are clearly identified as outstanding.
- Provide a small reviewable PR and a regression/rollback path. No automatic merge or deployment.
