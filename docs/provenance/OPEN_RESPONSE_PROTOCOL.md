# Controlled Response Protocol

## Current invitation-only, provider-independent contract — 29 October 2026

Use the [current Weaver Door](WEAVER_DOOR.md) and [verified hosting/storage assessment](../deployment/WEAVER_STAGING_REVIEW.md). Duet operates locally/statically under current owner direction. Historical Express, Firestore and Cloud Run examples are not a current deployment or a requirement to restore those services.

Only existing issued invitations are eligible. Account control, named-person review, version/digest-bound approval and explicit acceptance are separate. Matching names/handles, social posts, verification events, inferred historical responses and troubleshooting issue closure never count as consent. Unresolved verification stays pending; confirmed mismatch excludes that account. Automatic named-person verification remains disabled.

Acceptance requires a working authorized persistent adapter with atomic, immutable, idempotent receipts, recipient recovery and owner/recipient isolation. No such Weaver adapter has been established. The deployment must say: **“Invitation acceptance is not available on this deployment. Nothing has been accepted.”** Do not use browser localStorage, temporary files, process memory or simulated success. Mocked integration tests are not live provider verification. The exact invitation and acceptance notice remain in the current Weaver Door; Germ remains optional user-controlled navigation after a saved receipt.

<details>
<summary>Historical specification — preserved provenance; superseded where it assumes current infrastructure or permits requests</summary>

# The Weaver — Controlled Response Protocol

## Current owner direction — 29 October 2026, proposed PR #105 implementation

The newer owner direction supersedes the historical invitation-request/registration lifecycle below. Participation is limited to existing issued invitations; unsolicited requests are closed. Account control, named-person verification, approval and explicit acceptance are separate. A matching DID or issue closure never records consent. Unresolved verification remains pending; confirmed mismatch excludes the account from that invitation.

The current authoritative flow, private record contract, versioned acceptance notice, owner binding, provider limitations and Germ handoff rules are in [Weaver Door](WEAVER_DOOR.md#canonical-pixie-runtime-amendment--29-october-2026). Use that contract rather than the older status diagrams below. Static previews cannot verify identity or save acceptance. No real invitation, production configuration or message was changed during this review.

## Historical design below — superseded where it permits requests or equates credentials with participation


The original questions were developed in connection with a proposed collaboration. They may be read publicly, but participation is controlled.

**There are no anonymous response or submission paths.** A person who wants to participate must register for an invitation through the project's controlled invitation process. Registration is a request, not automatic access. An invitation must be issued before a response pathway opens.

Until an invitation is issued, the public repository is the boundary: read the record, inspect the design, and do not submit into the Weaver archive.

## Response types

1. **Invited Collaborator Response** — a response from the person to whom the original invitation was delivered, entering through the private invitation pathway.
2. **Independent Male Perspective** — a man responding because the structural questions resonate with his own experience. This response represents that respondent only.
3. **Independent Perspective** — another invited participant responding from their own experience.
4. **AI-Assisted Response** — an invited human response where AI was used to help articulate, organize, translate, or edit the person's own thinking.
5. **System / Design Response** — an invited designer, researcher, artist, or other participant addressing the framework as a system.

There is deliberately **no Anonymous Response** category.

## Access lifecycle

```text
PUBLIC REPOSITORY
      ↓
READ-ONLY DOOR
      ↓
REGISTRATION REQUEST
      ↓
REVIEW / INVITATION DECISION
      ↓
INVITATION ISSUED
      ↓
AUTHENTICATED RESPONSE PATHWAY
      ↓
VERSIONED ARTIFACT
      ↓
DISCUSSION / CORRECTION
      ↓
EXPLICIT CONSENT
      ↓
INCORPORATION — IF CHOSEN
```

## Required provenance

An authorized response should identify, where appropriate:

- response type
- authenticated submitter / public attribution
- submission date
- whether AI assistance was used
- questions answered
- questions intentionally skipped
- unresolved questions
- corrections or disagreements
- privacy requests

Identity should be established by the invitation/authentication pathway, not inferred from the content of an answer.

## GitHub provenance

A Pull Request is preferred when an invited participant wants a versioned document in the repository. An Issue may be used for an invited participant when lower-friction discussion is appropriate.

The repository should not auto-merge participant responses. A submitted response is not the same thing as accepted project material.

## Corrections and boundaries

Authorized participants may identify:

- a factual error
- an assumption they do not share
- a question that does not apply to them
- something requiring clarification
- something they want removed
- something they want treated as private
- something they want documented differently

The protocol treats disagreement as a legitimate response state.

## Resumed operational review — 29 October 2026

See [operational readiness and release handoff](../deployment/WEAVER_STAGING_REVIEW.md) for fresh hosting/owner/provider observations, the private historical-receipt endpoint, session/logout corrections, isolated test results and exact remaining operator gates. Static preview remains non-operational for authentication and acceptance. Automatic named-person verification remains disabled; no real invitation writes or messages are authorized.

</details>
