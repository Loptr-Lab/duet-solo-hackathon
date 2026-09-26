# Contributing to Duet

Thanks for your interest in contributing to Duet and the Veiled Dominion engine. This document covers how to get oriented, what's already been evaluated, and what to avoid reinventing.

---

## Stack

- **Frontend:** Single-file `public/index.html` (vanilla JS, Web Speech API, no build step)
- **Backend:** Node.js + Express (`server.js`)
- **Realtime:** Socket.io (`gameNamespace.js`)
- **Persistence:** Firestore (`roomStore.js`)
- **AI Opponent:** Custom minimax + alpha-beta pruning with a hand-tuned `evaluateBoard()` — lives in `index.html`
- **Deployment:** Google Cloud Run (`us-central1`)

No Unity. No Unreal. No console platform dependencies. That's intentional — see Philosophy below.

---

## Philosophy

- **People over Profits.** No heavy legal/contractual overhead between collaborators.
- **Accessibility-first, universally.** Not targeted at a single disability — built to work for everyone.
- **No engine gatekeeping.** The project stays independent of proprietary game engines and console platform requirements, and must run on existing/current hardware.
- **Open source, simple enough to join.** The repo should be approachable to any qualified contributor without a lengthy onboarding dependency chain.

---

## Prior Art & What We Evaluated

Before contributing a new system or suggesting an architectural change, check here first.

### Lichess (`lichess-org`)

Evaluated the full [lichess-org GitHub](https://github.com/lichess-org) (79 repos). Summary:

| Repo | Verdict | Reason |
|---|---|---|
| `lila` | ❌ Not applicable | Scala monolith built for millions of concurrent users. We're on Node + Cloud Run. |
| `stockfish-web` | ❌ Not

### Chess.com (`ChessCom`)

Evaluated the [ChessCom GitHub](https://github.com/ChessCom) (92 repositories). Chess.com is a closed, proprietary platform — their public GitHub is almost entirely internal infrastructure, forks of third-party libraries, and peripheral tooling. Their actual game server, matchmaking, and engine code is not public.

| Repo | Verdict | Reason |
|---|---|---|
| `stockfish` | ❌ Not applicable | Fork of Stockfish (standard chess engine). Same reason as lichess — no concept of Veil, Rebirth, or Fog Mode. |
| `android-chessclock` / `ios-chessclock` | ❌ Not applicable | Mobile clock apps. Unrelated to game logic or server architecture. |
| `browser-extension` | ❌ Not applicable | Chess.com UI customization. Proprietary platform-specific. |
| `Chess-Game` | ❌ Not applicable | PHP object representing standard chess. Different language, different rules. |
| `DiagramGenerator` | ❌ Not applicable | PHP tool for generating standard chess board images. No variant support. |
| `OpenBench` | ❌ Not applicable | Forked distributed SPRT testing framework for benchmarking standard chess engines. Not relevant to our evaluator. |
| `ccc-configs` | ❌ Not applicable | Docker/config for Chess.com's internal Computer Chess Championship infrastructure. Platform-scale, proprietary context. |
| Everything else | ❌ Not applicable | Forks of general-purpose libraries (protobuf, webpack plugins, etc.) with no chess-specific relevance. |

**Bottom line:** Chess.com's source code for anything meaningful is proprietary and not public. What they do publish is either standard-chess-specific, PHP/Objective-C mobile tooling, or forks of general open source libraries. Nothing applicable to Duet's Node stack, custom ruleset, or accessibility goals.


---

### M0-A evidence discipline

For Xbox/Godot feasibility work, record evidence rather than conclusions:

- Use **UNKNOWN**, **UNVERIFIED**, **VERIFIED**, or **CONTRADICTED** for the state of an evidence item.
- Record the Evidence ID, capture date, source type/owner, exact value or statement, environment, result, reproducibility, evidence location, and open questions.
- Treat Microsoft/Xbox and W4 Games statements as authoritative for their respective controlled systems, but do not treat a vendor statement as physical hardware proof.
- Keep external blockers explicit and separate from project implementation status.
- Do not mark M0-A complete until the documented PASS criteria in `docs/DEVELOPMENT_STATUS.md` have been demonstrated and recorded.

## MCP-assisted contribution

MCP (Model Context Protocol) tools may be used to inspect repository state, research technical questions, organize evidence, and assist with implementation or documentation. They do not override repository governance.

When using MCP or other AI-assisted tooling:

- Treat tool output as evidence to inspect, not as automatic authority.
- Do not bypass branch protection, required review, or the pull-request workflow.
- Do not write directly to `main` where a PR is required.
- Do not merge without maintainer authorization.
- Never expose or commit secrets, credentials, tokens, private keys, personal data, or confidential partner material.
- Do not present AI inference as a Microsoft/Xbox, W4 Games, or other vendor statement.
- Record exact versions and source evidence for compatibility claims.
- Distinguish **DOCUMENTED**, **LOCALLY VERIFIED**, **VENDOR CONFIRMED**, and **HARDWARE VERIFIED** states.
- Do not turn "looks compatible," "probably supported," or "should work" into project facts.
- For hardware-gated work, documentation and partner confirmation do not substitute for the required physical test.

For detailed MCP restrictions, evidence handling, review-comment guidance, and the current M0-A call to action, see [`docs/MCP_CONTRIBUTION.md`](docs/MCP_CONTRIBUTION.md).
