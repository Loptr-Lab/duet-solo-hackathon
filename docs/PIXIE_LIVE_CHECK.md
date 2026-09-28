# PIXIE live check for PR #67

Run this against a local or staging deployment of the **PR branch**, with `GEMINI_MODEL`
set to a supported `generateContent` model and a valid `GEMINI_API_KEY`. Testing the
current production `main` endpoint does not verify the scope gate in this PR. Do not
paste API keys, full provider requests, or personal messages into the public record.

Record the model name, date, response intent, character count, and accuracy for each
case. The response must have the listed intent and a nonempty `reply` of at most 500
characters. The server accepts only the exact expected intent, but that check does
not establish that the words of the answer are factually correct.

| Input to `/api/agent` | Fixed question sent to Gemini | Intent | Accuracy check |
| --- | --- | --- | --- |
| `What are the DUET rules?` | Explain the rules of DUET briefly. | `rules` | Short overview; no invented mechanics. |
| `How do I use the controls?` | How do I use DUET game controls and make a move? | `controls` | Coordinate input such as `e2e4` and keyboard interaction. |
| `Does this work with NVDA?` | Explain DUET keyboard and screen reader controls. | `accessibility` | Screen-reader interaction and game announcements; no claim of verified Fire TV support. |
| `How do I make a legal move?` | How do I make a legal move in DUET? | `gameplay` | One legal move example without inventing a board state. |
| `What is Radius of Ruin?` | Explain the Radius of Ruin mechanic in DUET. | `rules` | An enemy Rebirth Veils nearby pieces unless protected by their own Death. See rules discrepancy below. |
| `How does Sanctuary work?` | Explain the Sanctuary mechanic in DUET. | `rules` | Death protects friendly pieces within one square (including diagonals) from Veiling. |
| `How does Rebirth move?` | Explain the Rebirth and Death mechanics in DUET. | `rules` | Rebirth and Death have distinct roles; Rebirth does not grant Sanctuary, Death does not grant the Radius. |
| `What is Fog Mode?` | Explain Fog Mode and elevation in DUET. | `rules` | Elevation affects sight and combat, fog gates information; currently local human vs. human, with AI opponent disabled. Remote play is Classic only. |

| Model | Date (UTC) | Case | Returned intent | Reply characters | Accurate? | Notes / rule source |
| --- | --- | --- | --- | ---: | --- | --- |
|  |  | Rules |  |  |  |  |
|  |  | Controls |  |  |  |  |
|  |  | Accessibility |  |  |  |  |
|  |  | Gameplay |  |  |  |  |
|  |  | Radius of Ruin |  |  |  |  |
|  |  | Sanctuary |  |  |  |  |
|  |  | Rebirth and Death |  |  |  |  |
|  |  | Fog Mode |  |  |  |  |

## Rules discrepancy to resolve before judging an answer

The lore in `public/index.html` says Rebirth's proximity affects an ally or an
enemy. The live board implementation's `RadiusOfRuinSystem.resolve` instead
iterates only over the active player's pieces near the **enemy** Rebirth. Its
own Rebirth can be Veiled by the opposing Rebirth when unprotected; this does
not mean each Rebirth Veils pieces of her own color. The server base engine
documents the same behavior. Decide whether the lore or implementation is
authoritative before accepting an answer that says the aura affects allies.

Sources in this repo: `public/index.html` (lore, Fog Mode rules, and
`RadiusOfRuinSystem`), `veiled-chess-core-server.js` (base rules and win
condition), and `agentScope.js` (fixed prompts and intent mapping).

If an answer is wrong, correct the corresponding fixed question with a short,
reviewed rule statement, then rerun that case. Do not send raw player input to
Gemini or broaden the gate to improve the answer.
