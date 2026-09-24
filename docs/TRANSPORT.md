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

## Future adapters
Possible later implementations include Socket.IO plus Xbox platform services, PlayFab Party through ITransport, or another platform/network transport. The production choice belongs to M8.

## Non-goals
M1 does not replace Socket.IO, introduce PlayFab Party, change room/session semantics, move authority to the client, or modify Firestore persistence.
