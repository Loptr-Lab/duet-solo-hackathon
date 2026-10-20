"""Build a server-free local-play surface without editing the Cloud Run sources."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
s=(root/'public/index.html').read_text()
css='\n'.join(re.findall(r'<style>(.*?)</style>',s,re.S))
start=s.index('<div class="page" id="game-screen"')
end=s.index('<!-- ===================================================================',start)
body=s[start:end].strip().replace('id="game-screen" style="display:none;"','id="game-screen"')
for ident in ['speak-btn','spectator-toggle','fog-mode-toggle']:
 body=re.sub(r'<button\b[^>]*id="'+ident+r'"[^>]*>.*?</button>','',body,flags=re.S)
for ident in ['speech-instructions','speech-status']:
 body=re.sub(r'<p\b[^>]*id="'+ident+r'"[^>]*>.*?</p>','',body,flags=re.S)
body=body.replace(' &nbsp;&middot;&nbsp; or tap Speak Move','')
body=body.replace('Game over. Return home to start a new game.','Game over. Use New game to restart.')
body=re.sub(r'<p>Or tap.*?Speak Move.*?</p>', '', body, flags=re.S)
body=re.sub(r'<button[^>]*data-depth="4"[^>]*>.*?</button>', '', body, flags=re.S)
body=body.replace('AI: Off','Computer: Off')
body=re.sub(r' When Fog Mode is on, querying.*?stale\.', '', body)
body=body.replace('If a question is not recognized, PIXIE uses fixed game answers on this device.', 'Answers are selected on this device.')
recovery_panel='''<section class="panel" aria-labelledby="recovery-title"><h2 id="recovery-title">DUET · Local play recovery</h2><p>Two players on this device or a local computer opponent. No account, cloud service, model API, telemetry or saved-game service is used. Refreshing closes this match. This is a tested recovery build; independent accessibility acceptance remains pending.</p><button type="button" class="btn-primary" onclick="startLocalGame(false)">New game · two players</button> <button type="button" class="btn-primary" onclick="startLocalGame(true)">New game · play computer</button></section>'''
body=body.replace('<header class="hero">','''<nav aria-label="Recovery navigation"><a href="../">Current State</a> · <a href="https://break.loptrlab.com/">Break this build</a></nav>
<header class="hero">''',1)
help_start=body.index('    <details class="panel" aria-labelledby="agent-heading">')
support_end=body.index('    <footer',help_start)
body=body[:help_start]+'<div class="recovery-support-row"><div class="recovery-menus">\n'+body[help_start:support_end]+'</div>'+recovery_panel+'</div>'+body[support_end:]
body=body.replace('PIXIE suggests example game questions. Please do not enter personal information.','PIXIE uses fixed game answers on this device. Questions are not sent or saved. Remote play, undo, Fog Mode and platform-specific controls are outside this recovery build.')
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
engine=scripts[0]
a=engine.index('    function enterRealm(');b=engine.index('    const FogMode',a)
engine=engine[:a]+engine[b:]
engine=engine.replace('Game over. Return home to start a new game.','Game over. Use New game to restart.')
engine=engine.replace("'AI: On' : 'AI: Off'","'Computer: On' : 'Computer: Off'")
engine=engine.replace('function submitPlayerIntent(intent) {', 'function submitPlayerIntent(intent) {\n        if (GameState.gameOver) return;')
engine=engine.replace('        advanceTurn();', '        if (!GameState.gameOver) advanceTurn();')
# Only expose the supported classic local experience from the original debug API.
a=engine.index('        spectator: {');b=engine.index('\n    };',a)
engine=engine[:a]+engine[b:]
helpcode=(root/'agentScope.js').read_text().split('module.exports =')[0]
extra='''
function startLocalGame(computer) {
 AIConfig.controllers.w = null;
 AIConfig.controllers.b = computer ? {depth: 2} : null;
 document.getElementById('ds-ai-toggle').innerText = computer ? 'Computer: On' : 'Computer: Off';
 document.getElementById('ds-ai-toggle').setAttribute('aria-pressed', String(computer));
 document.querySelectorAll('.chip[data-depth]').forEach(el => el.classList.toggle('active', el.dataset.depth === '2'));
 selectedSquare = null;
 initGame();
 document.getElementById('cmd').focus();
}
function sendAgentMessage() {
 const input = document.getElementById('agent-input');
 const topic = scopedQuestion(input.value);
 const unsupported = /remote|room|code|undo|fog|elevation|fire tv/i.test(input.value);
 document.getElementById('agent-status').textContent = unsupported
  ? 'This recovery supports Classic play on one device. Remote rooms, undo, Fog Mode and platform-specific controls are not included.'
  : (topic ? gameReply(topic) : OFF_TOPIC).reply;
 input.value = '';
}
document.getElementById('agent-input').addEventListener('keydown', e => { if(e.key === 'Enter') sendAgentMessage(); });
'''
# Default to two humans; the optional computer is a local deterministic search.
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>DUET · Local play recovery</title><style>'''+css+'''\nbody{overflow-x:hidden} .page{max-width:1200px} a{color:var(--amber-light)} button{min-height:44px} nav{margin-bottom:20px} .recovery-support-row{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:24px;align-items:start;margin:24px 0} .recovery-support-row .panel{max-width:none;min-width:0} .recovery-menus{display:grid;gap:16px;min-width:0} .recovery-menus .key-row{margin:0;padding:16px;gap:12px} .recovery-menus .key-panel{min-width:0;gap:8px} .recovery-menus .key-token{width:32px;height:32px;flex-shrink:0} .recovery-support-row button{white-space:normal;margin-top:8px;max-width:100%} @media(max-width:700px){.recovery-support-row{grid-template-columns:minmax(0,1fr)}}</style></head><body>'''+body+'<script>'+engine+'\n'+helpcode+'\n'+extra+'</script></body></html>'
assert not re.search(r'fetch\(|new WebSocket|<script[^>]+src=|https?://[^\s]+(?:\.js|\.css)',html)
(root/'site/play/index.html').write_text(html)
print('Built static local recovery:',len(html),'bytes')

