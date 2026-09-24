# MCP Use and Contribution Guidance

**Status:** Active guidance for contributor review  
**Updated:** 2026-09-24  
**Scope:** Repository comments, research, implementation assistance, and proposed changes

## Purpose

MCP (Model Context Protocol) tools may be used by maintainers or contributors as controlled interfaces to external systems, repository data, development services, or other connected resources.

MCP use does **not** change the project's source-of-truth rules. Tool output is evidence to inspect and verify, not permission to bypass repository governance or to turn an unresolved assumption into a project fact.

## What MCP may be used for

MCP-assisted work may include:

- inspecting repository files, history, issues, pull requests, and CI results;
- locating relevant documentation or implementation references;
- researching technical compatibility questions;
- drafting or reviewing code and documentation;
- running supported development or validation workflows;
- preparing evidence for feasibility gates such as M0-A;
- proposing changes through the repository's normal branch/PR workflow.

For M0-A in particular, MCP may help collect and organize evidence, but Microsoft/Xbox-controlled facts must remain attributable to Microsoft/Xbox sources, and W4-controlled facts must remain attributable to W4 Games or the applicable local installation evidence.

## What MCP must not be used to do

Do not use MCP or an AI-assisted workflow to:

- bypass branch protection, required reviews, access controls, or repository contribution rules;
- write directly to `main` when the repository requires a pull request;
- merge a pull request without the maintainer's explicit authorization;
- expose, copy, or commit secrets, credentials, tokens, private keys, personal data, or confidential partner material;
- represent tool-generated text, inferred compatibility, or AI opinion as an authoritative vendor statement;
- mark an unverified capability as demonstrated;
- silently alter milestone definitions or architectural contracts;
- make external changes with material side effects without explicit authorization and a clear record of what changed;
- substitute MCP output for physical validation where the milestone requires hardware evidence.

## Evidence discipline

When a contribution depends on an external fact, record:

1. **Exact value or statement**
2. **Source**
3. **Date collected**
4. **Evidence location** when available
5. **Evidence state**

Use these evidence states consistently:

- **DOCUMENTED** — supported by an authoritative published source.
- **LOCALLY VERIFIED** — observed in the contributor's actual development environment.
- **VENDOR CONFIRMED** — explicitly confirmed by the relevant vendor or partner support channel.
- **HARDWARE VERIFIED** — exercised successfully on the required physical hardware.
- **NOT YET VERIFIED** — still an open question.

Do not replace these states with conclusions such as "looks compatible," "probably supported," or "should work."

For M0-A, documentation or partner confirmation can establish useful evidence, but the exit criterion still requires the applicable Godot project to run on an Xbox development kit with the required controller/Xbox-services behavior. Network behavior must be tested where it is part of the intended deployment chain.

## Comments and review contributions

Useful comments should identify a concrete claim, contradiction, risk, missing evidence, or reproducible result.

Prefer:

- "Microsoft documents X for GDK version Y; our recorded environment is Z. Compatibility is unresolved."
- "This step requires a physical dev kit and therefore cannot be marked hardware-verified from documentation alone."
- "I reproduced this failure with these versions and this error output."

Avoid:

- unsupported compatibility conclusions;
- speculative statements presented as facts;
- personal credentials or private vendor correspondence pasted into public issues/PRs;
- drive-by architectural rewrites unrelated to the requested milestone.

For confidential Microsoft/Xbox or W4 material, summarize the relevant fact publicly without publishing restricted artifacts. Keep the underlying evidence in the appropriate private location.

## Change and PR discipline

Contributors should:

1. Start from the current `main` state or the designated development branch.
2. Make the smallest change that addresses the documented issue or milestone.
3. Preserve the authoritative server/client boundaries unless an architectural change is explicitly proposed.
4. Run the relevant tests or validation and report the result.
5. Open a pull request for review.
6. Do not merge another contributor's work without maintainer authorization.

For the current M0-A gate, **do not add speculative Xbox/Godot implementation merely to resolve an unknown environment fact**. Capture the fact first, then update the plan based on evidence.

## Current M0-A call to action

M0-A is currently **FROZEN / PENDING EXTERNAL FACTS**.

Contributors can help by reviewing:

- the M1 platform-neutral client boundary;
- the M0-A evidence chain;
- the environment-record fields;
- the distinction between documented capability and hardware proof;
- any concrete contradiction in the current deployment plan.

The next execution step is:

**Microsoft/Xbox response or W4 Games response → capture exact environment facts → build version/compatibility matrix → identify remaining unknowns → exercise the physical dev-kit proof chain.**

Until those facts arrive, DUET remains frozen at **M1 COMPLETE** and no Xbox/Godot implementation expansion is required.
