// Synthetic only. Never imported by services/ or server.js; no production selector.
function syntheticWeaverStore() {
  const data = new Map(); let chain = Promise.resolve();
  const copy = value => value === undefined ? null : structuredClone(value);
  const store = {
    contractVersion: 1, available: true, testOnly: true,
    data, writes: 0, fail: false, failCommit: false, failCreate: false,
    async getInvitation(did) { if (store.fail) throw Error('synthetic storage outage'); return copy(data.get(`invitation:${did}`)); },
    async getReceipt(key) { if (store.fail) throw Error('synthetic storage outage'); return copy(data.get(`receipt:${key}`)); },
    transaction(operation) {
      const run = chain.then(async () => {
        if (store.fail) throw Error('synthetic storage outage');
        const snapshot = structuredClone(data); let writes = 0;
        const result = await operation({
          getInvitation: async did => copy(snapshot.get(`invitation:${did}`)),
          getReceipt: async key => copy(snapshot.get(`receipt:${key}`)),
          createReceipt: async (key, record) => {
            if (store.failCreate) throw Error('synthetic asynchronous write failure');
            if (snapshot.has(`receipt:${key}`)) throw Error('immutable receipt already exists');
            snapshot.set(`receipt:${key}`, structuredClone(record)); writes++;
          },
        });
        if (store.fail || store.failCommit) throw Error('synthetic commit failure');
        data.clear();for (const [key,value] of snapshot) data.set(key,value);
        store.writes += writes;
        return result; // Never return before the simulated commit.
      }); chain = run.catch(() => {}); return run;
    },
  };
  return store;
}
module.exports = { syntheticWeaverStore };
