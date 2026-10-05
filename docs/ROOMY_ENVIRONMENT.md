# Loptr Lab Roomy environment
Prepared October 5, 2026. Requested environment: **Loptr Lab — Build, Play & Learn**.

## Provisioning status
- Roomy app: https://roomy.space/
- Setup account: selected privately by the owner; no identifier published here.
- Environment, channels, invite URL and moderation configuration: NOT CREATED / UNVERIFIED.
- Current blocker: owner authorization/provisioning has not been completed.
  Verify requested application permissions privately before accepting access.
- Second administrator: not confirmed. Do not invent or grant another administrator.
- This file is a copy-ready setup packet, not proof of an operating community.
- No Discord bridge, bot migration, automatic GitHub sync or PDS game storage is configured.

## Space structure
Use one community with DUET and training areas. If the current UI has no categories,
use the prefixes below as channel names. Prefer channels/pages supported by the UI;
do not claim unsupported roles, private channels or wiki features.

| Area | Channel/page | Purpose and initial content |
| --- | --- | --- |
| Welcome | start-here | Scope, public-data notice, participation rules, production testing packet |
| Welcome | announcements | Serving revision, changed behavior, known issues, testing rounds |
| DUET | duet-find-a-player | Arrange paired tests; share room codes privately rather than in the feed |
| DUET | duet-playtest-results | Case reports from the production packet; link to issue #70 |
| DUET | duet-bugs | Reproduction steps, expected/actual behavior, severity and GitHub issue link |
| DUET | duet-accessibility | Keyboard, VoiceOver, VoiceView and other input/announcement findings |
| DUET | duet-pixie-rules-review | Eight proposed help answers, qualified review and issue #69 |
| Training | lab-training-start-here | Pick a project, learning goal, issue and mentor/reviewer if available |
| Training | lab-project-work | One thread per project/task, repo/PR links and scope |
| Training | lab-help-and-pairing | Ask for help, pair on an issue, arrange a review |
| Training | lab-show-and-tell | Demonstration, evidence, feedback and the next learning step |
| Operations | community-requests | Report moderation/access problems; no credentials or sensitive case details |

Training projects can include DUET, PIXIE Creator OS/device stewardship, narrative
provenance, Violet's Revenge and other linked Loptr Lab repositories. Joining this
space does not grant repository write access, professional oversight or admin status.

## Copy-ready welcome
Welcome to Loptr Lab — Build, Play & Learn. We build in public.

DUET players: use the current production testing packet, find a partner, complete
a real remote match and report what happened. Include the serving revision,
device/browser, input method, assistive technology and Pass/Fail/Blocked status.
Gameplay and optional feedback do not require AT Proto sign-in.

Training contributors: choose one project and one task. Share your learning goal,
repository/issue, expected outcome and a small demonstration when ready. A named
mentor or reviewer is present only if that person has accepted the role.

Treat shared messages as community-visible. Do not post passwords, OAuth tokens,
reconnect tokens, private room codes, medical details or other sensitive data.
Ask before sharing someone else's identifying screenshots or private messages.
Product participation does not imply consent to research.

PDS game records are required future work, not live functionality today. Standard
AT Proto repository records are public. Signing into Roomy or DUET does not itself
prove your matches are saved in your PDS.

## Copy-ready DUET round announcement
Round / date:
Production URL:
Serving revision / source commit / verified time:
Changed behavior:
Known issues:
Available help and sign-in:
Storage and posting status:
Required device/input cases:
Instructions: link the published PRODUCTION_PLAYTEST.md packet.
Results: post a redacted report here and link actionable findings to GitHub #70.
Qualified PIXIE rules/accessibility review: GitHub #69.
No deadline or successful test result is implied by an empty field.

## Training task template
- Project and repo:
- Learning goal and task/issue:
- Current source/PR:
- What I changed or tried:
- How I checked it:
- Evidence/demo:
- Help or review requested:
- Next step:
- Mentor/reviewer (only if agreed):

## Provisioning and verification
1. After authorized sign-in, inspect existing spaces before creating a duplicate.
   Reuse a suitable owner-approved Loptr Lab space; otherwise create the requested
   space with the supported UI.
2. Create the welcome, DUET and training channels/pages above. Add the templates
   and links. State visibility explicitly after checking the actual setting.
3. Verify owner moderation access, member posting and invitation behavior. Keep
   admin access with the confirmed owner; no second admin is required to draft
   instructions or run tester rounds.
4. Test onboarding as a normal participant and keyboard/screen-reader navigation.
   Check whether a tester can reach instructions, find a partner and submit a report.
5. Record the verified space/invite URL here and in README/review-page links only
   after observing the created environment. Do not publish session-bound OAuth URLs.
6. Keep GitHub as the source of code/release evidence and issue resolution. Roomy
   is the discussion/onboarding layer; copying a report is manual until a bridge
   is separately implemented and tested.

## Storage and privacy boundary
Roomy's official site says data storage is transitioning to AT Proto as permissioned
data rolls out. Do not claim all Roomy messages already reside in each member's PDS
or that an invite-only space is end-to-end encrypted. Verify the deployed service's
actual privacy and storage behavior before inviting sensitive discussion.
References: https://a.roomy.space/ and https://tangled.org/roomy.space/roomy .
