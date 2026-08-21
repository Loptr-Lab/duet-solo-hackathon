# Player Profile Schema

**Location in repo:** `docs/design/player-profile-schema.md`
**Status:** Final draft — merge before implementing Issues 1–7
**Related files:** `gameNamespace.js`, `roomStore.js`, `veiled-chess-core-server.js`, `atprotoPoster.js`
**Firestore project:** `adept-crossing-106819`
**Milestone:** `Player Profile System v1`
**Labels:** `stat-capture`, `player-profile`, `at-proto`, `matchmaking`, `ethics`, `docs`

---

## 1. System Vision & Core Philosophy

Veiled Dominion combines chess-variant mechanics (Veil, Rebirth, Sealed Decks) with an authentic, data-driven identity architecture built on two pillars:

**Observed telemetry over self-report.** Playstyle profiles and archetypes derive from passive in-game decision telemetry (`matchLogs`, ACPL, sacrifice rates, veil usage, comeback wins) — not surveys, which suffer from aspirational bias.

**Mercy-first framing for self-acceptance.** Move evaluations use non-punitive tiers (`BEST`, `SOLID`, `OPPORTUNITY`, `PIVOTAL`). Gameplay data is surfaced as continuous behavioral traits with dual-sided reflections — every style has a superpower and a natural shadow — fostering genuine player self-discovery rather than deficit labeling.

---

## 2. Multi-Layer Storage Architecture

| Layer | Location | Owner | Function |
|---|---|---|---|
| Live game state | Firestore `veiled_dominion_rooms` | Platform | Active socket coordination, board state, active turns |
| Match history | Firestore `matchLogs` | Platform | Append-only move telemetry, server-evaluated scores, severity tiers |
| Aggregated summary | Firestore `playerProfiles` | Platform (Phase 1 canonical / Phase 2 cache) | Matchmaking queries, continuous trait vectors, archetype tags, Sealed Deck selections |
| Sovereign player record | AT Proto `actor.rpg.stats` | Player | Portable, player-owned character identity and behavioral signature |

```
┌─────────────────────────────────┐
│       Live Match Session        │
│ (veiled_dominion_rooms/{roomId})│
└────────────────┬────────────────┘
                 │ Move confirmation via gameNamespace.js
                 ▼
┌─────────────────────────────────┐
│          Match Logs             │
│      (matchLogs/{roomId})       │
└────────────────┬────────────────┘
                 │ Post-game aggregation
                 ▼
┌─────────────────────────────────┐
│         Player Profile          │
│ (playerProfiles/{playerToken})  │
└────────────────┬────────────────┘
                 │ Phase 2 OAuth / PKCE write-back
                 ▼
┌─────────────────────────────────┐
│    AT Proto Sovereign Record    │
│        (actor.rpg.stats)        │
└─────────────────────────────────┘
```

---

## 3. Pre-DID Identity Bridging

AT Proto DIDs are not available until Phase 2 OAuth is implemented. During Phase 1, players are keyed by the **reconnect token** — the 32-character hex string (`crypto.randomBytes(16).toString('hex')`) generated at `create_room` and `join_room` in `gameNamespace.js`, stored on the room as `room.tokens.w` and `room.tokens.b`.

- Move logs and profile summaries are keyed by reconnect token during Phase 1
- All schemas include a `did` field initialized to `null`
- When Phase 2 OAuth/PKCE lands, a one-time migration updates the `did` field — a field update, not a schema change
- Token collision probability is negligible (2^128 space) but the aggregator should check for an existing document before creating and log a warning if the token maps to a different match history

---

## 4. Firestore Collections

### 4.1 `veiled_dominion_rooms` (existing — no changes)

Managed by `roomStore.js`. Reference only.

```
veiled_dominion_rooms/{roomId}
  board:       Array(8)[Array(8)[{type, color} | null]]
  turn:        'w' | 'b'
  gameOver:    boolean
  winner:      'w' | 'b' | null
  players:     { w: socketId, b: socketId | null }
  tokens:      { w: string, b: string | null }
  createdAt:   number (Unix ms)
  updatedAt:   number (Unix ms)
```

---

### 4.2 `matchLogs/{roomId}` (new — Issue 1)

One document per match. Written by `gameNamespace.js` after each confirmed `make_move`. Created on the first move; updated (array union) on every subsequent move. Average document size ~16 KB — well below the 1 MB Firestore document limit; the `moves` array stays on the parent document.

```
matchLogs/{roomId}
  roomId:        string
  playerTokens:  { w: string, b: string }
  playerDIDs:    { w: string | null, b: string | null }
  startedAt:     number (Unix ms)
  completedAt:   number | null
  winner:        'w' | 'b' | null
  moves:         Array[MoveEntry]
```

#### MoveEntry

```json
{
  "moveNum": 1,
  "color": "w",
  "from": "e2",
  "to": "e4",
  "piece": "p",
  "capturedPiece": null,
  "evalBefore": 0.0,
  "evalAfter": 0.15,
  "severity": "BEST",
  "veiled": false,
  "veiledOpponent": false,
  "sacrifice": false,
  "inversionClause": null,
  "promotedTo": null,
  "timeMs": 3200,
  "timestamp": 1724184000000
}
```

| Field | Type | Source | Notes |
|---|---|---|---|
| `moveNum` | int | counter | 1-indexed, increments each confirmed move |
| `color` | `'w'`\|`'b'` | `moverColor` in `make_move` | Player who just moved |
| `from` / `to` | string | `payload.from` / `payload.to` | Algebraic notation, validated by `parseSquare()` |
| `piece` | string | `board[from.r][from.c].type` before move | `'p'`, `'r'`, `'n'`, `'b'`, `'rb'`, `'d'` |
| `capturedPiece` | string\|null | `board[to.r][to.c].type` before move | null if square was empty |
| `evalBefore` | float | `engine.evaluateBoard(board, moverColor)` | Called before `engine.makeMove` |
| `evalAfter` | float | `engine.evaluateBoard(board, moverColor)` | Called after `engine.makeMove` |
| `severity` | string | `engine.getSeverityTier(evalBefore, evalAfter, moverColor)` | `'BEST'`\|`'SOLID'`\|`'OPPORTUNITY'`\|`'PIVOTAL'` |
| `veiled` | boolean | board state post-move | True if moved piece is veiled after landing |
| `veiledOpponent` | boolean | board state post-move | True if this move caused an opponent piece to become veiled |
| `sacrifice` | boolean | derived | True if `capturedPiece === null` AND moved piece enters veil (voluntary veil walk) |
| `inversionClause` | `'blind'`\|`'seal'`\|null | reserved | Null until Inversion Clause mechanic is implemented |
| `promotedTo` | string\|null | result of `engine.makeMove` | Piece type if pawn promotion occurred, else null |
| `timeMs` | int | timestamp delta | Ms since previous move, or since match start for move 1 |
| `timestamp` | number | `Date.now()` | Unix ms at move confirmation |

**Implementation note:** `evaluateBoard` and `getSeverityTier` are both exported from `veiled-chess-core-server.js` — no prerequisite export work needed. Both evals must use the same `forColor` (moverColor) so the diff is directionally meaningful. The severity tier names (`BEST`, `SOLID`, `OPPORTUNITY`, `PIVOTAL`) are final — do not substitute chess-conventional terms (`inaccuracy`, `mistake`, `blunder`) anywhere in the codebase, UI, or PIXIE coaching output.

---

### 4.3 `playerProfiles/{playerToken}` (new — Issues 2 & 3)

One document per player. Created or updated by the post-game aggregator after a match completes. Also updated when a player saves their Sealed Deck selection.

```
playerProfiles/{playerToken}
  playerToken:     string
  did:             string | null
  createdAt:       number (Unix ms)
  updatedAt:       number (Unix ms)

  stats: {
    matchesPlayed:       int
    wins:                int
    losses:              int
    winRate:             float
    acpl:                float
    veilRate:            float
    opponentVeilRate:    float
    sacrificeRate:       float
    comebackWins:        int
    rebirthAdvances:     int
    rebirthReady:        boolean
    inversionClause:     { total: int, blind: int, seal: int }
  }

  traits: {                              // Phase 2 — reserved, written as null by Issue 2
    riskOrientation:     float | null    // 0.0–1.0: Preservationist <-> Vanguard
    veilIntimacy:        float | null    // 0.0–1.0: Anchor <-> Shadow-Weaver
    deliberation:        float | null    // 0.0–1.0: Intuitive <-> Architect
    resilience:          float | null    // 0.0–1.0: Front-Runner <-> Tenacious
  }

  deck: {
    primarySuit:   'spades' | 'hearts' | 'diamonds' | 'clubs' | null
    cards:         Array[string]
    savedAt:       number | null
  }

  archetype:       string | null
  researchConsent: boolean
```

#### Field notes

**`stats.rebirthReady`** — set to `true` by the aggregator if `engine.isReadyToAdvance()` returned true at any point during the match. This is the gate for the Sealed Deck unlock in Issue 3. `isReadyToAdvance()` is already exported from `veiled-chess-core-server.js`. See Open Question 2 for a known timing edge case.

**`stats.acpl`** — average centipawn loss across all confirmed moves for this player, computed from `evalBefore - evalAfter` per move (clamped to 0 minimum — a move that improves the position does not produce negative loss).

**`stats.comebackWins`** — incremented when the player wins a match where `evalBefore < -1.0` on the winning move (board was losing from their perspective immediately before the game-ending move).

**`traits`** — all four fields initialized to `null` by the aggregator in Issue 2. Normalization formulas and radar UI are the subject of Issue 4 (RFC). The aggregator must not write non-null values here until Issue 4 is resolved and merged.

**`researchConsent`** — `false` by default. Set at account creation via plain-language opt-in. Only anonymized post-game summaries are included in any research export — raw move logs (`matchLogs`) are never included.

#### Archetype derivation (Issue 3 — set by aggregator, not self-reported)

| Label | Condition |
|---|---|
| `unclassified` | `matchesPlayed < 3` |
| `eletra_scion` | `sacrificeRate > 0.15` AND `acpl < 80` |
| `arian_bound` | `veilRate < 0.05` AND `opponentVeilRate > 0.10` |
| `hecate_witness` | High `opponentVeilRate`, low `sacrificeRate` |
| `sovereign_choice` | Win without sacrifice moves in final 5 turns |
| `architects_debt` | `comebackWins > 2` AND high `timeMs` variance |

Archetypes are descriptive only — observed play behavior, not a personality assessment. They are never surfaced to other players during matchmaking and must not be framed as permanent identity labels in any UI copy.

---

## 5. Derived Mechanics

### 5.1 Continuous Traits (Issue 4 — RFC)

Normalization formulas are not yet defined. Issue 4 produces them. Until Issue 4 merges, the aggregator writes `null` for all trait fields. Do not implement partial formulas ahead of the RFC.

| Trait | Low pole | High pole | Raw signal |
|---|---|---|---|
| `riskOrientation` | Preservationist | Vanguard | `sacrificeRate` + forward tempo |
| `veilIntimacy` | Anchor | Shadow-Weaver | `veilRate` + `opponentVeilRate` |
| `deliberation` | Intuitive | Architect | `timeMs` variance across PIVOTAL nodes |
| `resilience` | Front-Runner | Tenacious | `comebackWins` + recovery from negative eval swings |

### 5.2 PIXIE Coaching Architecture (Issue 6)

**In-game hint ladder** (practice and casual modes only — not ranked):
- Level 1 (Piece Focus): highlights origin square of highest-potential candidate move
- Level 2 (Threat Zone): highlights destination sector or tactical tension line
- Level 3 (Tactical Principle): textual principle hint (e.g. *"Veil entry preserves tempo here"*)

**Post-match debrief** (Issue 5):
- Frames missed lines as natural trade-offs (superpower vs. shadow), not failure points
- Interactive sandbox: replay board states tagged `OPPORTUNITY` or `PIVOTAL` to discover the `BEST` line
- Dual-sided self-acceptance card: surfaces the player's strongest trait alongside its natural shadow

### 5.3 Matchmaking Algorithm (Issue 3)

Reads from `playerProfiles` on two axes. Skill balance resolves first; faction coverage is optimized within the skill-balanced pool.

**Axis 1 — Skill:** |ACPL_A − ACPL_B| ≤ 40 centipawns. Widens to 80 after 60 seconds without a full table.

**Axis 2 — Faction:** `deck.primarySuit` coverage. Target: ≥ 1 Diamonds, ≥ 1 Hearts, ≤ 2 same-suit duplicates at any table.

Players with `matchesPlayed < 3` (`unclassified`) queue in an isolated beginner pool until the threshold is met.

### 5.4 Archetype Bot Sparring (Issue 7)

Four bot presets (one per suit/faction) serve as matchmaking queue fallbacks when a human table cannot be assembled. Bot heuristics derive from the archetype signal definitions above — each bot plays to its archetype's dominant trait rather than pure minimax optimization.

---

## 6. AT Proto Phase 2

Phase 2 writes aggregated stats to `actor.rpg.stats` via OAuth/PKCE (`@atproto/oauth-client-browser`, CDN/ESM, no build step). `client-metadata.json` is hosted on the ibloud GitHub Pages URL.

After Phase 2, Firestore `playerProfiles` remains as the platform-side matchmaking cache — querying AT Proto at match-join time is too slow. The post-game aggregator keeps both in sync.

The existing `atprotoPoster.js` (event posting, app-password auth) is separate from Phase 2 and is not modified by this work.

**Phase 2 prerequisite:** test the fetch-merge-put against a throwaway Bluesky account with a disposable `actor.rpg.stats` record before writing to any real character record, to confirm the merge does not overwrite data belonging to other game systems sharing the same record.

---

## 7. Ethical Data Handling

- Move logs (`matchLogs`) are never exposed to third parties or used for profiling beyond the player's own stats
- `researchConsent: false` by default — opt-in at account creation with plain-language description of what is included
- Research exports contain anonymized post-game summaries only — raw move logs are excluded
- No demographic inference from play style, trait scores, or archetype label
- Archetype labels must not be framed as permanent identity in any UI copy
- Severity tier naming (`BEST`, `SOLID`, `OPPORTUNITY`, `PIVOTAL`) is final — chess-conventional punitive terms are prohibited throughout the codebase and UI
- No cross-session behavioral tracking beyond what the player opts into via AT Proto write-back
- Guest/anonymous sessions produce no `playerProfiles` document (session-scoped anonymized aggregates are future scope, not Phase 1)
- Fog Mode move logs are out of scope for Phase 1 — Fog Mode is mutually exclusive with remote play in the current build

---

## 8. Implementation Roadmap

```
[Schema PR: docs/design/player-profile-schema.md]
                       │
      ┌────────────────┴────────────────┐
      ▼                                 ▼
[Issue 1: Telemetry Capture]   [Issue 4: Trait System RFC]
(matchLogs writes in            (Normalization formulas
 gameNamespace.js)               and radar UI design)
      │                                 │
      ▼                                 ▼
[Issue 2: Post-Game Aggregator] [Issue 5: Retry Sandbox]
(playerProfiles updates,         (Interactive replay of
 traits written as null)          OPPORTUNITY/PIVOTAL states)
      │                                 │
      ▼                                 ▼
[Issue 3: Sealed Deck &        [Issue 6: PIXIE Hint Ladder]
 Archetype Classification]      (3-tier progressive engine
(rebirthReady gate,              for practice/casual modes)
 faction + matchmaking)
      │                                 │
      └────────────────┬────────────────┘
                       ▼
          [Issue 7: Archetype Bot Presets]
          (Sparring AI for queue fallbacks,
           one per suit/faction)
```

Issues 1 and 4 are parallelizable. Issues 2 and 5 each depend on their upstream (1 and 4 respectively). Issue 3 depends on Issue 2. Issue 6 depends on Issues 3 and 5. Issue 7 depends on Issue 3.

---

## 9. Open Questions

1. **Fog Mode logging** — out of scope for Phase 1. If Fog Mode is ever enabled for remote play, its HP/combat fields need a separate MoveEntry extension. Flag as a follow-up issue at that time.

2. **`isReadyToAdvance()` timing** — the aggregator checks this from the final board state post-game. If the condition was briefly true mid-game but resolved before game-over (e.g. a Rebirth was captured and re-promoted), the post-game snapshot misses it. Decide whether to track `rebirthReady` as a per-move boolean in MoveEntry or accept the post-game snapshot as sufficient for Phase 1.
