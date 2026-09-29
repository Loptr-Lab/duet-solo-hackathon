# DUET operations handoff

**Updated:** 2026-09-28 (America/Chicago)
**Scope:** Production Cloud Run configuration and PIXIE live verification. This is an evidence record, not an incident attribution.

## Confirmed production context

- Google Cloud project ID shown in the container image path: `adept-crossing-106819`.
- Cloud Run service: `duet-solo-hackathon`, region `us-central1`. The older `duet-solo` deploy example in this repository was not the observed service name.
- On September 28, the Cloud Run Revision History screen showed `duet-solo-hackathon-00137-c98` receiving **100%** of ordinary traffic. The console labeled it deployed **2 days ago**; an exact deployment timestamp has not been recorded.
- That revision's Containers view showed **two** configured entries: `FIRESTORE_DATABASE` and a Secret Manager reference named `ATPROTO_OAUTH_PRIVATE_KEY`. No `GEMINI_API_KEY` or `GEMINI_MODEL` entry appeared.
- An older revision, `duet-solo-hackathon-00116-hkn`, showed **eight** environment variables, including `GEMINI_MODEL`. Its values are not reproduced here. We have not identified the first revision where the other entries ceased to appear.
- Revision `00137-c98` displayed “Deployed by Default Compute SA (logs, trigger) using gcloud.” [GitHub's Google Cloud Build check](https://github.com/Loptr-Lab/duet-solo-hackathon/runs/108528888007) for `main` commit `6d8a287` links build `5acbe976-681c-401a-8683-bfd2afd6a763` and trigger `rmgpgab-duet-solo-hackathon-us-central1-Loptr-Lab-duet-solo-nlb` (`e75073d5-c44f-4dfe-a0a2-191c84af1c36`). Its Build, Push, and Deploy steps succeeded on September 26 CDT and ended by routing **100%** of traffic to `00137-c98`. The build log does not show the deploy flags. The trigger definition and Cloud Run Admin Activity audit record have **not** been examined. This confirms an automated build produced this revision, not why the Gemini entries disappeared or who configured the trigger.
- The owner reported that **DUET spectate still works**. This is an owner observation, not a full live game regression test. The current production PIXIE Gemini path has not been successfully verified. The code reads `GEMINI_API_KEY` and `GEMINI_MODEL` from process environment before calling Gemini, so it cannot use those missing settings on that revision.
- Draft PR #67 (`pixie/scope-gate`) is the scope gate under review. It has not been established as the code running on production. The local branch and its passing tests do not establish production behavior.

## Critical ordering rule

**Do not restore `GEMINI_API_KEY` to the production service while it runs ungated `main` code.** On `main`, `/api/agent` returns a canned response when the key is missing; when a key is present, that version includes raw player input in the Gemini request and accepts `general` replies. The missing key currently prevents that code path from calling Gemini. A model name alone does not enable it. PR #67 changes the input and output boundary, but remains a draft and has not been verified live. A no-traffic revision with the key on the **same production service** is unsafe before that merge: [Cloud Run configuration normally carries into subsequent revisions](https://docs.cloud.google.com/run/docs/configuring/services/environment-variables), and the `main` trigger deploys a new revision with 100% traffic. Use a separate staging service for pre-merge key testing, or merge the gate with the key absent and test a tagged revision only afterward.

The evidence was captured in the owner's September 28 conversation screenshots (`IMG_2343.png` through `IMG_2346.png`). Screenshots may contain sensitive values; do not copy them into the public repository or issue tracker.

## Open questions and next checks

1. Read the Cloud Build **trigger definition** and its Deploy step arguments. GitHub's Cloud Build check already ties build `5acbe976-681c-401a-8683-bfd2afd6a763` for commit `6d8a287` to revision `00137-c98`; it does not reveal deploy flags. Determine whether the trigger replaces environment entries (for example, a partial `--set-env-vars`), without treating that as proven until the definition is inspected. Do not infer an attacker or a responsible person from the service account name alone.
2. Use Cloud Run Admin Activity audit logs to identify the deployment principal and the sequence of revisions that changed the environment entries. Record timestamps and revision IDs, without copying secret values. Compare the latest revision with the last known revision containing the settings.
3. **Before merging either PR**, inspect how the confirmed `main` push trigger supplies environment variables and secrets. Its recent run built and routed a revision to 100% traffic; a docs-only merge can therefore deploy too. Record the current traffic revision and configuration before and after any merge.
4. Check whether the historical Gemini key still exists in the intended Google AI Studio project or Secret Manager. A key existing there does not mean Cloud Run has it attached. **Do not attach it to the ungated production revision.** Never paste a key into a chat, GitHub issue, command history, or screenshot.
5. Verify the production game's basic path separately: home page, room creation/join, spectate, and PIXIE's actual response to a game question. Record what was tested and what was observed. Do not describe the entire game as down based only on the PIXIE configuration.
6. After the trigger is understood, merge [docs-only PR #68](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68) **with the key still absent**. Check the automatically created revision and confirm its code, traffic, and environment. Both PRs edit `README.md` and add this handoff; rebase #67 onto the new `main` and resolve that overlap, preserving the latest verified facts.
7. Review and merge **rebased PR #67 with the key still absent**. Its `main` push will automatically build and route a new revision. Confirm that the serving revision contains the gate and continues to have no key; check off-topic and in-scope fallback behavior. If pre-merge live Gemini verification is required, use a **separate staging service** with the PR code and key, never a tagged revision of the ungated production service.
8. Once gated code is confirmed live, choose a supported model and attach the Gemini key through Secret Manager to a **tagged, no-traffic revision** of that gated production service. Preserve Firestore and AT Protocol settings and verify the exact source commit. The tag URL can still be reached directly; send only fixed game test messages. Hold other merges while this is tested.
9. Run the eight live prompts against that tagged revision using [the live-check sheet in draft PR #67](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/pixie/scope-gate/docs/PIXIE_LIVE_CHECK.md); inspect factual accuracy and confirm provider calls in that revision's logs. A canned fallback can have the right intent and length. Only after all eight pass should traffic shift to a revision verified to contain both gate and key. Fix any trigger behavior that drops required configuration before further merges. Do not roll back to an old revision merely to recover its environment values.
10. Test home page, create/join room, spectate, and one completed match before recruiting testers. Fire TV with VoiceView remains a separate hackathon device gate.

**Current status:** cause of the configuration change **unknown**; no evidence of compromise from the screenshots alone. No Cloud Run changes or live Gemini verification were performed in this handoff. New operators should verify the current traffic revision again because it may change after this record.

## Deployment guardrail

Cloud Run configurations are revision-specific. Do not copy the historical key value from a revision into a public document. Do not use `gcloud run deploy ... --set-env-vars` as a partial update: it can remove environment variables omitted from that flag. Use a reviewed deployment configuration and preserve required secret references. Confirm the actual service, project, region, traffic, and secret attachment before every deployment.

## Rule source for PIXIE answers

The DUET movement implementation in `veiled-chess-core-server.js` (`isValidMove`) and `public/index.html` (`isValidMove`) treats `rb` like `q`: straight lines or diagonals with a clear path. It treats `d` like `k`: at most one square in each direction. A **Veiled** piece uses the separate one-square-forward restriction. The Rebirth/Death fixed question in PR #67 matches the normal movement code; inspect the actual answer for this distinction. This rule comes from DUET's implementation, not the four-player rulebook.
