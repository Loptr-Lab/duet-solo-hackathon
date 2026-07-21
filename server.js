const express = require('express');
const path = require('path');
const storage = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function logInteraction(payload) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'agent_interaction',
        ...payload
    }));
}

app.get('/api/profile', (req, res) => {
    try {
        const profile = storage.getProfile();
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});

app.post('/api/profile', (req, res) => {
    try {
        const updated = storage.updateProfile(req.body);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.post('/api/agent', async (req, res) => {
    const userMessage = req.body.message || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        logInteraction({ error: 'GEMINI_API_KEY environment variable is missing.' });
        return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
    }

    const systemInstruction = `You are the AI Onboarding and Support Assistant for Duet: Solo — a screen-reader-first, highly accessible chess variant. 
Your goal is to guide players through screen-reader controls, game rules, and accessibility pack settings. 
Be concise, encouraging, and informative. Always respond in valid JSON format with keys "reply" and "intent".`;

    const requestBody = {
        system_instruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ],
        generationConfig: {
            response_mime_type: 'application/json'
        }
    };

    try {
        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            logInteraction({ input: userMessage, error: `Gemini API error: ${geminiRes.status} ${errText}` });
            return res.status(502).json({ error: 'Agent temporarily unavailable.' });
        }

        const data = await geminiRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        let parsedReply;
        try {
            parsedReply = JSON.parse(rawText);
        } catch (e) {
            parsedReply = { reply: rawText, intent: 'general' };
        }

        logInteraction({
            input: userMessage,
            reply: parsedReply.reply,
            intent: parsedReply.intent || 'general'
        });

        return res.json(parsedReply);

    } catch (err) {
        logInteraction({ input: userMessage, error: err.message });
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(JSON.stringify({
        type: 'server_start',
        port: PORT,
        model: 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
    }));
});
