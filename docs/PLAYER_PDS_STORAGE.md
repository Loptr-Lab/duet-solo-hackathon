# Required player-owned DUET game records
Decision recorded October 5, 2026: signed-in players should own their durable DUET
game records in their own PDS. This is an implementation requirement, not a claim
that current production or the merged fixed-help source already does it.

## Present versus required
| Data | Current source | Required destination / control |
| --- | --- | --- |
| Live authoritative board/reconnect state | DUET memory and configured Firestore | Server operational state; do not move live authority to client/PDS |
| Durable player match record | Firestore match logs; no player-PDS writer | Player's resolved PDS, under their OAuth identity and permission |
| OAuth state/session and reconnect secrets | Operator server storage | Remain private operational data; never public repo records |
| Anonymous summaries/optional feedback | Separate Firestore collections | Distinct telemetry policy; not described as player-owned history |
| Community reports/training discussion | Roomy channels provisioned; member access pending | Roomy community visibility as verified; code issues in GitHub |
| Optional public result announcement | Configured project account's Bluesky post | Separate permission and disclosure; does not replace player record |

Standard AT Proto repository records are public, including custom collections.
Player-owned does not mean private. Exclude credentials, room/reconnect identifiers,
opponent DIDs/handles, private feedback and health/accessibility information.
Private PDS feedback must await a supported, verified permissioned-data mechanism;
do not silently publish it as an ordinary custom record.

## Implementation contract
1. Publish a versioned DUET match-record Lexicon in an operator-controlled namespace
   (proposed: org.loptrlab.duet.match; ownership/schema registration unverified).
   Define sanitized result, player's seat, rules version, move count, completion
   time and source revision. Full replay is a separate disclosed scope; do not
   assume consent to publishing a shared move history.
2. Request only the collection-specific OAuth rights required for game records.
   Plain atproto sign-in is insufficient. Existing users reauthorize the added
   scope; do not reuse project posting credentials or broaden access to unrelated
   records. Resolve PDS via the authenticated session/DID, not bsky.social hardcoding.
3. Bind the authenticated identity to the player's seat server-side using proven
   seat ownership. A room code or client-supplied DID/result is insufficient.
   Prevent seat takeover and cross-account writes.
4. Present an accessible public-record disclosure and save preference. After the
   player explicitly enables saving, completed matches should save automatically
   to that player's own repository; never write to the opponent's repository.
   Guest play remains available, with an honest not-saved-to-PDS status.
5. Construct the record from the authoritative completed match. Do not publish
   reconnect tokens, operator database keys or raw logs. Use idempotent per-player
   record keys, duplicate-safe retry and a verified result/source boundary.
6. Return the AT URI and CID, then read back the record from the player's PDS.
   Show Saved only after confirmed write/readback, Pending on retry and Failed
   with an accessible retry/recovery path. A failed save must not block gameplay.
7. List/retrieve a player's owned records, support portable export and deletion
   through the player's authorized session. Document that public network copies
   may survive deletion from the source repository.
8. Define operational retention and cache minimization once PDS saving works.
   Firestore may serve live state/limited operational caches; it must not remain
   the only durable player record under a misleading PDS ownership label.
   Do not delete or migrate existing records without a separately reviewed plan.

## Acceptance evidence before production claims
- Two test accounts complete a match and each enabled account gets its own record,
  matching the authoritative result and correct PDS/collection.
- Repeated save/retry yields no duplicate record; no opponent writes.
- Guest/declined saves produce no PDS record; missing/revoked scope is handled.
- Forged DID, stolen room code, incorrect seat token, unfinished match and cross-
  origin write attempts are rejected.
- Outage/session expiry does not break the match; recovery and status are accurate.
- Public record fields are checked for secrets/private/opponent-identifying data.
- Readback, listing/export and authorized deletion are demonstrated.
- Screen-reader save disclosure, status and recovery are tested in the serving
  production revision after code review and owner release approval.
- Record dated evidence; do not mark implemented from this document or a mock test.

## Smallest next development slice
A separate code PR should add the sanitized record schema, collection-specific
OAuth flow, server-side identity/seat binding, save/readback endpoint and accessible
post-match control. Then exercise write/readback using designated test accounts
before inviting production testers to validate saving. The October 5 exception waived the #67/#68/#71 merge prerequisite only;
human rules/accessibility evidence remains pending. This document does not
authorize production deployment.

## Primary references
- Public repositories/PDS resolution: https://atproto.com/specs/repository
- Collection permission selection: https://atproto.com/guides/scope-builder
- OAuth/session patterns: https://atproto.com/guides/oauth-patterns
