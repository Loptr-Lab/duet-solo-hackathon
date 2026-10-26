# PIXIE accessibility boundary

**Governing product boundary for Veiled Dominion: Duet**

## Purpose

The only permitted use of AI-related technology in this project is accessibility support for executive functioning within a closed Veiled Dominion franchise sandbox. PIXIE exists to support continuity, not conquest. It is a learning and test environment, not an autonomous agent or an open-ended AI product.

## What support means

PIXIE may help a participant maintain context, orient to the current activity, recall the applicable rules or controls, and identify a useful next step. Support must be bounded, understandable, and under the participant's control. The participant retains agency over decisions and actions.

## Hard boundaries

- **Closed sandbox:** No general-purpose deployment, open-ended franchise expansion, or use outside the defined learning/test environment without a separate human-approved governance decision.
- **Continuity, not conquest:** No autonomous goal-seeking, competitive manipulation, coercive engagement, or taking control of a participant's work.
- **Accessibility purpose only:** Technology must have a direct, documented connection to executive-function accessibility. Convenience, engagement maximization, data collection, or speculative capability are not sufficient reasons.
- **Human authority:** Humans own canon, rules, interpretation, decisions, testing, and releases. PIXIE does not establish canon or make authoritative franchise decisions.
- **Minimal data:** Do not collect or retain participant content unless necessary for a clearly documented accessibility function and explicitly approved. Do not send personal, sensitive, or private project data to external models.
- **Deterministic by default:** PIXIE's existing game help remains eight fixed answers plus a neutral fallback, with no generative-model call or model API key. Do not add a model dependency as a shortcut for a bounded help function.
- **No implied autonomy:** Describe PIXIE as continuity support and a learning/test aid, not as a self-directed agent, decision-maker, or substitute for human judgment.
- **AI-assisted development is optional:** Contributors may use AI tools as disclosed, bounded aids, but the project must remain understandable, testable, and maintainable by people without them. AI use in development does not expand the permitted runtime purpose.

## Decision test for proposed changes

A proposed feature or dependency is out of scope unless a human reviewer can answer yes to all of these:

1. Does it directly support executive-function accessibility in the closed sandbox?
2. Does it preserve participant control and support continuity rather than conquest?
3. Is the behavior bounded, understandable, testable, and reversible?
4. Is data use minimal and documented, with no unapproved external disclosure?
5. Can the feature work without a generative model when a deterministic approach is sufficient?
6. Is there a named human owner and a reproducible acceptance test?

If any answer is no or unknown, do not implement or deploy the change until the issue is resolved by a human decision.

## Scope of this policy

This policy governs product purpose and runtime behavior. It does not assert that the entire repository has already been audited or that every existing feature currently complies. The dependency inventory, actual call-path review, accessibility testing, and staging verification remain work items. No policy change authorizes a production deployment, DNS change, data migration, or new paid service.
