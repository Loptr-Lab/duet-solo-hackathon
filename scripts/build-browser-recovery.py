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
body=body.replace('<div>Or tap <span class="mono-accent">Speak Move</span> and say your move aloud</div>', '')
body=body.replace('<p class="quickstart" aria-hidden="true">', '<p class="quickstart">')
body=re.sub(r' When Fog Mode is on, querying.*?stale\.', '', body)
body=body.replace('If a question is not recognized, PIXIE uses fixed game answers on this device.', 'Answers are selected on this device.')
recovery_panel='''<section class="panel" aria-labelledby="recovery-title"><h2 id="recovery-title">DUET · Local play recovery</h2><p>Two players on this device or a local computer opponent. No account, cloud service, model API, telemetry or saved-game service is used. Refreshing closes this match. This is a tested recovery build; independent accessibility acceptance remains pending.</p><button type="button" class="btn-primary" onclick="startLocalGame(false)">New game · two players</button> <button type="button" class="btn-primary" onclick="startLocalGame(true)">New game · play computer</button></section>'''
body=body.replace('<header class="hero">','''<nav aria-label="Recovery navigation"><a href="../">The Weaver</a> · <a href="../review.html">Current State</a> · <a href="https://break.loptrlab.com/">Break this build</a></nav>
<header class="hero">''',1)
help_start=body.index('    <details class="panel" aria-labelledby="agent-heading">')
support_end=body.index('    <footer',help_start)
body=body[:help_start]+'<div class="recovery-support-row"><div class="recovery-menus">\n'+body[help_start:support_end]+'</div>'+recovery_panel+'</div>'+body[support_end:]
body=body.replace('PIXIE suggests example game questions. Please do not enter personal information.','PIXIE uses fixed game answers on this device. Questions are not sent or saved. Remote play, undo, Fog Mode and platform-specific controls are outside this recovery build.')
body=body.replace('<div class="board-row">', '''<section class="board-access" aria-labelledby="board-access-title"><h2 id="board-access-title">Board controls</h2><p id="board-key-help">Tab to Navigate board. Arrow keys move the cursor; Enter selects a piece, then a target. Escape cancels; R reads the square. Tab leaves the board. Typed moves and square queries remain available below.</p><div id="board-navigator" tabindex="0" role="application" aria-label="Navigate board" aria-describedby="board-key-help">Navigate board · arrow keys and Enter</div><p id="board-input-status" role="status" aria-live="polite" aria-atomic="true">Cursor starts at e2.</p><details id="board-key-settings"><summary>Remap keyboard or adaptive-switch keys</summary><p>Choose an action, then press its new key. Each key must be unique. Settings last until this page is refreshed. Devices must send keyboard keys; direct gamepad and TV-remote support are not included.</p><button type="button" id="bind-up" onclick="beginBoardBinding('up')">up</button> <button type="button" id="bind-down" onclick="beginBoardBinding('down')">down</button> <button type="button" id="bind-left" onclick="beginBoardBinding('left')">left</button> <button type="button" id="bind-right" onclick="beginBoardBinding('right')">right</button> <button type="button" id="bind-select" onclick="beginBoardBinding('select')">select</button> <button type="button" id="bind-cancel" onclick="beginBoardBinding('cancel')">cancel</button> <button type="button" id="bind-read" onclick="beginBoardBinding('read')">read</button> <button type="button" onclick="resetBoardKeys()">Restore default keys</button></details></section><div class="board-row">''',1)
body=body.replace('<div class="board-row">', '''<details class="board-access" id="audio-settings"><summary>Audio and spoken feedback · testing</summary><p>Audio is off by default. Speech uses only voices reported by your browser as installed locally. No microphone or model service is used. Keep spoken feedback off when using a screen reader to avoid duplicate speech. Preferences reset on refresh.</p><button type="button" id="spoken-toggle" aria-pressed="false" onclick="toggleSpokenFeedback()">Spoken feedback</button> <button type="button" onclick="speakGameMessage('DUET local voice test. White pawn on e two.')">Test voice</button> <button type="button" onclick="speakGameMessage(AudioSettings.lastMessage)">Repeat last message</button> <button type="button" onclick="stopSpokenFeedback()">Stop speech</button><p>Turn spoken feedback on before testing a voice.</p><label for="local-voice">Installed local voice</label><select id="local-voice" onchange="AudioSettings.voiceURI=this.value"></select> <button type="button" onclick="refreshLocalVoices()">Refresh voices</button><p><label for="cueVolume">Cue volume <output id="cueVolume-value" for="cueVolume">50%</output></label><input id="cueVolume" type="range" min="0" max="1" step="0.05" value="0.5" oninput="setAudioPreference('cueVolume',this.value)"></p><p><label for="speechVolume">Speech volume <output id="speechVolume-value" for="speechVolume">70%</output></label><input id="speechVolume" type="range" min="0" max="1" step="0.05" value="0.7" oninput="setAudioPreference('speechVolume',this.value)"></p><p><label for="rate">Speech speed <output id="rate-value" for="rate">1×</output></label><input id="rate" type="range" min="0.5" max="2" step="0.1" value="1" oninput="setAudioPreference('rate',this.value)"></p><button type="button" onclick="testCueTone()">Test tone</button><p>The toolbar Audio Cue button controls the continuous proximity tone. Test tone plays a short sample independently. Voice commands, direct gamepads and TV-remote support are not included.</p><p id="audio-status" role="status" aria-live="polite">Expand and choose Refresh voices to check local speech availability.</p></details><div class="board-row">''',1)
body=body.replace('id="audio-btn"', 'id="audio-btn" aria-pressed="false"')
# Keep secondary controls after the board, command bar and notation guide.
controls_start=body.index('<section class="board-access" aria-labelledby="board-access-title">')
controls_end=body.index('</section>',controls_start)+len('</section>')
board_controls=body[controls_start:controls_end]
body=body[:controls_start]+body[controls_end:]
audio_start=body.index('<details class="board-access" id="audio-settings">')
audio_end=body.index('</details>',audio_start)+len('</details>')
audio_controls=body[audio_start:audio_end]
body=body[:audio_start]+body[audio_end:]
legend_start=body.index('<p id="legend"')
legend_end=body.index('</p>',legend_start)+len('</p>')
body=body[:legend_end]+board_controls+audio_controls+body[legend_end:]
body=body.replace('or click two squares on the board below','or click two squares on the board above')
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
engine=scripts[0]
a=engine.index('    function enterRealm(');b=engine.index('    const FogMode',a)
engine=engine[:a]+engine[b:]
engine=engine.replace('Game over. Return home to start a new game.','Game over. Use New game to restart.')
engine=engine.replace("'AI: On' : 'AI: Off'","'Computer: On' : 'Computer: Off'")
engine=engine.replace("div.dataset.square = sq;", "div.dataset.square = sq; if (sq === (window.boardCursor || 'e2')) div.classList.add('keyboard-cursor');")
engine=engine.replace('function submitPlayerIntent(intent) {', 'function submitPlayerIntent(intent) {\n        if (GameState.gameOver) return;')
engine=engine.replace('        advanceTurn();', '        if (!GameState.gameOver) advanceTurn();')
# Only expose the supported classic local experience from the original debug API.
a=engine.index('        spectator: {');b=engine.index('\n    };',a)
engine=engine[:a]+engine[b:]
audio_code='''
var AudioSettings = {cueVolume:0.5,speechVolume:0.7,rate:1,spoken:false,voiceURI:'',lastMessage:''};
function audioStatus(message) {
 document.getElementById('audio-status').textContent = message;
}
function localVoices() {
 try { return window.speechSynthesis ? window.speechSynthesis.getVoices().filter(voice => voice.localService === true) : []; }
 catch (_) { return []; }
}
function refreshLocalVoices() {
 const select = document.getElementById('local-voice');
 select.innerHTML = '';
 const voices = localVoices();
 voices.forEach(voice => {
  const option = document.createElement('option');
  option.value = voice.voiceURI;
  option.textContent = voice.name+' ('+voice.lang+')';
  select.appendChild(option);
 });
 if (!voices.some(voice => voice.voiceURI === AudioSettings.voiceURI)) AudioSettings.voiceURI = voices[0] ? voices[0].voiceURI : '';
 select.value = AudioSettings.voiceURI;
 if (!voices.length) {
  AudioSettings.spoken = false;
  document.getElementById('spoken-toggle').setAttribute('aria-pressed','false');
  audioStatus('No installed local voice is available. Screen-reader announcements and tone controls remain available.');
 } else audioStatus(voices.length+' local voice(s) available. Spoken feedback is optional; keep it off when using a screen reader to avoid duplicate speech.');
}
function speakGameMessage(message) {
 AudioSettings.lastMessage = message;
 if (!AudioSettings.spoken) return;
 const voice = localVoices().find(voice => voice.voiceURI === AudioSettings.voiceURI);
 if (!voice || !window.SpeechSynthesisUtterance) {
  AudioSettings.spoken = false;
  document.getElementById('spoken-toggle').setAttribute('aria-pressed','false');
  audioStatus('Local speech unavailable. Use your screen reader or text feedback.');
  return;
 }
 try {
  const utterance = new window.SpeechSynthesisUtterance(message);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.volume = AudioSettings.speechVolume;
  utterance.rate = AudioSettings.rate;
  utterance.onerror = () => audioStatus('Speech could not finish. Text feedback remains available; try Test voice.');
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
 } catch (_) { audioStatus('Speech unavailable. Text feedback remains available.'); }
}
function toggleSpokenFeedback() {
 if (AudioSettings.spoken) {
  AudioSettings.spoken = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
 } else {
  refreshLocalVoices();
  if (!localVoices().length || !window.SpeechSynthesisUtterance) return;
  AudioSettings.spoken = true;
 }
 document.getElementById('spoken-toggle').setAttribute('aria-pressed',String(AudioSettings.spoken));
 audioStatus('Spoken feedback '+(AudioSettings.spoken?'on.':'off.'));
 if (AudioSettings.spoken) speakGameMessage('Spoken feedback enabled. Moves and square queries will be read aloud.');
}
function stopSpokenFeedback() {
 if (window.speechSynthesis) window.speechSynthesis.cancel();
 audioStatus('Current speech stopped.');
}
function setAudioPreference(name, value) {
 const limits = name === 'rate' ? [0.5,2] : [0,1];
 if (!['cueVolume','speechVolume','rate'].includes(name) || !Number.isFinite(Number(value))) return;
 AudioSettings[name] = Math.min(limits[1],Math.max(limits[0],Number(value)));
 document.getElementById(name+'-value').textContent = name === 'rate' ? AudioSettings[name]+'×' : Math.round(AudioSettings[name]*100)+'%';
 if (name === 'cueVolume') updateAudio(createSnapshot());
}
function ensureCueContext() {
 if (!audioCtx) {
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) throw Error('Web Audio unavailable');
  audioCtx = new AudioConstructor();
 }
 if (audioCtx.state === 'suspended') {
  const resumed = audioCtx.resume();
  if (resumed && resumed.catch) resumed.catch(() => audioStatus('Audio could not resume. Tap Test tone to try again.'));
 }
 return audioCtx;
}
function toggleAudio() {
 try {
  if (audioEnabled) {
   audioEnabled = false;
   if (gainNode) gainNode.gain.setValueAtTime(0,audioCtx.currentTime);
  } else {
   ensureCueContext();
   if (!osc) {
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    osc.type = 'sine';
    gainNode.gain.value = 0;
    osc.connect(gainNode);gainNode.connect(audioCtx.destination);osc.start();
   }
   audioEnabled = true;
   updateAudio(createSnapshot());
  }
  document.getElementById('audio-btn').innerText = audioEnabled ? 'Mute Audio Cue' : 'Toggle Audio Cue';
  document.getElementById('audio-btn').setAttribute('aria-pressed',String(audioEnabled));
  announce('Audio cues '+(audioEnabled?'enabled.':'disabled.'));
 } catch (_) {
  audioEnabled = false;
  document.getElementById('audio-btn').setAttribute('aria-pressed','false');
  audioStatus('Audio unavailable in this browser. Text and screen-reader feedback remain available.');
 }
}
function testCueTone() {
 try {
  const context = ensureCueContext();
  const tone = context.createOscillator(), level = context.createGain();
  tone.frequency.value = 440;
  level.gain.setValueAtTime(0,context.currentTime);
  level.gain.linearRampToValueAtTime(0.12*AudioSettings.cueVolume,context.currentTime+0.03);
  level.gain.linearRampToValueAtTime(0,context.currentTime+0.35);
  tone.connect(level);level.connect(context.destination);
  tone.start();tone.stop(context.currentTime+0.4);
  tone.onended = () => {tone.disconnect();level.disconnect();};
  audioStatus('Short test tone requested. Check device volume and output if you cannot hear it.');
 } catch (_) { audioStatus('Test tone unavailable. Text feedback remains available.'); }
}

'''
# Define preferences before initGame's first announcement; functions are hoisted.
a=engine.index('    function toggleAudio()');b=engine.index('    function updateAudio(',a)
engine=engine[:a]+engine[b:]
engine=audio_code+'\n'+engine
engine=engine.replace("document.getElementById('sr-status').innerText = msg;", "document.getElementById('sr-status').innerText = msg; speakGameMessage(msg);")
engine=engine.replace('gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);','gainNode.gain.setValueAtTime(vol * AudioSettings.cueVolume, audioCtx.currentTime);')
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
extra+='''
const defaultBoardKeys = {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',select:'Enter',cancel:'Escape',read:'r'};
let boardKeys = {...defaultBoardKeys};
let pendingBoardKey = null;
window.boardCursor = 'e2';
function boardFeedback(message) {
 document.getElementById('board-input-status').textContent = message;
}
function showBoardKeys() {
 Object.entries(boardKeys).forEach(([action,key]) => {
  document.getElementById('bind-'+action).textContent = action+': '+(key === ' ' ? 'Space' : key);
 });
}
function beginBoardBinding(action) {
 pendingBoardKey = action;
 boardFeedback('Press a key for '+action+'. Escape cancels. Tab remains available for navigation.');
}
function resetBoardKeys() {
 pendingBoardKey = null;
 boardKeys = {...defaultBoardKeys};
 showBoardKeys();
 boardFeedback('Default keys restored.');
}
function captureBoardBinding(event) {
 if (!pendingBoardKey) return;
 if (event.key === 'Tab') { pendingBoardKey = null; boardFeedback('Remapping cancelled.'); return; }
 event.preventDefault();
 event.stopPropagation();
 if (event.key === 'Escape') { pendingBoardKey = null; boardFeedback('Remapping cancelled.'); return; }
 if (event.ctrlKey || event.metaKey || event.altKey || ['Shift','Control','Alt','Meta'].includes(event.key)) { boardFeedback('Choose a key without a modifier.'); return; }
 const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
 if (Object.entries(boardKeys).some(([action,value]) => action !== pendingBoardKey && value === key)) { boardFeedback('That key is already assigned. Choose another key.'); return; }
 boardKeys[pendingBoardKey] = key;
 pendingBoardKey = null;
 showBoardKeys();
 boardFeedback('Key assigned for this page session.');
}
function boardInput(event) {
 if (pendingBoardKey || event.ctrlKey || event.metaKey || event.altKey) return;
 const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
 const action = Object.keys(boardKeys).find(action => boardKeys[action] === key);
 if (!action) return;
 event.preventDefault();
 if (event.repeat && ['select','cancel'].includes(action)) return;
 let {r,c} = parseSquare(window.boardCursor);
 if (action === 'cancel') {
  selectedSquare = null;
  document.getElementById('cmd').value = '';
  renderVisualBoard(createSnapshot());
  boardFeedback('Selection cancelled. '+window.boardCursor+'.');
 } else if (action === 'select') {
  if (GameState.gameOver || isAIControlled(GameState.turn)) { boardFeedback('Wait for your turn, or start a new game if this match has ended.'); return; }
  const piece = GameState.board[r][c];
  if (!selectedSquare) {
   if (!piece || piece.color !== GameState.turn) { boardFeedback('Choose a piece belonging to the side whose turn it is.'); return; }
   handleSquareClick(window.boardCursor);
   boardFeedback(window.boardCursor+' selected. Move to a target square and select again.');
  } else {
   handleSquareClick(window.boardCursor);
   boardFeedback(selectedSquare ? 'Selection changed.' : 'Selection cleared. See move status for the result.');
  }
 } else if (action === 'read') {
  querySquare(window.boardCursor);
 } else {
  if (action === 'up') r = Math.max(0,r-1);
  if (action === 'down') r = Math.min(7,r+1);
  if (action === 'left') c = Math.max(0,c-1);
  if (action === 'right') c = Math.min(7,c+1);
  window.boardCursor = squareName(r,c);
  renderVisualBoard(createSnapshot());
  querySquare(window.boardCursor);
  boardFeedback('Cursor: '+window.boardCursor+(selectedSquare ? '; selected '+selectedSquare : '')+'.');
 }
}
document.getElementById('board-navigator').addEventListener('keydown', boardInput);
document.getElementById('board-navigator').addEventListener('focus', () => { querySquare(window.boardCursor); });
document.getElementById('board-key-settings').addEventListener('keydown', captureBoardBinding, true);
showBoardKeys();
renderVisualBoard(createSnapshot());

'''
extra+='''
if (window.speechSynthesis && window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', refreshLocalVoices);
'''
# Default to two humans; the optional computer is a local deterministic search.
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>DUET · Local play recovery</title><style>'''+css+'''\nbody{overflow-x:hidden} .page{max-width:1200px} a{color:var(--amber-light)} button{min-height:44px} nav{margin-bottom:20px} .board-access{margin:16px 0;padding:16px;border:1px solid var(--border-hairline)} .board-access h2{font-size:16px} .board-access p{line-height:1.5} #board-navigator{padding:14px;border:2px solid var(--amber-light);width:fit-content;cursor:pointer} #board-navigator:focus-visible{outline:3px solid white;outline-offset:3px} .sq.keyboard-cursor{outline:3px solid var(--amber-light);outline-offset:-4px;z-index:1} #board-key-settings button{margin:8px 8px 0 0}  .board-row{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;align-items:start} #visual-board{width:100%;max-width:720px;aspect-ratio:1;grid-template-columns:repeat(8,minmax(0,1fr));grid-template-rows:repeat(8,minmax(0,1fr))} .board-row .sidebar{min-width:0;width:auto;gap:20px} .board-row .panel{max-width:none;padding:16px} .piece-token{width:72%;height:72%;font-size:clamp(18px,3vw,36px)} .piece-token.special{width:80%;height:80%;font-size:clamp(18px,2.7vw,32px)} @media(max-width:700px){.board-row{grid-template-columns:minmax(0,1fr)} .board-row .sidebar{width:100%} .piece-token{font-size:clamp(18px,5vw,32px)} .piece-token.special{font-size:clamp(18px,4.7vw,30px)}} .recovery-support-row{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:24px;align-items:start;margin:24px 0} .recovery-support-row .panel{max-width:none;min-width:0} .recovery-menus{display:grid;gap:16px;min-width:0} .recovery-menus .key-row{margin:0;padding:16px;gap:12px} .recovery-menus .key-panel{min-width:0;gap:8px} .recovery-menus .key-token{width:32px;height:32px;flex-shrink:0} .recovery-support-row button{white-space:normal;margin-top:8px;max-width:100%} @media(max-width:700px){.recovery-support-row{grid-template-columns:minmax(0,1fr)}}</style></head><body>'''+body+'<script>'+engine+'\n'+helpcode+'\n'+extra+'</script></body></html>'
assert not re.search(r'fetch\(|new WebSocket|<script[^>]+src=|https?://[^\s]+(?:\.js|\.css)',html)
(root/'site/play/index.html').write_text(html)
print('Built static local recovery:',len(html),'bytes')

