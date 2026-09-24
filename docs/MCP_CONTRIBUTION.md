# MCP and AI-Assisted Contribution

**Status:** Contributor guidance  
**Updated:** 2026-09-24

## Purpose

DUET permits MCP (Model Context Protocol) and other AI-assisted tooling to help contributors inspect the repository, research documented technical facts, draft documentation, review proposed changes, and assist with implementation.

AI/MCP assistance is a **tooling layer, not a source of authority or a substitute for maintainer judgment**. A tool result must not be treated as proof merely because an agent produced it.

## What MCP/AI assistance may be used for

Contributors may use MCP-connected tools or AI assistants to:

- inspect repository files, history, issues, pull requests, and tests;
- identify relevant documentation and prior implementation decisions;
- draft or improve documentation, comments, tests, and implementation changes;
- perform code-review analysis and surface concrete risks or inconsistencies;
- research public technical documentation;
- help reproduce and diagnose build or test failures;
- prepare contributor comments or pull-request review feedback.

For factual or compatibility questions, prefer authoritative primary sources and record the source and date. For M0-A in particular, distinguish **documented**, **locally verified**, **vendor confirmed**, and **hardware verified** evidence.

## Contribution restrictions

### 1. Changes go through branches and pull requests

Do not use MCP/AI tooling to bypass repository review or branch protections.

- Work from a feature/documentation branch.
- Submit changes through a pull request.
- Do not write directly to `main`.
- Do not merge a pull request autonomously.
- A maintainer remains responsible for accepting, rejecting, or requesting changes.

This is especially important for AI-assisted changes: the contributor must understand the proposed diff before asking for review.

### 2. No autonomous scope expansion

MCP/AI tools must not silently turn a review request into implementation work.

For DUET's current state:

- M1 is complete.
- M0-A is frozen pending external Microsoft/Xbox and W4 Games facts.
- Do not modify DUET implementation merely because an agent identifies a possible Xbox solution.
- Do not convert "probably compatible" into a documented compatibility claim.
- Do not reopen a completed milestone without an explicit project decision.

### 3. Evidence must be attributable

Comments and documentation should distinguish:

- **Fact:** supported by a repository artifact or authoritative source.
- **Observation:** directly observed in a build, test, or hardware run.
- **Inference:** a reasoned interpretation that still requires verification.
- **Recommendation:** a proposed next step, not an established fact.

Avoid unsupported language such as "should work," "looks compatible," or "is certified."

For M0-A, use the evidence schema in `docs/DEVELOPMENT_STATUS.md`: Evidence ID, capture date, source type, source owner, exact value/statement, environment, result, reproducibility, evidence location, and open questions. Use **UNKNOWN**, **UNVERIFIED**, **VERIFIED**, or **CONTRADICTED** for the evidence state. Record external blockers separately from project implementation status before constructing a compatibility conclusion.

### 4. Protect credentials and private platform material

Never commit, paste into public issues/PRs, or place in repository documentation:

- secrets, tokens, passwords, private keys, or credentials;
- private Xbox/GDK downloads or restricted Microsoft partner material;
- W4 confidential source, packages, support correspondence, or contractual information unless explicitly authorized for publication;
- private dev-kit identifiers or other sensitive provisioning information unless the project owner has approved publication.

Keep restricted M0-A evidence in the appropriate private working record. If a public status document is needed, publish only a sanitized summary.

### 5. Comments and reviews are advisory unless explicitly adopted

MCP/AI-generated review comments should be:

- specific to the changed code or documented decision;
- grounded in observable evidence;
- clear about uncertainty;
- actionable where possible;
- limited to the scope of the review.

A comment is not a project decision. Do not state that a milestone, architecture, compatibility claim, or policy interpretation has changed unless the repository has actually been updated through the normal review process.

When a finding is uncertain, phrase it as a question or verification request rather than as an asserted defect.

### 6. External actions require human intent

Repository mutations, external communications, issue/PR comments, deployment actions, cloud changes, or other consequential operations must be performed only within the contributor's authorized workflow.

AI assistance may prepare the action; the responsible contributor decides whether it should be executed.

## Review checklist for AI/MCP-assisted contributions

Before submitting or posting:

- [ ] I understand every substantive change in the diff.
- [ ] Repository facts were checked against the actual current files/commits.
- [ ] External technical claims have an identifiable source.
- [ ] Unverified assumptions are labeled as such.
- [ ] No credentials or restricted platform material are included.
- [ ] The change stays within the requested scope.
- [ ] Tests or validation steps are reported accurately.
- [ ] The change is on a branch and will be reviewed through a pull request.
- [ ] Any consequential external action was intentionally authorized.

## DUET M0-A evidence rule

The current Xbox/Godot feasibility work is deliberately evidence-first:

```
Microsoft / W4 facts
        ↓
Environment Record
        ↓
Version / access matrix
        ↓
Sample build
        ↓
Package
        ↓
Deploy to Xbox dev kit
        ↓
Launch + controller
        ↓
HTTPS / WebSocket / Socket.IO
        ↓
DUET integration
```

Do not skip directly from documentation or AI-assisted research to a claim that DUET runs on Xbox hardware.

## Contributor call to action

Reviewers are invited to comment on:

1. whether these MCP/AI contribution boundaries are clear enough for an open contributor workflow;
2. whether any repository action should require an additional approval gate;
3. whether the M0-A evidence categories are sufficiently auditable;
4. concrete contradictions between this guidance and the repository's actual contribution workflow.

For M0-A, the immediate work item remains **environment acquisition**: obtain the authoritative Microsoft/Xbox and W4 Games responses, capture exact values and evidence, then build the compatibility matrix. No Xbox implementation expansion is required while those facts remain unresolved.
