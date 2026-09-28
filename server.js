const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { createFirestoreRoomStore } = require('./roomStore.js');
const { createGameNamespace } = require('./gameNamespace.js');
const { createPlayerStorage } = require('./services/storage.js');
const { createAtprotoAuth } = require('./services/atprotoAuth.js');
const { scopedQuestion, validGameReply, OFF_TOPIC } = require('./agentScope.js');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '16kb';
const AI_RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000;
const AI_RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX) || 30;
const aiRateBuckets = new Map();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

function limitAiRequests(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket?.remoteAddress || 'unknown';

  for (const [bucketKey, bucket] of aiRateBuckets) {
    if (bucket.resetAt <= now) aiRateBuckets.delete(bucketKey);
  }

  const bucket = aiRateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    aiRateBuckets.set(key, { count: 1, resetAt: now + AI_RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (bucket.count >= AI_RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json({
      reply: 'The assistant has reached its temporary request limit. Please try again later.',
      intent: 'general'
    });
  }

  bucket.count += 1;
  return next();
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.post('/api/agent', limitAiRequests, async (req, res) => {
  const submittedMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (submittedMessage.length > 2000) {
    return res.status(400).json({
      reply: 'Please shorten the message to 2,000 characters or fewer.',
      intent: 'general'
    });
  }
  const scoped = scopedQuestion(submittedMessage);
  if (!scoped) return res.status(200).json(OFF_TOPIC);
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey) {
    return res.status(200).json({
      reply: 'PIXIE game help is temporarily unavailable. DUET controls and rules remain available on this page.',
      intent: scoped.intent
    });
  }
  if (!model || !/^[a-zA-Z0-9._-]+$/.test(model)) {
    return res.status(503).json({ reply: 'PIXIE game help is temporarily unavailable. DUET controls and rules remain available on this page.', intent: scoped.intent });
  }

  const systemInstruction =
    "You are PIXIE, the ancestral-intuition assistant built into Duet: Solo, a screen-reader-first accessible chess variant. " +
    "You were made to catch what pure calculation misses — read the moment by feel as much as by rule. " +
    "Guide players clearly and warmly through controls, standard rules, and the game's signature mechanics (the Radius of Ruin, the Sanctuary). " +
    "Answer only the provided DUET game question. Do not discuss personal topics or unrelated subjects. " +
    "Keep replies short and direct — they are read aloud by a screen reader, so no filler, no long preambles, one clear next step at a time. " +
    `Set intent to ${scoped.intent}. ` +
    "Always return strict JSON matching the required schema.";

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nDUET question: ${scoped.question}` }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 200,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          reply: { type: 'STRING' },
          intent: { type: 'STRING', enum: ['rules', 'controls', 'accessibility', 'gameplay'] }
        },
        required: ['reply', 'intent']
      }
    }
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }
    );
    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('Gemini API request failed with status:', geminiRes.status);
      return res.status(502).json({ reply: 'The assistant is temporarily unavailable. Core game controls still work.', intent: scoped.intent });
    }
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    try {
      const parsed = JSON.parse(rawText);
      if (!validGameReply(parsed, scoped.intent)) throw new Error('Invalid game reply');
      return res.json({ reply: parsed.reply.trim(), intent: scoped.intent });
    } catch {
      return res.json({ reply: 'PIXIE could not answer that game question. DUET controls and rules remain available on this page.', intent: scoped.intent });
    }
  } catch (err) {
    console.error('Gemini request failed:', err?.name || 'error');
    return res.status(200).json({ reply: 'PIXIE game help is temporarily unavailable. DUET controls and rules remain available on this page.', intent: scoped.intent });
  }
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
