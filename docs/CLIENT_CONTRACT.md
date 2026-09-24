# DUET Client Contract

**Status:** M1 working contract

## Purpose
Define what the DUET game client needs from identity, transport, and authoritative state without naming a platform or networking technology.

## Architecture
Platform Identity -> DuetClient -> ITransport -> authoritative DUET server

## Contract
The conceptual client API is:

    connect(transport, identity)
    createRoom() -> roomCode
    joinRoom(roomCode)
    sendMove(intent)
    onStateUpdate(snapshot)
    onError(error)
    disconnect()

## Responsibilities
### DuetClient
Owns connection lifecycle, room lifecycle, player identity, current authoritative snapshot, player-intent submission, and propagation of server events/errors to UI. It does not implement game rules.

### ITransport
Provides connect/disconnect, request/ack semantics, server event subscription, transport errors, and connection state. It does not know what a board move means.

### Identity
Provides DUET player ID, display name, identity provider, and optional platform identifier.

### Snapshot
Represents the latest authoritative game state received from the server. The client may render and announce it; the server decides whether it is valid.

## Forbidden dependencies
Game logic, UI, and controller code must not directly import or call Socket.IO, Xbox SDK/GDK, PlayFab, AT Protocol, or Firestore. Adapters may.

## M1 exit condition
A second client can be implemented against this contract without changing the contract to mention its networking or platform technology.
