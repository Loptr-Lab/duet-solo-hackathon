// Only these bounded game questions can reach the model. Never forward raw input:
// a game question may contain unrelated personal information or instructions.
const WORDS = new Set(`a about accessibility accessible and are attack audio bishop board can castle castling check checkmate chess clock command commands control controls do does duet e2e4 end enter explain focus for game get help how i in is it keyboard king knight legal make match move moves my navigate navigation of on pawn pieces play queen radius read reader restart rook ruin rules sanctuary screen square start status the to turn use what when where which win with`.split(' '));
const GAME_WORDS = new Set('duet chess game board match move moves pieces pawn knight bishop rook queen king e2e4 rules radius ruin sanctuary controls control command commands keyboard screen reader accessibility accessible focus navigate navigation square castle castling check checkmate turn legal play restart status'.split(' '));

const QUESTIONS = {
  rules: 'Explain the rules of DUET briefly.',
  controls: 'How do I use DUET game controls and make a move?',
  accessibility: 'Explain DUET keyboard and screen reader controls.',
  gameplay: 'How do I make a legal move in DUET?',
  radius: 'Explain the Radius of Ruin mechanic in DUET.',
  sanctuary: 'Explain the Sanctuary mechanic in DUET.'
};

const OFF_TOPIC = Object.freeze({
  reply: 'PIXIE answers questions about DUET only. For other help, open Outside Support.',
  intent: 'outside_support',
  supportUrl: '/outside-support.html'
});

function scopedQuestion(message) {
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) return null;
  const normalized = message.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ');
  if (words.length > 20 || words.some(word => !WORDS.has(word)) || !words.some(word => GAME_WORDS.has(word))) return null;
  if (words.includes('sanctuary')) return { intent: 'rules', question: QUESTIONS.sanctuary };
  if (words.includes('radius') || words.includes('ruin')) return { intent: 'rules', question: QUESTIONS.radius };
  if (words.some(word => ['screen', 'reader', 'accessibility', 'accessible', 'audio', 'focus'].includes(word))) return { intent: 'accessibility', question: QUESTIONS.accessibility };
  if (words.some(word => ['control', 'controls', 'keyboard', 'command', 'commands', 'navigate', 'navigation'].includes(word))) return { intent: 'controls', question: QUESTIONS.controls };
  if (words.some(word => ['rules', 'castle', 'castling', 'check', 'checkmate'].includes(word))) return { intent: 'rules', question: QUESTIONS.rules };
  return { intent: 'gameplay', question: QUESTIONS.gameplay };
}

function validGameReply(value, expectedIntent) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    value.intent === expectedIntent && typeof value.reply === 'string' &&
    value.reply.trim().length > 0 && value.reply.length <= 500;
}

module.exports = { scopedQuestion, validGameReply, OFF_TOPIC };
