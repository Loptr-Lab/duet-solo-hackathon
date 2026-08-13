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
