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
