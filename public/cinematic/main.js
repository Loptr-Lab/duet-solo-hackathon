/* ============================================================
   Veiled Dominion: Duet — Cinematic Sequence
   main.js  –  timeline state machine + scene logic
   ============================================================ */

'use strict';

/* ---- Board helpers ---- */
// Converts chess coordinate (e.g. "e1") to {row, col} (row 0=rank8 .. 7=rank1)
function coord(notation) {
  const col = notation.charCodeAt(0) - 97;   // a=0 .. h=7
  const rank = parseInt(notation[1], 10);
  const row = 8 - rank;                       // rank 1 => row 7
  return { row, col };
}

function cellIndex(notation) {
  const { row, col } = coord(notation);
  return row * 8 + col;
}

/* ---- SVG inlining helper ---- */
async function loadSVG(path) {
  try {
    const r = await fetch(path);
    return await r.text();
  } catch {
    return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" fill="none"/>
            </svg>`;
  }
}

/* ---- Board builder ---- */
function buildBoard(container) {
  container.innerHTML = '';
  const files = ['a','b','c','d','e','f','g','h'];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      cell.dataset.file = files[col];
      cell.dataset.rank = String(8 - row);
      cell.id = `cell-${files[col]}${8 - row}`;
      container.appendChild(cell);
    }
  }
}

/* ---- Piece placement ---- */
async function placePiece(boardEl, notation, type, cls, svgMarkup) {
  const cellId = `cell-${notation}`;
  const cell = boardEl.querySelector(`#${cellId}`);
  if (!cell) return null;
  const wrap = document.createElement('div');
  wrap.classList.add('piece', cls);
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', type === 'skull' ? 'Death – King' : 'Rebirth – Queen');
  wrap.innerHTML = svgMarkup;
  cell.appendChild(wrap);
  return wrap;
}

/* ---- Pulse ring helper ---- */
function addPulse(cellEl) {
  const ring = document.createElement('div');
  ring.classList.add('pulse-ring');
  cellEl.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());
}

/* ---- Floating label ---- */
function addLabel(cellEl, text) {
  const lbl = document.createElement('div');
  lbl.classList.add('float-label');
  lbl.textContent = text;
  cellEl.style.position = 'relative';
  cellEl.appendChild(lbl);
  lbl.addEventListener('animationend', () => lbl.remove());
}

/* ---- Sleep helper ---- */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- Typed text ---- */
async function typeText(el, text, msPerChar = 80) {
  el.textContent = '';
  for (const ch of text) {
    el.textContent += ch;
    await sleep(msPerChar);
  }
}

/* ============================================================
   SCENE DEFINITIONS
   ============================================================ */

async function scene1(el) {
  /* Nothing dynamic needed; CSS handles the glitch/shimmer */
}

async function scene2(el) {
  const board = el.querySelector('.board');
  if (!board) return;
  buildBoard(board);

  const [skullSVG, starSVG] = await Promise.all([
    loadSVG('assets/skull.svg'),
    loadSVG('assets/star.svg'),
  ]);

  await sleep(600);
  const skullCell = board.querySelector('#cell-e1');
  const starCell  = board.querySelector('#cell-d1');
  if (skullCell) skullCell.classList.add('highlight');
  if (starCell)  starCell.classList.add('highlight');

  // Place skull
  await placePiece(board, 'e1', 'skull', 'piece-skull', skullSVG);
  if (skullCell) { addPulse(skullCell); addLabel(skullCell, 'DEATH'); }
  await sleep(900);

  // Place star
  await placePiece(board, 'd1', 'star', 'piece-star', starSVG);
  if (starCell)  { addPulse(starCell);  addLabel(starCell,  'REBIRTH'); }
}

async function scene3(el) {
  const board = el.querySelector('.board');
  if (!board) return;
  buildBoard(board);

  const [skullSVG, starSVG] = await Promise.all([
    loadSVG('assets/skull.svg'),
    loadSVG('assets/star.svg'),
  ]);

  // Place pieces
  await placePiece(board, 'e4', 'skull', 'piece-skull', skullSVG);
  await placePiece(board, 'd4', 'star',  'piece-star',  starSVG);

  // Surround skull with generic enemy markers
  const enemySquares = ['d5','e5','f5','f4','f3','e3','d3'];
  for (const sq of enemySquares) {
    const cell = board.querySelector(`#cell-${sq}`);
    if (cell) {
      const dot = document.createElement('div');
      dot.style.cssText = 'width:55%;height:55%;border-radius:50%;background:rgba(255,59,59,0.6);';
      cell.appendChild(dot);
    }
  }

  await sleep(800);

  // Threat zone around star
  const starCell = board.querySelector('#cell-d4');
  if (starCell) {
    const zone = document.createElement('div');
    zone.classList.add('threat-zone');
    const cellSize = board.getBoundingClientRect().width / 8;
    const size = cellSize * 2.8;
    zone.style.cssText = `width:${size}px;height:${size}px;top:50%;left:50%;transform:translate(-50%,-50%);`;
    starCell.style.position = 'relative';
    starCell.appendChild(zone);
  }

  // Agency bar animation
  const fill = el.querySelector('.agency-fill');
  if (fill) {
    fill.style.width = '100%';
    await sleep(400);
    fill.style.width = '28%';
  }
}

async function scene4(el) {
  const board = el.querySelector('.board');
  if (!board) return;
  buildBoard(board);

  const skullSVG = await loadSVG('assets/skull.svg');
  // Place a pawn-style piece at e2
  const pawnCell = board.querySelector('#cell-e2');
  if (pawnCell) {
    const wrap = document.createElement('div');
    wrap.classList.add('piece', 'piece-pawn');
    wrap.setAttribute('aria-label', 'Pawn');
    wrap.innerHTML = skullSVG;   // reuse skull as stand-in
    wrap.style.transform = 'scale(0.75)';
    pawnCell.appendChild(wrap);
  }

  // Cursor animation
  const cursor = el.querySelector('.cursor-dot');
  const speakBtn = el.querySelector('.speak-btn');
  const termText = el.querySelector('.terminal-text');

  if (!cursor || !speakBtn || !termText) return;

  // Move cursor toward speak button
  const btnRect = speakBtn.getBoundingClientRect();
  const stageRect = el.getBoundingClientRect();
  cursor.style.top  = `${btnRect.top  - stageRect.top  + btnRect.height/2}px`;
  cursor.style.left = `${btnRect.left - stageRect.left + btnRect.width/2}px`;

  await sleep(1000);
  speakBtn.classList.add('active');
  await sleep(700);

  // Type command
  await typeText(termText, 'e2e4', 100);
  await sleep(500);

  // Animate piece move
  const e2Cell = board.querySelector('#cell-e2');
  const e4Cell = board.querySelector('#cell-e4');
  if (e2Cell && e4Cell) {
    const boardRect = board.getBoundingClientRect();
    const e2Rect = e2Cell.getBoundingClientRect();
    const e4Rect = e4Cell.getBoundingClientRect();

    const movePiece = el.querySelector('.piece-moving');
    if (movePiece) {
      movePiece.innerHTML = skullSVG;
      movePiece.style.left = `${e2Rect.left - boardRect.left + e2Rect.width*0.2}px`;
      movePiece.style.top  = `${e2Rect.top  - boardRect.top  + e2Rect.height*0.2}px`;
      await sleep(100);
      movePiece.style.left = `${e4Rect.left - boardRect.left + e4Rect.width*0.2}px`;
      movePiece.style.top  = `${e4Rect.top  - boardRect.top  + e4Rect.height*0.2}px`;

      // Remove original piece from e2
      const orig = e2Cell.querySelector('.piece');
      if (orig) orig.style.opacity = '0';
    }
  }
}

async function scene5(el) {
  const bar = el.querySelector('.browser-loading-bar');
  const barText = el.querySelector('.browser-bar');

  await sleep(400);
  // Type URL
  if (barText) await typeText(barText, 'veileddominion.com', 60);

  await sleep(300);
  if (bar) bar.style.width = '100%';

  await sleep(800);
  // Cross out icons sequentially
  const items = el.querySelectorAll('.crossout-item');
  for (const item of items) {
    await sleep(400);
    item.classList.add('crossed');
  }
}

async function scene6(el) {
  const board = el.querySelector('.board');
  if (!board) return;
  buildBoard(board);

  const [starSVG] = await Promise.all([loadSVG('assets/star.svg')]);

  // Place star (Rebirth) at d5
  await placePiece(board, 'd5', 'star', 'piece-star', starSVG);

  // Knight starts at f6, visible
  const knightCell = board.querySelector('#cell-f6');
  if (knightCell) {
    const k = document.createElement('div');
    k.classList.add('piece', 'piece-knight');
    k.setAttribute('aria-label', 'Enemy Knight');
    k.id = 'knight-piece';
    k.innerHTML = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 38 L14 30 Q10 26 12 20 Q14 14 20 12 Q24 10 28 14 Q34 12 36 18 L30 22 Q32 28 28 32 L30 38 Z"
            fill="currentColor"/>
    </svg>`;
    knightCell.appendChild(k);
  }

  // Add initial 8 move dots around knight
  const moveDotSquares = ['e4','e8','d7','d5','h5','h7','g4','g8'];
  const dots = [];
  for (const sq of moveDotSquares) {
    const cell = board.querySelector(`#cell-${sq}`);
    if (cell) {
      const dot = document.createElement('div');
      dot.classList.add('move-dot');
      dot.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);';
      cell.appendChild(dot);
      dots.push(dot);
    }
  }

  await sleep(1200);

  // Knight moves closer: from f6 to e7 (enters 2-sq radius)
  const knight = document.getElementById('knight-piece');
  if (knight && knightCell) {
    const e7Cell = board.querySelector('#cell-e7');
    if (e7Cell) {
      e7Cell.appendChild(knight);
      knightCell.classList.remove('highlight');
    }
  }

  await sleep(600);

  // Veil the knight
  const knightEl = document.getElementById('knight-piece');
  if (knightEl) knightEl.classList.add('veiled');

  // Spawn fog particles
  const knightParent = knightEl?.parentElement;
  if (knightParent) {
    knightParent.style.position = 'relative';
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.classList.add('fog-particle');
      const angle = Math.random() * 360;
      const dist  = 18 + Math.random() * 22;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.top  = `${40 + Math.random()*20}%`;
      p.style.left = `${40 + Math.random()*20}%`;
      p.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
      p.style.animationDelay   = `${Math.random() * 0.5}s`;
      knightParent.appendChild(p);
    }
  }

  // Fade out 6 of the 8 move dots → only 2 remain
  await sleep(500);
  for (let i = 0; i < dots.length - 2; i++) {
    dots[i].style.opacity = '0';
    await sleep(120);
  }
}

async function scene7(el) {
  const packet = el.querySelector('.data-packet');
  const toast  = el.querySelector('.toast');
  const path   = el.querySelector('.data-path');

  if (!packet || !path) return;

  await sleep(600);

  // Animate packet sliding to the right
  const pathRect = path.getBoundingClientRect();
  packet.style.left = `calc(100% - 60px)`;

  await sleep(1700);
  if (toast) toast.classList.add('visible');
}

async function scene8(el) {
  /* Static; CSS handles live pulse */
}

/* ============================================================
   SCENE REGISTRY
   ============================================================ */
const SCENES = [
  {
    id: 's1',
    caption: 'This is Veiled Dominion: Duet — built in Minneapolis by Loptr Lab.',
    duration: 4000,
    fn: scene1,
  },
  {
    id: 's2',
    caption: 'It\'s an asymmetric chess variant. That skull is Death — the King. That star is Rebirth — the Queen.',
    duration: 6000,
    fn: scene2,
  },
  {
    id: 's3',
    caption: 'But unlike standard chess, protecting Rebirth\'s agency is how you win, not protecting Death.',
    duration: 6000,
    fn: scene3,
  },
  {
    id: 's4',
    caption: 'I can move by typing, clicking, or voice. Tap Speak Move, say e2e4.',
    duration: 7000,
    fn: scene4,
  },
  {
    id: 's5',
    caption: 'The game runs in the browser. No install. No account. Just show up and play.',
    duration: 7000,
    fn: scene5,
  },
  {
    id: 's6',
    caption: 'When a piece gets too close to the enemy Rebirth it becomes veiled — movement restricted. That\'s the mechanic that changes everything.',
    duration: 7000,
    fn: scene6,
  },
  {
    id: 's7',
    caption: 'After the match, your stats write back to your own AT Protocol server. Not ours. Yours.',
    duration: 6000,
    fn: scene7,
  },
  {
    id: 's8',
    caption: 'It\'s open source. It\'s live. It\'s Minnesota-made.',
    duration: 5000,
    fn: scene8,
  },
];

/* ============================================================
   TIMELINE ENGINE
   ============================================================ */
let currentScene = -1;
let sceneTimer   = null;
let paused       = false;

const progressBar = document.getElementById('progress-bar');
const captionEl   = document.getElementById('caption');

function setCaption(text) {
  if (!captionEl) return;
  captionEl.style.opacity = '0';
  setTimeout(() => {
    captionEl.textContent = text;
    captionEl.style.opacity = '1';
  }, 300);
}

function updateProgressBar() {
  if (!progressBar) return;
  const pct = ((currentScene + 1) / SCENES.length) * 100;
  progressBar.style.width = `${pct}%`;
}

async function showScene(idx) {
  if (idx < 0 || idx >= SCENES.length) return;

  // Hide current scene
  if (currentScene >= 0) {
    const prev = document.getElementById(SCENES[currentScene].id);
    if (prev) {
      prev.classList.add('exiting');
      prev.classList.remove('active');
    }
  }

  currentScene = idx;
  const def = SCENES[idx];
  const el  = document.getElementById(def.id);
  if (!el) return;

  el.classList.add('active');
  el.classList.remove('exiting');
  setCaption(def.caption);
  updateProgressBar();

  // Run scene-specific logic
  await def.fn(el);

  // Auto-advance
  if (sceneTimer) clearTimeout(sceneTimer);
  sceneTimer = setTimeout(() => {
    if (!paused) nextScene();
  }, def.duration);
}

function nextScene() {
  if (currentScene + 1 < SCENES.length) {
    showScene(currentScene + 1);
  } else {
    // End of sequence – loop back
    showScene(0);
  }
}

function prevScene() {
  if (currentScene - 1 >= 0) {
    showScene(currentScene - 1);
  }
}

/* ---- Controls ---- */
document.getElementById('btn-next')?.addEventListener('click', () => {
  if (sceneTimer) clearTimeout(sceneTimer);
  nextScene();
});

document.getElementById('btn-prev')?.addEventListener('click', () => {
  if (sceneTimer) clearTimeout(sceneTimer);
  prevScene();
});

document.getElementById('btn-pause')?.addEventListener('click', (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? '▶ Resume' : '⏸ Pause';
  if (!paused && currentScene >= 0) {
    // Re-queue advance
    const def = SCENES[currentScene];
    sceneTimer = setTimeout(nextScene, def.duration / 2);
  } else if (sceneTimer) {
    clearTimeout(sceneTimer);
  }
});

/* ---- Keyboard navigation ---- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'l') {
    if (sceneTimer) clearTimeout(sceneTimer);
    nextScene();
  } else if (e.key === 'ArrowLeft' || e.key === 'h') {
    if (sceneTimer) clearTimeout(sceneTimer);
    prevScene();
  } else if (e.key === ' ') {
    e.preventDefault();
    document.getElementById('btn-pause')?.click();
  }
});

/* ---- Kick off ---- */
showScene(0);
