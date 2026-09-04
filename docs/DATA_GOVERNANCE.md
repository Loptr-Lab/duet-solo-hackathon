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

## AI boundary

Messages sent to `/api/agent` are transmitted to the configured Gemini service. Do not
invite users to submit sensitive information. Core gameplay must remain usable when Gemini
is disabled or unavailable.
