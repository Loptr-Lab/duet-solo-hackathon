// Only these bounded game questions receive PIXIE game help. A message with
// unknown words receives the same Outside Support card, including mixed input.
const WORDS = new Set(`a about accessibility accessible and are attack audio bishop board can castle castling check checkmate chess clock code command commands control controls d death do does duet e2e4 elevation end enter explain fire fog focus for game get help how i in is isnt it jaws join keyboard king knight last legal make match mode move moves my navigate navigation nvda of on pad pawn pieces play queen radius read reader reading rebirth remote restart rook room ruin rules sanctuary screen square start status talkback the this to turn tv undo use voiceover voiceview what when where which win with work works`.split(' '));
const GAME_WORDS = new Set('duet chess game board match move moves pieces pawn knight bishop rook queen king e2e4 rules radius ruin sanctuary rebirth fog elevation room code join undo controls control command commands keyboard screen reader accessibility accessible focus navigate navigation square castle castling check checkmate turn legal play restart status pad remote fire tv voiceview voiceover talkback nvda jaws'.split(' '));

const ANSWERS = Object.freeze({
  rules: Object.freeze({
    intent: 'rules',
    reply: 'DUET is a two-player chess variant. Each side has a Rebirth and a Death. The opposing Rebirth can Veil your nearby pieces, restricting how they move; your Death protects nearby friendly pieces. If your Rebirth is Veiled, you lose.'
  }),
  controls: Object.freeze({
    intent: 'controls',
    reply: 'On the web board, Tab to the command bar, type a move such as e2e4, and press Enter. Type one square, such as e4, to hear what is there. Remote matches use a room code. Fire TV remote controls still need device testing.'
  }),
  accessibility: Object.freeze({
    intent: 'accessibility',
    reply: 'Use the command bar to enter moves or query a square. DUET announces moves and status changes for screen readers. Tab moves through controls. VoiceView on Fire TV still needs device testing; please report any announcement or focus problem.'
  }),
  gameplay: Object.freeze({
    intent: 'gameplay',
    reply: 'On your turn, enter a four-character move such as e2e4 in the command bar and press Enter. The move must be legal for that piece and the current board. e2e4 is an example of the format, not a promise that it is legal right now.'
  }),
  radius: Object.freeze({
    intent: 'rules',
    reply: 'At the end of a turn, your pieces within one square of the opposing Rebirth become Veiled unless protected by your own Death. A Veiled piece has restricted movement. Rebirth does not Veil her own side. If your Rebirth becomes Veiled, you lose immediately.'
  }),
  sanctuary: Object.freeze({
    intent: 'rules',
    reply: 'Death’s Sanctuary protects friendly pieces within one square, including diagonals, from the opposing Rebirth’s Veil. It prevents new Veiling while they are protected; it does not clear a Veil already on a piece.'
  }),
  rebirth: Object.freeze({
    intent: 'rules',
    reply: 'Rebirth moves like a queen and Veils opposing pieces within one square. Death moves one square like a king, cannot be captured, and protects nearby friendly pieces from Veiling. If your Rebirth becomes Veiled by the opposing Rebirth, you lose immediately.'
  }),
  fog: Object.freeze({
    intent: 'rules',
    reply: 'Fog Mode adds elevation, limited sight, and HP combat. Higher ground can extend sight and increases attack damage; unexplored squares stay hidden. It is local two-player play on a shared device. The AI opponent and Spectator mode are disabled, and remote rooms use Classic mode.'
  })
});

const OFF_TOPIC = Object.freeze({
  reply: 'PIXIE answers questions about DUET only. Try asking about rules, controls, or Sanctuary. For other help, open Outside Support.',
  intent: 'outside_support',
  supportUrl: '/outside-support.html'
});

function scopedQuestion(message) {
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) return null;
  const normalized = message.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ');
  if (words.length > 20 || words.some(word => !WORDS.has(word)) || !words.some(word => GAME_WORDS.has(word))) return null;
  if (words.includes('sanctuary')) return 'sanctuary';
  if (words.includes('radius') || words.includes('ruin')) return 'radius';
  if (words.includes('rebirth') || words.includes('death')) return 'rebirth';
  if (words.includes('fog') || words.includes('elevation')) return 'fog';
  if (words.some(word => ['screen', 'reader', 'accessibility', 'accessible', 'audio', 'focus', 'reading', 'voiceview', 'voiceover', 'talkback', 'nvda', 'jaws'].includes(word))) return 'accessibility';
  if (words.some(word => ['control', 'controls', 'keyboard', 'command', 'commands', 'navigate', 'navigation', 'undo', 'room', 'code', 'join', 'pad', 'remote', 'fire', 'tv'].includes(word))) return 'controls';
  if (words.some(word => ['rules', 'castle', 'castling', 'check', 'checkmate'].includes(word))) return 'rules';
  return 'gameplay';
}

function gameReply(topic) { return ANSWERS[topic] || null; }

module.exports = { scopedQuestion, gameReply, OFF_TOPIC };

