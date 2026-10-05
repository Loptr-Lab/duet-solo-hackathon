// Review-only runtime: volatile rooms, no cloud storage, OAuth or public posting.
// Install these boundaries before server.js loads its dependencies.
const path = require('node:path');
const root = path.join(__dirname, '..');
function substitute(file, exports) {
  const filename = require.resolve(path.join(root, file));
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}
const rooms = new Map();
substitute('roomStore.js', {
  createFirestoreRoomStore: () => ({
    db: null,
    async saveRoom(id, state) { rooms.set(id, structuredClone(state)); },
    async loadRoom(id) { return rooms.has(id) ? structuredClone(rooms.get(id)) : null; },
    async deleteRoom(id) { rooms.delete(id); }
  })
});
substitute('services/storage.js', { createPlayerStorage: () => null });
substitute('services/atprotoAuth.js', {
  createAtprotoAuth: async () => { throw new Error('OAuth is disabled in the review sandbox.'); }
});
substitute('atprotoPoster.js', {
  postMatchResult() {},
  postMilestone: async () => { throw new Error('Posting is disabled in the review sandbox.'); }
});
console.log('PIXIE REVIEW SANDBOX: volatile rooms; no Firestore, OAuth or posting.');
require(path.join(root, 'server.js'));
