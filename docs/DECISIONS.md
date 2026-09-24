# DUET Architecture Decisions

## ADR-001 - Client-first platform abstraction
**Status:** Accepted

DUET introduces a platform-neutral client contract before Xbox-specific client code. Xbox/Godot is a proving ground for the abstraction, not the owner of the architecture.

## ADR-002 - Server remains authoritative
**Status:** Accepted

The existing authoritative Node.js server remains responsible for validation, move application, resolution, and snapshots. A second client must not create a second source of truth.

## ADR-003 - Socket.IO is an adapter
**Status:** Accepted

Socket.IO remains the initial gameplay transport. Client/game code accesses it through the transport boundary.

## ADR-004 - Repository isolation
**Status:** Accepted

Xbox/Godot work lives in a dedicated client area and does not turn the existing web project into a Godot project. The working web game remains the baseline.
