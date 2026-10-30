'use strict';

function boundedInteger(value, fallback, maximum, name) {
    if (value === undefined) return fallback;
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
        throw new Error(`${name} must be an integer between 1 and ${maximum}`);
    }
    return number;
}

// The namespace owns the sole memory cache. This adapter intentionally retains
// no second copy and cannot restore anything after process loss or expiration.
function createDemoRuntime(env = {}) {
    return {
        roomStore: {
            async saveRoom() {},
            async loadRoom() { return null; },
            async deleteRoom() {},
        },
        options: {
            maxRooms: boundedInteger(env.DUET_DEMO_MAX_ROOMS, 10, 100, 'DUET_DEMO_MAX_ROOMS'),
            idleMs: boundedInteger(env.DUET_DEMO_IDLE_MINUTES, 30, 120, 'DUET_DEMO_IDLE_MINUTES') * 60000,
            postResults: false,
        },
    };
}

module.exports = { createDemoRuntime };
