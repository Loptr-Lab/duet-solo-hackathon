# M1 Implementation

**Status:** In progress

## Goal
Extract a platform-neutral client boundary from the existing DUET implementation without changing gameplay behavior.

## Existing source of truth
- gameNamespace.js: authoritative room/game server
- public/index.html: current web client
- veiled-chess-core-server.js: server-side game rules
- roomStore.js: room persistence
- services/storage.js: player/match storage

## Work completed
- Protocol contract documented in docs/DUET_PROTOCOL.md.
- Client contract documented in docs/CLIENT_CONTRACT.md.
- Identity abstraction documented in docs/IDENTITY_CONTRACT.md.
- Transport boundary documented in docs/TRANSPORT.md.
- Initial JavaScript contract modules added under client/.
- Existing Socket.IO gameplay remains the compatibility target.

## Next steps
1. Wire the current web client to DuetClient without changing UI behavior.
2. Move Socket.IO calls behind SocketTransport.
3. Add contract tests for create/join/rejoin/move/state-update/error flows.
4. Verify the existing web game before M2.
5. Only after the web client passes, use the same contract for the Godot client.

## Gate
M1 is complete when the existing web client can play a complete match while game/UI code no longer directly depends on Socket.IO.
