# Duet: Solo
Screen-reader-first chess variant. This review candidate incorporates PR #67’s proposed fixed PIXIE help on current main; external review and production acceptance remain pending.
The earlier Gemini XPRIZE planning is historical. See [candidate validation](docs/PIXIE_TEST_CANDIDATE.md).

---

## Research and canon status

Duet: Solo is the **accessibility artifact** within Loptr Lab's longitudinal doctoral practice-research project, *Organizational Leadership and Narrative World-Building in Independent Game Studio Production*. Veiled Dominion is the primary creative case.

Duet remains a separate two-player, 8×8 experimental mechanics lab. The canonical four-player, 14×14 rules authority is [`Loptr-Lab/veiled-dominion-engine`](https://github.com/Loptr-Lab/veiled-dominion-engine). Experimental Duet mechanics do not become canon unless explicitly promoted there.

- See [`docs/RESEARCH_ALIGNMENT.md`](docs/RESEARCH_ALIGNMENT.md) for the research role and evidence practices.
- See [`docs/CANONICAL_DIVERGENCES.md`](docs/CANONICAL_DIVERGENCES.md) for the mechanics boundary.
- See [`docs/PROJECT_BIBLE.md`](docs/PROJECT_BIBLE.md) for the Weaver, PIXIE, deck, game, and external reading hierarchy.

---

## What this project does
Duet: Solo is an accessible strategy game experience designed for blind and low-vision players first (not as an afterthought).

The application includes:
- Accessible game interaction patterns for screen readers
- Eight proposed fixed PIXIE answers and a deterministic scope gate; rules and accessibility review remain pending
- Cloud Run deployability for judging/demo reliability
- An "Obsidian Realm" landing screen that leads into two gameplay modes: a classic ruleset, and an experimental Fog Mode (elevation-based vision and HP combat) — both built to the same accessibility standard, with information gated by fog rather than hidden only visually (see below)

---

## PIXIE game help in this test candidate
`POST /api/agent` selects one of eight proposed answers. Unknown wording, mixed
and off-topic messages receive the same Outside Support card. There is no model
call and no provider key is needed. Question text is not persisted by this route.

This is a candidate derived from draft [PR #67](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/67),
not a production claim. The existing main/serving-source distinction and external
review hold remain in effect. The previous Gemini experiment is not a fallback.

---

## Architecture (high level)
- **Frontend:** static HTML/CSS/JS (`public/index.html`)
  - Splits into a landing screen (`#front-page`) and the game itself (`#game-screen`), swapped via JS rather than a page reload — no routing/build step added.
  - Two gameplay modes, both sharing the same rules engine and accessible command bar: Classic (instant capture) and an optional Fog Mode toggle (elevation terrain, fog of war, HP-based combat).
  - Fog Mode's accessibility design gates *information*, not just visuals: querying a square via the command bar or screen reader returns only what a sighted player would actually see (visible, last-known/stale, or unexplored) — fog is a fairness mechanic, not an accessibility gap.
  - The Radius of Ruin / Sanctuary auras use a data-driven "breathing" animation (CSS custom properties set per-render from live board state — how many pieces are currently veiled or sheltered) rather than a fixed decorative pulse, with `prefers-reduced-motion` respected throughout.
- **Backend:** Node.js + Express (`server.js`)
- **Candidate game-help endpoint:** `POST /api/agent` (fixed responses; no model call)
- **Hosting target:** Google Cloud Run

---

## Local run
### 1) Install dependencies
```bash
npm install
```
### 2) Configure environment
Copy `.env.example` to `.env` and fill values:
- `PORT`
- `PUBLIC_URL` (optional locally, recommended in deploy)
- `GOOGLE_CLOUD_PROJECT` (only when persistent remote play is enabled)

### 3) Start
```bash
npm start
```
Open `http://localhost:8080`

---

## Deployment evidence and approval
Cloud Run is the hosting target. A reachable page does not establish the serving
commit, provider configuration, Firestore access, or functioning model/posting services.

The operations handoff is proposed in
[PR #68](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68). Before any production
change, verify the serving source, traffic, trigger and required configuration privately,
and reconfirm the owner's build-approval setting. Keep the Gemini key absent.
The [operations handoff](docs/OPERATIONS_HANDOFF.md) is carried forward for review,
not accepted by assembling this candidate. Public playtesters test the serving
production build using the [production playtest packet](docs/PRODUCTION_PLAYTEST.md).
The isolated sandbox is optional developer evidence and cannot validate production
identity or persistence. Unreleased help requires the existing review/release gates.
Qualified external review and owner build approval are separate gates; a main push
does not authorize production deployment.

A public fork supplies and pays for its own services. Follow
[FAN_FORK_GUIDE.md](FAN_FORK_GUIDE.md), [SECURITY.md](SECURITY.md), and
[docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md); do not use Loptr Lab credentials.

---

## Evidence for judges
This repository contains the browser client, Cloud Run deployment materials, an
proposed fixed-answer support path, and accessibility-oriented gameplay design,
including Fog Mode. Current deployment, help behavior, remote-match persistence and
assistive-technology usability require dated runtime evidence. Historical hackathon
claims are not current infrastructure verification.

---

## Hackathon alignment
Earlier Gemini XPRIZE materials are archived planning. Current work targets accessible
strategy play; this candidate does not establish submission eligibility, device
compatibility or readiness. External review remains pending.

---

## Anonymous playtest feedback

The source implements minimal anonymous completed-game summaries and optional post-game
feedback for a configured Firestore deployment. Successful live writes and retention
are not established by a rendering check. The intended privacy boundary excludes room
codes, reconnect tokens, DIDs, handles, email addresses, socket identifiers and network
addresses from the anonymous collections. The form requires explicit consent and can
be skipped; raw records are assigned a 30-day expiry timestamp.

Before deployment, enable Firestore TTL on the `expiresAt` field for both
`anonymousCompletedGames` and `anonymousGameFeedback`. The portable schema and privacy boundary
are maintained in the
[`veiled-dominion-engine` contract directory](https://github.com/Loptr-Lab/veiled-dominion-engine/tree/main/docs/contracts).

## PIXIE ecosystem continuity

PIXIE is the shared guide; each surface has its own role, storage and permissions.
Discovery, the local Creator workspace, practice notes and stewardship demonstrations
are separate destinations. Links do not exchange private context or configure identity.

See [PIXIE routes and verification](docs/PIXIE_CONTINUITY.md) for the destination map,
explicitly unconfigured identity, and the observed source/deployment difference.

## Development status

The current milestone state, completed M1 verification, M0 Xbox/Godot feasibility gate, deferred scope, and contributor review questions are maintained in [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md).

Contributors are invited to review and comment on that document, particularly the M0-A/M0-B evidence gates and the platform-neutral client boundary.

## Continuing development

This project is under active development beyond the hackathon. The Veiled Dominion ecosystem — 4-player engine, Sealed Deck mechanics, stats-driven playable characters, and experimental Bluesky match-posting code for the-rift — is being built in the open. Current posting configuration and successful live posts remain unverified.

See the [contributor wiki](https://github.com/Loptr-Lab/duet-solo-hackathon/wiki) for setup, architecture, and how to get involved.

---

## License and fan forks

Software is available under the [MIT License](LICENSE). Fan forks must use distinct branding
and must not imply Loptr Lab endorsement or canonical status. Before deploying, read
[FAN_FORK_GUIDE.md](FAN_FORK_GUIDE.md), [SECURITY.md](SECURITY.md), and
[docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md).

