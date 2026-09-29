# DUET operations handoff

**Updated:** 2026-09-29 (UTC)  
**Scope:** Production Cloud Run configuration and the transition to fixed PIXIE help. This is an evidence record, not an incident attribution.

## Confirmed production context

- Project: `adept-crossing-106819`; Cloud Run service: `duet-solo-hackathon` in `us-central1`. The old `duet-solo` deploy example was not the observed service.
- On September 28, revision `duet-solo-hackathon-00137-c98` served 100% of ordinary traffic. Its configuration showed `FIRESTORE_DATABASE` and the `ATPROTO_OAUTH_PRIVATE_KEY` Secret Manager reference; no `GEMINI_API_KEY` or `GEMINI_MODEL`. A prior revision, `00116-hkn`, showed eight entries. Do not copy values from historical revisions into public records.
- The [GitHub Cloud Build check](https://github.com/Loptr-Lab/duet-solo-hackathon/runs/108528888007) for `main` commit `6d8a287` built and deployed `00137-c98`, routing 100% traffic. The owner inspected the [trigger's inline YAML](https://console.cloud.google.com/cloud-build/triggers/edit/e75073d5-c44f-4dfe-a0a2-191c84af1c36?project=adept-crossing-106819): the Deploy step uses `gcloud run services update` with image, labels, region, and quiet flags. It contains no explicit environment or secret update flags in the reviewed definition.
- The owner later provided September 17 Admin Activity records of service updates from an interactive Cloud Shell session. The requests carried templates without environment entries. These records help locate the configuration transition but do not establish the operator's intent or explain why that command was run. The current trigger definition does not account for every historical update.
- The owner reports that spectate works. Home page, create/join room, one completed match, and Fire TV with VoiceView remain separate checks. Production PIXIE has not been verified against a real model; the serving revision has no model key configured.
- Draft [PR #67](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/67) replaces the Gemini route with eight static answers selected by the scope gate. It is not yet running on production. The former Gemini experiment is preserved on `pixie/gemini-experiment`.

## Critical ordering rule

**Keep the Gemini key off this production service.** The current `main` endpoint would send raw player text to Gemini if the key were attached. PR #67 needs neither a model key nor live Gemini testing; its answer text needs human review against the two-player game code. No tagged keyed revision or traffic shift is part of the static PIXIE plan.

Screenshots and audit payloads may contain sensitive values. Do not copy them into this repository or issue tracker.

## Next steps

1. Before either merge, reconfirm the serving revision, its environment and secret names, and the trigger's Deploy step. Preserve the reviewed trigger YAML and logs as private evidence.
2. Review and merge this **docs-only PR #68 with no Gemini key**. The `main` trigger deploys even for documentation changes and routes a new revision to 100% traffic. Check that revision's source, traffic, and required Firestore/AT Protocol configuration.
3. Rebase PR #67 onto the resulting `main`, resolve its overlapping README and handoff edits, and review the [fixed-answer sheet](https://github.com/Loptr-Lab/duet-solo-hackathon/blob/pixie/scope-gate/docs/PIXIE_LIVE_CHECK.md). Reviewer and date entries are still open. The answer does not assert a Veil duration because the displayed wording needs a decision.
4. Merge PR #67 with **no Gemini key**. Confirm the serving revision's source commit, eight fixed answers, mixed/off-topic Outside Support response, and absence of the key. Check the full game path and Fire TV with VoiceView before recruiting testers.
5. Investigate and restore any other required settings only after determining their actual service use and validating the resulting revision. Avoid a partial `--set-env-vars` update, which can remove omitted variables. Do not roll back solely to recover old values.

**Current status:** Neither PR has been merged; the old `main` code remains the production baseline. The audit records narrow the transition to an interactive service update but do not establish why it happened. Verify the current traffic revision again before acting.

## Rule source for fixed answers

DUET's movement validators in `veiled-chess-core-server.js` and `public/index.html` treat ordinary Rebirth (`rb`) as queen-line movement and Death (`d`) as one-square movement. Veiled movement uses a separate restriction. Judge PIXIE's exact answer text against DUET's implementation and record reviewer/date in the sheet.
