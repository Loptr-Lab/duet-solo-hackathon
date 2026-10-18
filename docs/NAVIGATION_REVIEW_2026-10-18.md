# Public entry and contributor navigation review

Reviewed 18 October 2026. Owner direction: simplify navigation, keep PIXIE's
contributor route clear, and remove counters that do not provide useful evidence.

## Findings and changes

- Break This Build and the DUET server are different deployments. Pages publishes
  `duet-review.html`; the game server serves `public/index.html`.
- The review page's `/pixie.html` held a second, older companion implementation.
  Replace it with a compatibility redirect and explicit fallback links; use the
  current Project Companion rather than maintain a parallel catalog.
- Add one visible contributor action near the review page's experience choices.
  Shorten the PIXIE dock instead of repeating the whole ecosystem directory.
- DUET's top navigation becomes Play/home, Test a build, Contribute with PIXIE,
  and a disclosure for secondary project links. Remove the repeated splash CTA.
- Remove community-interest counters, their local-storage script and unused CSS.
  Repeated clicks on one device were not evidence of people, enrollment or demand.
  Do not replace them with another public metric without a specific purpose and
  reliable, privacy-appropriate evidence.
- Keep the contribution route as a real task/checkpoint handoff. Current open
  contributions are unpaid unless a separate signed paid agreement exists.
- Remove the review page's fundraising CTA while the game reports payments paused.

## Status accuracy

The inspected DUET source and live page expose computer, local two-player and
remote entry points. Remote mode states Classic-only. Eight fixed PIXIE game-help
answers are distinct from the contributor companion. Source testing does not
establish a production match, storage behavior, accessibility or Xbox acceptance.
The existing development and release records retain their own dates and evidence.
Halloween checkpoints remain plans, not completed milestones.

The First Movement description on the review page was not revalidated by playing
the Ren Rhapsody build in this pass. Its independent completion, iPad and
accessibility acceptance remain open. Do not infer them from its playable link.

## Validation and publication

Server/module syntax checks and all 24 existing automated tests passed. Changed
HTML IDs and inline script syntax were checked. No game rules, service credentials,
authentication, storage backend or paid services changed.

GitHub Pages can publish the review changes after merge. DUET's Cloud Run service
requires its existing deployment process and serving-revision verification. A
merged source change must not be described as a changed live game. No Cloud Run
rollout was performed in this environment.

Use the current Companion URL until the guide's `pixie.loptrlab.com` DNS and HTTPS
are verified. A future domain change is a link update, not a reason to duplicate
the companion again.
