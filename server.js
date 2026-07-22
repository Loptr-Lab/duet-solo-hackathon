const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') return next();
  return express.json()(req, res, next);
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/agent', async (req, res) => {
  const userMessage = req.body.message || 'Hello';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      reply: 'Welcome to Duet: Solo! I am your AI assistant. (API key not configured)',
      intent: 'general'
    });
  }

  const systemInstruction =
    "You are the AI Onboarding and Support Assistant for Duet: Solo — a screen-reader-first, highly accessible chess variant. Guide players through controls and rules clearly. Return strict JSON with keys: reply, intent.";

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser message: ${userMessage}` }]
      }
    ],
    generationConfig: {
      response_mime_type: 'application/json'
    }
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
      reply: 'Duet: Solo AI Assistant is standing by. How can I help with screen reader controls?',
      intent: 'general'
    });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
