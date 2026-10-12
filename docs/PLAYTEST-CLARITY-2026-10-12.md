# Playtest clarity fixes — October 12, 2026

## Observed live behavior before changes

- The local opening e2e4 advanced to Black with AI off. e7e5 advanced back to White.
- Enabling AI and submitting g1f3 produced a Black computer reply.
- The game-options toolbar had aria-hidden=true, hiding its controls from assistive technology.
- Remote room creation, joining and an opening move synchronized in two tabs. Both displayed White because this profile shares reconnect state; this is not independent-device acceptance.
- Inspection included CSS-generated “No moves yet” from a hidden remote history panel. A visible stale local-history defect was not established.
- The review hub mixed player entry instructions and technical plans. Rhapsody's opening claimed a playable journey while its current destination was a blueprint.

## Changes

Explicit computer/local/remote choices; visible turn and opponent guidance; accessible game-options toolbar and AI toggle state; removal of ambiguous generated empty-history text; separate-profile remote instructions; short player testing steps with development material in a disclosure. Rhapsody wording and scope are corrected in ibloud/ren-rhapsody.

## Validation and release boundary

Run npm run check and npm test. Local onboarding regression tests execute the actual inline engine with a minimal DOM harness: local two-player turns and a computer reply. Existing simulated remote completion remains covered. These do not establish screen-reader, Safari/iPad, independent-device remote completion, or production acceptance.

Approve only the Cloud Build sourced from the final main commit containing this document, public/index.html, duet-review.html and test/localOnboarding.test.js. Match the full resolved source commit SHA, not queue order or a similar title. Confirm the intended existing DUET trigger/service and successful CI; preserve Firestore/AT Protocol configuration and keep Gemini credentials absent. Do not approve superseded commits. The console queue and build ID could not be inspected in the current browser.

GitHub Pages serves the review hub separately. Cloud approval is needed for the game deployment, not the Rhapsody Pages wording change. After approval, verify the serving revision, the three play choices, e2e4/computer reply, local e2e4/e7e5, and remote create/join/completion using independent devices. Obtain iPad/Safari and assistive-technology results before closing production acceptance.
