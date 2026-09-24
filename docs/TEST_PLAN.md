# DUET M1 Test Plan

## Contract tests
1. create room returns room ID, seat, reconnect token, snapshot
2. join room returns room ID, seat, reconnect token, snapshot
3. rejoin requires the correct reconnect token
4. invalid move is rejected
5. valid move produces an authoritative state update
6. state update is consumable without Socket.IO knowledge
7. disconnect/reconnect preserves server-authoritative room state
8. request errors do not mutate local authoritative state

## Regression
Run the existing Node test suite before and after M1 changes.

## Acceptance
A web player must still be able to create a room, share the room code, join from another browser, complete a match, receive the same final authoritative state, and reconnect using the existing mechanism.

M1 does not require Xbox hardware. M0-A remains the separate physical feasibility gate.
