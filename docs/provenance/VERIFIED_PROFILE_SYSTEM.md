# Verified Profile System

The Weaver uses an existing AT Protocol identity as the prerequisite for participation. It does **not** create accounts or onboard people to AT Protocol/Bluesky.

A **verified profile** records which verification evidence has actually been checked. Authentication, verification, invitation, and consent are separate states.

## Status model

```text
UNAUTHENTICATED
    ↓
AT AUTHENTICATED
    ↓
VERIFIED PROFILE
    ↓
INVITATION REQUESTED
    ↓
INVITED
    ↓
WEAVER PARTICIPATION
```

Verification may be established by confirmed AT Protocol account email (`transition:email`) or by a server-side DNS TXT domain challenge. Domain control is evidence of control of that DNS namespace; it is not proof of authorship, employment, legal identity, ownership, collaboration, or consent.

## Specific collaborator DID rule

The Weaver may designate one specific, pre-established AT Protocol DID as the **Original Collaborator DID** through the deployment configuration `WEAVER_ORIGINAL_COLLABORATOR_DID`.

The system compares the authenticated **DID**, not merely the handle. A handle such as `renmakesmusic.bsky.social` is only a lookup starting point. If it resolves to a different DID, the account is not treated as the Original Collaborator for this purpose.

If the authenticated DID exactly matches the configured Original Collaborator DID and that DID later completes domain verification for a domain it controls, the verification event is preserved as historical provenance. The event is append-only and remains associated with that DID even if the handle later changes, domain evidence later expires, or the current profile state changes.

The preserved record means only:

> This specific AT identity authenticated, and this specific AT identity subsequently demonstrated control of this domain through the Weaver verification process.

It does **not** mean that the account holder accepted the Weaver, consented to collaboration, agreed with the project's interpretation, established authorship or ownership, or accepted legal terms.

A non-matching DID must never be promoted to the Original Collaborator merely because it uses the same or a similar handle or domain.

## Historical record

Qualifying events are stored separately from the mutable current profile. The historical record includes the DID, event type, relevant handle at authentication, domain and verification timestamp when applicable, and verification method. Historical events are not overwritten by later profile changes.

This is intentional for an account that may have existed on the platform earlier and later disappeared, changed handles, or returned: provenance follows the DID, not the current display name.

## Security boundaries

Authentication is not legal identity verification. Email verification is not authorship verification. Domain verification is not employment verification. A verified profile does not establish consent, ownership, collaboration, or canon.

The Weaver remains read-only to unauthenticated visitors. No anonymous submission path is created.

## Invitation boundary

Verification and invitation remain separate decisions:

```text
AUTHENTICATED + VERIFIED PROFILE
             ↓
       REQUEST INVITATION
             ↓
     HUMAN REVIEW / DECISION
             ↓
          INVITED
```

A verified profile never automatically means consent to Weaver participation.
