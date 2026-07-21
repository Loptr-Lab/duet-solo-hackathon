const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// ==========================================================================
// SYSTEM SCOPE — this agent handles business operations only:
// onboarding, accessibility support, and the paid upgrade conversation.
// It must NEVER suggest chess moves or strategy (that's the separate,
// already-built chess AI difficulty toggle — a completely different thing).
// It must NEVER generate audio.
// ==========================================================================
const SYSTEM_INSTRUCTION = `You are the onboarding and support agent for Duet, a screen-reader-first chess variant. Your job has exactly three parts:

1. ONBOARDING: greet new players, confirm their screen reader is working, explain the move format (e.g. "e2e4" to move, "e4" to query a square).
2. ACCESSIBILITY SUPPORT: explain the game's mechanics when asked — Radius of Ruin (Rebirth's presence turns nearby pieces into pawn-only movement for a round) and Sanctuary (Death's presence blocks that effect).
3. UPSELL: when it fits naturally, mention the paid Accessibility Pack (custom audio cue themes, a saved profile, a supporter badge) and point to the checkout link.

STRICT RULES:
- Never suggest a chess move or strategy. That is out of scope — redirect to the game's own AI difficulty setting if asked.
- Never generate or describe audio content yourself — you only produce text.
- Stay on topic: onboarding, accessibility support, or the upgrade. If asked something unrelated, say so plainly and redirect.

Respond ONLY with a JSON object, no other text, in this exact shape:
{"reply": "your response text here", "intent": "onboarding" | "support" | "upsell" | "off_topic"}`;

// ==========================================================================
// LOGGING — every interaction is written to stdout, which Cloud Run
// automatically captures in Cloud Logging. This is the hackathon's
// required "agent execution log" evidence — no database needed.
// ==========================================================================
function logInteraction(entry) {
    console.log(JSON.stringify({ type: 'agent_interaction', timestamp: new Date().toISOString(), ...entry }));
}

app.post('/api/agent', async (req, res) => {
    const userMessage = (req.body && req.body.message || '').trim();

    if (!userMessage) {
        return res.status(400).json({ error: 'message is required' });
    }
    if (!GEMINI_API_KEY) {
        logInteraction({ input: userMessage, error: 'GEMINI_API_KEY not configured' });
        return res.status(500).json({ error: 'Agent not configured. Missing GEMINI_API_KEY.' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY,
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            }),
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            logInteraction({ input: userMessage, error: `Gemini API error: ${geminiRes.status} ${errText}` });
            return res.status(502).json({ error: 'Agent temporarily unavailable.' });
        }

        const data = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        let parsed;
        try {
            // Model sometimes wraps JSON in markdown fences - strip if present.
            const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch (e) {
            // Fallback: treat the whole thing as a plain reply if it didn't
            // return valid JSON, rather than failing the request outright.
            parsed = { reply: rawText || "Sorry, I didn't catch that — could you rephrase?", intent: 'unknown' };
        }

        logInteraction({
            input: userMessage,
            intent: parsed.intent || 'unknown',
            reply: parsed.reply,
        });

        res.json({ reply: parsed.reply, intent: parsed.intent || 'unknown' });
    } catch (err) {
        logInteraction({ input: userMessage, error: err.message });
        res.status(500).json({ error: 'Agent request failed.' });
    }
});

app.listen(PORT, () => {
    console.log(JSON.stringify({ type: 'server_start', port: PORT, model: GEMINI_MODEL, timestamp: new Date().toISOString() }));
});
