# Veiled Dominion: Duet — Experiment Review & Next Experiment

> **You can lose the "King" Have a Great Knight and still win the game**

This tagline is retained as the project's signature line. Preserve the wording and capitalization unless the owner explicitly revises it.

## Purpose

Duet is an experiment, not a promise of a continuously hosted service. The cloud trial ended. Local play/recovery is the currently available path; cloud gameplay services are offline. This review records what the experiment was intended to test, what evidence is available, what remains unknown, and what must be true before rebuilding.

## Hypothesis (to validate, not retroactively claim)

A chess-derived game with asymmetric mechanics and meaningful alternatives to conventional king-centered victory can produce interesting strategic play. Optional infrastructure and assistance may improve access, but must not be prerequisites for a useful, recoverable game experience.

Evaluate two separate hypotheses:
1. **Game hypothesis:** players can understand the rules, find meaningful choices, complete games, and want to play again.
2. **Infrastructure hypothesis:** remote play, persistence, reconnect, and any assistance provide enough demonstrated value to justify their complexity and maintenance.

Do not treat cloud activity, code completion, or an automated test as proof of player engagement or usability.

## Status and timeline

- **Concept and development:** experimental mechanics and a prototype were built.
- **Cloud experiment:** trial hosting was used; the trial ended.
- **Recovery:** local play is the fallback/recovery surface. The page must clearly distinguish verified local paths from unavailable cloud paths.
- **Review:** evidence is being reconciled. Surviving telemetry may not distinguish visits, started games, completed games, repeat play, or broken sessions.
- **Next experiment:** gated on the evidence and acceptance checklist below. No rebuild date is promised.

Use dated links, build identifiers, and actual test results when available. If data was not collected or cannot be recovered, mark it **Unknown**, not zero or evidence of disinterest.

## Evidence ledger

| Question | Current status | Evidence needed |
|---|---|---|
| Can a player reach and start local play? | Verify against the currently serving build | Dated browser/device test, URL, commit/build |
| Are custom rules understandable and internally consistent? | Open review | Rule test cases, independent playtest notes, adjudicated examples |
| Can a full game be completed? | Not established by infrastructure logs alone | Completed match record or witnessed test |
| Is there genuine player interest? | Unknown unless recoverable evidence supports it | Consent-respecting counts of starts, completions, return play, or direct feedback |
| Does computer-opponent play help? | Unproven | Clearly labeled mode, difficulty and comparative feedback |
| Does optional assistance improve accessibility? | Unproven | Independent accessibility review and player feedback; assistance must not make decisions |
| Are remote play/reconnect/persistence worth maintaining? | Cloud services offline; value unproven | Need evidence of demand plus acceptance and operational feasibility |
| Is the experience accessible? | Not accepted as complete | Keyboard, screen reader, low-vision, reduced-motion and recovery tests appropriate to the client |

## Local recovery and playtest protocol

Where local play is available, keep the recovery path simple and explicit:
- **Local Classic — two people on one device:** use as a rules and interaction test.
- **Local computer opponent:** label it as a separate mode and disclose its limitations; do not imply it represents human play.
- Remote/cloud play, accounts, cloud saves, and reconnect remain offline unless independently verified.

Ask testers, optionally and without requiring account creation:
1. Which rules or terms were unclear?
2. What decision felt meaningful—or meaningless?
3. Did anything appear unfair, inconsistent, or broken?
4. Could you recover from a mistake or interruption?
5. Did you finish? If not, where did you stop?
6. Would you play again? Why or why not?

Do not collect personal information by default. Feedback is voluntary. If telemetry is absent, disclose it. Avoid publishing identifiers, room codes, reconnect tokens, or private messages.

## Test protocol

1. Record date, exact URL, build/commit, browser and device.
2. Read the rules without coaching; note interpretation questions.
3. Start a local game and play through if possible.
4. Record rule discrepancies, accessibility barriers, interruption/recovery, and unexpected behavior.
5. Submit optional feedback. Distinguish automated testing, owner testing, and independent playtesting.
6. Preserve reproducible bugs and decisions in GitHub; summarize findings here.

## Findings vs. unknowns

Use separate headings for **Observed**, **Interpretation**, and **Unknown**. A lack of telemetry is a limitation, not a conclusion. Do not infer player interest, game quality, or failure from Cloud Run request activity alone.

## Rebuild decision gate

A rebuild should not begin merely because hosting can be restored. Review these gates:
- [ ] Rules and experimental/canonical boundaries are documented and reviewed.
- [ ] Local play has dated acceptance evidence, including a full-game path.
- [ ] Available historical data has been reviewed with its limitations stated.
- [ ] A real player need for remote play has been demonstrated or clearly articulated.
- [ ] Architecture supports local recovery and does not require AI/model services for core play.
- [ ] Hosting, persistence, reconnect, security, maintenance, and failure recovery have owners and realistic costs.
- [ ] Accessibility acceptance is part of the gate, not a post-launch promise.
- [ ] The smallest next experiment and success/failure criteria are written before implementation.

## Portfolio and research connection

Duet remains its own game experiment. It is not automatically PIXIE, ScreenWeaver, or Veiled Dominion's canonical engine. A future Loptr Lab field note may examine **what happens when an AI/cloud-dependent creative experiment is made useful after its infrastructure disappears**—local-first recovery, optional services, graceful degradation, human control, and the distinction between hypothesis and deployment. Publish substantive conclusions only when evidence supports them.

## Invitation to review

We welcome focused review from players, chess-variant designers, accessibility testers, and engineers. The most useful feedback is reproducible: a rule interpretation, a barrier, an unexpected outcome, or evidence that changes the next experiment. Review is not a claim that the prototype is finished, nor a promise of paid work or future participation.

## Page structure recommendation

Keep the public review page in this order:
1. Tagline and current status
2. Play locally / recovery links (only paths verified live)
3. Original hypothesis
4. Timeline
5. Evidence ledger (Observed / Interpretation / Unknown)
6. Test protocol and optional feedback
7. Rebuild decision gate
8. Review/contribution invitation
9. Related research (clearly separate projects)

**Do not advertise unavailable cloud features as working.** Update the status and evidence only after a dated verification.
