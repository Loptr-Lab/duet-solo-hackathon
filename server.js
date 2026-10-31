const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const demoMode = process.env.DUET_STORAGE_MODE === 'memory-demo';
if (process.env.DUET_STORAGE_MODE && !['memory-demo', 'firestore'].includes(process.env.DUET_STORAGE_MODE)) {
  throw new Error('DUET_STORAGE_MODE must be firestore or memory-demo');
}
const { createGameNamespace } = require('./gameNamespace.js');
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

if (demoMode) {
  const html = require('./demoPage.js').renderDemoPage(
    require('fs').readFileSync(path.join(__dirname, 'public/index.html'), 'utf8')
  );
  app.get(['/', '/index.html'], (_req, res) => res.type('html').send(html));
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/runtime', (_req, res) => {
  const source = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.DUET_SOURCE_SHA || '';
  res.setHeader('Cache-Control', 'no-store');
  res.json({ mode: demoMode ? 'memory-demo' : 'firestore', sourceSha: /^[a-f0-9]{40}$/i.test(source) ? source : null });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.post('/api/agent', (req, res) => {
  const topic = scopedQuestion(req.body?.message);
  return res.status(200).json(topic ? gameReply(topic) : OFF_TOPIC);
});

const httpServer = http.createServer(app);
const io = new Server(httpServer);
const { createDemoRuntime } = require('./demoRuntime.js');
const demo = demoMode ? createDemoRuntime(process.env) : null;
const roomStore = demo ? demo.roomStore : require('./roomStore.js').createFirestoreRoomStore();
const playerStorage = demo ? null : require('./services/storage.js').createPlayerStorage();

if (roomStore && typeof roomStore.verifyAccess === 'function') {
  Promise.resolve(roomStore.verifyAccess()).catch((err) => {
    console.error('⚠️ [roomStore] Non-fatal verification check failure:', err?.message || err);
  });
}

async function startServer() {
  if (roomStore.db && process.env.ATPROTO_BASE_URL && process.env.ATPROTO_OAUTH_PRIVATE_KEY) {
    try {
      const atprotoAuth = await require('./services/atprotoAuth.js').createAtprotoAuth({ db: roomStore.db });
      atprotoAuth.routes(app);
      console.log('AT Protocol OAuth BFF enabled.');
    } catch (err) {
      console.error('⚠️ AT Protocol OAuth initialization failed:', err.message);
      console.error('The game server will continue without OAuth until configuration is corrected.');
    }
  } else {
    console.log('AT Protocol OAuth is not configured; gameplay remains available.');
  }

  createGameNamespace(io, roomStore, playerStorage, demo ? demo.options : undefined);
  if (demo) console.log('Memory demo: one process only; matches expire or disappear on restart. No cloud storage or posting.');
  httpServer.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${httpServer.address().port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

