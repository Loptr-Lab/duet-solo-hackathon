const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const html = fs.readFileSync(require('node:path').join(__dirname, '../site/play/index.html'), 'utf8');
function fresh() {
 const elements = new Map();
 const el = () => ({innerText:'',textContent:'',innerHTML:'',value:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},appendChild(){},addEventListener(){},focus(){}});
 const get = id => { if(!elements.has(id)) elements.set(id,el()); return elements.get(id); };
 const ctx = vm.createContext({document:{getElementById:get,createElement:el,querySelectorAll:()=>[]},window:{},setTimeout(){},console,Math});
 const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
 vm.runInContext(script,ctx);
 return {run:s=>vm.runInContext(s,ctx), get};
}
test('static recovery contains no backend or external runtime dependency',()=>{
 assert.match(html,/connect-src 'none'/);
 assert.doesNotMatch(html,/fetch\(|new WebSocket|socket\.io|<script[^>]+src=/);
});
test('local turns, invalid moves, square query and restart',()=>{
 const {run,get}=fresh();
 run("Duet=window.Duet; Duet.move('e2','e4')");
 assert.equal(run('GameState.turn'),'b');
 assert.equal(run("Duet.query('e4').piece.type"),'p');
 run("Duet.move('d2','d4')"); assert.equal(run('GameState.turn'),'b');
 run("Duet.move('e7','e5')"); assert.equal(run('GameState.turn'),'w');
 run('startLocalGame(false)'); assert.equal(run('GameState.turnNumber'),1);
 assert.equal(run("window.Duet.query('e4').piece"),null);
});
test('sliders are blocked; Death cannot be captured',()=>{
 const {run}=fresh();
 assert.equal(run("onValidateIntent({from:'a1',to:'a4'}).valid"),false);
 run("GameState.board=Array.from({length:8},()=>Array(8).fill(null)); GameState.board[4][0]={type:'r',color:'w'}; GameState.board[4][2]={type:'d',color:'b'};");
 assert.equal(run("onValidateIntent({from:'a4',to:'c4'}).valid"),false);
});
test('veiled Rebirth ends the game and blocks later moves',()=>{
 const {run,get}=fresh();
 run("GameState.board[7][3].veiled=true; onCheckEndState();");
 assert.equal(run('GameState.gameOver'),true);
 const before=run('JSON.stringify(createSnapshot())');
 run("window.Duet.move('e2','e4')");
 assert.equal(run('JSON.stringify(createSnapshot())'),before);
 assert.match(get('log').innerText,/Black wins/);
});
test('computer search returns a legal move without a model service',()=>{
 const {run}=fresh();
 run("startLocalGame(true); window.Duet.move('e2','e4'); runAITurn();");
 assert.equal(run('GameState.turn'),'w'); assert.equal(run('GameState.turnNumber'),3);
});
test('fixed PIXIE help answers locally and labels unsupported remote features',()=>{
 const {run,get}=fresh();
 get('agent-input').value='What are the rules?';run('sendAgentMessage()');assert.match(get('agent-status').textContent,/Rebirth/);
 get('agent-input').value='How do I join a remote room?';run('sendAgentMessage()');assert.match(get('agent-status').textContent,/not included/);
});

test('keyboard board navigation selects and completes a legal move',()=>{
 const {run,get}=fresh();
 run("function key(k, repeat=false){boardInput({key:k,repeat,preventDefault(){}})};key('Enter');key('ArrowUp');key('ArrowUp');key('Enter');");
 assert.equal(run("window.Duet.query('e4').piece.type"),'p');
 assert.equal(run('GameState.turn'),'b');
 run("key('Escape')");assert.equal(run('selectedSquare'),null);
 run("window.boardCursor='a8';key('ArrowUp');key('ArrowLeft')");assert.equal(run('window.boardCursor'),'a8');
});
test('remapping rejects duplicate keys, preserves Tab and applies new keys',()=>{
 const {run,get}=fresh();
 run("function bind(k){captureBoardBinding({key:k,preventDefault(){},stopPropagation(){}})};beginBoardBinding('up');bind('ArrowDown')");
 assert.equal(run('boardKeys.up'),'ArrowUp');assert.match(get('board-input-status').textContent,/already assigned/);
 run("bind('w');boardInput({key:'w',preventDefault(){}})");assert.equal(run('window.boardCursor'),'e3');
 run("beginBoardBinding('down');captureBoardBinding({key:'Tab',preventDefault(){throw Error('Tab trapped')}})");assert.equal(run('pendingBoardKey'),null);
 run('resetBoardKeys()');assert.equal(run('boardKeys.up'),'ArrowUp');
});
test('holding select does not submit repeated actions and unrelated keys remain free',()=>{
 const {run}=fresh();
 run("boardInput({key:'Enter',repeat:true,preventDefault(){}})");assert.equal(run('selectedSquare'),null);
 run("boardInput({key:'Tab',preventDefault(){throw Error('Tab trapped')}})");
 run("boardInput({key:'Enter',ctrlKey:true,preventDefault(){throw Error('modifier intercepted')}})");
});
test('speech stays off by default and never selects remote voices',()=>{
 const {run,get}=fresh();
 run("window.speechSynthesis={getVoices:()=>[{voiceURI:'remote',localService:false}],cancel(){},speak(){throw Error('remote voice used')}}; window.SpeechSynthesisUtterance=function(text){this.text=text};toggleSpokenFeedback()");
 assert.equal(run('AudioSettings.spoken'),false);
 assert.match(get('audio-status').textContent,/No installed local voice/);
 run("window.speechSynthesis.getVoices=()=>[{voiceURI:'local',localService:true,name:'Local',lang:'en-US'},{voiceURI:'remote',localService:false}];window.spoken=[];window.speechSynthesis.speak=u=>window.spoken.push(u);toggleSpokenFeedback();querySquare('e2')");
 assert.equal(run('window.spoken.at(-1).voice.voiceURI'),'local');
 assert.match(run('window.spoken.at(-1).text'),/White Pawn/i);
 run("window.speechSynthesis.getVoices=()=>[];speakGameMessage('test')");
 assert.equal(run('AudioSettings.spoken'),false);
});
test('speech and cue preferences are independent and bounded; speech can be stopped',()=>{
 const {run}=fresh();
 run("setAudioPreference('cueVolume',0.2);setAudioPreference('speechVolume',0.8);setAudioPreference('rate',9)");
 assert.equal(run('AudioSettings.cueVolume'),0.2);assert.equal(run('AudioSettings.speechVolume'),0.8);assert.equal(run('AudioSettings.rate'),2);
 run("window.cancelled=false;window.speechSynthesis={cancel(){window.cancelled=true}};stopSpokenFeedback()");assert.equal(run('window.cancelled'),true);
});
test('Web Audio failures remain recoverable and do not block gameplay',()=>{
 const {run,get}=fresh();run('toggleAudio();testCueTone()');
 assert.equal(run('audioEnabled'),false);assert.match(get('audio-status').textContent,/unavailable/);
 run("window.Duet.move('e2','e4')");assert.equal(run('GameState.turn'),'b');
});
test('cue volume changes generated gain and mute silences the proximity tone',()=>{
 const {run}=fresh();
 run("window.AudioContext=function(){this.state='running';this.currentTime=0;this.destination={};this.createGain=()=>({gain:{value:0,setValueAtTime(v){this.value=v}},connect(){}});this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){}},connect(){},start(){}})};toggleAudio();setAudioPreference('cueVolume',0)");
 assert.equal(run('audioEnabled'),true);assert.equal(run('gainNode.gain.value'),0);
 run("setAudioPreference('cueVolume',1);toggleAudio()");assert.equal(run('audioEnabled'),false);assert.equal(run('gainNode.gain.value'),0);
});
