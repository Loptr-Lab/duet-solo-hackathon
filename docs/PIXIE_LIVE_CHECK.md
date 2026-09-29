# PIXIE live check for PR #67

The production service has a `main` push trigger that automatically routes a new
revision to 100% traffic. **Do not attach a Gemini key to that service until the
scope-gated PR #67 code is confirmed live.** With the key absent, review and merge
the gate, confirm its source commit and behavior, then add `GEMINI_MODEL` and a
Secret Manager key reference to a tagged **no-traffic** revision of the now-gated
service. An isolated staging service can be used to test the PR with a key before
merge. Never use a no-traffic tagged revision on the still-ungated production
service for key testing: a later deploy may inherit its key and route it to 100%.
Do not paste API keys, full provider requests, or personal messages into the
public record.

From a terminal with Node.js 18+ (Cloud Shell is one option), use the tagged
gated revision URL or the isolated staging service URL, not the production domain:

```sh
PIXIE_BASE_URL=https://YOUR-TAGGED-OR-ISOLATED-URL \
PIXIE_MODEL_NAME=YOUR-CONFIGURED-MODEL \
node scripts/verify-agent-live.js
```

The runner sends the eight fixed game inputs to the gated `/api/agent` route,
checks HTTP status, intent, and reply length, and prints each answer for manual
review. It also fails known canned unavailable responses. Confirm the model
request succeeded in that revision's logs, because response shape alone cannot prove
Gemini was called. The runner does not need the Gemini key; the staging
service revision holds that key.

## Operator setup in Cloud Shell

The observed Google Cloud project is `adept-crossing-106819`, service
`duet-solo-hackathon`, region `us-central1`. The September 28 production revision
was missing both Gemini entries. Read [OPERATIONS_HANDOFF.md](OPERATIONS_HANDOFF.md)
and inspect the Cloud Build trigger's Deploy step before merging. GitHub's
Cloud Build check for commit `6d8a287` shows that its `main` push built revision
`00137-c98` and routed 100% of traffic there; it does not show deploy flags.
Never attach the Gemini key to ungated production `main`: that code sends raw
player text to Gemini when configured.

After the gated code is verified on `main` **with no key**, attach
`GEMINI_API_KEY` through Secret Manager and set a supported `GEMINI_MODEL` on
a no-traffic tagged revision. Preserve all other required entries and do not
put the key into a command or a chat. Hold other merges during the test. The
tagged URL remains directly reachable; send only fixed game inputs. Use it as
`PIXIE_BASE_URL` in the runner above. Check the deployed source commit and
provider logs, then route ordinary traffic only after all eight answers pass.
Remove the temporary tag when no longer needed. Avoid partial `--set-env-vars`
commands, which can remove omitted entries. For a pre-merge live test, create
a **separate** staging service instead of changing the production template.

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
| `What is Radius of Ruin?` | In DUET, each side has a Rebirth and a Death. Your pieces within one square of the opposing Rebirth become Veiled unless they are within one square of your own Death. Your Rebirth does not Veil your own side. If your Rebirth becomes Veiled, you lose immediately. Explain Radius of Ruin briefly; do not invent a Veil duration. | `rules` | Only opposing pieces are targets; a player's own Rebirth can be Veiled by the opponent. |
| `How does Sanctuary work?` | In DUET, Death protects friendly pieces within one square, including diagonals, from being Veiled by the opposing Rebirth. Sanctuary does not belong to Rebirth. Explain Sanctuary briefly without claiming it removes an existing Veil. | `rules` | Death prevents new Veiling of nearby friendly pieces; no claim it clears an existing Veil. |
| `How does Rebirth move?` | In DUET, each side has a Rebirth and an uncapturable Death. Rebirth moves like a queen; Death moves one square like a king. Rebirth Veils opposing pieces within one square unless protected by their own Death. Death grants Sanctuary, not Radius of Ruin. If your Rebirth becomes Veiled by the opposing Rebirth, you lose immediately. Explain their distinct roles briefly. | `rules` | Rebirth and Death have distinct movement, auras, and loss role. |
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

## DUET rule authority

The two-player DUET implementation is authoritative for this check. Its
`RadiusOfRuinSystem.resolve` iterates over the active player's pieces near the
**opposing** Rebirth. A player's own Rebirth can be Veiled by the opponent's
aura, but a Rebirth does not Veil pieces of her own color. The lore has been
updated to match this behavior; `docs/CANONICAL_DIVERGENCES.md` records the
different four-player rule. Do not accept a model answer that imports the
four-player self-Veil rule into DUET.

Sources in this repo: `public/index.html` (lore, Fog Mode rules, and
`RadiusOfRuinSystem`), `veiled-chess-core-server.js` (base rules and win
condition), and `agentScope.js` (fixed prompts and intent mapping).

If an answer is wrong, correct the corresponding fixed question with a short,
reviewed rule statement, then rerun that case. Do not send raw player input to
Gemini or broaden the gate to improve the answer.
