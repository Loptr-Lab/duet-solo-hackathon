# Verified Profile System

## Current invitation-only, provider-independent contract — 29 October 2026

Use the [current Weaver Door](WEAVER_DOOR.md) and [verified hosting/storage assessment](../deployment/WEAVER_STAGING_REVIEW.md). Duet operates locally/statically under current owner direction. Historical Express, Firestore and Cloud Run examples are not a current deployment or a requirement to restore those services.

Only existing issued invitations are eligible. Account control, named-person review, version/digest-bound approval and explicit acceptance are separate. Matching names/handles, social posts, verification events, inferred historical responses and troubleshooting issue closure never count as consent. Unresolved verification stays pending; confirmed mismatch excludes that account. Automatic named-person verification remains disabled.

Acceptance requires a working authorized persistent adapter with atomic, immutable, idempotent receipts, recipient recovery and owner/recipient isolation. No such Weaver adapter has been established. The deployment must say: **“Invitation acceptance is not available on this deployment. Nothing has been accepted.”** Do not use browser localStorage, temporary files, process memory or simulated success. Mocked integration tests are not live provider verification. The exact invitation and acceptance notice remain in the current Weaver Door; Germ remains optional user-controlled navigation after a saved receipt.

<details>
<summary>Historical specification — preserved provenance; superseded where it assumes current infrastructure or permits requests</summary>

# Verified Profile System

## Current owner direction — 29 October 2026, proposed PR #105 implementation

The newer owner direction supersedes the historical invitation-request/registration lifecycle below. Participation is limited to existing issued invitations; unsolicited requests are closed. Account control, named-person verification, approval and explicit acceptance are separate. A matching DID or issue closure never records consent. Unresolved verification remains pending; confirmed mismatch excludes the account from that invitation.

The current authoritative flow, private record contract, versioned acceptance notice, owner binding, provider limitations and Germ handoff rules are in [Weaver Door](WEAVER_DOOR.md#canonical-pixie-runtime-amendment--29-october-2026). Use that contract rather than the older status diagrams below. Static previews cannot verify identity or save acceptance. No real invitation, production configuration or message was changed during this review.

## Historical design below — superseded where it permits requests or equates credentials with participation


## Purpose

The Weaver uses an existing AT Protocol identity as the prerequisite for participation. It does **not** create accounts or onboard people to AT Protocol/Bluesky.

A **verified profile** is stronger than an authenticated DID. It records which verification evidence has actually been checked:

- **AT identity:** OAuth authentication establishes the session DID and binds the session to the expected account.
- **Email:** the account email is readable only when the person explicitly grants the `account:email` OAuth permission. The returned account record includes the email and its confirmation status. A confirmed account email may be recorded as `email_verified`.
- **Domain:** a domain is verified separately by a DNS TXT challenge. Control of a domain is evidence of control of that DNS namespace; it is not proof of authorship, employment, legal identity, or ownership of creative work.

AT Protocol's current OAuth profile requires identity authentication and recommends the official OAuth client libraries; the `account:email` permission exposes the account email and verification status. See the official AT Protocol OAuth and Permissions specifications before deployment.

## Status model

```text
UNAUTHENTICATED
    ↓
AT AUTHENTICATED
    ↓
VERIFIED PROFILE
    ├── EMAIL VERIFIED
    ├── DOMAIN VERIFIED
    └── EMAIL + DOMAIN VERIFIED
    ↓
INVITATION REQUESTED
    ↓
INVITED
    ↓
WEAVER PARTICIPATION
```

A profile may be verified with either validated email or validated domain. The profile must display exactly which evidence supports the status.

## Security boundaries

Authentication is not legal identity verification. Email verification is not authorship verification. Domain verification is not employment verification. A verified profile does not establish consent, ownership, collaboration, or canon.

The Weaver remains read-only to unauthenticated visitors. No anonymous submission path is created.

## Verification record

A server-side record should contain:

```json
{
  "did": "did:...",
  "handle": "example.com",
  "status": "verified",
  "evidence": {
    "atIdentity": {
      "status": "verified",
      "verifiedAt": "2026-09-17T00:00:00Z"
    },
    "email": {
      "status": "verified",
      "address": "redacted-or-encrypted",
      "source": "atproto-account-email",
      "verifiedAt": "2026-09-17T00:00:00Z"
    },
    "domain": {
      "status": "verified",
      "domain": "example.com",
      "method": "dns-txt-challenge",
      "verifiedAt": "2026-09-17T00:00:00Z"
    }
  },
  "invitation": {
    "status": "not-requested"
  }
}
```

Do not publish the email address merely because it was validated. Store the minimum information needed to establish the verification state.

## Domain challenge

The service generates a random high-entropy value and asks the participant to publish:

```text
_weaver-verification.example.com TXT "weaver=<challenge>"
```

The verifier resolves the TXT record and compares the exact value. Challenges are single-use and expire. A successful check is recorded with the domain, timestamp, method, and challenge version.

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

A verified profile never automatically grants Weaver participation.

## Production implementation note

The repository currently contains the public Weaver door and its existing Express/Firestore infrastructure. The production OAuth implementation must use an official atproto OAuth client, persistent session/state storage, HTTPS client metadata, secure cookies, CSRF/state protections supplied by the OAuth implementation, and the minimum requested scope (`atproto account:email`). The browser should never receive a server private key.

For production deployment, domain verification can be performed server-side with DNS resolution. Email verification can use the account's confirmed AT Protocol email status rather than creating a second password/email account system.

## Resumed operational review — 29 October 2026

See [operational readiness and release handoff](../deployment/WEAVER_STAGING_REVIEW.md) for fresh hosting/owner/provider observations, the private historical-receipt endpoint, session/logout corrections, isolated test results and exact remaining operator gates. Static preview remains non-operational for authentication and acceptance. Automatic named-person verification remains disabled; no real invitation writes or messages are authorized.

</details>
