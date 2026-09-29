#!/usr/bin/env node
// Run against a tagged revision with gated code or an isolated staging service.
// No Gemini key is needed on the client: the target holds its model and key.
const cases = [
  ['Rules', 'What are the DUET rules?', 'rules'],
  ['Controls', 'How do I use the controls?', 'controls'],
  ['Accessibility', 'Does this work with NVDA?', 'accessibility'],
  ['Gameplay', 'How do I make a legal move?', 'gameplay'],
  ['Radius of Ruin', 'What is Radius of Ruin?', 'rules'],
  ['Sanctuary', 'How does Sanctuary work?', 'rules'],
  ['Rebirth and Death', 'How does Rebirth move?', 'rules'],
  ['Fog Mode', 'What is Fog Mode?', 'rules']
];

async function main() {
  const base = process.env.PIXIE_BASE_URL;
  if (!base) throw new Error('Set PIXIE_BASE_URL to a gated tagged or isolated staging URL.');
  const url = new URL('/api/agent', base);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('Use an HTTPS staging URL (or localhost).');
  }
  const productionRunAppUrl = /^duet-solo-hackathon-\d+\.us-central1\.run\.app$/.test(url.hostname) ||
    /^duet-solo-hackathon-[a-z0-9-]+-uc\.a\.run\.app$/.test(url.hostname);
  if (url.hostname === 'duet.loptrlab.com' || productionRunAppUrl) {
    throw new Error('Do not test the ordinary production endpoint. Use a gated tagged revision or isolated staging URL.');
  }

  console.log(`UTC: ${new Date().toISOString()}`);
  console.log(`Model recorded by operator: ${process.env.PIXIE_MODEL_NAME || '(enter from Cloud Run configuration)'}`);
  console.log(`Endpoint: ${url.origin}`);
  let failed = false;
  for (const [name, message, expectedIntent] of cases) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      const length = typeof data.reply === 'string' ? [...data.reply].length : -1;
      const fallback = typeof data.reply === 'string' &&
        /temporarily unavailable|could not answer|API key not configured/i.test(data.reply);
      const pass = response.ok && data.intent === expectedIntent && length > 0 && length <= 500 && !fallback;
      if (!pass) failed = true;
      console.log(`\n${pass ? 'PASS' : 'FAIL'} ${name}: HTTP ${response.status}, intent ${JSON.stringify(data.intent)} (expected ${expectedIntent}), ${length} characters${fallback ? ', canned fallback' : ''}`);
      console.log(`Reply: ${JSON.stringify(data.reply)}`);
    } catch (error) {
      failed = true;
      console.log(`\nFAIL ${name}: ${error.message}`);
    }
  }
  console.log('\nRead each answer against docs/PIXIE_LIVE_CHECK.md; PASS above checks shape only.');
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
