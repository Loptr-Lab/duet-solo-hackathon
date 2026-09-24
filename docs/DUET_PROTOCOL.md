# DUET Protocol

**Status:** M1 working contract
**Source:** existing duet-solo-hackathon server/client implementation
**Rule:** this document describes gameplay semantics independently of Socket.IO.

## Authority
The DUET server is authoritative.

PlayerIntent -> Validate -> Apply -> Resolve -> Snapshot

A client may propose an intent and render a snapshot, but it does not decide whether a move is legal or what the resulting state is.

## Client -> Server
- create_room: currently empty object
- join_room: { roomId }
- rejoin_room: { roomId, color, reconnectToken }
- make_move: { from, to }
- submit_feedback: post-match flow; outside core M1 gameplay

## Server -> Client
- create_room acknowledgement: room, assigned color, reconnect token, initial snapshot
- join_room acknowledgement: room, assigned color, reconnect token, current snapshot
- rejoin_room acknowledgement: room, color, current snapshot
- opponent_joined: both seats are connected
- state_update: authoritative snapshot after a confirmed move
- acknowledgement with ok:false: rejected request

## Move intent
A move intent contains from and to square identifiers, for example { "from": "e2", "to": "e4" }.

The server validates square notation, turn ownership, and game rules before applying the move.

## Authoritative snapshot
The current public snapshot contains:
- board
- turn
- gameOver
- winner
- playersConnected.w
- playersConnected.b

Completed games may add anonymous feedback metadata. Clients must tolerate additive snapshot fields.

## Errors
Request errors use { ok:false, reason:"..." }. The client must not infer authoritative state from a rejected intent.

## Versioning
Protocol changes must be documented here before a second client depends on them. Prefer additive fields. Breaking changes require an explicit compatibility decision.

## M1 boundary
This contract intentionally contains no Godot, Xbox, PlayFab, Socket.IO, AT Protocol, or Firestore concepts. Those are adapter implementations.
