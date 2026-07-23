# Duet: Solo

Screen-reader-first, accessibility-built chess variant with a Gemini-powered onboarding/support agent.
Built for **Build with Gemini XPRIZE (Education & Human Potential)**.

## What this project does

Duet: Solo is an accessible strategy game experience designed for blind and low-vision players first (not as an afterthought).
The application includes:

- Accessible game interaction patterns for screen readers
- A Gemini-powered assistant for onboarding and support
- Stripe checkout flow for a paid accessibility/supporter pack
- Cloud Run deployability for judging/demo reliability
- An "Obsidian Realm" landing screen that leads into two gameplay modes: a classic ruleset, and an
  experimental Fog Mode (elevation-based vision and HP combat) — both built to the same
  accessibility standard, with information gated by fog rather than hidden only visually (see below)

## Why Gemini

Gemini is used for operational product work inside the app:

- onboarding new users,
- answering accessibility and gameplay support questions,
- handling support-style intent triage in structured JSON responses.

This is not a "demo-only chatbot"; it supports real player interaction flows.

## Architecture (high level)

- **Frontend:** static HTML/CSS/JS (`public/index.html`)
  - Splits into a landing screen (`#front-page`) and the game itself (`#game-screen`), swapped via JS
    rather than a page reload — no routing/build step added.
  - Two gameplay modes, both sharing the same rules engine and accessible command bar: Classic
    (instant capture) and an optional Fog Mode toggle (elevation terrain, fog of war, HP-based combat).
  - Fog Mode's accessibility design gates *information*, not just visuals: querying a square via the
    command bar or screen reader returns only what a sighted player would actually see (visible,
    last-known/stale, or unexplored) — fog is a fairness mechanic, not an accessibility gap.
  - The Radius of Ruin / Sanctuary auras use a data-driven "breathing" animation (CSS custom
    properties set per-render from live board state — how many pieces are currently veiled or
    sheltered) rather than a fixed decorative pulse, with `prefers-reduced-motion` respected throughout.
- **Backend:** Node.js + Express (`server.js`)
- **AI endpoint:** `POST /api/agent` (Gemini API)
- **Payments:** Stripe Checkout (`POST /api/create-checkout-session`) + webhook (`POST /api/webhook`)
- **Hosting target:** Google Cloud Run

## Local run

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and fill values:

- `PORT`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (optional for local unsigned webhook testing)
- `PUBLIC_URL` (optional locally, recommended in deploy)

### 3) Start

```bash
npm start
```

Open `http://localhost:8080`

## Cloud Run deploy (quick path)

1. Ensure Google Cloud project + billing are enabled.
2. Build and deploy container:

```bash
gcloud run deploy duet-solo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,STRIPE_SECRET_KEY=...,PUBLIC_URL=https://<your-run-url>
```

3. Add `STRIPE_WEBHOOK_SECRET` once webhook endpoint is configured in Stripe.

## Evidence for judges

This repo demonstrates:

- Running product on Google Cloud Run
- Gemini usage in a user-facing onboarding/support path
- Payment flow integration and transaction capture hooks
- Accessibility-first UX design choices in gameplay interaction, including an experimental mode
  (Fog Mode) built to prove the accessibility approach holds up even as gameplay complexity grows,
  not just in the simplest case

## Hackathon alignment

Category: **Education & Human Potential**

Duet: Solo expands access to strategy learning/play by centering assistive-technology users and reducing onboarding friction with AI guidance.

## License

MIT
