# Duet: Solo
Screen-reader-first, accessibility-built chess variant with an experimental onboarding/support path.
Built for **Build with Gemini XPRIZE (Education & Human Potential)**.

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
- An experimental Gemini support endpoint in the current source; live model availability is unverified
- Cloud Run deployability for judging/demo reliability
- An "Obsidian Realm" landing screen that leads into two gameplay modes: a classic ruleset, and an experimental Fog Mode (elevation-based vision and HP combat) — both built to the same accessibility standard, with information gated by fog rather than hidden only visually (see below)

---

## Support implementation and verification
The current `main` source includes a Gemini experiment for onboarding and gameplay
questions, with structured JSON responses. Code presence does not establish a
configured or functioning live model. Keep the Gemini key absent during the existing
review hold.

[PR #67](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/67) proposes fixed game
help and an Outside Support response. It remains a draft under external review;
that proposed behavior is not the current production claim.

---

## Architecture (high level)
- **Frontend:** static HTML/CSS/JS (`public/index.html`)
  - Splits into a landing screen (`#front-page`) and the game itself (`#game-screen`), swapped via JS rather than a page reload — no routing/build step added.
  - Two gameplay modes, both sharing the same rules engine and accessible command bar: Classic (instant capture) and an optional Fog Mode toggle (elevation terrain, fog of war, HP-based combat).
  - Fog Mode's accessibility design gates *information*, not just visuals: querying a square via the command bar or screen reader returns only what a sighted player would actually see (visible, last-known/stale, or unexplored) — fog is a fairness mechanic, not an accessibility gap.
  - The Radius of Ruin / Sanctuary auras use a data-driven "breathing" animation (CSS custom properties set per-render from live board state — how many pieces are currently veiled or sheltered) rather than a fixed decorative pulse, with `prefers-reduced-motion` respected throughout.
- **Backend:** Node.js + Express (`server.js`)
- **Support endpoint in current source:** `POST /api/agent` (Gemini experiment; live availability unverified)
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
- `GEMINI_API_KEY` (leave absent during the review hold)
- `PUBLIC_URL` (optional locally, recommended in deploy)
- `AI_RATE_LIMIT_WINDOW_MS` and `AI_RATE_LIMIT_MAX` (keep enabled for public deployments)
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
Qualified external review and owner build approval are separate gates; a main push
does not authorize production deployment.

A public fork supplies and pays for its own services. Follow
[FAN_FORK_GUIDE.md](FAN_FORK_GUIDE.md), [SECURITY.md](SECURITY.md), and
[docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md); do not use Loptr Lab credentials.

---

## Evidence for judges
This repository contains the browser client, Cloud Run deployment materials, an
experimental Gemini support path, and accessibility-oriented gameplay design,
including Fog Mode. Current deployment, model use, remote-match persistence and
assistive-technology usability require dated runtime evidence. Historical hackathon
claims are not current infrastructure verification.

---

## Hackathon alignment
Category: **Education & Human Potential**

Duet: Solo expands access to strategy learning/play by centering assistive-technology users and reducing onboarding friction with AI guidance.

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
