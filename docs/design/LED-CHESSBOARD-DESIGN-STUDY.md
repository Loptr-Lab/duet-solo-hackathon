# Duet LED chessboard — design study

**Status:** unbuilt proposal. No prototype, hardware purchase, build partner, compatibility test, or accessible hardware interaction has been verified. This is an educational analysis, not a production commitment or canonical Veiled Dominion rules change.

## Provenance

The founder supplied text from the Loptr Lab Patreon [Hackaday Build post](https://www.patreon.com/LoptrLab/posts/hackaday-build-163694370), which discusses adapting the board in this [video walkthrough](https://youtu.be/Z92TdhsAWD4) for Duet. The Patreon page was not publicly retrievable in this review and the video has not been independently audited. The component list and adaptation ideas below are attributed to that founder-supplied account, not verified build instructions.

## Reference board and proposed translation

The described reference has a four-section printed base, eight strips of eight LEDs under the squares, edge-coordinate LEDs, ten tactile switches connected to an Arduino Nano, USB 5V power, a Raspberry Pi, OLED, and serial level converter. Its reported standard-chess software uses a referee and optional Stockfish for local solo play; it can also connect two boards. These are claims about the reference board, **not** Duet features.

| Duet design question | Proposed experiment | Evidence needed |
| --- | --- | --- |
| Rules | Replace the standard-chess referee with an adapter to the current `Loptr-Lab/duet-solo-hackathon` multiplayer app's server-authoritative move contract; omit Stockfish for the two-human experiment | Fixture cases for valid and invalid moves, snapshots and final state from [the M1 test plan](../TEST_PLAN.md); record the app commit and compare browser and board responses against the same server state |
| Visual state | Map Radius of Ruin, Sanctuary, and Veiled to LEDs with patterns or brightness as well as colors | Player comprehension in varied lighting; no color-only meaning |
| Input | Try square select and confirm using available buttons | Reversible selection, error recovery, motor-access test |
| Audio | Provide deterministic speech or recorded announcements and a speaker; test spatial/proximity cues | Blind-player review of full state, action feedback, navigation, and setup without a screen |
| Power and service | Assess USB supply, current draw, level shifting, cable strain, enclosure, and maintenance with an experienced maker | Electrical review and a reproducible bill of materials before a physical build |

The browser game's accessible command path and screen-reader announcements do not automatically transfer to an Arduino/Pi kiosk. Do not treat LED output, tactile buttons, or a text-to-speech library as proof of accessibility. Prototype the complete nonvisual interaction before proposing a public installation.

## Training use

This is a **turn-based software-to-hardware design analysis**: draw a system boundary, map one Duet state transition to input, LED, and audio feedback, and write a test against the multiplayer app's server-authoritative state. The separate `ibloud/duet_engine_architecture` lab can inform reusable contracts but is not the parity oracle for this exercise. Deliver a diagram, state/announcement table, and a risk and provenance log. No hardware is needed for the first exercise. The proposed maker index is tracked in [Loptr Lab maker pathway index](https://github.com/Loptr-Lab/training/blob/main/docs/tracks/maker-game-systems.md).

Duet's production and accessibility owners must review any implementation. The canonical four-player Veiled Dominion rules remain in the separate engine repository; this study grants no rights to third-party build assets or artist material.
