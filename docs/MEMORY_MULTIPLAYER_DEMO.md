# One-process multiplayer demo

Prepared 30 October 2026. This is an optional runtime for the existing web
client and authoritative Node/Socket.IO server. It does not replace the static
recovery, change game rules, or establish public hosting or contest eligibility.

## Run

Use Node.js 22 or later. Install with `npm ci`, then run `npm run start:demo`.
Open `http://localhost:8080`. On the same trusted network, a second device can
open the host computer's reachable address on port 8080, create/join by room code,
and play without an account. Local network access is not a public contest URL.

A separate `Dockerfile.demo` packages this mode without modifying the existing
production Dockerfile. It exposes a Play with a friend entry, Classic rules,
labeled room/move inputs and explicit temporary-match limits.

For a container host, set `DUET_STORAGE_MODE=memory-demo` and use `npm start`.
Use exactly one replica and one Node process. Configure public HTTPS on the host;
verify its current account allowance and billing behavior before provisioning.
No deployment, billing change or guaranteed free host is included in this change.

Optional environment settings:

- `PORT`: defaults to 8080.
- `DUET_DEMO_MAX_ROOMS`: 1–100, default 10. This is an allocation limit, not a
  measured supported capacity or complete traffic/abuse protection.
- `DUET_DEMO_IDLE_MINUTES`: 1–120, default 30. Successful room creation, joining,
  reconnection or moves refresh inactivity. Socket heartbeats do not.

Explicit `memory-demo` skips construction of Firestore/player stores and OAuth;
no telemetry, feedback persistence or public match posting occurs. Gemini/model
credentials are unnecessary. The browser uses the existing fixed PIXIE help.
Unset storage mode retains the existing Firestore path; `firestore` is also valid.
Other mode names fail startup rather than silently selecting a backend.

## Limits

Multiple rooms share this process but retain distinct state and seat tokens.
Room capacity is rejected with an acknowledgement; idle rooms are removed and
subscribers notified and detached. Expiry is checked during requests and at most
once per minute in the background. Old room codes/tokens cannot restore expired
state. Restart, redeployment, eviction or process loss destroys every match.
A valid reconnect token restores a seat only while its room remains in memory.
There is no durable save, production capacity claim, or multi-replica coordination.
Provider logs and traffic metering remain governed by the host.

## Verification

`npm run check` and `npm test` include the existing regressions plus real local
WebSocket checks for two rooms, synchronized moves, invalid/wrong-turn rejection,
seat recovery/token rejection, capacity, expiry, a completed 34-move game and
post-game rejection. A startup test blocks cloud, identity and posting imports.
These tests use simulated clients, not physical devices or a public deployment.

Continue public/human acceptance under existing issue #70: record deployed SHA,
one-process settings and URL; repeat on two physical devices and two simultaneous
rooms, including reconnect and completed play. Measure CPU, RAM and egress before
claiming the workload fits an account allowance. Do not mark #70 complete from CI.

`GET /api/runtime` reports the selected storage mode and an optional validated
40-character source SHA. Set `DUET_SOURCE_SHA` to the deployed commit when the
host does not supply `RAILWAY_GIT_COMMIT_SHA`. The response contains no credentials.

Contest-preparation validation on 30 October: all 41 local tests passed, including
HTTP checks for the served demo entry, rules and runtime metadata, plus recovery
from an acknowledgement timeout. Both static-site builders ran successfully.
Container build, public hosting and physical-device acceptance remain unverified.
