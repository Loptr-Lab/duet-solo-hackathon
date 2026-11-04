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

## Approved Duet presentation continuity — November 4 follow-up

### Source and serving revisions

Owner supplied Safari screenshots establish the local recovery workspace as the continuity reference and show the inconsistent Railway entry. This is a presentation reference; it does not certify the reference's text sizes, target sizes or accessibility.

- `break.loptrlab.com/duet/play/`: generated `site/play/index.html`, extracted from `public/index.html` by `scripts/build-browser-recovery.py`. The Pages workflow assembles `site/` under `_site/duet/`; its latest successful run [41700038244](https://github.com/Loptr-Lab/duet-solo-hackathon/actions/runs/41700038244) and Pages deployment `7528040946` identify main `5acdffa1fcb56eefe026918ad4a62afdb1ee3c00`. Pages API confirms CNAME `break.loptrlab.com`.
- Railway multiplayer: deployment `f3f92daf-60a5-4cb7-a807-3944910d7bf8`, service `22ca04fc-1e20-454f-81b3-2d93f1742bef`, project `1a8b9509-3376-4593-ad3f-482eeb548261`, production environment `4445d5ff-3168-4f47-b769-f80bf5701d06`. Railway's source configuration and deployment metadata pin `feat/memory-multiplayer-demo` at `7a1e8b81ae4b59e30030c2acf46009730867effc`, using `Dockerfile.demo`, one replica. Observed deployment state was SLEEPING; no restart, wake/deploy command or configuration mutation was performed.
- These are control-plane serving revisions. Direct HTTP to both public domains returned proxy-policy 403, so live HTML/CSS equality could not independently be checked here. They must not be described as tested current response bodies.
- Existing dependencies are still [CSS #110](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/110), head `1d607ad93a7e05b2396ff181325ff5773c4acdee`, and this [onboarding #112](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/112), previously `3c48a4a5b5b8881f2ffd72d2fb05ac3d8c4ba031`, stacked on #110. No successor was needed. No AGENTS.md was found. README, CONTRIBUTING, deployment/build/tests and the canonical Design Bible were read. No prior unpushed patch was assumed.

### Root cause and source correction

The deployed demo predates #110/#112. Its `demoPage.js` replaces the regular entry with a separate, padded splash layout and two competing headings. It injects `/interaction.css`, but that file does not exist in the deployed Git tree. `Dockerfile.demo` copies `public/`, and Express serves that directory, so a stylesheet absent from that tree cannot be served by the package. Unscoped action links therefore fall through to browser blue/purple defaults. Meanwhile recovery had its own wide-board layout and CSS overrides, and remote retained fixed 46px board tracks. Deploying only a regenerated recovery page would not fix the demo.

The correction extends the existing #112 branch and reuses #110's `public/style.css` authority. Local/remote workspace roles replace recovery-only geometry; boards use fluid eight-column tracks. Small game text is raised to the 20px baseline. The existing builders regenerate `site/play/index.html`, `site/style.css` and `review-site/style.css`; generated output is not edited independently. `public/interaction.css` is a historical input already consolidated by #110; the demo now loads the existing public stylesheet through the source document. Docker configuration and COPY instructions need no change. Regression checks fetch every stylesheet linked by the running demo, verify HTTP 200/CSS content type/source equality, and verify that the Docker public copy includes it. This catches the missing-file failure at the package boundary.

### Approved visual roles and mode-specific exceptions

Use the existing canonical [Loptr Lab Design Bible](https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/docs/design/DESIGN_BIBLE.md): near-black workspace, readable neutral text, restrained gold signals and reduced-motion fallbacks. Gold marks signals, links, action boundaries and selected states rather than large filled panels. Preserve artwork, token forms and board structure. The Weaver prefix of the shared stylesheet and Weaver #105 sources are unchanged.

Both modes use the name **Duet**, with explicit **Local two-player** and **Remote multiplayer demo** labels. One heading identifies the game. Instructions and state sit beside the active workspace. Buttons, inputs and disclosure summaries use at least 56px heights; compact phone boards retain the large typed-move route and local keyboard navigator. The eight-square game geometry is not converted into a Material layout. Board squares remain smaller than 48px at phone widths, and physical selection accuracy is unverified.

Remote entry offers one primary **Set up a room** action. Room setup offers **Create room** and a secondary join disclosure with a visibly labeled room code. Opening Join makes Create secondary while Join is the current primary action. Initial keyboard focus lands on Create room instead of attempting to focus a field inside a closed disclosure. There is no automatic claim that remote play starts without room/seat selection.

After setup the remote view exposes room identity, turn/seat state, the broad board, move history, input options, labeled move input and cancellation. Enter submits one move; repeated Enter is ignored; Escape cancels selection and clears input. Completion focuses a heading so held Enter cannot trigger another session. **Set up another room** explicitly disconnects the completed session before fresh room setup, respecting the existing server guard against creating two rooms on one socket. This is a new-room flow, not a reset of the opponent's match. Rules, capacity, room isolation, reconnect-token handling and server expiry are unchanged.

Participation, training, project context, full rules and temporary-match disclosures remain secondary. A refresh can rejoin only while that room survives; idle expiry/process loss clears the match. There is no durable persistence, demo feedback collection or verified VOX game-key mapping/holds. All normal/visited links use authored colors; hover/focus remain distinguishable. Browser privacy masks visited computed styles, so visited styling is checked in the source rules separately.

Readable UI text defaults to at least 20px, body line height 1.6, paragraph gaps 2em, prose below 80 characters, and responsive wrapping. These are project requirements. Existing official Material Web/W3C references above are interface references; the change does not establish full AAA or Material conformance.

### Verification and captures

Run the existing builders, `npm run check`, `npm test`, `scripts/verify-handsfree-browser.cjs`, and new `scripts/verify-presentation.cjs`. Supply Playwright/Chromium externally via `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH`; `DUET_LOCAL_URL`, `DUET_REMOTE_URL` and `DUET_CAPTURE_DIR` select the locally staged endpoints and capture directory. No dependency or lockfile changed.

43 Node tests pass, including real local WebSockets, separate rooms, expiry, seat reconnect, completed matches and the new package-stylesheet regression. Existing hands-free Chromium script passes 34-move local pointer and keyboard sessions, same-square/Escape cancellation, repeat guards, turn handoff and restart. This is ordinary-input emulation, not physical assistive-device evidence.

The new Chromium walkthrough uses two independent browser profiles against the actual memory-demo Node/Socket.IO server: create/join, first legal move/handoff, invalid move, pointer/Escape cancellation, repeat guard, reload/rejoin, full 34-move completion, completion focus and explicit fresh-room replay. It submits no reports or feedback. The layout audit covers entry, room setup, local input options, live remote workspace and both completion surfaces at 320/390/820/1440px, 200% text and spacing overrides separately and combined. Expanded disclosures are included in completed-workspace checks. Decorative board glyphs and screen-reader-only nodes are excluded from visible prose measurements; they retain separate semantics/device acceptance requirements.

Before/after captures below use matching 820×1100 and 1440×1100 viewports and the initial entry state. Before images are local renders of the verified deployment-source revisions above, not newly retrieved public-server responses. After remote workspace captures show a real locally staged two-profile room with White to move, with input details collapsed.

| Mode / width | Before | After |
| --- | --- | --- |
| Local / 820 | [capture](evidence/continuity-local-820-before-entry.png) | [capture](evidence/continuity-local-820-after-entry.png) |
| Remote / 820 | [capture](evidence/continuity-remote-820-before-entry.png) | [capture](evidence/continuity-remote-820-after-entry.png) |
| Local / 1440 | [capture](evidence/continuity-local-1440-before-entry.png) | [capture](evidence/continuity-local-1440-after-entry.png) |
| Remote / 1440 | [capture](evidence/continuity-remote-1440-before-entry.png) | [capture](evidence/continuity-remote-1440-after-entry.png) |

Remote board workspace after room setup: [820](evidence/continuity-remote-820-after-workspace.png), [1440](evidence/continuity-remote-1440-after-workspace.png).

Source corrections, local package/runtime HTTP tests and staged preview HTTP checks are separate evidence tracks. Physical MouthPad, VOX, iPad Safari, VoiceOver, independent participants and physical touch accuracy remain unverified. The Railway project has only production, so no live remote preview backend was provisioned. Static local play and remote visual captures can be reviewed in the staging preview; working remote-room behavior was verified locally, not deployed. No main merge/push, production deployment, configuration change or Weaver work is included.

Final local measured results: 112 combinations, 8,160 visible prose/label observations; minimum readable text contrast 8.57:1. A further 87 default/hover/focus action/link observations measured 9.24:1–15.44:1. Selected controls retain neutral text on #1a1a1a with a gold double boundary. Visited rules are authored and inspected, not falsely inferred from privacy-masked computed styles. Screenshots at both comparison sizes were inspected. No audit failure remains in these checks; physical and live-origin limitations above remain open.

The existing assembled hub walkthrough also passed after applying its established preview-only First Movement URL mapping. It exercised pointer/keyboard entry, legal move and handoff, local full completion, explicit Replay, cancellation, report-draft fields (GET intercepted before network), enlargement and reduced motion. Canonical source destinations were not changed. Final staging readback and exact commit are recorded in PR #112.
