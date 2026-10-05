const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { scopedQuestion, gameReply, OFF_TOPIC } = require('../agentScope.js');

test('isolated sandbox serves fixed help, neutral fallback, and continuity routes', { timeout: 15000 }, async () => {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['scripts/start-pixie-sandbox.js'], {
    cwd: path.join(__dirname, '..'),
    env: { PATH: process.env.PATH, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', chunk => {
        output += chunk;
        if (output.includes('Server listening')) resolve();
      });
      child.stderr.on('data', chunk => { output += chunk; });
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`sandbox exited ${code}: ${output}`)));
    });
    assert.match(output, /volatile rooms; no Firestore, OAuth or posting/);
    const base = `http://127.0.0.1:${port}`;
    assert.equal(await (await fetch(base + '/healthz')).text(), 'ok');
    for (const message of ['What are the DUET rules?', 'How do I use the controls?',
      'Does this work with NVDA?', 'How do I make a legal move?', 'What is Radius of Ruin?',
      'How does Sanctuary work?', 'How does Rebirth move?', 'What is Fog Mode?',
      'hello', 'How do I move the queen? Also I feel unsafe', 'x'.repeat(2001)]) {
      const response = await fetch(base + '/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      assert.equal(response.status, 200);
      const topic = scopedQuestion(message);
      assert.deepEqual(await response.json(), topic ? gameReply(topic) : OFF_TOPIC);
    }
    const home = await (await fetch(base + '/')).text();
    assert.match(home, /PIXIE REVIEW CANDIDATE/);
    assert.match(home, /https:\/\/ibloud.github.io\/pixie-creator-os\//);
    assert.match(home, /Discover PIXIE worlds/);
    const support = await fetch(base + '/outside-support.html');
    assert.equal(support.status, 200);
    assert.match(await support.text(), /Outside Support/);
  } finally {
    if (child.exitCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve));
      child.kill();
      await stopped;
    }
  }
});
