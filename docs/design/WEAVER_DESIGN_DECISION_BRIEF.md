# Weaver Design Decision Brief: Issues 1 & 2

**Status:** Decision-space artifact — open design; no alternative selected.

**Source authority:** `docs/design/WEAVER_START_HERE.md`, `docs/design/dueling-systems.md`.

**Constraint:** Resolving these questions must add Weaver-specific rules. It must not modify the shared mechanics primitives or borrow Money Game / Veiled Dominion rules.

---

## Issue 1: Shared conflict resource

### What the source establishes

The two decks operate on incompatible logics. Her side (Sufi Tariqah) uses hidden information, ritual, card peeks, and intercepts. His side (Systems Quartet) uses open information and socio-economic mechanics (Homeostasis, Cybernetic Loop, Leisure Class, Abundance). When her card ability triggers against a piece running his logic, there may be nothing on his side for it to resolve against.

The source sketches a direction: introduce a shared resource both systems can generate and spend through different means. A contested square resolves on who has more of the shared resource banked. The resource becomes the conflict-resolution currency instead of the abilities themselves.

### What must be decided

1. What the resource represents (identity)
2. How each system generates it (production rules)
3. How each system spends it (consumption rules)
4. Whether it reuses an existing stat (RP) or is new

### Alternative A: Reuse Restoration Points (RP)

RP already exists in the 52 Cards of War base system. Hearts suit generates RP.

**For:** No new concept. Reduces cognitive load. Base deck already has RP mechanics documented.

**Against:** RP is thematically tied to Hearts/Restoration. Using it as universal conflict currency flattens suit distinction. His side has no existing RP generation, so rules must still be invented. Reusing a stat from her side's native system may undermine the asymmetry the source explicitly frames.

**Dependency:** Hearts suit gains structural importance over other suits in conflict resolution, potentially distorting strategy.

### Alternative B: New named resource

A resource specific to the Weaver dueling context, generated differently by each side.

**For:** Preserves asymmetry. Each side's generation can reflect its philosophy (ritual/hidden-information vs. positional/systemic conditions like Equilibrium or hoarding thresholds). Tunable independently. Cleaner separation from base 52 Cards of War.

**Against:** New concept to learn, name, track, and render. The source proposes no name or unit.

**Dependency:** The name and thematic identity affect whether it reads as native to "two people learning to rule together" or as an imported abstraction.

### Alternative C: Positional/spatial resolution (no abstract resource)

Conflict resolves based on board state. Stronger position on the contested square wins.

**For:** No new tracked value. Grounded in the board. Consistent with his open-information philosophy.

**Against:** Her card-based abilities become irrelevant to conflict outcomes. The source explicitly proposes a "banked" resource, suggesting designers considered and moved past spatial-only resolution.

**Dependency:** Requires defining "stronger position" across two systems that measure strength differently.

### Unresolved sub-questions (regardless of alternative)

- Generation asymmetry: how different can rates be before structurally unfair?
- Spending: consumed on use, or committed (locked during contest, returned if not spent)?
- Visibility: visible to both (his open-information philosophy) or hidden (hers)?
- Persistence: carries across turns, or resets?

---

## Issue 2: Cross-system cooperation

### What the source establishes

Per 4-player lore, Death and Rebirth are eventually a married, unified force. The relationship should model two different problem-solving approaches learning to combine. The source sketches: neither system should be optimal alone on defense. Specific cross-system pairings unlock a joint effect neither side produces solo.

### What must be decided

1. What constitutes a valid cross-system pairing
2. What joint effects exist (the combo catalog)
3. Whether the game is competitive-with-cooperation or cooperative-with-competition
4. When cooperation becomes available

### Alternative A: Cooperation as a phase gate

Cooperation unlocks only after reaching the "united" state. Before that, competitive play with War for impasses. After uniting, personal decks set aside for the shared 52 Cards of War against external kingdoms.

**For:** Matches the lore arc. Clear narrative progression. Simplifies competitive phase. The source already distinguishes personal decks (each other) from 52 Cards of War (external opponents).

**Against:** Delays cross-system combos to a phase that may not be the primary play experience.

**Dependency:** Requires defining what triggers the competitive → united transition.

### Alternative B: Cooperation always available, competition is the tension

Cross-system combos available at any time, but require committing resources that could be used competitively. Every turn has a cooperate-or-compete decision.

**For:** Reflects "learning to work together" in real-time. Combos discoverable throughout play.

**Against:** Hardest to balance. Requires Issue 1 resolved first (cooperation and competition draw from same pool). Risk of dominant always-cooperate or always-compete strategies.

**Dependency:** Deeply coupled to Issue 1. The economy must support both uses.

### Alternative C: Cooperation as defensive-only mechanic

Cross-system effects available only on defense. Offense remains individual. Matches the source's "neither system optimal alone on defense" direction.

**For:** Constrains design space. Smaller combo catalog needed. Preserves individual identity on offense. Directly implements stated source direction.

**Against:** May feel restrictive. "Learning to combine" theme weakened if combination only happens under threat.

**Dependency:** Requires defining "defense" in a system where Fresco/Abundance does not capture.

### Candidate cross-system pairings

These are structural possibilities, **not proposals or committed mechanics**.

| His system | Her suit | Potential joint direction | Status |
|---|---|---|---|
| Cannon (Homeostasis) | ♠ Shariat (Law) | Stabilization under pressure? | OPEN |
| Coulter (Cybernetic Loop) | ♦ Haqiqat (Truth/Intel) | Information-driven positioning? | OPEN |
| Veblen (Leisure Class) | ♣ Tariqat (Mystic Path) | Selective protection? | OPEN |
| Fresco (Abundance) | ♥ Ma'rifat (Gnosis) | Restoration through repurposing (source example) | OPEN |

### Unresolved sub-questions

- Combo discovery: explicit rules or emergent through play?
- Combo cost: both players spend the shared resource, or only one?
- Combo symmetry: can either side initiate, or must both contribute?
- Combo persistence: instantaneous or lasting condition?

---

## Dependencies between Issue 1 and Issue 2

These issues are coupled. The shared conflict resource (Issue 1) likely serves as the economy for cooperation (Issue 2). Resolving Issue 1 first constrains the cooperation design space usefully. Resolving Issue 2 first risks designing mechanics that require a resource the system does not have yet.

**Resolution order recorded by this brief: Issue 1 → Issue 2.**

This is a sequencing recommendation for the design process, not a selected gameplay mechanic.

---

## What this brief does not do

- Choose a winner among alternatives
- Invent mechanics not in the source material
- Import Money Game ledger semantics or Veiled Dominion restraint mechanics
- Resolve Issues 3 or 4
- Modify the shared mechanics layer
- Promote any alternative into the Weaver instantiation document

---

## Relationship to the existing Weaver architecture

The structural instantiation remains separate:

`docs/design/WEAVER_SHARED_MECHANICS_INSTANTIATION.md` maps Weaver concepts onto shared primitives.

This brief does not alter that mapping.

The eventual Weaver contract should be downstream of this decision artifact and should contain only decisions explicitly made by the design team, expressed as named, deterministic, testable Weaver-specific rules.

Until then, **PR #52 remains a structural instantiation draft rather than a completed Weaver rules contract.**
