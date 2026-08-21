/**
 * AT Proto (Bluesky) event posting — additive only. Posts a short note to
 * the-rift when a real remote Duet match finishes. Never touches game
 * state, never blocks a move's ack/emit, and any failure here is caught and
 * logged, not thrown -- same "additive feature, failures are non-fatal"
 * pattern as roomStore.persist() and the client's TipJar/SpeechInput.
 *
 * Credentials come from Cloud Run env vars only:
 *   BLUESKY_HANDLE        e.g. the-rift.bsky.social
 *   BLUESKY_APP_PASSWORD  an app password (NOT the account password),
 *                         generated at bsky.app -> Settings -> Privacy and
 *                         Security -> App Passwords. Rotate immediately if
 *                         it is ever exposed (pasted into a terminal,
 *                         committed, printed to a log, etc).
 *
 * A session is created fresh per post rather than cached/refreshed. Match
 * completions are infrequent, so the extra createSession call per post is
 * cheap, and it avoids handling access-token expiry/refresh for a feature
 * where "occasionally skip a post" is an acceptable failure mode and
 * "silently post with a stale token" is not.
 */

const BSKY_SERVICE = 'https://bsky.social';

async function createSession() {
    const handle = process.env.BLUESKY_HANDLE;
    const appPassword = process.env.BLUESKY_APP_PASSWORD;
    if (!handle || !appPassword) {
        throw new Error('BLUESKY_HANDLE / BLUESKY_APP_PASSWORD not configured.');
    }

    const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.server.createSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password: appPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error((data && data.message) || `createSession failed (${res.status})`);
    }
    return data; // { did, accessJwt, ... }
}

async function createPost(session, text) {
    const res = await fetch(`${BSKY_SERVICE}/xrpc/com.atproto.repo.createRecord`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessJwt}`,
        },
        body: JSON.stringify({
            repo: session.did,
            collection: 'app.bsky.feed.post',
            record: {
                '$type': 'app.bsky.feed.post',
                text,
                createdAt: new Date().toISOString(),
            },
        }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error((data && data.message) || `createRecord failed (${res.status})`);
    }
    return data; // { uri, cid }
}

/**
 * Fire-and-forget: call this and move on. It is intentionally not awaited
 * by callers -- a slow or failed post to Bluesky should never delay or
 * break the actual game response to players. Errors are caught internally
 * and logged; there is no retry.
 */
function postMatchResult({ winner }) {
    const winnerName = winner === 'w' ? 'White' : 'Black';
    const siteUrl = process.env.PUBLIC_URL || 'duet.loptrlab.com';
    const text = `A Duet match just ended — ${winnerName} takes it on Rebirth control. ${siteUrl}`;

    createSession()
        .then((session) => createPost(session, text))
        .then((post) => {
            console.log('[atprotoPoster] Posted match result:', post.uri);
        })
        .catch((err) => {
            console.error('[atprotoPoster] Failed to post match result:', err.message);
        });
}

module.exports = { postMatchResult };
