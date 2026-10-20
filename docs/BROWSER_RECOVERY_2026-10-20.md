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
`node --test test/browserRecovery.test.js`. Six checks cover network independence,
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
