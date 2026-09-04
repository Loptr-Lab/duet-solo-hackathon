# Duet Canonical Divergences

## Status

**Classification: Experimental**

Duet: Solo is a two-player, 8×8, screen-reader-first mechanics experiment. It is intentionally separate from the canonical four-player Veiled Dominion game.

The rules authority is `Loptr-Lab/veiled-dominion-engine`, whose current target is the four-player, 14×14 cross-board design. A Duet mechanic becomes canonical only through an explicit design decision and corresponding update in that repository. Similar names do not imply shared authority.

## Current divergence register

| Area | Duet behavior | Canonical four-player position | Status |
| --- | --- | --- | --- |
| Board and players | Two players on an 8×8 board | Four players on a 14×14 cross-shaped board | Experimental adaptation |
| Veiled duration | `DURATION_TURNS: 2`, ticked for the color that just moved | Until the start of the affected piece owner's next turn | Known divergence |
| Rebirth immunity | Rebirth may become Veiled | `docs/RULEBOOK_v0.1` currently says Rebirth is immune; the contradiction remains unresolved | Experimental |
| Loss of control | A Veiled Rebirth immediately returns `rebirth_lost_control` game over | No equivalent canonical four-player rule has been approved | Experimental |
| Reapplication | Applying Veil resets the fixed counter | Canonical implementation behavior must be deterministic while preserving owner-turn expiration | Experimental implementation detail |
| Pawn promotion | Tiered Rebirth/Knight/Bishop promotion with an overloaded-board state | Not part of the current four-player rulebook | Experimental |
| Fog Mode | Elevation, vision, HP/combat, and hidden information | Not part of the base canonical game | Optional and noncanonical |
| Resonance | Psychic and cinematic presentation language | Presentation language only | Not a stat or resource |

## Base-engine boundaries

The shared Duet base engine implements standard chess-like movement, Radius of Ruin, Veiled movement restrictions, Sanctuary behavior, and an uncapturable Death. Its implementation is useful evidence about an experiment, not authority for the four-player rules.

In particular:

- `VeiledStateSystem.DURATION_TURNS = 2` is a known deviation from the canonical owner-turn lifecycle.
- The Rebirth Veil exemption was intentionally removed in Duet.
- `checkLossCondition` treats a Veiled Rebirth as immediate loss of control.
- These choices must remain documented and tested as Duet behavior; they must never be copied into the four-player game merely because code already exists here.

## Fog Mode

Fog Mode is a separate optional system with elevation, vision, HP/combat, and hidden information. It is not part of Duet's extracted base engine and is not canonical Veiled Dominion gameplay. Promotion would require an explicit four-player design decision.

## Resonance and sound

Resonance may communicate psychic intrusion, psychic defense, mastery/restraint, and cinematic feedback. It remains presentation-only. Do not introduce a Resonance stat, HP system, damage type, or resource through this experiment.

## Cross-repository change rule

Every mechanics PR should state whether it changes:

- canonical four-player behavior;
- Duet-only experimental behavior;
- presentation only; or
- documentation only.

When Duet intentionally differs, keep the divergence explicit in tests and documentation. Promotion into canon requires a separate authoritative decision in `Loptr-Lab/veiled-dominion-engine`.
