const test = require('node:test');
const assert = require('node:assert/strict');

const { createGameNamespace, feedbackPromptFor, normalizeFeedback } = require('./gameNamespace.js');

test('feedback prompt is deterministic and contract-approved', () => {
    const first = feedbackPromptFor('a0000000-0000-4000-8000-000000000000');
    const second = feedbackPromptFor('a0000000-0000-4000-8000-000000000000');
    assert.deepEqual(first, second);
    assert.match(first.id, /^(veil-predictable|pace-comfortable|ending-clear)$/);
});

test('normalizes an anonymous feedback record without identity fields', () => {
    const result = normalizeFeedback({
        consent: true,
        rating: '5',
        questionId: 'ending-clear',
        answer: 'yes',
        kind: 'note',
        comment: ' Clear ending. ',
        reconnectToken: 'must-not-survive',
    }, 'ending-clear', 'a0000000-0000-4000-8000-000000000000');

    assert.equal(result.error, undefined);
    assert.equal(result.value.rating, 5);
    assert.equal(result.value.comment, 'Clear ending.');
    assert.equal(result.value.reconnectToken, undefined);
    assert.deepEqual(Object.keys(result.value).sort(), [
        'anonymousMatchId', 'answer', 'comment', 'kind', 'questionId',
        'rating', 'schemaVersion', 'submittedAt',
    ]);
});

test('rejects missing consent, wrong prompts, empty responses, and long comments', () => {
    const base = {
        consent: true,
        rating: 4,
        questionId: 'veil-predictable',
        answer: 'mostly',
        kind: 'none',
        comment: '',
    };
    const id = 'a0000000-0000-4000-8000-000000000000';

    assert.match(normalizeFeedback({ ...base, consent: false }, base.questionId, id).error, /Consent/);
    assert.match(normalizeFeedback(base, 'ending-clear', id).error, /invalid/);
    assert.match(normalizeFeedback({ ...base, rating: null, answer: 'skipped' }, base.questionId, id).error, /Choose/);
    assert.match(normalizeFeedback({ ...base, comment: 'x'.repeat(601) }, base.questionId, id).error, /600/);
});

test('accepts feedback only once from a participant in a completed game', async () => {
    const handlers = {};
    const socket = {
        id: 'socket-white',
        data: {},
        join() {},
        on(event, handler) { handlers[event] = handler; },
    };
    const io = {
        on(event, handler) { if (event === 'connection') handler(socket); },
        to() { return { emit() {} }; },
    };
    const roomStore = {
        async saveRoom() {},
        async loadRoom() { return null; },
    };
    const saved = [];
    const playerStorage = {
        async saveAnonymousFeedback(value) { saved.push(value); },
    };
    const namespace = createGameNamespace(io, roomStore, playerStorage);

    let createResult;
    await handlers.create_room({}, (result) => { createResult = result; });
    const room = namespace.rooms[createResult.roomId];
    room.gameOver = true;
    room.winner = 'w';
    const prompt = feedbackPromptFor(room.anonymousMatchId);
    const payload = {
        consent: true,
        rating: 5,
        questionId: prompt.id,
        answer: 'yes',
        kind: 'none',
        comment: '',
    };

    let firstResult;
    await handlers.submit_feedback(payload, (result) => { firstResult = result; });
    assert.equal(firstResult.ok, true);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].anonymousMatchId, room.anonymousMatchId);
    assert.equal(saved[0].roomId, undefined);

    let duplicateResult;
    await handlers.submit_feedback(payload, (result) => { duplicateResult = result; });
    assert.equal(duplicateResult.ok, false);
    assert.match(duplicateResult.reason, /already submitted/);
    assert.equal(saved.length, 1);
});
