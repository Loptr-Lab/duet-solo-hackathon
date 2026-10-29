# DUET browser-only recovery — 20 October 2026

## Preserved evidence

Cloud-era source baseline: `019172f9d3a2deab83c6cb73872f91d42d567921`.
The cloud runtime, `public/index.html`, server, Socket.IO, storage, authentication,
Dockerfile and dependencies are unchanged. Recovery is a separate static artifact
under `site/play/`, served by the existing GitHub Pages workflow under
`https://break.loptrlab.com/duet/play/`. The owner's Porkbun forwarding continues to
send `duet.loptrlab.com` to the Current State page; no DNS change is required.

The pre-Express standalone source at `3610d02504aeadf7ef7e453145c40da1867d1111`
was inspected, but its end-state check is a no-op. It is a historical artifact,
not a verified stable release to deploy blindly. The recovery restores the
browser-only experience using the later corrected local engine from the baseline.
It is not a full historical rollback and introduces no new game mechanics.

## Supported resources and boundaries

- Existing GitHub Pages, browser JavaScript, keyboard and pointer/touch input.
- Classic local two-player play; optional local minimax computer opponent.
- Locally synthesized audio cue and existing screen-reader announcements.
- Fixed PIXIE answers bundled locally. No model key, request or prompt storage.
- No remote rooms, login, Firestore, telemetry, persistent saves, payments,
  network speech input, Fog Mode or spectator controls in the recovery UI.
- Reloading clears the match. There is no installable offline cache; the page
  must first be loaded or saved. It has no runtime network dependencies.

The cloud sources are inputs, not edited runtime targets. The builder extracts
only local markup/engine and fixed help. A content security policy blocks network
connections and external scripts/assets. The recovery adds new-game controls and
guards end-state moves/turn messages in the generated engine only.

## Verification

Run `python3 scripts/build-browser-recovery.py` and
`node --test test/browserRecovery.test.js`. The original six checks cover network independence,
local turns/restart, blocking and Death protection, a veiled-Rebirth game ending,
post-game move rejection, computer reply and local help. Desktop Chrome UI tests
confirmed typed moves, turn handoff, restart, computer reply and fixed help.
These checks do not establish full-match human acceptance, iPad performance or
independent screen-reader accessibility. No earlier build is labeled stable.

## Rule for continued development

Add only features supported by this browser/static-hosting budget. Before adding
one, record its resource requirement and acceptance evidence here or in its issue.
A new server, paid service, remote multiplayer, account system or model dependency
requires an explicit owner decision. Preserve the baseline and existing accepted
rules; do not import proposed mechanics or change canon during recovery.


## Audio and keyboard accessibility test revision — 20 October 2026

Status: prepared on `test/local-audio-keyboard-accessibility`; this section does
not assert that the revision is deployed. The separate browser recovery is the
only runtime target. Cloud-era sources and game rules remain unchanged.

### Added for testing

- Responsive board up to 720 CSS pixels with larger piece tokens; the right
  history/instruction column is 280 CSS pixels and stacks below on narrow screens.
- A focusable, scoped board navigation control. Default arrows move its visible
  cursor, Enter selects an owned piece then a target, Escape clears selection,
  and R queries the current square. Tab exits normally. Typed moves still work.
- Remappable unique keyboard keys; settings last for the page session. Adaptive
  devices must emit keyboard events. No direct Gamepad API, TV-remote support,
  single-switch scanning, or device compatibility claim is included.
- Optional spoken move/error/square feedback, off by default, using only voices
  for which the browser reports `localService === true`. Voice enumeration can
  arrive late; use Refresh voices. If none qualify, speech remains off.
- Local voice selection, separate cue/speech volume, speech rate, repeat-last,
  stop-current-speech, and explicit voice/tone test controls.
- The existing generated proximity cue remains optional and has a volume scale.
  A short standalone tone helps check output without enabling continuous audio.
- Missing Web Audio or local speech produces text status and leaves gameplay
  available. Speech output replaces pending app narration to avoid a backlog.
- Screen-reader live regions remain. Keep app narration off with VoiceOver/NVDA
  to avoid duplicate speech. Device volume/mute and OS voice installation still
  apply. No microphone, recognition model, downloaded voice, server, account,
  analytics, or saved preference has been added.
- Removed the stale Speak Move instruction. Voice input remains unimplemented.

### Implementation choice and upstream resources

Native Web Audio and SpeechSynthesis cover this small test without adding a
runtime dependency. Candidate upstream projects were reviewed, not imported:
[Howler.js](https://github.com/goldfire/howler.js) for future recorded effects,
[Tone.js](https://github.com/Tonejs/Tone.js) for more elaborate synthesis,
[eSpeak NG](https://github.com/espeak-ng/espeak-ng) for a separately engineered
speech engine, and [Vosk Browser](https://github.com/ccoreilly/vosk-browser) for a
future recognition experiment. Browser voice locality is defined by
[SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).
A browser-reported local voice is not independently audited OS networking evidence.
The page CSP still blocks page-initiated network connections and external assets.

### Reproduce automated evidence

Run, from the repository root:

```sh
python3 scripts/build-browser-recovery.py
node --test test/browserRecovery.test.js
```

All 13 Node VM checks passed during preparation. The seven additional checks cover
keyboard completion of e2–e4, boundaries/cancel, unique remapping and Tab escape,
held select/modifier handling, default-off speech and remote-voice rejection,
bounded independent preferences/stop, missing-audio fallback, and cue gain/mute.
Voice/audio API doubles validate program behavior, not audible sound, voice
availability, browser accessibility trees, or hardware performance.

### Hands-on acceptance checklist — results pending

Tester records device, OS/browser version, assistive technology, input hardware,
date, steps, expected/actual result, and the tested commit in a GitHub issue.

1. Load the recovery page over HTTPS. Confirm no audio starts automatically.
2. Expand Audio and spoken feedback, select Refresh voices, and enable narration
   only if a local voice appears. Test voice; change voice, volume, and speed;
   stop/repeat; query e2 and play e2e4. Confirm spoken results match visible text.
3. With app narration off, repeat using VoiceOver on iPad/Safari and a desktop
   screen reader. Verify names, live announcements, history, and Tab escape.
4. Toggle proximity audio, test the short tone, change cue volume including zero,
   and mute. Check speakers/headphones, device mute, and an audio interruption.
5. Tab to Navigate board. Select e2, navigate to e4, select; test invalid moves,
   cancelling, all board edges, and the computer's turn. Verify no focus trap.
6. Remap keys, reject a duplicate, cancel mapping with Escape or Tab, restore
   defaults, and verify refresh resets settings. Repeat with an adaptive device
   configured to emit keyboard keys, if available.
7. Check 390px portrait, 820px tablet, and wide layouts; 200% zoom; contrast,
   larger pieces, visible cursor and focus. Confirm no clipped control labels.
8. Simulate no installed local voice or missing Web Audio. Confirm graceful
   fallback and continued moves. TV and controller hardware remain untested.

Do not mark independent accessibility acceptance complete until those results
exist. No separate paid service or model API is required for this test revision.


## Weaver access restoration — 29 October 2026

Owner requested restoration of the Weaver entrance with access to Duet on the same site. `scripts/build-weaver-site.py` publishes the preserved `public/weaver/index.html` at `/duet/` and `/duet/weaver/`, with links to `/duet/play/` and the retained status page `/duet/review.html`. The game links back to the Weaver. The existing Break This Build landing page also links to the Weaver. The Pages workflow now includes the Weaver source and builder, preventing future omission. No cloud runtime, game rules, remote service or DNS configuration was changed. Direct public-host checks are blocked by this execution environment's proxy; local published-layout navigation and the existing browser recovery tests are checked before publication. GitHub deployment status is separate from verification of Porkbun forwarding.


## Weaver readability correction — 29 October 2026

Owner reported small text and requested review for readers over 40 and people with low vision. The Weaver's existing 16px body and 11–14px labels/controls were replaced with a scalable 125% root and 1rem minimum reading/control text (20px at standard browser settings). Normal tracking and sentence-case labels, stronger heading weight, comfortable leading, bounded paragraph widths and reflowing cards replace dense small presentation. The existing source page and both generated entrances share these changes; game rules and controls are unchanged.

Local Chromium checks pass at 320/390/640/820/1440 CSS pixels; 200% text enlargement at 320px has no horizontal page overflow. Checked visible keyboard focus, Weaver/game return links, guide control and reduced motion. Representative body, muted, gold-label, card and button foreground/background contrast pairs exceed 4.5:1. All 13 browser-recovery checks pass. This is implementation verification, not independent low-vision acceptance; physical iPad Safari, VoiceOver and public-domain rendering remain unverified because the environment blocks those hostnames.


## Weaver brand correction preview — 29 October 2026

Extends review/weaver-low-vision ce2e27bec201fb8a9b540d31b50bccea5b62f012.
The actual supplied /duet/ Vercel HTML was retrieved (HTTP 200) and compared with
public/weaver source and builder output. Existing current-main game routes retained.
Applied the retrieved Loptr Lab Design Bible's near-black/neutral/sans/gold identity
with Material semantic roles, scoped adaptive layouts, shared spacing and focus.
Moved embedded Weaver presentation into public/style.css; the existing builder
copies it byte-for-byte to site/style.css and fixes source/alias hrefs. Added that
source CSS to the existing Pages path trigger. Game code and narrative are unchanged.
Kept 20px reading/label/control defaults; fixed inherited 14px card prose. Reduced
empty hero height and removed gold-tinted surface fills. Added skip focus and Escape
close/focus return for the existing fixed informational PIXIE panel. No new AI,
login, response form or participation system.

Verified locally: existing syntax checks and all 37 Node tests passed; four widths
320/390/820/1440 at normal 20px and simulated 200% root text (40px) had no page
overflow. Keyboard skip and PIXIE open/Escape passed. Representative text/background
contrast pairs: neutral/void 15.44:1, neutral/panel 13.83:1, supporting/void 8.88:1,
gold/void 9.24:1 and gold/panel 8.28:1. These are sampled pairs, not full certification.
Physical iPad Safari and VoiceOver remain untested. Publication requires preview review.

## Proposed private invitation flow — PR #105, 29 October 2026

Continues from f135c4ddd5eb100c89533241635c0e0a47a66af6 on review/weaver-low-vision. The older staged readability work remains untouched in its original worktree. Current owner instructions supersede unsolicited registration and the read-only-helper restriction only for the private issued-invitation pathway; see the current contract in docs/provenance/WEAVER_DOOR.md.

Implementation checks: npm run check and all 48 Node tests pass. New synthetic tests cover pending/unapproved/mismatched/stale invitations, exact-text digest binding, duplicate/concurrent acceptance, storage failure/retry, session/CSRF/owner denial, provider outages, every Germ permission state, follow direction, malformed destinations and unreachable handoff. Opening/retrying Germ performs no acceptance write and records no sending/delivery status. No real identity evidence or invitations were read or modified by these tests.

Local Chromium checked static unavailable-backend behavior at 320/390/820/1440 CSS pixels, enlarged 200% text at 320px, keyboard Escape/focus return and helper controls. A separate synthetic mocked-backend browser test checked signed-out UI, exact text rendering without HTML execution, storage failure, receipt only after confirmation, Germ retry and removal of unavailable links. Sample text contrast and supplied mark's reduced-motion fallback pass. Static previews never contain those synthetic backend responses. Authoritative CSS/JS copies and both generated aliases match the existing builder. The exact owner-supplied Weaver SVG is distinct from the pinned, unchanged Companion image; the owner-supplied Yellow Door link is retained.

Unverified operational requirements: configured OAuth origin/key and backend, private Firestore access rules and approved versioned records/evidence, qualified named-person review, W Identity provider support, current owner Germ declaration (request returned HTTP 403), destination/device acceptance, physical iPad Safari and VoiceOver. Preview deployment metadata and exact final commit are recorded in PR #105. No main merge, production promotion, DNS change, real invitation modification or message sending is authorized.


## Weaver resumed review — 29 October 2026

Continued PR #105 from `2f15eeec81de0aad4835d4a4025e6d7ecdd05b83` without branch advancement at initial inspection. [Operational report](deployment/WEAVER_STAGING_REVIEW.md) records the current files/behavior, 51 passing tests, local browser journey, hosting inspection, official W provider assessment and blocked live gates. Public owner binding was freshly verified; owner OAuth, Cloud Run/Firestore configuration, live Germ, physical Safari and VoiceOver remain unverified. Static review does not save acceptance. No production or real invitation change occurred. Exact uploaded source SHA and fresh preview are recorded in PR #105 delivery metadata.

Tested resumed implementation: `703d4ee12483a9283ef5642aec96bcf64b7efefd` (51 tests plus local Chromium). The operational handoff commit changes documentation only.
