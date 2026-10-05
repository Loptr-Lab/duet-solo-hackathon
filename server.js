const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { createFirestoreRoomStore } = require('./roomStore.js');
const { createGameNamespace } = require('./gameNamespace.js');
const { createPlayerStorage } = require('./services/storage.js');
const { createAtprotoAuth } = require('./services/atprotoAuth.js');
const { scopedQuestion, gameReply, OFF_TOPIC } = require('./agentScope.js');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '16kb';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.post('/api/agent', (req, res) => {
  const topic = scopedQuestion(req.body?.message);
  return res.status(200).json(topic ? gameReply(topic) : OFF_TOPIC);
});

const httpServer = http.createServer(app);
const io = new Server(httpServer);
const roomStore = createFirestoreRoomStore();
const playerStorage = createPlayerStorage();

if (roomStore && typeof roomStore.verifyAccess === 'function') {
  Promise.resolve(roomStore.verifyAccess()).catch((err) => {
    console.error('⚠️ [roomStore] Non-fatal verification check failure:', err?.message || err);
  });
}

async function startServer() {
  if (roomStore.db && process.env.ATPROTO_BASE_URL && process.env.ATPROTO_OAUTH_PRIVATE_KEY) {
    try {
      const atprotoAuth = await createAtprotoAuth({ db: roomStore.db });
      atprotoAuth.routes(app);
      console.log('AT Protocol OAuth BFF enabled.');
    } catch (err) {
      console.error('⚠️ AT Protocol OAuth initialization failed:', err.message);
      console.error('The game server will continue without OAuth until configuration is corrected.');
    }
  } else {
    console.log('AT Protocol OAuth is not configured; gameplay remains available.');
  }

  createGameNamespace(io, roomStore, playerStorage);
  httpServer.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

