# PIXIE isolated review candidate

Prepared October 5, 2026. This branch combines main at
`180862ae3b179058961a31fad59696529750d293` (#73) with proposed fixed help
from #67 at `d2d5c0b49fd11aba7ca05ba336062e8391e2d475`.
It is a test candidate, not a release or replacement for the held PRs.

## Reconciliation

- Preserve #73's discovery, Creator, practice, identity and service-evidence boundaries.
- Carry #67's eight proposed answers, strict word gate, neutral Outside Support,
  fixed-help server/UI and existing tests. The answer text is unchanged.
- Qualify README for this candidate instead of restoring historical live-service claims.
- Keep reviewer/date entries pending. An exact-text test does not make an answer reviewed.
- Preserve the operations handoff and external-review hold. #67, #68 and #71 remain
  unchanged drafts; their eventual order remains #68, rebased/reviewed #67, then #71.
- Do not copy the obsolete October 4 Fire TV deadline into the review page. Device
  requirements and acceptance remain tracked under #69/#70.

## Isolated runtime

Run `npm install --ignore-scripts --no-audit --no-fund`, then `npm run sandbox`.
Open `http://localhost:8080`. The dedicated launcher substitutes in-memory room
storage and disables Firestore/player storage, OAuth and public posting before
the server loads. Rooms disappear when the process stops. Feedback persistence
is unavailable. This cannot validate production persistence, identity or scaling.

Use `Dockerfile.pixie-sandbox` for a separate test container:

```sh
docker build -f Dockerfile.pixie-sandbox -t duet-pixie-review .
docker run --rm -p 8080:8080 duet-pixie-review
```

The existing production Dockerfile and `npm start` are unchanged. They do not
select the sandbox. Do not deploy this candidate using the production trigger.
No cloud service or externally reachable preview was created by this preparation.
For a later test service, use the sandbox image, a separate service name, no secrets,
no production credentials and no production traffic changes. Verify the serving
source and runtime command before sharing a preview URL.

## Automated evidence

- `npm run check`: passed locally.
- `npm test`: 22 passed, zero failed locally.
- All eight exact proposed answers, unsupported/mixed input and long input checked.
- Simulated two-player 34-move match completes; public posting boundary is stubbed.
- Sandbox HTTP check: `/healthz`, all eight answer examples, fallback, long input,
  Outside Support and preserved Creator/discovery routes passed.
- Game engine, namespace, production storage, auth, poster and platform client source
  are unchanged from the pinned main. The support route and help UI do change.
- No production endpoint, credential, Firestore collection or public posting was tested.
- Container commands are prepared but the image has not been built or deployed here.

## Remaining acceptance

1. Provide and verify an isolated preview URL for this exact candidate revision.
2. On iPad Safari/VoiceOver, test announcements, focus, recovery, help and fallback,
   Outside Support return, and a real-client full match. Record actual results under #70.
3. Test Fire TV D-pad/VoiceView where required; retain provisional wording if blocked.
4. Obtain external rules and screen-reader feedback under #69. All eight reviewer/date
   entries remain pending; Sanctuary/Radius/Veil sequence reconciliation remains open.
5. Reissue the pinned review packet for this candidate; do not label production play
   as testing this branch. CI and this sandbox do not waive the review gate.
6. Reconcile accepted changes through the held PR sequence and obtain separate owner
   production approval only after the existing gates are satisfied.
