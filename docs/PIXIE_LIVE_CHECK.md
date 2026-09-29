# PIXIE fixed-answer review sheet

PR #67 serves eight fixed responses from `agentScope.js`; `/api/agent` makes no
model call. Use this sheet to review the player-facing text against DUET's
implementation before merging and after any rules change. Every response must
be at most 500 characters and use the intent returned by `gameReply`.

| Answer | Source in the DUET code | Reviewer | Date |
| --- | --- | --- | --- |
| **Rules:** DUET is a two-player chess variant. Each side has a Rebirth and a Death. The opposing Rebirth can Veil your nearby pieces, restricting how they move; your Death protects nearby friendly pieces. If your Rebirth is Veiled, you lose. | `public/index.html` game intro; `RadiusOfRuinSystem.resolve`; `checkLossCondition` in `veiled-chess-core-server.js` | Pending | Pending |
| **Controls:** On the web board, Tab to the command bar, type a move such as e2e4, and press Enter. Type one square, such as e4, to hear what is there. Remote matches use a room code. Fire TV remote controls still need device testing. | `public/index.html` command bar and `handleCommand`; remote room UI | Pending | Pending |
| **Accessibility:** Use the command bar to enter moves or query a square. DUET announces moves and status changes for screen readers. Tab moves through controls. VoiceView on Fire TV still needs device testing; please report any announcement or focus problem. | `public/index.html` `aria-live` status regions, `announce`, and command bar | Pending | Pending |
| **Gameplay:** On your turn, enter a four-character move such as e2e4 in the command bar and press Enter. The move must be legal for that piece and the current board. e2e4 is an example of the format, not a promise that it is legal right now. | `public/index.html` `handleCommand` and move validation | Pending | Pending |
| **Radius of Ruin:** At the end of a turn, your pieces within one square of the opposing Rebirth become Veiled unless protected by your own Death. A Veiled piece has restricted movement. Rebirth does not Veil her own side. If your Rebirth becomes Veiled, you lose immediately. | `public/index.html` `RadiusOfRuinSystem.resolve`; `veiled-chess-core-server.js` `checkLossCondition` | Pending | Pending |
| **Sanctuary:** Death’s Sanctuary protects friendly pieces within one square, including diagonals, from the opposing Rebirth’s Veil. It prevents new Veiling while they are protected; it does not clear a Veil already on a piece. | `public/index.html` `RadiusOfRuinSystem._within1` and `resolve` | Pending | Pending |
| **Rebirth and Death:** Rebirth moves like a queen and Veils opposing pieces within one square. Death moves one square like a king, cannot be captured, and protects nearby friendly pieces from Veiling. If your Rebirth becomes Veiled by the opposing Rebirth, you lose immediately. | `public/index.html` and `veiled-chess-core-server.js` `isValidMove`, `RadiusOfRuinSystem`, and `checkLossCondition` | Pending | Pending |
| **Fog Mode:** Fog Mode adds elevation, limited sight, and HP combat. Higher ground can extend sight and increases attack damage; unexplored squares stay hidden. It is local two-player play on a shared device. The AI opponent and Spectator mode are disabled, and remote rooms use Classic mode. | `public/index.html` Fog Mode rules, `computeVisionForColor`, `resolveFogCombat`, and handoff UI | Pending | Pending |

For each row, check the answer with a player-facing example and record a named
reviewer and date. If the code and answer disagree, correct the answer and its
exact-text test before marking the row reviewed. The DUET two-player code is
authoritative; the four-player Veiled Dominion lore has a different Radius rule.

Veil duration is deliberately absent from the answers: `DURATION_TURNS: 2`
counts down on the owner's moves and Radius can refresh the Veil, while older
page copy says “for a round.” Decide on a player-facing duration description
after confirming the full sequence. Fire TV D-pad and VoiceView behavior still
requires testing on a device or emulator.
