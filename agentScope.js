// Only these bounded game questions can reach the model. Never forward raw input:
// a game question may contain unrelated personal information or instructions.
const WORDS = new Set(`a about accessibility accessible and are attack audio bishop board can castle castling check checkmate chess clock code command commands control controls d death do does duet e2e4 elevation end enter explain fire fog focus for game get help how i in is isnt it jaws join keyboard king knight last legal make match mode move moves my navigate navigation nvda of on pad pawn pieces play queen radius read reader reading rebirth remote restart rook room ruin rules sanctuary screen square start status talkback the this to turn tv undo use voiceover voiceview what when where which win with work works`.split(' '));
const GAME_WORDS = new Set('duet chess game board match move moves pieces pawn knight bishop rook queen king e2e4 rules radius ruin sanctuary rebirth fog elevation room code join undo controls control command commands keyboard screen reader accessibility accessible focus navigate navigation square castle castling check checkmate turn legal play restart status pad remote fire tv voiceview voiceover talkback nvda jaws'.split(' '));

const QUESTIONS = {
  rules: 'Explain the rules of DUET briefly.',
  controls: 'How do I use DUET game controls and make a move?',
  accessibility: 'Explain DUET keyboard and screen reader controls.',
  gameplay: 'How do I make a legal move in DUET?',
  radius: 'Explain the Radius of Ruin mechanic in DUET.',
  sanctuary: 'Explain the Sanctuary mechanic in DUET.',
  rebirth: 'Explain the Rebirth and Death mechanics in DUET.',
  fog: 'Explain Fog Mode and elevation in DUET.'
};

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
  if (words.includes('sanctuary')) return { intent: 'rules', question: QUESTIONS.sanctuary };
  if (words.includes('radius') || words.includes('ruin')) return { intent: 'rules', question: QUESTIONS.radius };
  if (words.includes('rebirth') || words.includes('death')) return { intent: 'rules', question: QUESTIONS.rebirth };
  if (words.includes('fog') || words.includes('elevation')) return { intent: 'rules', question: QUESTIONS.fog };
  if (words.some(word => ['screen', 'reader', 'accessibility', 'accessible', 'audio', 'focus', 'reading', 'voiceview', 'voiceover', 'talkback', 'nvda', 'jaws'].includes(word))) return { intent: 'accessibility', question: QUESTIONS.accessibility };
  if (words.some(word => ['control', 'controls', 'keyboard', 'command', 'commands', 'navigate', 'navigation', 'undo', 'room', 'code', 'join', 'pad', 'remote', 'fire', 'tv'].includes(word))) return { intent: 'controls', question: QUESTIONS.controls };
  if (words.some(word => ['rules', 'castle', 'castling', 'check', 'checkmate'].includes(word))) return { intent: 'rules', question: QUESTIONS.rules };
  return { intent: 'gameplay', question: QUESTIONS.gameplay };
}

function validGameReply(value, expectedIntent) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    value.intent === expectedIntent && typeof value.reply === 'string' &&
    value.reply.trim().length > 0 && value.reply.length <= 500;
}

module.exports = { scopedQuestion, validGameReply, OFF_TOPIC };
