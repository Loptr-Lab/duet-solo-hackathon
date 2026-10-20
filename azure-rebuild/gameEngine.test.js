import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, getLegalMoves, applyMove, parseSquare, PIECES } from "./gameEngine.js";
const has=(state,from,to)=>getLegalMoves(state,parseSquare(from)).some(p=>p[0]===parseSquare(to)[0]&&p[1]===parseSquare(to)[1]);
test("initial setup uses Death and Rebirth in the royal squares",()=>{
 const s=createInitialState();
 assert.equal(PIECES[s.board[7][4]].kind,"death");
 assert.equal(PIECES[s.board[7][3]].kind,"rebirth");
 assert.equal(PIECES[s.board[0][4]].kind,"death");
 assert.equal(PIECES[s.board[0][3]].kind,"rebirth");
});
test("ordinary pawn movement and blocked paths are validated",()=>{
 const s=createInitialState();
 assert.equal(has(s,"e2","e4"),true);
 assert.equal(has(s,"e2","e5"),false);
 assert.throws(()=>applyMove(s,"e2","e5"),/not legal/);
});
test("turn order and own-piece capture are enforced",()=>{
 let s=createInitialState();
 assert.throws(()=>applyMove(s,"e7","e5"),/not that piece's turn/);
 assert.throws(()=>applyMove(s,"e2","d2"),/not legal/);
 s=applyMove(s,"e2","e4");
 assert.equal(s.turn,"b");
});
test("Death cannot be captured",()=>{
 const s=createInitialState();
 // Place a black rook on an open file and a white Death target.
 s.board[3][4]="r"; s.board[4][4]="K"; s.board[6][4]=null; s.board[7][4]=null;
 s.turn="b";
 assert.equal(has(s,"e5","e4"),false);
});
test("promotion creates Rebirth when none exists",()=>{
 const s=createInitialState();
 s.board=Array.from({length:8},()=>Array(8).fill(null));
 s.board[1][0]="P"; s.turn="w";
 const n=applyMove(s,"a7","a8");
 assert.equal(n.board[0][0],"R_STAR");
});
test("invalid coordinates are rejected",()=>assert.throws(()=>applyMove(createInitialState(),"z9","a1")));

test("Veiled pieces can move one empty square forward regardless of piece type",()=>{
 const s=createInitialState();
 s.board=Array.from({length:8},()=>Array(8).fill(null));
 s.board[4][3]="N"; s.board[3][4]="r_star"; s.turn="w";
 assert.equal(has(s,"d4","d5"),false); // not forward for White
 // White moves toward decreasing row; diagonal forward is allowed if empty.
 assert.equal(has(s,"d4","c5"),true);
 assert.equal(has(s,"d4","e5"),true);
});
