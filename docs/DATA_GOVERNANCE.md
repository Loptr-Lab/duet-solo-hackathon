# Data Governance

Duet can store match telemetry and player profiles when Firestore is configured. A fan fork
operator becomes responsible for that deployment's data; Loptr Lab does not operate or
endorse third-party forks.

## Data currently handled

- room identifiers and reconnect tokens
- move history, timing, evaluation values, and match outcomes
- deck selection, aggregate play statistics, archetype tags, and optional future DIDs
- messages sent to the Gemini support endpoint
- optional Bluesky match-result posts
- optional anonymous post-game ratings, structured answers, notes, and bug reports

Reconnect tokens are credentials for returning to a room. Treat them as secrets even though
they are not account passwords.

## Required deployment controls

Before enabling persistent public play, a fork operator must:

1. publish a plain-language privacy notice identifying the operator;
2. document purpose, fields collected, retention period, and deletion contact;
3. configure Firestore access with least privilege and deny public client writes;
4. configure TTL/deletion for abandoned rooms, raw match logs, and inactive profiles;
5. avoid collecting names, email addresses, disability information, or research-participant
   records unless a separate reviewed process explicitly requires them;
6. use synthetic data and throwaway accounts in development;
7. never log API keys, reconnect tokens, full Gemini prompts, or Firestore credentials;
8. obtain appropriate consent before public posting or research use.

Suggested starting maximums are 24 hours for abandoned rooms and 30 days for raw match logs.
Profile retention requires an operator-defined purpose and deletion path. These are project
defaults, not a substitute for checking laws applicable to the operator and players.

Anonymous completed-game summaries use `anonymousCompletedGames`; optional responses use
`anonymousGameFeedback`. Both include an `expiresAt` timestamp 30 days after creation. Before
public deployment, enable a Firestore TTL policy on the `expiresAt` field in both collections.
These records deliberately exclude room codes, reconnect tokens, socket identifiers, DIDs,
handles, email addresses, and network addresses. Only a socket occupying a seat in the
completed match may submit, once per seat.

## AI boundary

Messages sent to `/api/agent` are transmitted to the configured Gemini service. Do not
invite users to submit sensitive information. Core gameplay must remain usable when Gemini
is disabled or unavailable.

## AT Proto identity and storage destinations

AT Proto OAuth sign-in is not per-player PDS game storage. The current source
uses Firestore for rooms, match logs, OAuth/session state and verified profiles.
Match logs initialize player DIDs to null; the gameplay reconnect token is not
bound to the OAuth identity. No per-player game-record write/read path exists.

`atprotoPoster.js` can create an `app.bsky.feed.post` containing a short result
through the project account configured by the operator. It does not archive
moves in each player's repository. Live posting and persistence require runtime
evidence. Anonymous summaries/feedback exclude identifiers by design; legacy
room/match logs contain identifiers and reconnect tokens and must be governed
separately. An `expiresAt` field alone does not prove deletion.

See [public production playtest instructions](PRODUCTION_PLAYTEST.md) for the
release card, player data notice, optional sign-in case and operator checks.
