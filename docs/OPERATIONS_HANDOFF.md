# DUET operations handoff

**Updated:** 2026-09-28 (America/Chicago)
**Scope:** Cloud Run deployment and PIXIE fixed game help. This is an evidence
record, not an attribution of a past configuration change.

## Observed service and trigger

- Project `adept-crossing-106819`, Cloud Run service `duet-solo-hackathon`, region
  `us-central1`. The old `duet-solo` deploy example named a different service.
- On September 28, revision `duet-solo-hackathon-00137-c98` served 100% of
  traffic. Its Containers view showed `FIRESTORE_DATABASE` and a Secret Manager
  reference named `ATPROTO_OAUTH_PRIVATE_KEY`; the Gemini key and model were absent.
  Earlier revision `00116-hkn` had eight entries. No values are recorded here.
- [The Cloud Build check for `6d8a287`](https://github.com/Loptr-Lab/duet-solo-hackathon/runs/108528888007)
  confirms the `main` push trigger built, pushed, and deployed `00137-c98`, then
  routed 100% traffic. A merge to `main` therefore creates a production revision.
- On September 28 the owner inspected the trigger's inline YAML. Its Deploy
  command is `gcloud run services update` with image, labels, region, and quiet
  arguments. It has no environment or secret flags. This rules out the current
  trigger definition explicitly setting those values; it does not explain every
  historical update. The [trigger definition](https://console.cloud.google.com/cloud-build/triggers/edit/e75073d5-c44f-4dfe-a0a2-191c84af1c36?project=adept-crossing-106819)
  should be rechecked before a merge.
- The owner reported that spectate works. A full match, room join, and Fire TV
  VoiceView test have not been recorded. No Cloud Run change was made here.

## PIXIE decision and key boundary

The current `main` code sends raw player text to Gemini **if** `GEMINI_API_KEY`
is attached. Its missing key keeps that path inactive on the observed revision.
**Do not attach the key to the production service.** PR #67 replaces the model
path with eight reviewed, fixed answers selected by a deterministic game gate.
After that version is live, PIXIE does not need `GEMINI_API_KEY` or
`GEMINI_MODEL`. The earlier model implementation is retained separately on
`pixie/gemini-experiment`, not as a production fallback.

## Next operator steps

1. Recheck the current traffic revision, environment and secret-reference
   **names**, and trigger YAML before either merge. Preserve required Firestore
   and AT Protocol settings. Historical configuration changes can be examined
   separately; do not copy audit payloads or secret values into this public repo.
2. Review and merge [docs-only PR #68](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68)
   while the key is absent. Its `main` push deploys automatically. Confirm the
   new revision's image, traffic, and required configuration.
3. Rebase [PR #67](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/67)
   onto the new `main`, resolving the overlapping README and handoff changes.
   Review the [eight fixed answers](PIXIE_LIVE_CHECK.md) against the game code.
   Merge with the key absent, then confirm the new serving revision has the
   expected source commit and still has no Gemini key. Test all eight game
   questions plus mixed and off-topic messages at `/api/agent`.
4. Check the home page, create and join a room, spectate, and finish one match.
   Separately validate D-pad focus and VoiceView on Fire TV hardware or emulator
   before a hackathon submission decision.

Do not use a partial `--set-env-vars` deployment: it can remove omitted
settings. A later experimental model feature would require a new review and
separate privacy and deployment decision; the static branch has no live-model
test or key-restoration step.

## Rule authority

DUET's two-player code is the answer source. `public/index.html` contains the
gameplay, accessible controls, Fog Mode, and Radius/Sanctuary behavior;
`veiled-chess-core-server.js` confirms movement and loss rules. The four-player
Veiled Dominion lore is distinct. Veil duration remains under wording review:
the code uses `DURATION_TURNS: 2` with refresh behavior, while older page copy
says “for a round.” No static answer states a duration until reconciled.
