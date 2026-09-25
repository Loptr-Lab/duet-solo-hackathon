# Ecosystem Architecture Map

**Status:** Working ecosystem map  
**Purpose:** Durable orientation document for the connected Loptr Lab game/design projects.  
**Authority:** This document records relationships, boundaries, and current artifact locations. It does not replace any project's constitution, rulebook, GDD, architecture invariant, or canonical engine.

## 1. System map

```text
                         SHARED MECHANICS
                    (common primitives only)
                              │
             ┌────────────────┼────────────────┐
             │                │                │
        MONEY GAME      VEILED DOMINION     WEAVER
       power/economy    restraint/game      dueling/
                          systems           experimental
             │                │                │
             └────────────────┼────────────────┘
                              │
                    host-specific rules
                             
          PARAGON-REBORN
       separate production /
       asset-license boundary
```

The shared layer provides reusable mechanics primitives. Each host retains its own rules, identity, presentation, and canonical authority.

## 2. Repositories and durable artifacts

### Shared Mechanics — canonical host

**Repository:** `Loptr-Lab/veiled-dominion-engine`

The shared mechanics layer was merged into `main` in PR #45 (merge commit `96a3ed9ed67ab474eed9834f8839a48571704eb5`).

Primary artifacts:

- `docs/architecture/SHARED_MECHANICS_LAYER.md`
- `docs/adr/ADR-0002-shared-mechanics-layer.md`

Shared primitives include:

- State
- Actors
- Actions
- State transitions
- Event → Outcome → Reaction → Counterreaction
- Cascades
- Separation of mechanics and presentation

The shared layer does **not** make the host games subsystems of one another, does not define host-specific numerical balance, and does not create a third game constitution.

### Money Game — socioeconomic host

**Repository:** `ibloud/pixie-holdings`  
**Architecture artifact set:** maintained as the Money Game contract/document set.

Constitutional architecture:

1. `ARCHITECTURAL_INVARIANT.md`
2. Core Design Architecture
3. MCP Contributor System Prompt

Contract layer:

4. `docs/design/FACTIONS.md`
5. `docs/architecture/EVENT_TRANSLATION_ENGINE.md`
6. `docs/architecture/CASCADE_ENGINE.md`
7. `.github/PULL_REQUEST_TEMPLATE.md`

Build tracker:

8. Architecture-to-Contracts Build Prompt

Core invariant:

> Money Game simulates the movement of power, not the movement of prices.

North Star ordering:

> Economy creates pressure → Ledgers express power → Coalitions create action → Influence determines outcomes.

**Important status note:** the architecture/contracts document set is complete as a design artifact, but that does not mean every document has been installed into the `pixie-holdings` repository. Repo installation remains separate work.

Unresolved gameplay parameters remain design decisions rather than architecture decisions.

### Veiled Dominion — canonical game host

**Repository:** `Loptr-Lab/veiled-dominion-engine`

Veiled Dominion remains the canonical four-player, 14×14 rules authority. Experimental mechanics from other projects do not become canon unless explicitly promoted there.

The shared layer is intentionally subordinate to Veiled Dominion's existing canonical rules.

### Weaver — experimental dueling host

**Repository:** `Loptr-Lab/duet-solo-hackathon`

Weaver is an experimental host implementation against the shared mechanics layer.

Structural instantiation:

- PR #52 — `docs: instantiate Weaver against shared mechanics layer`
- File: `docs/design/WEAVER_SHARED_MECHANICS_INSTANTIATION.md`
- Commit: `25390aff1bae998834c3681b9055b4c259eafc36`
- Status: draft/open

Design decision brief:

- PR #53 — `docs: add Weaver design decision brief`
- File: `docs/design/WEAVER_DESIGN_DECISION_BRIEF.md`
- Commit: `381c1049b8dfa28475e31f62aef96295b731b3ea7`
- Status: draft/open

The brief preserves Issues 1 and 2 as explicit design alternatives rather than silently selecting mechanics.

Open Weaver questions include:

- shared conflict resource
- generation and spending rules
- cross-system combinations
- Systems Quartet → card mapping
- Pip-card progression
- relationship between personal decks and the 52 Cards of War
- any future promotion into Veiled Dominion canon

### Paragon-Reborn — production / asset boundary

**Repository:** `ibloud/Paragon-Reborn`

Paragon-Reborn is kept separate from the shared mechanics architecture. Its current role is production, visual/asset integration, and licensing boundary management.

Asset integration contract:

- PR #13 — `docs: establish Paragon asset integration contract`
- `docs/PARAGON_ASSET_INTEGRATION.md`
- `docs/decisions/2026-09-24-paragon-asset-integration.md`
- Status: draft/open

The contract is a production/compliance gate, not a gameplay constitution. It records the current Fab licensing baseline and project-specific asset provenance/release requirements.

## 3. Boundary rules

### Shared mechanics boundary

The shared layer may define reusable mechanics primitives.

It must not silently import:

- Money Game's six ledgers into Veiled Dominion
- Veiled Dominion's canonical rules into Money Game
- Weaver's Systems Quartet or Sufi Tariqah deck into another host
- Paragon assets or licensing terms into game mechanics

### Canon boundary

Experimental behavior remains experimental until the host project explicitly promotes it.

The existence of a shared abstraction does not itself promote a mechanic into any host's canon.

### Presentation boundary

Mechanics determine authoritative state and outcomes. Presentation/UI renders those results for the host experience.

### Asset boundary

Paragon/Fab assets remain governed by their applicable third-party terms and project-specific provenance controls. They are not treated as repository-owned source assets merely because a project uses them.

## 4. Current development chain

```text
Shared primitives
      ↓
Host-specific instantiation
      ↓
Explicit design decisions
      ↓
Host-specific contract
      ↓
Implementation
      ↓
Tests / playtesting
      ↓
Explicit canon promotion (if applicable)
```

An unresolved design question should remain visibly unresolved. Architecture documents should not be used to smuggle gameplay decisions into the system.

## 5. Current artifact status

| Area | Durable artifact | Current status |
|---|---|---|
| Shared mechanics | Shared Mechanics Layer + ADR | Merged |
| Weaver structural instantiation | PR #52 | Draft/open |
| Weaver Issues 1–2 brief | PR #53 | Draft/open |
| Paragon asset integration | PR #13 | Draft/open |
| Money Game architecture/contracts | Document set | Complete as artifacts; repo installation separate |
| Weaver gameplay contract | Future artifact | Blocked on explicit design decisions |

## 6. What this document is for

Use this file as the **ecosystem starting point** when returning after a break, onboarding a contributor, or handing the work to another AI/tool.

Use the project-specific canonical documents for actual rules.

This file should be updated when:

- a repository changes role,
- a major architecture artifact is merged,
- a host-specific boundary changes,
- a major design decision is explicitly resolved,
- a new project becomes part of the ecosystem.

Do **not** update this file merely because an unresolved idea was discussed. Discussion belongs in the relevant design brief, issue, ADR, or chat history until explicitly adopted.

## 7. Explicit non-goals

This map does not:

- establish new gameplay rules;
- select among unresolved Weaver alternatives;
- make Money Game architecture canonical for another project;
- make Weaver canonical for Veiled Dominion;
- create a third constitution;
- grant rights to third-party assets;
- replace repository-specific contribution, licensing, or release documentation.
