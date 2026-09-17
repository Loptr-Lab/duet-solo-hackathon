# Verified Profile System

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
