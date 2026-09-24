# DUET Transport Boundary

**Status:** M1 working contract

## Rule
DuetClient -> ITransport -> authoritative DUET server

Socket.IO is the current gameplay transport implementation, not the DUET client contract.

## Required capabilities
    connect()
    disconnect()
    request(message, payload) -> response
    on(message, handler)
    off(message, handler)
    isConnected()

## Current adapter
SocketTransport -> Socket.IO -> gameNamespace.js

The existing server remains unchanged during M1.

## M1 known exceptions and provisional behavior

### Feedback bypass
The current `submit_feedback` path uses `ITransport.request()` directly rather than `DuetClient`. This is a **DuetClient boundary bypass**, not a Socket.IO leak: the calling code still depends on the abstract transport and does not call Socket.IO directly.

M1 intentionally documents this as an exception because feedback is outside the core gameplay contract. The path is to move it behind `DuetClient` before or during the M3 hardening work.

### Connection-event reach-through
The browser lobby currently listens to the transport's `connect` event through `RemoteState.client.transport` so it can trigger the existing auto-rejoin flow. This is a **temporary DuetClient boundary reach-through**, not a direct Socket.IO dependency. M3 should expose connection state through `DuetClient`/the normative transport contract and remove this reach-through.

### Reconnection
M1 does not define a normative reconnect lifecycle. The current Socket.IO adapter retains its existing behavior. Ownership of connection state, reconnect attempts, replay/rejoin, and error propagation remains provisional until M3.

### Request timeout
M1 does not define a timeout or mandatory rejection contract for `request()`. A request currently depends on the transport receiving an acknowledgement. This is a known limitation and must not be treated as a complete production transport contract.

### Browser/Node duplication
The repository currently contains Node/CommonJS and browser-global versions of the client/transport modules. This is an M1 implementation constraint, not two independent contracts. M3 must establish a single source of truth or an explicit build/generation strategy to prevent semantic drift.

## Future adapters
Possible later implementations include Socket.IO plus Xbox platform services, PlayFab Party through ITransport, or another platform/network transport. The production choice belongs to M8.

## Non-goals
M1 does not replace Socket.IO, introduce PlayFab Party, change room/session semantics, move authority to the client, or modify Firestore persistence.
