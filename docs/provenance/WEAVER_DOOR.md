# The Weaver — Public Door

## Current deployment correction — 29 October 2026

The owner moved Duet to local/static operation. Historical server imports, deployment examples and mocked tests do not establish an authorized working backend. Do not restore Cloud Run or Firestore for Weaver. [Current hosting evidence, storage contract and next decision](../deployment/WEAVER_STAGING_REVIEW.md) supersede earlier operational assumptions.

No production storage adapter is connected. The exact unavailable state is: **“Invitation acceptance is not available on this deployment. Nothing has been accepted.”** No browser storage, temporary files or in-process store may substitute for durable acceptance. The synthetic adapter is test-only and is refused in production mode.

Weaver participation is invitation-only. We do not accept unsolicited invitations or requests to participate. If you have received an invitation, PIXIE can help you verify your account and respond. Verification difficulties do not constitute acceptance or rejection.

Current path: **existing issued invitation → existing AT Protocol OAuth session → exact recipient DID match → separate private named-person review and version-specific approval → exact versioned invitation → explicit “Accept invitation to discuss” → private durable receipt → optional Germ handoff**. Account control, an email/domain credential, named-person review, approval and acceptance are separate. A confirmed mismatch excludes that account; unresolved evidence stays pending. A technical issue or its closure never changes those states. The old public request and legacy decision endpoints return 410; this flow provides no issuance or evidence-editing endpoint.

The provider-independent invitation record has no authorized production storage location yet. Historical `duet_auth` collection paths are not a current deployment requirement. Required fields are `id`, `did`, `status: invited`, immutable `version` and exact `text`; `approval` contains status, owner DID (`by`), matching version and SHA-256 `invitationDigest` of the exact UTF-8 text; `verification` contains confirmed/pending/mismatch state, `subjectDid`, authorized `reviewedBy`, `reviewedAt`, and minimal opaque `evidenceRefs`. A matching email or domain is not sufficient named-person evidence. Legacy records lacking version/text or reviewed evidence remain pending; no record migration or real invitation editing was performed.

Acceptance requires an atomic transaction through the provider-independent storage contract that rechecks current invitation state and the digest of the exact text displayed to the recipient and creates one private record keyed by a hash of invitation ID/version/recipient DID. Concurrent retries return the same receipt. The private acceptance stores recipient DID, invitation ID/version, timestamp, notice version, invitation text digest and opaque evidence references, never evidence contents or correspondence. Only the server's committed receipt permits UI success. Any future authorized adapter must restrict private record access to the authenticated recipient and authorized owner; no public AT record, localStorage or public repository carries acceptance data. Retain immutable issued versions and acceptance records under a documented retention/access process; implementation does not establish professional validation of evidence.

Notice version `discuss-v1`: Acceptance opens discussion of Weaver, differing interpretations, contributions and possible rights or obligations. It does not itself confirm disputed history, establish a relationship, transfer rights, waive rights, authorize publication or accept separate collaboration terms.

Owner account binding is configured in `config/weaver-owner.json`: public handle resolution and the reverse DID document were retrieved 29 October 2026. Runtime privileged routes recheck this binding and the PDS endpoint, then require the matching OAuth account for owner status. This is account authorization, not named-person verification. Unavailable authenticated sessions or authorized storage, failed binding checks or unknown approval evidence disable privileged actions. W Identity automatic verification is disabled: no documented provider integration or credentials were established.

Support uses a fixed technical error code and stable fingerprint, with an existing-issue search and reviewable GitHub draft. No issue is posted automatically and no DID, handle, invitation content, private evidence or token is placed in the draft. Deduplication is review-assisted through the existing-issue search; concurrent manual GitHub submissions are not claimed to be atomically deduplicated.

### Germ handoff and source limits

Official guidance reviewed 29 October 2026: [Germ announcement](https://www.germnetwork.com/blog/atproto-devs-button), [Mark X, implementation guidance, 11 February 2026](https://mark-germ.leaflet.pub/3mem22lhe222t), and [Using Germ, updated 6 August 2026](https://www.germnetwork.com/using-germ-dm-user-guide). These are technical sources, not endorsements or professional review. No jurisdictional/legal conclusion follows from the handoff.

Only after a saved receipt may the owner’s fresh `com.germnetwork.declaration/self` enable a button. Missing record/messageMe, invalid data, none/unknown permission, failed provider checks or unreachable destination produce no external link. `everyone` is eligible; `usersIFollow` requires **the owner/recipient to follow the authenticated sender**, not the reverse. The supported current destination is HTTPS landing.ger.mx/newUser (optional documented android/iOS/web path). URLs with credentials, query/prefill parameters, fragments, unsupported hosts/paths or failed HEAD checks are refused. The completed fragment is **recipient DID + sender DID**.

The button rechecks permission before offering the external navigation. Germ is opened only by the person; this service has no sending API, bot, webhook, prefilled message, delivery receipt or encrypted-reply access. Opening Germ changes neither acceptance nor delivery status. Failed handoff/retry leaves acceptance saved. The live owner declaration request returned HTTP 403 in this environment; its present policy and destination remain unverified. Synthetic provider responses are used only in tests.

### Verification and deployment boundary

Tests exercise synthetic identities and mocked providers, private transaction idempotency, pending/mismatched/stale invitations, CSRF, owner denial, outages, storage failure and Germ permission/follow/URL rules. Static preview has no OAuth/storage backend and explicitly reports unavailable verification and durable acceptance. No current persistent backend has been authorized for Weaver acceptance. The existing PIXIE Companion is a reuse candidate only; historical Google services are not required. The configured production factory remains unavailable regardless of historical database/OAuth configuration. A future adapter needs durable atomic create-only receipts, private isolation and an authenticated session; qualified identity review, W Identity support and Germ destination acceptance remain separate gates. The previously locked external review/governance boundaries are not unlocked by these tests.


Historical receipt recovery remains DID-bound and independent of current invitation eligibility once authenticated access and a working authorized store exist. No receipt is returned before committed storage. Sign-out race protection and session-derived CSRF checks remain required.

<details>
<summary>Historical specification before the deployment correction — superseded infrastructure assumptions, not current instructions</summary>

# The Weaver — Public Door

## Current owner direction — 29 October 2026, proposed PR #105 implementation

This section supersedes the earlier invitation-request/registration lifecycle below. Older text is retained as a historical design record, not a currently available participation route.

Weaver participation is invitation-only. We do not accept unsolicited invitations or requests to participate. If you have received an invitation, PIXIE can help you verify your account and respond. Verification difficulties do not constitute acceptance or rejection.

Current path: **existing issued invitation → existing AT Protocol OAuth session → exact recipient DID match → separate private named-person review and version-specific approval → exact versioned invitation → explicit “Accept invitation to discuss” → private durable receipt → optional Germ handoff**. Account control, an email/domain credential, named-person review, approval and acceptance are separate. A confirmed mismatch excludes that account; unresolved evidence stays pending. A technical issue or its closure never changes those states. The old public request and legacy decision endpoints return 410; this flow provides no issuance or evidence-editing endpoint.

The invitation's private record remains in the existing `duet_auth/invitation_<recipient-DID>` location. Required fields are `id`, `did`, `status: invited`, immutable `version` and exact `text`; `approval` contains status, owner DID (`by`), matching version and SHA-256 `invitationDigest` of the exact UTF-8 text; `verification` contains confirmed/pending/mismatch state, `subjectDid`, authorized `reviewedBy`, `reviewedAt`, and minimal opaque `evidenceRefs`. A matching email or domain is not sufficient named-person evidence. Legacy records lacking version/text or reviewed evidence remain pending; no record migration or real invitation editing was performed.

Acceptance is an atomic Firestore transaction that rechecks current invitation state and the digest of the exact text displayed to the recipient and creates one private record keyed by a hash of invitation ID/version/recipient DID. Concurrent retries return the same receipt. The private acceptance stores recipient DID, invitation ID/version, timestamp, notice version, invitation text digest and opaque evidence references, never evidence contents or correspondence. Only the server's committed receipt permits UI success. Operator must restrict collection access to the existing backend service and authorized owner; no public AT record, localStorage or public repository carries acceptance data. Retain immutable issued versions and acceptance records under a documented retention/access process; implementation does not establish professional validation of evidence.

Notice version `discuss-v1`: Acceptance opens discussion of Weaver, differing interpretations, contributions and possible rights or obligations. It does not itself confirm disputed history, establish a relationship, transfer rights, waive rights, authorize publication or accept separate collaboration terms.

Owner account binding is configured in `config/weaver-owner.json`: public handle resolution and the reverse DID document were retrieved 29 October 2026. Runtime privileged routes recheck this binding and the PDS endpoint, then require the matching OAuth account for owner status. This is account authorization, not named-person verification. Missing keys/storage, failed binding checks or unknown approval evidence disable privileged actions. W Identity automatic verification is disabled: no documented provider integration or credentials were established.

Support uses a fixed technical error code and stable fingerprint, with an existing-issue search and reviewable GitHub draft. No issue is posted automatically and no DID, handle, invitation content, private evidence or token is placed in the draft. Deduplication is review-assisted through the existing-issue search; concurrent manual GitHub submissions are not claimed to be atomically deduplicated.

### Germ handoff and source limits

Official guidance reviewed 29 October 2026: [Germ announcement](https://www.germnetwork.com/blog/atproto-devs-button), [Mark X, implementation guidance, 11 February 2026](https://mark-germ.leaflet.pub/3mem22lhe222t), and [Using Germ, updated 6 August 2026](https://www.germnetwork.com/using-germ-dm-user-guide). These are technical sources, not endorsements or professional review. No jurisdictional/legal conclusion follows from the handoff.

Only after a saved receipt may the owner’s fresh `com.germnetwork.declaration/self` enable a button. Missing record/messageMe, invalid data, none/unknown permission, failed provider checks or unreachable destination produce no external link. `everyone` is eligible; `usersIFollow` requires **the owner/recipient to follow the authenticated sender**, not the reverse. The supported current destination is HTTPS landing.ger.mx/newUser (optional documented android/iOS/web path). URLs with credentials, query/prefill parameters, fragments, unsupported hosts/paths or failed HEAD checks are refused. The completed fragment is **recipient DID + sender DID**.

The button rechecks permission before offering the external navigation. Germ is opened only by the person; this service has no sending API, bot, webhook, prefilled message, delivery receipt or encrypted-reply access. Opening Germ changes neither acceptance nor delivery status. Failed handoff/retry leaves acceptance saved. The live owner declaration request returned HTTP 403 in this environment; its present policy and destination remain unverified. Synthetic provider responses are used only in tests.

### Verification and deployment boundary

Tests exercise synthetic identities and mocked providers, private transaction idempotency, pending/mismatched/stale invitations, CSRF, owner denial, outages, storage failure and Germ permission/follow/URL rules. Static preview has no OAuth/storage backend and explicitly reports unavailable verification and durable acceptance. Actual OAuth configuration, backend availability, Firestore IAM/private records, qualified identity review, W Identity support and Germ destination acceptance remain operational gaps. The previously locked external review/governance boundaries are not unlocked by these tests.

## Historical design below — superseded where it permits requests or equates credentials with participation


## Purpose

The Weaver public door is the accessible entry point into the documented creative/research process connecting the proposed collaboration, Duet, 52 Cards of War, and Veiled Dominion.

The originating collaboration letter has been sent. This public door is prepared for controlled participation and professional review, including legal review if invited reviewers choose to participate.

The page is intentionally a door rather than a legal memo. It introduces the creative history, the questions, the provenance model, and unresolved areas without converting any unresolved question into a conclusion.

## Review posture

This publication does not ask a reviewer to agree with the project's interpretation. Reviewers may identify factual errors, unsupported assumptions, missing context, privacy concerns, rights questions, jurisdictional issues, or language that should be changed before incorporation into the project.

A review comment is a review comment. It is not automatically consent, acceptance, a license, an ownership statement, a legal conclusion, or a change to canon.

## Provenance model

The project distinguishes:

- **Original Collaborator** — the person to whom the originating invitation was delivered.
- **Independent Respondent** — another participant answering from their own perspective.
- **AI-Assisted Response** — a human response articulated or edited with AI assistance.

There is no anonymous response category. Public visitors may read the repository, but participation requires registration for an invitation and a separately issued invitation before a response pathway opens.

A response's content does not authenticate its author. Authentication and content are separate layers.

### Original-collaborator pathway

The originating invitation has already been delivered privately. The public page does not expose the recipient's private contact information and does not allow a visitor to self-assign the `Original Collaborator` role.

The original collaborator's response, if any, should enter through a protected private invitation pathway. The pathway must establish provenance through the authenticated invitation/session channel rather than asking the respondent to prove identity by answering questions about the shared history.

Recommended provenance chain:

`Invitation → private pathway → authenticated submission provenance → response artifact → discussion → explicit decision → possible incorporation`

The system should record what pathway produced a response, not ask the public to prove a real-world identity by answering trivia.

### Everyone-else pathway

Other participants may register for an invitation. Registration is not anonymous and does not itself grant participation. A human invitation decision is required before the response pathway opens.

Independent responses remain independent responses. One person's answer must never be represented as the original collaborator's answer or as a universal male perspective.

## Verification boundary

The application may establish a **Verified Profile** from an existing AT Protocol identity plus validated email and/or domain evidence.

Verification is not legal identity, authorship, employment, ownership, consent, invitation, or a legal conclusion. It is an application-level provenance signal used before controlled participation.

The current implementation supports:

`EXISTING AT IDENTITY → AUTHENTICATE → VERIFY EMAIL AND/OR DOMAIN → REQUEST INVITATION → HUMAN DECISION → INVITED RESPONSE PATH`

Domain verification is independently capable of establishing the first verified-profile credential; it must not require a profile to be verified before the domain challenge can begin.

## Memory prompts

A useful provenance prompt is:

> What song, moment, or piece of work do you remember as the beginning of this?
>
> You don't have to remember it the way I do. I'm interested in what you remember as the beginning.

A second prompt may ask whether there is something the respondent made, changed, or explored after the concept was introduced that they associate with the story.

These prompts preserve independent memory; they are not identity tests.

## Two histories

The archive should preserve both accounts where available:

- **My memory of how this began**
- **Your memory of how this began**
- **Where the accounts overlap**
- **Where they differ**
- **What each person thought was happening at the time**

Disagreement is a legitimate part of the documented experiment. It should not be silently corrected into a single canonical origin story.

## Consent and status

Suggested lifecycle:

`PROPOSED → SUBMITTED → DISCUSSED → CORRECTED / DISPUTED → EXPLICITLY ACCEPTED → INCORPORATED (IF CHOSEN)`

The project preserves the distinction between a proposed response, a review comment, accepted/shared material, and incorporated canon.

## Public/private boundary

Private originating correspondence may establish historical provenance without being published. Public documentation does not require publication of private contact information.

If the original collaborator does not respond, the archive should say so plainly. An independent response must never be represented as a response on that person's behalf.

## Legal boundary

This documentation records a creative/research process. It does not itself constitute a contract, license, assignment, partnership agreement, legal opinion, or determination of ownership.

Questions concerning applicable law, jurisdiction, intellectual-property rights, tax, estate interests, or enforceability require appropriate professional review.

## Resumed operational review — 29 October 2026

See [operational readiness and release handoff](../deployment/WEAVER_STAGING_REVIEW.md) for fresh hosting/owner/provider observations, the private historical-receipt endpoint, session/logout corrections, isolated test results and exact remaining operator gates. Static preview remains non-operational for authentication and acceptance. Automatic named-person verification remains disabled; no real invitation writes or messages are authorized.

</details>
