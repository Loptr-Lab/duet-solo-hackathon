# Data Governance

Duet can store match telemetry and player profiles when Firestore is configured. A fan fork
operator becomes responsible for that deployment's data; Loptr Lab does not operate or
endorse third-party forks.

## Data currently handled

- room identifiers and reconnect tokens
- move history, timing, evaluation values, and match outcomes
- deck selection, aggregate play statistics, archetype tags, and optional future DIDs
- game-help questions sent to DUET's server for fixed-answer selection; the route does not persist their text
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
7. never log API keys, reconnect tokens, game-help question text, or Firestore credentials;
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

## PIXIE game-help boundary

`/api/agent` receives a question on the DUET server and applies a deterministic
game scope gate. In-scope questions select one of eight fixed, reviewed answers;
off-topic and mixed messages receive the same Outside Support card. The server
does not call a model or third-party help provider, persist question text, or
write a per-user help event. The gate does not detect distress or establish a
crisis protocol. A neutral Outside Support page is also available directly.
Do not invite players to submit sensitive information. Review Cloud Run request
logging separately before deployment.
