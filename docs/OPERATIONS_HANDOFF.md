# DUET operations handoff

**Updated:** 2026-09-28 (America/Chicago)
**Scope:** Production Cloud Run configuration and PIXIE live verification. This is an evidence record, not an incident attribution.

## Confirmed production context

- Google Cloud project ID shown in the container image path: `adept-crossing-106819`.
- Cloud Run service: `duet-solo-hackathon`, region `us-central1`. The older `duet-solo` deploy example in this repository was not the observed service name.
- On September 28, the Cloud Run Revision History screen showed `duet-solo-hackathon-00137-c98` receiving **100%** of ordinary traffic. The console labeled it deployed **2 days ago**; an exact deployment timestamp has not been recorded.
- That revision's Containers view showed **two** configured entries: `FIRESTORE_DATABASE` and a Secret Manager reference named `ATPROTO_OAUTH_PRIVATE_KEY`. No `GEMINI_API_KEY` or `GEMINI_MODEL` entry appeared.
- An older revision, `duet-solo-hackathon-00116-hkn`, showed **eight** environment variables, including `GEMINI_MODEL`. Its values are not reproduced here. We have not identified the first revision where the other entries ceased to appear.
- Revision `00137-c98` displayed “Deployed by Default Compute SA (logs, trigger) using gcloud.” The build trigger and Cloud Run Admin Activity audit record have **not** been examined. This is not evidence of an intruder or of who configured the deployment.
- The owner reported that **DUET spectate still works**. This is an owner observation, not a full live game regression test. The current production PIXIE Gemini path has not been successfully verified. The code reads `GEMINI_API_KEY` and `GEMINI_MODEL` from process environment before calling Gemini, so it cannot use those missing settings on that revision.
- Draft PR #67 (`pixie/scope-gate`) is the scope gate under review. It has not been established as the code running on production. The local branch and its passing tests do not establish production behavior.

## Critical ordering rule

**Do not restore `GEMINI_API_KEY` to a production revision running the ungated `main` code.** On `main`, `/api/agent` returns a canned response when the key is missing; when a key is present, that version includes raw player input in the Gemini request and accepts `general` replies. The missing key currently prevents that code path from calling Gemini. A model name alone does not enable it. PR #67 changes the input and output boundary, but remains a draft and has not been verified live. Keep the key off ordinary production traffic until the scope-gated code and key are deployed together and verified.

The evidence was captured in the owner's September 28 conversation screenshots (`IMG_2343.png` through `IMG_2346.png`). Screenshots may contain sensitive values; do not copy them into the public repository or issue tracker.

## Open questions and next checks

1. Read the Cloud Build **trigger** and the build logs linked from revision `00137-c98`. Determine the source commit and deployment command/configuration. Do not infer an attacker or a responsible person from the service account name alone.
2. Use Cloud Run Admin Activity audit logs to identify the deployment principal and the sequence of revisions that changed the environment entries. Record timestamps and revision IDs, without copying secret values. Compare the latest revision with the last known revision containing the settings.
3. **Before merging either PR**, determine whether a merge to `main` automatically builds and routes a Cloud Run revision, and how it supplies environment variables and secrets. A docs-only merge can still invoke that trigger. Record the current traffic revision before and after any merge.
4. Check whether the historical Gemini key still exists in the intended Google AI Studio project or Secret Manager. A key existing there does not mean Cloud Run has it attached. **Do not attach it to the ungated production revision.** Never paste a key into a chat, GitHub issue, command history, or screenshot.
5. Verify the production game's basic path separately: home page, room creation/join, spectate, and PIXIE's actual response to a game question. Record what was tested and what was observed. Do not describe the entire game as down based only on the PIXIE configuration.
6. After the trigger is understood, merge [docs-only PR #68](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68) first. Check whether it created a revision and confirm its code, traffic, and environment. Both PRs edit `README.md` and add this handoff; rebase #67 onto the new `main` and resolve that overlap, preserving the critical ordering rule and the latest verified facts.
7. Deploy the **rebased PR #67 code** to a no-traffic tagged revision or isolated staging service. On that gated revision only, choose a supported model and attach the API key through Secret Manager. Review **all** required entries from an approved configuration, preserving Firestore and AT Protocol settings. A tag URL can still be reached directly; use only fixed game test messages.
8. Run the eight live prompts against that PR build using [PIXIE_LIVE_CHECK.md](PIXIE_LIVE_CHECK.md); inspect the answers for factual accuracy. Check the exact deployed source commit and confirm a real Gemini response, since a canned fallback can have the right intent and length. This is a pre-merge gate.
9. Fix the deployment trigger so later builds preserve required configuration. After review, merge the gated code, then route ordinary traffic only to a revision confirmed to contain both the gate and the key; account for any automatic deployment caused by merging. Do not roll traffic back to a three-week-old revision merely to recover its environment values; it may also roll back game code.
10. Test home page, create/join room, spectate, and one completed match before recruiting testers. Fire TV with VoiceView remains a separate hackathon device gate.

**Current status:** cause of the configuration change **unknown**; no evidence of compromise from the screenshots alone. No Cloud Run changes or live Gemini verification were performed in this handoff. New operators should verify the current traffic revision again because it may change after this record.

## Deployment guardrail

Cloud Run configurations are revision-specific. Do not copy the historical key value from a revision into a public document. Do not use `gcloud run deploy ... --set-env-vars` as a partial update: it can remove environment variables omitted from that flag. Use a reviewed deployment configuration and preserve required secret references. Confirm the actual service, project, region, traffic, and secret attachment before every deployment.

## Rule source for PIXIE answers

The DUET movement implementation in `veiled-chess-core-server.js` (`isValidMove`) and `public/index.html` (`isValidMove`) treats `rb` like `q`: straight lines or diagonals with a clear path. It treats `d` like `k`: at most one square in each direction. A **Veiled** piece uses the separate one-square-forward restriction. The Rebirth/Death fixed question in PR #67 matches the normal movement code; inspect the actual answer for this distinction. This rule comes from DUET's implementation, not the four-player rulebook.
