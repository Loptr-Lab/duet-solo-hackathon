# Duet: Solo
Screen-reader-first chess variant in active development. This draft branch implements PIXIE's eight fixed DUET answers; production deployment and accessibility acceptance remain unverified.
The earlier **Build with Gemini XPRIZE** planning files are historical drafts, not current product claims.

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
- PIXIE game help: eight proposed answers pending qualified external review for rules, controls, and accessibility
- Cloud Run deployability for judging/demo reliability
- An "Obsidian Realm" landing screen that leads into two gameplay modes: a classic ruleset, and an experimental Fog Mode (elevation-based vision and HP combat) — both built to the same accessibility standard, with information gated by fog rather than hidden only visually (see below)

---

## PIXIE game help
The server selects one of eight fixed answers from a bounded DUET question gate.
Mixed and off-topic messages get one Outside Support card. Player questions do not
leave the server through a model API. The separate `pixie/gemini-experiment`
branch preserves the previous experimental model path; it is not deployed by
this branch and needs its own review before any use.

---

## Architecture (high level)
- **Frontend:** static HTML/CSS/JS (`public/index.html`)
  - Splits into a landing screen (`#front-page`) and the game itself (`#game-screen`), swapped via JS rather than a page reload — no routing/build step added.
  - Two gameplay modes, both sharing the same rules engine and accessible command bar: Classic (instant capture) and an optional Fog Mode toggle (elevation terrain, fog of war, HP-based combat).
  - Fog Mode's accessibility design gates *information*, not just visuals: querying a square via the command bar or screen reader returns only what a sighted player would actually see (visible, last-known/stale, or unexplored) — fog is a fairness mechanic, not an accessibility gap.
  - The Radius of Ruin / Sanctuary auras use a data-driven "breathing" animation (CSS custom properties set per-render from live board state — how many pieces are currently veiled or sheltered) rather than a fixed decorative pulse, with `prefers-reduced-motion` respected throughout.
- **Backend:** Node.js + Express (`server.js`)
- **Game-help endpoint:** `POST /api/agent` (deterministic DUET question gate and fixed answers; no model call)
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

## Cloud Run deployment

On September 29, the owner [reported enabling Cloud Build approval](https://github.com/Loptr-Lab/duet-solo-hackathon/pull/68#issuecomment-5890922219) and rejecting a manual build while it awaited approval; nothing deployed. Reconfirm this setting before acting. A main push does not authorize deployment: owner build approval is separate from qualified external review, and an approved deployment can route 100% traffic.

**External-review hold:** Keep #68, #67, and #71 in draft until qualified rules and screen-reader feedback has been received and triaged under [#69](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/69). Hands-on observations remain tracked in [#70](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70). CI, AI review, recruitment, and the October 16 checkpoint do not waive the gate. Eventual order: #68, then rebased/reviewed #67, then rebased/reviewed #71. No merge or production deployment is authorized by these documentation changes.

Before changing the Loptr Lab service, read the [operations handoff](docs/OPERATIONS_HANDOFF.md).
The observed service is `duet-solo-hackathon` in `us-central1`; production configuration
currently requires investigation. Review all environment variables and secret references
against the active revision and deployment trigger before deploying. Do not use a partial
`--set-env-vars` command or put an API key on the command line.
Production deployment requires separate owner build approval; reconfirm the trigger. Keep
`GEMINI_API_KEY` off this production service: current game help needs no key,
and the older `main` code sends raw player text to Gemini if a key is attached.
After an approved deployment, confirm the serving revision, its configuration, and the game path.

For a separate deployment, enable Google Cloud project billing, configure provider quotas,
a cloud budget, Firestore least privilege, retention, and privacy/security contacts before
allowing public traffic. Use `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` only for a dedicated
posting account.

> A public fork pays for its own Cloud Run, Firestore, and posting usage. Do not deploy
> with Loptr Lab credentials or production services.

---

## Evidence for judges
This repo demonstrates:
- Running product on Google Cloud Run
- Proposed fixed DUET help and Outside Support boundary on this draft branch; production and usability verification remain open
- Accessibility-first UX design choices in gameplay interaction, including an experimental mode (Fog Mode) built to prove the accessibility approach holds up even as gameplay complexity grows, not just in the simplest case

---

## Hackathon alignment
Earlier Gemini XPRIZE planning is retained in archival documents. The current
Fire TV accessibility challenge and ID@Xbox concept are described in
[`duet-review.html`](duet-review.html) and the project documentation.

Duet: Solo expands access to strategy play by centering assistive-technology
users and reducing onboarding friction with proposed fixed game help awaiting external review.

---

## Anonymous playtest feedback

Completed remote games produce a minimal anonymous summary in Firestore, and each player may
optionally submit one post-game rating, rotating rules question, note, or bug report. The form
can be skipped, requires explicit consent to submit, and never writes room codes, reconnect
tokens, DIDs, handles, email addresses, socket identifiers, or network addresses into the
anonymous collections. Raw records carry a 30-day expiry timestamp.

Before deployment, enable Firestore TTL on the `expiresAt` field for both
`anonymousCompletedGames` and `anonymousGameFeedback`. The portable schema and privacy boundary
are maintained in the
[`veiled-dominion-engine` contract directory](https://github.com/Loptr-Lab/veiled-dominion-engine/tree/main/docs/contracts).

## Development status

The current milestone state, completed M1 verification, M0 Xbox/Godot feasibility gate, deferred scope, and contributor review questions are maintained in [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md).

Contributors are invited to review and comment on that document, particularly the M0-A/M0-B evidence gates and the platform-neutral client boundary.

## Continuing development

This project is under active development beyond the hackathon. The Veiled Dominion ecosystem — 4-player engine, Sealed Deck mechanics, stats-driven playable characters, and live Bluesky match posting via the-rift — is being built in the open.

See the [contributor wiki](https://github.com/Loptr-Lab/duet-solo-hackathon/wiki) for setup, architecture, and how to get involved.

---

## License and fan forks

Software is available under the [MIT License](LICENSE). Fan forks must use distinct branding
and must not imply Loptr Lab endorsement or canonical status. Before deploying, read
[FAN_FORK_GUIDE.md](FAN_FORK_GUIDE.md), [SECURITY.md](SECURITY.md), and
[docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md).
