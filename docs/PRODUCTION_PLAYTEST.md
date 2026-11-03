# DUET public production playtest
Prepared October 5, 2026. Loptr Lab builds in public. Test the actually serving
production game, report observed behavior, and keep proposed PIXIE features
separate from released functionality. A sandbox is optional developer evidence,
not a substitute for production playtesting.

## Release card: operator completes before inviting testers
- Test URL: https://duet.loptrlab.com/
- Cloud Run URL: https://duet-solo-hackathon-381121522073.us-central1.run.app/
- Serving revision, source commit, traffic, UTC verification time: Pending current verification.
- Previously reported revision: duet-solo-hackathon-00137-c98 at 100% traffic.
  This report alone does not establish the current source or configuration.
- Known issues, available sign-in/help features, posting enabled/disabled: Pending operator verification.
- Storage write/read evidence, TTL policy evidence and deletion contact: Pending operator verification.
- Test status: instructions prepared; production acceptance results Pending.

Record the deployed source from build/service evidence; do not substitute main,
a merged PR or the newest branch for the serving revision. Attach this release
card to each testing round. If traffic changes during testing, identify which
revision each result belongs to or repeat the affected case.

## Requirements and data notice
Two people use separate devices or browser sessions for a remote Classic match.
Include iPad Safari with VoiceOver and a keyboard/screen-reader tester; Fire TV
D-pad/VoiceView is a separate device case where available. Record OS, browser,
assistive technology versions and input method. Report blocked cases as Blocked,
not Pass. Local Fog Mode is not a remote multiplayer test.

Gameplay does not require AT Proto sign-in. A signed-in test is a separate,
optional case only when the operator confirms OAuth works on the serving build.
Do not request player passwords, app passwords or admin access.

**Signing in does not save a match to your PDS.** The implementation stores room
state and match logs in operator-controlled Firestore when available. Legacy
match logs contain room identifiers, reconnect tokens and move history; these
are not the anonymous feedback collection. Authentication/session and verified
profile records also use Firestore. Match-log player DIDs begin null; gameplay
does not connect its reconnect token to the OAuth identity.

Anonymous completed-game summaries and optional feedback are separate Firestore
collections. They have 30-day expiry fields in code; automatic deletion requires
an enabled TTL policy, which must be verified. Do not promise completed deletion
from a timestamp alone. Optional feedback can be skipped. Avoid personal or
sensitive information in feedback and public reports.

If project posting credentials are configured, a completed remote match can
trigger a short public result post through that project account. This is not a
full match archive or a record in each player's PDS. Before inviting testers,
state whether this is enabled and disclose/obtain agreement for public posting.
The current source has no per-player PDS game-record writer or retrieval path.
These code paths are not proof of successful production storage or posting.

## Player steps
1. Open the test URL supplied in the completed release card. Note the time and
   your device/browser/input method. Read known issues and the data notice.
2. Player A chooses remote play and creates a room. Share the room code privately
   with Player B, who joins from their own device. Confirm opposite seats, the
   same board and the same side to move. Never publish reconnect tokens.
3. Use the remote command box to submit a legal four-character move, for example
   e2e4 only if legal on that board. Both players check the new board, turn and
   move history. Attempt one illegal move: it must be rejected without changing
   the board or turn. Alternate turns.
4. Briefly disconnect one player and reconnect on the same device/session.
   Check seat recovery, board, history and turn. Also try a refresh; report
   precisely whether recovery works or needs a room/rejoin action.
5. Complete a real match. Both players should receive the same final outcome
   and be prevented from continuing the finished game. Record move count and
   any rule/announcement disagreement. Do not force a pass if completion fails.
6. With keyboard or VoiceOver, check reachability and labels of remote controls,
   turn/move/error announcements, focus after updates and reconnect, and the
   final result. Report exactly what was heard and where focus was lost.
7. Optionally submit a non-sensitive post-game rating/note after explicit
   consent; record success or error. Another tester skips it and checks that
   gameplay/result access is unaffected. A successful UI acknowledgement alone
   does not establish a durable storage write.
8. If AT Proto sign-in is available, separately sign in via your account's OAuth
   page, check /auth/me without sharing its identifiers, sign out, and confirm
   unauthenticated status. Play a match while signed in. Do not report PDS
   storage as passed: it is not implemented.
9. Follow the release card for PIXIE. PR #67's fixed answers and Outside Support
   page are merged in source; confirm the serving revision includes that merge
   before testing them. Check all eight topics, mixed/off-topic questions,
   Outside Support return and screen-reader focus/announcements. Record where
   help is available in local versus remote play. Compare answers against actual
   DUET mechanics and record disagreements. Keep Gemini credentials absent.
10. Open PIXIE ecosystem links and report broken destinations. Cross-project
    identity, private-context sharing and direct Creator publishing remain
    unconfigured; a working link does not establish those integrations.

## Report template
Copy this into [issue #70](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70)
for hands-on results, or a new issue for a reproducible bug:

- Test URL / serving revision / source commit (or Unknown):
- Date/time with timezone:
- Device / OS / browser / assistive technology / input:
- Case number / Pass, Fail, Blocked or Not tested:
- Steps, expected behavior, actual behavior:
- Was this a complete remote match? Outcome and move count:
- Screenshot or quoted announcement (redact room codes, tokens and account data):
- Did another player observe the same problem?
- Severity: game blocking, accessibility blocking, data loss, or other:

Qualified rules and screen-reader review goes in
[issue #69](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/69).
Public testing and product improvement are distinct from consent for research;
do not treat participation as research enrolment.

## Operator evidence and acceptance
Players establish real-client behavior; the operator verifies persistence.
Privately correlate a designated test match with room/match documents, ordered
move history and final outcome, then verify readback. Confirm anonymous summary
and consented feedback write/read separately, TTL policies and deletion handling.
Do not paste database documents, room tokens, OAuth sessions or credentials into
public issues. A match can succeed while detached telemetry/posting writes fail.

Minimum observations before declaring a round successful: two real clients
complete a remote match and agree on outcome; invalid moves do not mutate state;
reconnect preserves the authoritative match; required keyboard/screen-reader
paths work; storage/feedback and configured posting have evidence or are explicitly
marked unavailable. Report scope and unresolved failures instead of calling the
whole build stable from CI alone.

The owner waived the #67/#68/#71 merge hold on October 5; those PRs are merged.
Qualified review remains pending under #69/#70. Owner Cloud Build approval and
serving-source verification remain separate steps; after deployment, exercise
fixed help and repeat affected cases in production. This packet does not approve
a deployment or mark any review requirement complete.

## Player-owned records and community destination

Player-PDS saving is required implementation work and remains unimplemented.
See [the PDS contract and acceptance checklist](PLAYER_PDS_STORAGE.md). Current production
testers should record this gap, not expect an existing save-to-PDS control.

The existing Loptr Lab Roomy community has [DUET tester instructions](https://roomy.space/did:plc:f62tthd7cmjpfvtlet2crpsq/01M45Y6MA3S2M1ER3V3BD9KPNY)
and [training onboarding](https://roomy.space/did:plc:f62tthd7cmjpfvtlet2crpsq/01M45YA3TCEK75WZTFB86M5HQJ), with saved templates and topic channels.
Joining is invite-only; the owner sends invitations. A normal-participant join,
posting and accessibility check remains pending. See [setup status](ROOMY_ENVIRONMENT.md).
Copy actionable findings into the GitHub issues above; no automatic
Roomy/GitHub/PDS bridge is configured.

## Break This Build 2027 — hands-free protocol (prepared November 3, 2026)

Continue the existing #70 acceptance work; no new contributor assignment or outreach is issued. The first reproducible Duet case is the existing static local Classic two-player recovery at `/duet/play/`. It is not proof of separate-device remote play. First Movement is the separate Rhapsody browser slice at `/ren-rhapsody/play/` on the paired preview, or its canonical project URL after an approved publication. Preserve the Halloween 2026 retrospective and artist/AI boundaries.

### Vendor evidence and setup gate

Checked November 3, 2026: [Augmental MouthPad](https://www.augmental.tech/) describes cursor, clicks and dragging; [VOX](https://www.augmental.tech/vox) describes dictation through macOS/iOS, including microphone use in Mac apps and text insertion on iOS. The VOX page links its hands-free chess demonstration. That demonstration motivates these tests; it establishes neither game's compatibility. No inspected first-party instruction establishes browser game-key mapping, sustained key down/up, repeat semantics, latency, or an iPadOS VOX game setup. Those remain blocked pending vendor documentation and a consented physical setup. Do not confuse unrelated products named Vox with Augmental VOX.

[MouthPad onboarding](https://onboarding.augmental.tech/) recommends Chrome for its onboarding exercises. This is an onboarding recommendation, not game compatibility or a prohibition on separately testing Safari.

### Four device cases

1. **First Movement / MouthPad:** one cursor starts; selects a direction and Jump separately; recovers from a deliberately missed ledge; pauses/resumes; finishes; restarts. First reproduce the ordinary hold/capture barrier: hold Right with one pointer, move it over Jump, and observe Jump is not activated. In the reviewed optional click-to-move mode, click a direction to latch, click it again to stop, or click the other direction to switch; Jump is a separate click. Verify mode-off, pause, blur/page hiding, and restart clear movement. No two-pointer gesture is allowed for this test. Where Quiet Beat exists on its own reviewed branch, separately test Start, tap along, tempo change, Stop, and page-hide stop. Do not claim that branch is live.
2. **First Movement / VOX:** establish the supported OS/app/browser combination and activation method first. Log which discrete actions actually produce browser events, then key-down/key-up/hold and timing. Try Start, Pause, Resume and Jump before movement combinations. If timing or holding is unreliable, retain the barrier and replay with timing assist; record latency and whether it helps. Assist supplies the beat boost, marks assisted results and excludes them from the best-score record. It is not a voice mapper or proof of VOX playability.
3. **Duet / MouthPad:** two consenting players, with the hands-free player using one cursor. Start a two-player session, select a piece, cancel by selecting it again, make a legal move, hand off, recover from a mistaken selection, finish a real match, and restart. Report any assistance or extra input. Setup time, fatigue, rest and recovery matter as well as move completion.
4. **Duet / VOX:** after verifying browser key delivery, map navigation, selection/confirmation and cancellation. Start and finish a session, alternate turns, cancel a mistake, and restart. Hold Select: `KeyboardEvent.repeat` must not select or commit another action. After a move, try the previous side's piece; wrong-turn actions must not change the board/turn. Test fresh duplicate voice commands separately: they need not set the repeat flag. No one may infer support from an ordinary keyboard pass.

### Result register

Use **planned**, **tested**, or **blocked**, with the result/limit stated separately. Never use tested as a synonym for passed.

| Track | Status on November 3 | Environment / build / reproduction and limit |
| --- | --- | --- |
| Ordinary pointer, First Movement | tested | Linux, Chromium 154.0.8037.57, automated mouse at 820×1100; paired `review/ren-development-record` candidate. Existing `play/tests/browser.cjs` replays barrier fix, separate clicks, pause/recovery/5-fragment finish/restart and timing assist. Final commit is recorded in the paired PR handoff. Not human or MouthPad evidence |
| Ordinary keyboard, First Movement | tested | Same Linux Chromium; existing default keyboard/browser regression plus optional timing-assist jump. Default flow and timing-assist source are separate from verified VOX delivery |
| Ordinary pointer and keyboard, Duet | tested | Linux Chromium 154, static local recovery from current main `ad55c088...` (game source unchanged); `scripts/verify-handsfree-browser.cjs` plays the same 34-move complete sequence through DOM squares and native keyboard navigation, cancellation/repeat/turn/restart. Both seats automated; not two independent people |
| Ordinary controls, Quiet Beat | tested | Optional `review/quiet-beat` at `e471e6d`; isolated scratch Chromium review tested Start, tap feedback, tempo selection to 72 BPM and Stop. Tempo used browser select automation; not a physical pointer/device acceptance. Excluded from main and hub release artifacts |
| Ordinary physical iPad Safari, both games | blocked | No physical iPad/Safari environment; browser/OS/device versions unavailable, not guessed. Repeat the four paths when available |
| Physical MouthPad, each game | blocked | No device/firmware/paired host available; exact OS/browser and fit/setup to be recorded before following cases 1 and 3 |
| Physical Augmental VOX, each game | blocked | No device/app or verified key-mapping/hold configuration; vendor macOS/iOS dictation documentation is not a supported game setup. Cases 2 and 4 remain gated |
| VoiceOver, each game | blocked | No Apple/VoiceOver setup; record OS/browser/VoiceOver/device and spoken output separately when testing |
| Independent completion and consented device sessions | planned | No participant recruited or contacted; scope, input setup, assistance, recording and fatigue/rest preferences require agreement first |

For every run copy: date/time; planned/tested/blocked; observed result; URL and exact commit/build; OS/browser version; device/firmware/app; mapping and event/hold/repeat evidence; steps; expected/actual; setup duration and assistance; optional fatigue/rest/recovery observations; reproduction artifact; next test. Do not collect private voice recordings or health details by default. Participants may stop at any time. Any physical session needs consent, comfortable setup and a clear exit path; outreach is a separate decision.

### Reproduce ordinary-input checks

Use the existing static site builders and serve the assembled hub at port 8042, then run:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright CHROMIUM_PATH=/path/to/chromium DUET_TEST_URL=http://127.0.0.1:8042/duet/play/ node scripts/verify-handsfree-browser.cjs
```

The external browser tool adds no runtime dependency. Rhapsody's existing `play/tests/browser.cjs` remains its reproducible check. Neither browser script impersonates a physical device or mutates game state to reach the ending. Independent participants and actual iPad Safari, MouthPad, VOX and VoiceOver remain separate gates. Lead-search results belong only in the paired PR review handoff, not this public test surface.
