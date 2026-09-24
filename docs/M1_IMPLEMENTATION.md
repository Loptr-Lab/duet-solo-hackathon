# M1 Implementation

**Status:** In progress — M1.1 review closure

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
- Initial JavaScript contract modules added under client/ and public/client/.
- Existing Socket.IO gameplay remains the compatibility target.
- Current web gameplay routes through DuetClient -> SocketTransport -> Socket.IO.

## M1.1 review disposition
The implementation review identified four follow-ups. They are intentionally documented here rather than expanded into M3 work:

| Review item | M1 disposition | M3 follow-up |
| --- | --- | --- |
| Feedback bypasses DuetClient | Known exception: submit_feedback uses the abstract transport directly; no direct Socket.IO dependency remains | Move feedback behind DuetClient |
| Reconnection semantics | Provisional behavior is documented; no new reconnect contract is introduced in M1 | Define connection state/reconnect ownership in ITransport |
| Request timeout | Current request behavior is documented as a limitation; M1 does not redesign request semantics | Add mandatory timeout/rejection semantics |
| Browser/Node module duplication | Known implementation duplication is documented; both surfaces currently expose the same contract | Establish a single source of truth/build strategy |

These are tracked architecture follow-ups, not silent assumptions. M1 does not expand into M3 merely to resolve them.

## M1 closure work
1. Add contract tests for create/join/rejoin/move/state-update/error flows.
2. Run the existing web regression suite.
3. Inspect and resolve M1 test failures without changing the server authority model.
4. Confirm the web client can complete a full match through DuetClient.
5. Record the resulting verification status here before merging PR #47.

## Gate
M1 is complete when the existing web client can play a complete match while core game/UI code no longer directly depends on Socket.IO, the contract tests pass, and the existing regression suite is green or any pre-existing failures are explicitly accounted for.

## Boundary for M3
M3 is the milestone where ITransport becomes load-bearing for a second implementation. Reconnection semantics, request timeouts/error behavior, and module single-sourcing are therefore deferred there rather than smuggled into M1.
