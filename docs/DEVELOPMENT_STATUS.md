# DUET Development Status

**Status:** Active development — M1 complete; M0 next  
**Updated:** 2026-09-24  
**Purpose:** Contributor review and comment

## Current state

DUET's platform-neutral client boundary has been implemented and merged into `main`.

**M1: Platform-neutral client contract — COMPLETE**

```
DuetClient → ITransport → authoritative DUET server
```

The existing web client is the known-good reference implementation. The authoritative Node/Socket.IO server remains unchanged.

### M1 verification

- PR #47 merged into `main`.
- Merge commit: `6942575be02cadd23152818b93e727d41dd42158`.
- Final pre-merge head: `019ea579676c221e06f474d6add26ff4c4c0fe77`.
- Final-head CI #119 passed.
- Client contract tests passed.
- Existing web regression coverage passed.
- Direct Socket.IO calls were removed from the web game's core client/UI path.
- M1 review exceptions and M3 follow-ups are documented rather than silently expanded into M1.
- The server authority model was preserved.

M1 is closed. No additional M1 implementation work is required.

## Next gate: M0

M0 is a feasibility gate for the Xbox/Godot proving ground. It does **not** invalidate or reopen M1.

### M0-A — Godot → Xbox hardware feasibility

Demonstrate the documented and applicable Godot console path in DUET's actual development environment:

- confirm the applicable GDK version;
- confirm the required Godot version and W4 Games console fork;
- confirm the applicable console-development/dev-kit configuration;
- obtain/provision the required Xbox development access and hardware;
- build/export the Microsoft Godot/Xbox sample for Xbox Series X|S;
- deploy that sample to an Xbox dev kit;
- verify controller input and Xbox services on hardware.

**M0-A exit condition:** a Godot project runs on an Xbox dev kit with controller input and Xbox services functioning.

Documentation alone, PC-only deployment, or partner confirmation does not satisfy M0-A.

If M0-A cannot be established, stop Xbox/Godot implementation. M1 and the platform-neutral client architecture remain valid and reusable for other clients/platforms.

### M0-B — Controller and TV/10-foot interaction

Evaluate DUET on the console interaction model:

- D-pad board navigation;
- cursor/focus movement;
- command-bar interaction using controller/virtual keyboard;
- selection and cancellation;
- visible focus state;
- 10-foot readability;
- Xbox Narrator interaction;
- clear turn/status comprehension.

The existing 46px browser grid is not treated as an Xbox visual specification.

Accessibility is load-bearing: compare DUET's screen-reader-first interaction model with the Xbox accessibility stack and record any product-level conflicts or required decisions.

## What is deliberately deferred

Until M0 is demonstrated, do not expand the Xbox implementation into:

- Xbox Store submission;
- achievements/Gamerscore;
- Play Anywhere;
- Xbox-native matchmaking, invitations, shell joinability;
- PlayFab Party;
- replacing DUET identity with Xbox identity;
- four-player console implementation;
- production art;
- Fog Mode;
- Gemini/PIXIE;
- unrelated persistence changes.

These remain later milestones or production decisions, not M0 prerequisites unless the feasibility work shows otherwise.

## Architectural invariant

The Xbox effort is a proving ground for the client abstraction, not a reason to rebuild DUET.

```
platform client
      ↓
DuetClient
      ↓
ITransport
      ↓
authoritative DUET server
```

The client contract must remain platform-neutral. Xbox/Godot, Socket.IO, PlayFab, Xbox services, and AT Protocol are implementation details behind the appropriate boundaries.

The server remains authoritative for gameplay.

## Contributor review focus

Contributors are invited to review and comment specifically on:

1. Whether the M1 boundary is sufficiently platform-neutral for a second client.
2. Whether M0-A identifies the minimum evidence needed to prove the Godot → Xbox hardware path.
3. Whether M0-B adequately captures controller, TV-distance, and accessibility concerns.
4. Any concrete contradiction between the current repository architecture and the documented M0 plan.
5. Risks that should be recorded before Xbox/Godot implementation begins.

Please distinguish **documented capability**, **team-demonstrated capability**, and **production readiness** in review comments.

## Source documents

- [M1 implementation](M1_IMPLEMENTATION.md)
- [Client contract](CLIENT_CONTRACT.md)
- [Transport contract](TRANSPORT.md)
- [Identity contract](IDENTITY_CONTRACT.md)
- [DUET protocol](DUET_PROTOCOL.md)
- [Architecture decisions](DECISIONS.md)
- [Test plan](TEST_PLAN.md)

## Change discipline

M0 should prove feasibility before implementation expands.

Do not convert an unresolved feasibility question into an architectural assumption. When evidence changes, update this status document and the relevant decision/contract document rather than silently changing the milestone definition.
