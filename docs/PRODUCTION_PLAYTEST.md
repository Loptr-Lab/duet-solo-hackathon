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
9. Follow the release card for PIXIE. On the baseline build, record the actual
   help behavior/unavailability with Gemini credentials absent. Do not expect
   PR #74's fixed answers or Outside Support page unless the serving commit
   includes them. Once released, check all eight topics, a mixed/off-topic
   question, Outside Support return and screen-reader focus/announcements.
   Compare proposed answers against actual DUET mechanics; record disagreements.
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

Existing #67/#68/#71 external-review holds remain. Production playtesting can
proceed against the current serving build without merging them. The unreleased
PIXIE candidate must first complete required review, accepted fixes and owner
release approval; after deployment, repeat affected cases in production. This
packet does not approve a deployment or mark any review requirement complete.

## Player-owned records and community destination

Player-PDS saving is required implementation work and remains unimplemented.
See [the PDS contract and acceptance checklist](PLAYER_PDS_STORAGE.md). Current production
testers should record this gap, not expect an existing save-to-PDS control.

The [Roomy setup packet](ROOMY_ENVIRONMENT.md) defines DUET tester/feedback channels
and a Loptr Lab training-project area. Environment and invite URL are pending
owner authorization/provisioning. Until verified, report to the GitHub issues
above; no automatic Roomy/GitHub/PDS bridge is claimed.
