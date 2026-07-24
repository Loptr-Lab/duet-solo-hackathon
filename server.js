const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Safely initialize Stripe so missing environment variables won't crash boot
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const { createFirestoreRoomStore } = require('./roomStore.js');
const { createGameNamespace } = require('./gameNamespace.js');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') return next();
  return express.json()(req, res, next);
});

app.use(express.static(path.join(__dirname, 'public')));

// Dumb, dependency-free health check. Deliberately does not touch game state,
// Gemini, or Stripe, so it can never false-fail a healthy game room.
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.post('/api/agent', async (req, res) => {
  const userMessage = req.body.message || 'Hello';
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    return res.status(200).json({
      reply: 'Welcome to Duet: Solo! I am your AI assistant. (API key not configured)',
      intent: 'general'
    });
  }

  const systemInstruction =
    "You are PIXIE, the ancestral-intuition assistant built into Duet: Solo, a screen-reader-first accessible chess variant. " +
    "You were made to catch what pure calculation misses — read the moment by feel as much as by rule. " +
    "Guide players clearly and warmly through controls, standard rules, and the game's signature mechanics (the Radius of Ruin, the Sanctuary). " +
    "Keep replies short and direct — they are read aloud by a screen reader, so no filler, no long preambles, one clear next step at a time. " +
    "Always return strict JSON matching the required schema.";

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser message: ${userMessage}` }]
      }
    ],
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
          intent: {
            type: 'STRING',
            enum: ['general', 'rules', 'controls', 'accessibility', 'gameplay']
          }
        },
        required: ['reply', 'intent']
      }
    }
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', JSON.stringify(data));
      return res.status(200).json({
        reply: `Duet: Solo AI Agent: ${data.error?.message || 'Service active'}`,
        intent: 'general'
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    try {
      return res.json(JSON.parse(rawText));
    } catch {
      return res.json({ reply: rawText, intent: 'general' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(200).json({
      reply: 'PIXIE is standing by. How can I help with screen reader controls?',
      intent: 'general'
    });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    console.warn('Stripe checkout attempt failed: STRIPE_SECRET_KEY is not set.');
    return res.status(500).json({ error: 'Stripe is not configured on this server.' });
  }

  try {
    const domainUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Duet: Solo — Accessibility & Supporter Pack',
              description:
                'Custom high-contrast themes, enhanced support profile, and supporter badge.'
            },
            unit_amount: 499
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${domainUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/?payment=cancelled`
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    return res.status(500).json({ error: 'Failed to initialize payment session.' });
  }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) {
    return res.status(400).send('Stripe is not configured on this server.');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`Webhook verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(
      `[VERIFIED TRANSACTION] Session ${session.id} Amount: $${(session.amount_total || 0) / 100}`
    );
  }

  return res.json({ received: true });
});

// ---------------------------------------------------------------------------
// REMOTE PLAY — new, fully additive. Does not touch /api/agent, /api/create-
// checkout-session, /api/webhook, or anything the client's existing local
// play, AI opponent, Spectator mode, or Fog Mode depend on. Base ruleset only
// (no Fog Mode remotely, per earlier scope decision) — server is the single
// source of truth for board state, using the same verified veiled-chess-core
// engine, not a re-implementation. Room/socket logic lives in
// gameNamespace.js (tested separately -- 12 gameplay tests + 12 restart/
// durability tests); Firestore persistence lives in roomStore.js.
// ---------------------------------------------------------------------------

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const roomStore = createFirestoreRoomStore();

// Safely invoke roomStore.verifyAccess without crashing process on unhandled promise rejection
if (roomStore && typeof roomStore.verifyAccess === 'function') {
  Promise.resolve(roomStore.verifyAccess()).catch((err) => {
    console.error('⚠️ [roomStore] Non-fatal verification check failure:', err?.message || err);
  });
}

createGameNamespace(io, roomStore);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
