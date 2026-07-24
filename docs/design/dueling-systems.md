# Design Handoff: The Dueling Systems (Sufi Deck vs. Systems Quartet)

**Status:** Open design problem — not yet mechanically resolved. This is a handoff point: design intent is defined below, implementation/refinement is the next owner's call.

## Where this fits in Walking the Path

The origin myth ("Walking the Path" — the manga/Substack telling of Death's Daughter) frames Rebirth's entire education as a three-stage progression: **dice → cards → chess** — "the story of the court, how to move across the board" is explicitly the cards stage, sitting between the dice stage and the chess mastery that follows.

That means these two decks (hers/Sufi, his/Systems Quartet) aren't a side mechanic bolted onto the chess engine — they *are* the cards rung of that same ladder, now being revisited at the married, 4-player chapter of the story rather than her original solo education. Whoever works on Issues 1–4 below should keep that in mind: the resolution isn't just "make these two systems balance," it's "make the cards stage of Walking the Path make sense for two people walking it together instead of one person walking it alone." The dice stage (deprioritized in the current build order) and the chess stage (Duet, already built) bookend this — the cards stage is the one still actually open.

## Origin: The Marriage of Lady Violet

This whole system traces back to a specific scene in *The Legend of Lady Violet and Sebastien* (a separate graphic novel property) called "The Marriage of Lady Violet" — a King teaching Violet chess as a metaphor for power and rule ("a King is limited, he truly loses when he's lost a Queen"), with Violet pushing back: "why can there only be ONE winner?" That scene is the literal textual origin of Veiled Dominion's whole win-condition philosophy — the Rebirth/Death win condition wasn't invented fresh for the engine, it's an implementation of this pre-existing scene.

Following from that: the Sealed Deck's two lore variants are specifically **the King's deck and the Queen's deck** — Death's and Rebirth's own personal decks, each one reflecting that character's individual leadership style and ethics. Playing the card game together is how they learn each other's approach to ruling before governing their joint kingdom — which is exactly why this maps onto the married, 4-player chapter. The decks aren't a combat subsystem bolted onto the chess engine; they're part of the ritual the two of them use to actually work through disagreements.

**Resolved distinction (settled, not open):** *Duet* (the 2-player chess engine) is them playing **each other**. *The 52 Cards of War* is the deck used when they're playing against **other kingdoms** — external opponents, not each other. That answers what was previously Issue 3 below as a lore question; what's still open is only the mechanical side of it (see Issue 3).

## Context

Two variant systems exist on opposite sides of the same board, and the mismatch between them is **intentional**, not an oversight to symmetrize:

- **Hers — The Sufi Tariqah variant** (Sealed Deck reskin): a 52-card system built on hidden information, ritual, and named lore figures per suit (King/Queen/Jack). Resolves through cards — hands, peeks, intercepts.
- **His — The Systems Quartet** (from *The Obsidian Blueprints*): a board/engine variant built on open information and pure socio-economic mechanics (Cannon's Biome, Coulter's Cybernetic Loop, Veblen's Leisure Class, Fresco's Abundance). No cards, no hands, no royalty structure at all.

The design reference point is "Men are from Mars, Women are from Venus" — two operating logics that don't natively speak the same language. The point of pairing them isn't to make one dominant or to force them into matching structures. It's to use the friction between them to work out two open rules questions.

## Open Issue 1: How do the two systems settle conflicts?

Right now there's no shared arbitration layer. Her side's abilities assume something to act on (a hand to peek at, information to intercept). His side's mechanics don't generate that — Fresco's Abundance pieces don't even capture, they get repurposed. If her card ability triggers against a piece running his logic, there may be nothing on his side for it to resolve against — the systems can pass through each other instead of colliding.

**Direction sketched so far:** introduce a shared resource both systems can generate and spend, even though they generate it through completely different means (her side through card/ritual actions, his side through positional/systemic conditions like Equilibrium or hoarding thresholds). A contested square resolves on *who has more of the shared resource banked*, not on whose ability "wins" by type. This makes the resource the actual conflict-resolution currency instead of the abilities themselves.

## Open Issue 2: How do the two systems work together?

Per existing 4-player lore, Death and Rebirth are eventually a married, unified force. The relationship between these two systems shouldn't model one side beating the other — it should model two genuinely different problem-solving approaches learning to combine.

**Direction sketched so far:** neither system should be optimal alone on defense. Specific cross-system pairings (e.g., her Hearts restoration paired with his Abundance repurposing) unlock a joint effect that neither side can produce solo. This rewards translating one system's logic into the other's, rather than letting either system override the other.

## Open Issue 3: How does the base "52 Cards of War" deck mechanically relate to the two personal decks?

Lore-wise this is now settled (see Origin section above): *The 52 Cards of War* is played against other kingdoms; the Sufi deck (hers) and a Systems Quartet card equivalent (his) are their personal decks, played with each other. What's still open is purely mechanical:

- Is *The 52 Cards of War* — with its universal, un-named face-card powers (Jack = The Lieutenant, Queen = The Strategist, King = The Warlord, Ace = The Wild Fate) — the base chassis that Death's and Rebirth's personal decks are each individually reskinned from? i.e., when either of them faces an external kingdom, do they still play their own named cards, just against a different kind of opponent — or does facing an external kingdom mean switching to the generic, un-personalized 52 Cards of War deck entirely?
- This also intersects with existing engine history: the original dice-and-cards hybrid was deliberately cut back to a pure chess variant for the current build, with cards planned to re-enter later once the promotion-cap "board overloaded" signal (`isReadyToAdvance()`) gates them back in for 4-player. Whoever picks this up needs to decide which deck (or both) is what gets gated back in.

## Open Issue 4: What do the pip cards (2–10) actually mean, beyond their combat numbers?

Every version of the deck found so far — the base *52 Cards of War*, the Sealed Deck lore bible, and the Sufi Tariqah variant — gives pip cards a purely mechanical function (Skirmish Strike = 2 attack, Ember Spark = 1 RP, Whisper Network = peek at the draw pile, etc.), scaling by suit. None of them map the pip progression onto a thematic structure the way the face cards get named lore figures.

Open question: should 2 through 10 read as an ascending code — a law/commandment progression for her Sufi suits, a value-of-the-kingdom scale for his Systems Quartet — instead of just a number with a combat function attached? No design work exists on this yet in any doc.

**Note:** this is explicitly the collaborator's to own, not mine — mechanics balancing isn't my strength, and I don't want to push into territory someone else should be driving. Whoever picks this up should feel free to build it from scratch rather than trying to extend anything I've sketched above.

## Reference: Full Rosters (so this doc is self-contained)

### Hers — Sufi Tariqah variant (complete, all four suits)

| Suit | King | Queen | Jack |
|---|---|---|---|
| ♠ Shariat (Exoteric Law) | Imam Ali — "The Warlord" | Mansur al-Hallaj — "Conqueror's Edge" | The Darvish — "The Lieutenant" |
| ♥ Ma'rifat (Gnosis) | Rumi — "Phoenix Rite" | Rabia al-Adawiyya — "Mender's Grace" | Ibn Arabi — "Undying Resolve" |
| ♦ Haqiqat (Ultimate Truth) | Ibn Sina — "Courier Intercept" | Lalla Ded — "Spy's Glance" | The Majzoob — "False Orders" |
| ♣ Tariqat (Mystic Path) | Abu Yazid al-Bistami — "Unbreakable Line" | Shams of Tabriz — "Fortress Gate" | The Master Calligrapher — "Wicker Shield" |

Art direction: sacred geometry + Islamic illumination (Jali star patterns, Thuluth calligraphy), palette of pitch black, lapis lazuli blue, and VD amber. No red, no green.

### His — The Systems Quartet (from *The Obsidian Blueprints* — board/engine variant, no card structure)

| Name | Concept | Mechanic |
|---|---|---|
| The Biome (Cannon) | Fight-or-flight piece behavior | Wins via Equilibrium (taking no damage) |
| The Cybernetic Loop (Coulter) | Web-threaded pieces | Pulls enemies 1 square closer per turn |
| The Leisure Class (Veblen) | Pieces too wealthy to bother with Pawns | Can only target high-value pieces |
| The Abundance (Fresco) | No capturing at all | Enemy pieces "repurposed" into a neutral resource pool instead of the Graveyard |

### Known gap — the core (non-reskinned) mythic variant

Odin/Boudicca (Spades), Asclepius/Isis (Hearts), Hermes/Cassandra (Diamonds) are all defined. **Clubs King/Queen for this specific variant were never written** — only the faction description ("The Architects") exists. Three full reskins of the core variant exist (Kemetic, Shinbi, Fifth Sun), all of which *do* have complete Clubs royals, so any of those three could inform backfilling the missing core Clubs entry if that's ever wanted.

### The 52 Cards of War — base pip mechanics (known portion)

| Suit | Pip range known | Example |
|---|---|---|
| ♠ Spades (Conquest/Attack) | 2–10 fully documented | 2 = Skirmish Strike (atk 2) → 10 = Conqueror's Edge (atk 10, draw from discard on win) |
| ♥ Hearts (Restoration/Support) | 2–10 fully documented | 2 = Ember Spark (1 RP) → 10 = Phoenix Rite (full RP restore, once/game) |
| ♦ Diamonds (Intelligence/Subterfuge) | 2–10 fully documented | 2 = Whisper Network (peek draw pile) → 10 = Grand Betrayal (steal 3 cards) |
| ♣ Clubs (Fortification/Defense) | Only endpoints known | 2 = Wicker Shield, 10 = Unbreakable Line — individual cards 3–9 not found in any doc |

Face cards are universal across all four suits: J = The Lieutenant, Q = The Strategist, K = The Warlord, A = The Wild Fate.

## Recommended Reading

For whoever ends up owning the mechanics work on Issues 1, 2, and 4 above:

**Issue 1 (arbitration between two non-communicating systems):**
- *Characteristics of Games* — George Skaff Elias, Richard Garfield, K. Robert Gutschera. Direct treatment of hidden-information vs. open-information systems interacting, and shared-resource conflict resolution.
- *Root* (board game, designer Cole Wehrle) — a strong real-world precedent for factions that each play by fundamentally different rules on the same board, with no shared mechanic except the win condition.

**Issue 2 (cooperative combos between mismatched systems):**
- *Rules of Play: Game Design Fundamentals* — Katie Salen & Eric Zimmerman. Has a specific framework for "meaningful play" that applies well to designing combo interactions that reward translating one system's logic into another's.
- Matt Leacock's talks/writeups on *Pandemic*'s co-op design — useful for the "neither side optimal alone" balance goal specifically.

**Issue 4 (pip cards as a meaning-progression, not just numbers):**
- *78 Degrees of Wisdom* — Rachel Pollack. Already sitting in the Drive (referenced via the tarot research docs) — the standard reference for numerological/thematic progression across a card suit's pip run, which is exactly the gap here.
- *The Art of Game Design: A Book of Lenses* — Jesse Schell. General-purpose but has a useful lens specifically for "does this number mean something, or is it just a number."

## Next steps (open)

- Decide the shared resource for Issue 1 — what it's called, how each side generates/spends it, whether it reuses an existing stat (RP) or is new.
- Prototype 1–2 cross-system combo pairings for Issue 2 to test whether the "neither side is optimal alone" premise actually holds in play.
- Neither of these is committed yet — this doc is the starting brief, not a spec.
