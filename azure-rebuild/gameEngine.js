// Veiled Dominion: Duet — deterministic local rules engine.
// Coordinates are [row, col], row 0 is Black's back rank.
export const FILES = "abcdefgh";
export const PIECES = {
  K: { name: "Death", glyph: "☠", side: "w", kind: "death" },
  k: { name: "Death", glyph: "☠", side: "b", kind: "death" },
  R_STAR: { name: "Rebirth", glyph: "✦", side: "w", kind: "rebirth" },
  r_star: { name: "Rebirth", glyph: "✦", side: "b", kind: "rebirth" },
  Q: { name: "Queen", glyph: "♕", side: "w", kind: "queen" },
  q: { name: "Queen", glyph: "♛", side: "b", kind: "queen" },
  R: { name: "Rook", glyph: "♖", side: "w", kind: "rook" },
  r: { name: "Rook", glyph: "♜", side: "b", kind: "rook" },
  B: { name: "Bishop", glyph: "♗", side: "w", kind: "bishop" },
  b: { name: "Bishop", glyph: "♝", side: "b", kind: "bishop" },
  N: { name: "Knight", glyph: "♘", side: "w", kind: "knight" },
  n: { name: "Knight", glyph: "♞", side: "b", kind: "knight" },
  P: { name: "Pawn", glyph: "♙", side: "w", kind: "pawn" },
  p: { name: "Pawn", glyph: "♟", side: "b", kind: "pawn" }
};
const BACK = ["R", "N", "B", "R_STAR", "K", "B", "N", "R"];
const BACK_BLACK = ["r", "n", "b", "r_star", "k", "b", "n", "r"];
export const squareName = ([r, c]) => FILES[c] + (8 - r);
export const parseSquare = (s) => {
  if (typeof s !== "string" || !/^[a-h][1-8]$/i.test(s.trim())) return null;
  const t = s.trim().toLowerCase();
  return [8 - Number(t[1]), FILES.indexOf(t[0])];
};
const inside = ([r,c]) => r >= 0 && r < 8 && c >= 0 && c < 8;
const same = (a,b) => a[0] === b[0] && a[1] === b[1];
export const adjacent = (a,b) => Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1])) === 1;
export function createInitialState() {
  const board = Array.from({length:8}, () => Array(8).fill(null));
  board[0] = BACK_BLACK.slice(); board[1] = Array(8).fill("p");
  board[6] = Array(8).fill("P"); board[7] = BACK.slice();
  return { board, turn: "w", ply: 0, status: "playing", winner: null, history: [], veiled: [], sheltered: [] };
}
function pathClear(board, from, to) {
  const dr = Math.sign(to[0]-from[0]), dc = Math.sign(to[1]-from[1]);
  let r = from[0]+dr, c = from[1]+dc;
  while (r !== to[0] || c !== to[1]) {
    if (board[r][c]) return false;
    r += dr; c += dc;
  }
  return true;
}
function standardLegal(board, piece, from, to) {
  const [fr,fc] = from, [tr,tc] = to, dr = tr-fr, dc = tc-fc;
  const target = board[tr][tc];
  if (same(from,to) || !inside(to) || (target && PIECES[target].side === PIECES[piece].side)) return false;
  const p = PIECES[piece], adr = Math.abs(dr), adc = Math.abs(dc);
  if (p.kind === "death") return Math.max(adr,adc) === 1 && !(target && PIECES[target].kind === "death");
  if (p.kind === "rebirth" || p.kind === "queen") {
    if (!(dr === 0 || dc === 0 || adr === adc)) return false;
    return pathClear(board, from, to);
  }
  if (p.kind === "rook") {
    if (!(dr === 0 || dc === 0)) return false;
    return pathClear(board, from, to);
  }
  if (p.kind === "bishop") {
    if (adr !== adc) return false;
    return pathClear(board, from, to);
  }
  if (p.kind === "knight") return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
  if (p.kind === "pawn") {
    const dir = p.side === "w" ? -1 : 1;
    const start = p.side === "w" ? 6 : 1;
    if (dc === 0 && dr === dir && !target) return true;
    if (dc === 0 && dr === 2*dir && fr === start && !target && !board[fr+dir][fc]) return true;
    return adr === 1 && dc !== 0 && dr === dir && !!target && PIECES[target].side !== p.side;
  }
  return false;
}
function calculateAuras(board) {
  const rebirths = [], deaths = [];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const id = board[r][c];
    if (!id) continue;
    if (PIECES[id].kind === "rebirth") rebirths.push({pos:[r,c],side:PIECES[id].side});
    if (PIECES[id].kind === "death") deaths.push({pos:[r,c],side:PIECES[id].side});
  }
  const veiled = [], sheltered = [];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const id=board[r][c]; if (!id) continue;
    const side=PIECES[id].side, pos=[r,c];
    const hostileRebirth=rebirths.some(x=>x.side!==side && adjacent(pos,x.pos));
    const friendlyDeath=deaths.some(x=>x.side===side && adjacent(pos,x.pos));
    if (hostileRebirth && !friendlyDeath) veiled.push(squareName(pos));
    if (friendlyDeath) sheltered.push(squareName(pos));
  }
  return {veiled, sheltered};
}
export function getLegalMoves(state, from) {
  if (!inside(from)) return [];
  const piece=state.board[from[0]][from[1]];
  if (!piece || PIECES[piece].side !== state.turn || state.status !== "playing") return [];
  const aura=calculateAuras(state.board), fromName=squareName(from);
  const isVeiled=aura.veiled.includes(fromName);
  const moves=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const to=[r,c];
    if (isVeiled) {
      const p=PIECES[piece], dir=p.side==="w"?-1:1;
      if (r-from[0] !== dir || Math.abs(c-from[1])>1 || state.board[r][c]) continue;
      // Veiled pieces may move one square forward only, never capture.
      if (p.kind==="pawn" || standardLegal(state.board,piece,from,to)) moves.push(to);
      continue;
    }
    if (standardLegal(state.board,piece,from,to)) moves.push(to);
  }
  return moves;
}
export function applyMove(state, fromInput, toInput, promotion) {
  const from=typeof fromInput==="string"?parseSquare(fromInput):fromInput;
  const to=typeof toInput==="string"?parseSquare(toInput):toInput;
  if (!from || !to || !inside(from) || !inside(to)) throw new Error("Use squares from a1 through h8.");
  const piece=state.board[from[0]][from[1]];
  if (!piece) throw new Error("There is no piece on "+squareName(from)+".");
  if (PIECES[piece].side!==state.turn) throw new Error("It is not that piece's turn.");
  if (!getLegalMoves(state,from).some(x=>same(x,to))) throw new Error("That move is not legal.");
  const board=state.board.map(row=>row.slice());
  const captured=board[to[0]][to[1]];
  board[to[0]][to[1]]=piece; board[from[0]][from[1]]=null;
  const moving=PIECES[piece];
  if (moving.kind==="pawn" && (to[0]===0 || to[0]===7)) {
    const side=moving.side, hasRebirth=board.some(row=>row.some(id=>id && PIECES[id].kind==="rebirth" && PIECES[id].side===side));
    let choice=promotion;
    if (!hasRebirth) choice=side==="w"?"R_STAR":"r_star";
    else {
      const allowed=side==="w"?["Q","R","B","N"]:["q","r","b","n"];
      if (!allowed.includes(choice)) choice=side==="w"?"Q":"q";
    }
    board[to[0]][to[1]]=choice;
  }
  const next={...state,board,turn:state.turn==="w"?"b":"w",ply:state.ply+1,history:[...state.history,{from:squareName(from),to:squareName(to),piece,captured:captured||null}],};
  const aura=calculateAuras(board);
  next.veiled=aura.veiled; next.sheltered=aura.sheltered;
  const ownRebirthVeiled=board.some((row,r)=>row.some((id,c)=>id && PIECES[id].kind==="rebirth" && PIECES[id].side===state.turn && aura.veiled.includes(squareName([r,c]))));
  if (ownRebirthVeiled) { next.status="finished"; next.winner=state.turn==="w"?"b":"w"; next.reason="A Rebirth ended its turn Veiled."; }
  return next;
}
export function describeSquare(state, square) {
  const pos=typeof square==="string"?parseSquare(square):square;
  if (!pos || !inside(pos)) return "Invalid square.";
  const id=state.board[pos[0]][pos[1]], name=squareName(pos), aura=calculateAuras(state.board);
  if (!id) return name+", empty"+(aura.veiled.includes(name)?", Veiled aura":"")+".";
  const p=PIECES[id], flags=[];
  if(aura.veiled.includes(name)) flags.push("Veiled; can move one empty square forward only");
  if(aura.sheltered.includes(name)) flags.push("sheltered by own Death");
  return name+", "+(p.side==="w"?"White ":"Black ")+p.name+(flags.length?"; "+flags.join("; "):"")+".";
}
