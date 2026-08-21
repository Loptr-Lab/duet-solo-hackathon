## Resolution: Open Question 2 — `isReadyToAdvance()` timing

**Decision: Post-game snapshot approach (deferred).**

For Phase 1, `rebirthReady` will remain a post-game boolean checked by the aggregator in **Issue 2**, not a per-move field in Issue 1. This simplifies telemetry capture and matches the current `engine.isReadyToAdvance()` API.

The edge case identified (mid-game advance condition triggered then resolved before game-over) is treated as deferred scope. If playtesting data surfaces this as a critical issue, we will flag a follow-up issue to:
- Track `rebirthReady` as a per-move flag in `MoveEntry` 
- Update the aggregator to check the full move history rather than just the final board state

**Rationale:**
- Phase 1 prioritizes minimal telemetry surface area and fast aggregation
- The post-game snapshot approach is sufficient for Sealed Deck gate logic
- Per-move tracking adds ~32 bytes per move (~5KB/match overhead) without clear benefit until playtesting reveals the edge case matters in practice

This keeps Issue 1 (Telemetry Capture) focused and unblocks Issue 2 (Post-Game Aggregator) without schema rework.
