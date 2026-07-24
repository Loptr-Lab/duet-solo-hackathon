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
