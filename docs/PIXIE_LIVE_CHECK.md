# PIXIE live check for PR #67

Run this against a local or staging deployment of the **PR branch**, with `GEMINI_MODEL`
set to a supported `generateContent` model and a valid `GEMINI_API_KEY`. Testing the
current production `main` endpoint does not verify the scope gate in this PR. Do not
paste API keys, full provider requests, or personal messages into the public record.

From a terminal with Node.js 18+ (Cloud Shell is one option), use the tagged PR
staging URL, not the production domain:

```sh
PIXIE_BASE_URL=https://YOUR-PR-STAGING-URL \
PIXIE_MODEL_NAME=YOUR-CONFIGURED-MODEL \
node scripts/verify-agent-live.js
```

The runner sends the eight fixed game inputs to the staging `/api/agent` route,
checks HTTP status, intent, and reply length, and prints each answer for manual
review. It does not need the Gemini key; the staging service holds that key.

## Operator setup in Cloud Shell

The repository documents Google Cloud project `adept-crossing-106819`, service
`duet-solo`, and region `us-central1`. Confirm those names in Cloud Run before
using these commands. In the service's **Containers → Variables & Secrets**,
check that `GEMINI_API_KEY` is available through an existing secret reference;
do not copy the key into a command or a chat. Choose a supported model name
for `GEMINI_MODEL`.

```sh
gcloud config set project adept-crossing-106819
git clone --branch pixie/scope-gate --single-branch https://github.com/Loptr-Lab/duet-solo-hackathon.git
cd duet-solo-hackathon
gcloud run deploy duet-solo --source . --region us-central1 \
  --no-traffic --tag pixie-check \
  --update-env-vars GEMINI_MODEL=YOUR-SUPPORTED-MODEL
```

This creates a tagged revision of the PR source with no ordinary traffic.
Use its **tagged URL** as `PIXIE_BASE_URL` in the runner above. The tag URL
may still be reachable directly, so do not send personal test messages.
After recording the results, remove the tag in Cloud Run. Do not use
`--set-env-vars`: it can remove other configured variables. If the key is not
already configured, attach it through Secret Manager before this deployment.

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
