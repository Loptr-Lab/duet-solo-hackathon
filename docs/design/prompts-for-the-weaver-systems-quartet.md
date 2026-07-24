# Prompts for The Weaver — Building the Systems Quartet Game & Deck

Context: these are meant to be pasted into your own Claude session (or Claude Code), one at a time, in order. Each one gives Claude the background it needs and asks it to help *you* make the calls — none of them presuppose an answer. This is your side of the project; the prompts are scaffolding, not a spec.

---

## Prompt 1 — Resolve the player-dynamic fork

```
I'm building a companion to an existing 2-player chess variant called Duet.
Duet works like this: two players, mirrored armies, one special piece each
(Rebirth and Death) with asymmetric narrative roles but identical rules for
both sides.

I have a 4-faction variant already designed called the Systems Quartet —
four completely different rule sets (Cannon: Homeostasis/fight-or-flight,
Coulter: Cybernetic feedback loops that pull enemy pieces closer, Veblen:
Conspicuous Consumption that can't capture Pawns, Fresco: Abundance that
repurposes instead of capturing). This was designed as one of several
4-player variant stress-tests for a bigger engine, not as a 2-player game.

I want a 2-player companion to Duet built from this material, but I haven't
decided the actual player dynamic yet. Help me think through the real
options before we build anything:

1. One faction (say, Cannon) plays as "my" side against a standard mirrored
   army — structurally identical to Duet, just with Homeostasis instead of
   the Veil mechanic.
2. Two different factions face each other (e.g. Cannon vs. Fresco) — a
   genuinely different kind of game, since neither side is a standard army
   and both sides play by different rules from each other.
3. Something else — a hybrid, or a different fork I haven't considered.

Walk me through what each of these actually plays like, what's easiest to
prototype first, and what changes about balance/testing for each. I want to
land on a specific decision before writing any code.
```

---

## Prompt 2 — Convert the board variant into an actual card deck

```
I have a fully-designed board-game variant (attached/pasted below) — four
factions, each with a distinct mechanic, aesthetic, and philosophy. I need
to convert this into an actual 52-card deck (4 suits, face cards, pip
cards 2-10) so it can be played as a standalone card game, and specifically
so it can be used in a simple two-player game of War against a different,
already-built 52-card deck.

The existing card deck I'm matching structurally (not thematically) uses:
- 4 suits mapped to 4 philosophies
- Face cards (King/Queen/Jack) as named characters with a lore blurb and a
  one-line mechanic tie-in
- Pip cards 2-10 with an ability tied to the suit's theme, scaling by number

Help me work through:
1. Do my four factions become the four suits, or is there a different
   mapping that makes more sense for what I'm building?
2. Who are the face cards for each suit — real people, characters, or
   abstractions consistent with my factions' existing philosophies?
3. What do the pip cards 2-10 actually represent thematically, not just
   mechanically — a progression of some kind, if one makes sense here?
4. For a plain game of War (compare top card by rank, no abilities), do the
   named abilities matter at all, or is this deck's "real" gameplay meant
   to live somewhere other than War?

I want your read on the design space, not a finished deck — I'll make the
actual calls.

[paste the Systems Quartet variant doc here]
```

---

## Prompt 3 — Tie it back to the union mechanic

```
Two personal card decks exist in this project — mine and a collaborator's.
The intended shape is: each of us plays our own deck separately while we're
still "reaching each other." When we hit a design or gameplay impasse, we
resolve it with a simple game of War, our deck against theirs, highest card
wins the dispute. Once we're "united," we set the personal decks aside and
play one shared 52-card deck together, against outside opponents.

Given the deck I'm building (see above), help me think through what it
actually feels like at the table when someone plays a hand of War using it
against a genuinely different card system (different suits, different
face-card logic, different thematic pip progression). Where does the
friction show up? What does "losing a War hand" cost thematically for my
side specifically, versus theirs?

I'm not looking for you to resolve the collaborator's design choices for
them — just to help me understand and design my own side's experience of
this shared mechanic clearly enough that it holds up when the two decks
actually meet.
```

---

## Notes for whoever picks this up

- These prompts assume access to the Systems Quartet variant doc and the Sufi Tariqah deck as reference material for structural comparison (not to copy).
- Prompt 1 needs to be resolved before Prompt 2 makes full sense — the player dynamic affects how many "your side" decks are even needed.
- None of this determines The Weaver's deck actual content (suits, characters, art, lore). That's their call entirely, same as before.
