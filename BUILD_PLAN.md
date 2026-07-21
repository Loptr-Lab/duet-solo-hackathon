# Duet: Solo — Build with Gemini XPRIZE
### Build Plan (solo execution, no Pulsr/PAW dependency)

**Deadline:** Aug 17, 2026 @ 1:00pm PDT
**Category:** Education & Human Potential
**Starting point:** Duet exists today, hosted on GitHub Pages, no AI layer, no Google Cloud presence, no payment processing.

---

## What "done" looks like at submission

- [ ] Public or private GitHub repo, shared with `testing@devpost.com` and `judging@hacker.fund`
- [ ] Duet running on Google Cloud (Cloud Run)
- [ ] A Gemini-powered agent that actually operates part of the business (onboarding/support/sales), with logs proving it
- [ ] Real Stripe transaction(s) — export or bank statement, plus a simple P&L (marketing/acquisition spend disclosed, even if $0)
- [ ] A handful of real named users with contact info and at least one testimonial
- [ ] 500–1000 word written narrative: human vs. AI division of labor, jobs/opportunity created, the story of building it this way
- [ ] 3-minute video demonstrating the agent live, making real decisions

---

## Week 1 (now → +7 days): Infrastructure + repo skeleton

- Stand up the dedicated repo (see naming note below)
- Containerize Duet, deploy to **Cloud Run** — this closes the Google Cloud gap immediately, it's the single most mechanical task on this list, do it first
- Set up a real **Stripe** account if one doesn't exist; wire a Stripe Checkout link for the "Accessibility Pack" (custom audio themes / saved profile / supporter badge)
- Confirm the P&L template (linked in the Devpost rules) and start logging expenses from day one, even if $0 so far

**Exit criteria for Week 1:** Duet is live on a Cloud Run URL, and a real Stripe checkout exists even if untested by a real customer yet.

## Week 2 (+7 → +14 days): The agent

- Scope and build the Gemini-powered onboarding/support agent: greets new players, walks through screen-reader setup, answers accessibility questions, handles the Accessibility Pack upsell conversation
- Instrument it so every interaction produces a log — this is your "AI-native operations" evidence, so logging has to be built in from the start, not bolted on later
- Test it end-to-end with yourself and at least one trusted person acting as a new user

**Exit criteria for Week 2:** the agent handles a real onboarding conversation start to finish, with logs to show for it.

## Week 3 (+14 → +21 days): Real users

- Reach out to the blind/low-vision playtesters from the earlier accessibility jam — warmest possible path to real, named users with real feedback
- Push the-rift and real-voice Bluesky posts (already drafted) to widen the funnel
- Collect actual contact info and testimonials as they come in — don't wait until the end to gather this
- Get at least one real, non-you Stripe transaction

**Exit criteria for Week 3:** at least a few real named users, at least one real transaction, testimonials in hand.

## Week 4 (+21 days → Aug 17): Submission package

- Write the 500–1000 word narrative
- Record the 3-minute video showing the agent live and making real decisions (not a mockup)
- Assemble the P&L, revenue export, product evidence (logs, dashboards), and customer evidence
- Share the repo with `testing@devpost.com` and `judging@hacker.fund`
- Submit

---

## Repo Naming Recommendation

Keep this **separate from `Loptr-Lab/veiled-dominion-engine`** — that repo already had a documented problem with serving two unrelated purposes at once (per your own `SESSION_SUMMARY.md`). Don't repeat that pattern here.

Suggested: **`Loptr-Lab/duet-solo-hackathon`** (or `ibloud/duet-solo-hackathon` if you want it under your personal handle rather than the org) — self-contained, clearly scoped, easy to hand to judges without them wading through unrelated game-engine history.

---

## Commands to Create and Push This Plan

Since I don't have GitHub write access, here's exactly what to run once the repo exists:

```bash
# If the repo doesn't exist yet, create it first on github.com, then:
git clone https://github.com/Loptr-Lab/duet-solo-hackathon.git
cd duet-solo-hackathon

# Copy this BUILD_PLAN.md file into the repo root, then:
git add BUILD_PLAN.md
git commit -m "Add hackathon build plan"
git push origin main
```

If the repo doesn't exist yet: go to github.com → New repository → name it `duet-solo-hackathon` → don't initialize with a README (so the clone above works cleanly) → then run the commands above.

---

*This plan assumes solo execution. If PAW/Pulsr become available again mid-build, the plan can absorb that — but treat this as the fallback that stands on its own regardless.*
