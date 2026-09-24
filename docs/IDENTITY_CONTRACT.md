# DUET Identity Contract

**Status:** M1 working contract

## Principle
DUET identifies a player independently from the mechanism used to authenticate that player.

Conceptual representation:

    {
      "platform": "xbox",
      "platformUserId": "...",
      "duetPlayerId": "...",
      "displayName": "...",
      "identityProvider": "xbox"
    }

Web/AT Protocol is another implementation of the same concept.

## Invariants
1. duetPlayerId is the DUET-level identity consumed by game systems.
2. platformUserId is implementation-specific and must not become the game identity.
3. identityProvider describes how identity was established.
4. The game protocol must not require a specific provider.
5. Cross-network identity and safety/privacy requirements remain platform/submission concerns.

## Current implementation
The existing web client keeps its current authentication/session mechanisms. M1 documents the abstraction; it does not replace web identity yet.

## Security
A display name is not proof of identity. Current seat ownership relies on a server-issued reconnect token. Future authenticated identity must not weaken that invariant.
