# Human-led maintenance transition

**Status:** Proposed operating policy; this is not a claim that the transition is complete. Assign a named human owner for each workstream.

## Decision

Duet uses a **human-led, AI-optional** development process. AI-assisted tools may help with research, drafting, code suggestions, and documentation, but are never required to understand, build, test, review, deploy, or maintain the project. Contributors remain responsible for their submissions; a human maintainer owns release approval. Do not rewrite historical code solely because AI may have helped create it. Assess code by known provenance, license, tests, maintainability, and observed behavior.

## Runtime policy

- PIXIE game help remains deterministic: eight fixed answers plus a neutral fallback. It must not call a generative model or require a model API key.
- The custom minimax/alpha-beta computer opponent is a conventional game-search algorithm, not a generative-AI service. Do not remove it under this policy; any change needs a separate product decision and tests.
- Do not add model SDKs, model credentials, model-backed endpoints, or runtime AI services without a reviewed proposal covering need, cost, privacy, accessibility, fallback, and removal.
- If a model integration is found, document its call path and data handling; remove it only after confirming it is not needed for unrelated functionality.
- Never paste secrets, player data, or private production logs into third-party AI services.

## Required contributor practice

1. Work on a named branch and open a pull request; do not push directly to `main` where review is required.
2. State whether AI assistance was used. If so, briefly identify its type (code suggestions, research, documentation) and what you personally verified. Do not disclose private prompts or account information.
3. Understand and explain every submitted change. Generated output is a draft, not evidence.
4. Include reproducible tests for behavior changes. Record commands and actual results; never report tests as passing unless they ran successfully.
5. Require human review for correctness, accessibility, security, data migration, and release decisions. AI output cannot approve its own work.
6. Keep canonical rules and product decisions under explicit human ownership. Experimental Duet mechanics must not silently become canonical Veiled Dominion rules.
7. Keep changes small, reversible, and documented.
8. Never commit credentials, access tokens, session secrets, private player data, or confidential partner material.

## Workstreams and acceptance criteria

### A. Repository and dependency inventory
- Inventory runtime dependencies, build/test tools, external services, model-related packages/endpoints, and environment variable names (names only, never secret values).
- For each item record purpose, runtime/build/test classification, data sent, owner, removal impact, and status: `UNKNOWN`, `UNVERIFIED`, or `VERIFIED`.
- Verify package manifests and source call sites; do not infer a runtime dependency from a package name alone.
- **Accept when:** a human reviewer can trace every external runtime service from entry point to call site and configuration without AI assistance.

### B. Reproducible local development
- Document the supported Node version, install/start commands, environment variable names, optional versus required services, test commands, and expected health checks.
- Verify from a clean checkout and record OS/runtime versions and output. Keep real secret values out of examples.
- **Accept when:** a new contributor can run the documented local experience and checks without paid services or AI tools.

### C. Rules and regression suite
- Test standard movement, turn order, board bounds, path blocking, friendly captures, Death uncapturability, Rebirth movement, Veiled forward-only movement and no captures, Sanctuary protection, aura refresh timing, promotion, and end states.
- Include illegal-move tests and regression fixtures for discovered defects.
- **Accept when:** CI runs the tests and a human rule owner approves expected outcomes. Passing tests alone do not prove accessibility or production readiness.

### D. Accessibility acceptance
- Record manual keyboard and screen-reader sessions with browser, OS, assistive technology, date, steps, expected/actual result, and defects.
- Test board navigation, square descriptions, legal destination announcements, errors, turn changes, undo/reset, and game-over announcements.
- **Accept when:** findings are reproducible and reviewed by people using the relevant assistive technology; source markup alone is not acceptance evidence.

### E. Hosting and release separation
- Continue Azure rebuild work on an isolated branch/staging environment. Do not alter production hosting, DNS, secrets, databases, or traffic as part of this transition.
- Verify CI, deployment identity, cost limits, database behavior, backup/rollback, two-client play, reconnect/restart, and security before staging sign-off.
- Any production change needs separate explicit approval, a recorded serving commit, a rollback plan, and post-deploy checks.
- **Accept when:** a documented staging release passes agreed gates; production remains unchanged until separately authorized.

### F. Ownership and governance
- Assign human maintainers for rules, accessibility, backend/multiplayer, operations, and documentation.
- Record decisions, rationale, alternatives, risks, and test evidence in issues/PRs.
- **Accept when:** each critical subsystem has a named accountable maintainer or is explicitly marked `UNOWNED`; no automated assistant is its sole authority.

## Contributor task menu

Choose one bounded task:

- **T1 — Dependency inventory:** map runtime packages, external services, model SDKs/endpoints, and environment variable names.
- **T2 — Clean-checkout runbook:** verify setup and test commands from a clean checkout; fix documentation gaps.
- **T3 — Rules test plan:** convert approved Duet rules into a reviewed matrix of legal/illegal moves and expected outcomes.
- **T4 — Regression tests:** implement one focused test set and record the actual command/result.
- **T5 — Accessibility audit:** run a bounded keyboard/screen-reader session and file reproducible findings.
- **T6 — Azure staging checklist:** verify CI, isolation, cost, deployment, persistence, rollback, and two-client tests without touching production.
- **T7 — Ownership map:** propose human maintainers and review responsibilities for each subsystem.

## Participation boundaries

Current open review/contribution opportunities are voluntary and unpaid unless a separate signed agreement says otherwise. Before work begins, agree on scope, time, public visibility, credit preferences, and an exit path. Anyone can stop at any time. Do not promise employment, ownership, revenue share, academic credit, or future pay without a separate agreement. Documentation, test, and review contributors do not need personal credentials or production administrator access.

## Evidence format

For each task record:
- **Status:** `UNKNOWN`, `UNVERIFIED`, `VERIFIED`, or `BLOCKED`
- **Environment:** commit SHA and OS/runtime/browser/assistive-technology versions as applicable
- **Steps/commands:** exact reproducible actions
- **Expected/actual:** observable behavior, not inference
- **Evidence:** test output, sanitized logs, screenshots where useful, issue/PR link
- **Reviewer/date:** named human reviewer and date
- **Open questions:** unresolved items and owner

## Out of scope

This policy does not restore production, migrate player data, deploy Azure, change DNS, remove the existing game-search opponent, or certify the current build. Those require separate tested work and explicit approval.
