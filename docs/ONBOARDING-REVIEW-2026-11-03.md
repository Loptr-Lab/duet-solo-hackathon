# Break This Build 2027 — play-first onboarding review

## Scope, authority and dependency

Current Duet main: `5acdffa1fcb56eefe026918ad4a62afdb1ee3c00` (merged #111). Rhapsody main: `3893fc43006a6496f8fbab75a16c2b8c3adfab58` (merged #14). Inspected current main READMEs, contribution/MCP instructions, existing build generators, tests, four device cases, and public-route sources. No AGENTS.md exists in either fetched main tree. Current live routes could not be retrieved through the execution proxy/web reader; no live artifact equality is claimed.

Existing CSS PR #110 already provides the required presentation authority. It was refreshed with merged main at `1d607ad93a7e05b2396ff181325ff5773c4acdee` without onboarding scope; 42 tests pass on that refreshed tree. This successor is stacked on `review/centralize-duet-css` and must follow #110 through review. Public/style.css remains authoritative, with generated copies in site/style.css and review-site/style.css. Rhapsody reuses play/style.css, shared by its play surfaces. No new dependency, framework or stylesheet is added. Weaver #105 source, narrative, private response work, assets and runtime are outside scope.

Read the canonical [Loptr Lab Design Bible](https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/docs/design/DESIGN_BIBLE.md) and the existing [brand application](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/review/weaver-low-vision/brand-guidelines.md) as references; the latter is Weaver-scoped, not an authorization to change Weaver. Near-black, neutral text and restrained gold remain studio roles. Rhapsody retains its established cyan/pink scene palette and procedural artwork. Motion retains reduced-motion fallbacks.

## Flow and references

[UserOnboard: Front-Loaded User Value](https://www.useronboard.com/onboarding-ux-patterns/front-loaded-user-value/) informed the order: choose a game → check input options → play an actual move → replay or report. A tour, sign-in, feedback request or training enrollment is not a prerequisite. The two hub cards each have one primary Play link and a secondary record link; detailed evidence, Halloween history, AI disclosure and optional training remain supporting context.

[Material 3 cards](https://m3.material.io/components/cards/guidelines), [app bars](https://m3.material.io/components/app-bars/), [Material Web buttons](https://material-web.dev/components/button/) and [material-components/material-web](https://github.com/material-components/material-web) were design references, not installed dependencies. Material Web documents action labels, hierarchy, focus and theming; the M3 guideline reader required JavaScript, so a complete guideline-rendering review was unavailable. Native buttons, links, details and a native dialog implement the existing brand. This is not Material certification or a full accessibility conformance claim.

First Movement's Input options sit beside Start and remain reachable in play. Opening pauses a running game; Escape closes and restores opener focus, while Resume is explicit. Movement plus a consumed jump triggers one first-success announcement per run. Optional assists retain off-by-default and best-run rules. Stuck players can restart or follow the public report link; completion offers Replay and report.

Duet starts in local two-player mode. Selection, confirmation and cancellation are explained beside the board/navigation controls; a legal move triggers the handoff message. A completion heading receives focus so held Enter cannot accidentally activate Replay. Explicit Replay resets the game and keyboard cursor to e2. The optional computer and separate remote demo retain accurate labels and evidence boundaries.

Public GitHub report drafts ask for build/URL, browser/OS, input method, steps and expected/actual behavior. The browser walk intercepts the outgoing GET after validating its public destination and fields; no issue is submitted, no remote form loading is asserted, and no account is required to play.

## Verification record

- Existing builders, syntax and 42 Duet tests; existing First Movement native browser regression including five fragments, ending, default keyboard/touch emulation, audio recovery and optional assist/best-record checks.
- Duet hands-free browser regression: full 34-move pointer and keyboard sessions; cancellation, legal moves, repeat/turn handoff and restart. A new completion-focus regression caught and corrected automatic Replay under held Enter.
- `scripts/verify-onboarding.cjs`: both paths from the assembled hub, pointer/keyboard input options and first meaningful actions, pause/dialog/Escape, stuck restart/cancel, completion/Replay and public report handoff. No synthetic mutation of game state is used to claim completion.
- Widths 320/390/820/1440: no page overflow on hub or either game. Tablet captures inspected. Enlarged root text and reduced-motion media emulation are checked separately from physical-device acceptance.
- Measured sampled critical contrast: gold on #151515 8.28:1; gold on #050505 9.24:1; Duet text 15.44:1; Rhapsody intro text 9.50:1; cyan option text 14.22:1 and Start label 14.94:1. These are selected computed-color pairs, not every pixel/state.
- New action controls are at least 48px high. Dense Duet squares remain approximately 34.75px at 320px width; larger keyboard navigation and typed-move routes remain available. Physical touch accuracy and a complete accessibility review remain pending.

The four game/device cases remain unchanged: First Movement/MouthPad, First Movement/VOX, Duet/MouthPad, Duet/VOX. Ordinary Linux Chromium pointer/keyboard results are separate. Physical MouthPad, VOX, iPad Safari and VoiceOver remain blocked/unverified; VOX mapping/hold behavior remains pending. Independent human playtesting is not replaced by this onboarding check.

Serve the assembled static review with hub at /, Duet at /duet/, and Rhapsody at /ren-rhapsody/. With existing external Playwright/Chromium, run scripts/verify-onboarding.cjs using ONBOARDING_URL, PLAYWRIGHT_MODULE and CHROMIUM_PATH; optional ONBOARDING_SCREENSHOT_DIR controls capture location. Preview-only canonical link rewrites keep both reviewed candidates on the same staging origin. Source production destinations remain unchanged. Successor PRs record final commits, remote CI and exact staging artifact matches. Review before publishing; no main merge or production promotion is authorized here.
