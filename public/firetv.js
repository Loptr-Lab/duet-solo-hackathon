(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('firetv') !== '1' && params.get('tv') !== '1') return;

  document.documentElement.classList.add('duet-tv');
  const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  let activeSquare = 'e2';
  let paused = false;

  const hint = document.createElement('p');
  hint.className = 'duet-tv-hint';
  hint.textContent = 'TV controls: use the directional pad to move and Select to choose. Press Play/Pause to pause.';
  document.getElementById('realm-intro')?.prepend(hint);

  const pauseLayer = document.createElement('div');
  pauseLayer.className = 'duet-tv-pause';
  pauseLayer.hidden = true;
  pauseLayer.setAttribute('role', 'dialog');
  pauseLayer.setAttribute('aria-modal', 'true');
  pauseLayer.setAttribute('aria-labelledby', 'duet-tv-pause-title');
  pauseLayer.innerHTML = '<div class="duet-tv-pause-card"><h2 id="duet-tv-pause-title">Game paused</h2><p>Your match is saved on this screen. Press Play/Pause or choose Resume when you are ready.</p><button type="button" class="btn-primary">Resume</button></div>';
  document.getElementById('game-screen')?.append(pauseLayer);
  const resumeButton = pauseLayer.querySelector('button');

  const isGameVisible = () => {
    const screen = document.getElementById('game-screen');
    return !!screen && getComputedStyle(screen).display !== 'none';
  };
  const pauseGame = (value) => {
    paused = value;
    pauseLayer.hidden = !value;
    if (typeof audioCtx !== 'undefined' && audioCtx) {
      if (value) audioCtx.suspend?.();
      else if (typeof audioEnabled !== 'undefined' && audioEnabled) audioCtx.resume?.();
    }
    if (value) resumeButton.focus();
    else document.querySelector(`#visual-board [data-square="${activeSquare}"]`)?.focus();
  };
  resumeButton.addEventListener('click', () => pauseGame(false));

  const visible = (element) => {
    if (!element || element.disabled || element.closest('[hidden]')) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };

  function decorateSquares(board) {
    if (!board) return;
    board.querySelectorAll('.sq[data-square]').forEach((square) => {
      const name = square.dataset.square;
      square.tabIndex = name === activeSquare ? 0 : -1;
      square.setAttribute('role', 'button');
      const piece = square.querySelector('.piece-token');
      const owner = piece?.classList.contains('owner-w') ? 'White' : piece ? 'Black' : '';
      const glyph = piece?.childNodes[0]?.textContent?.trim();
      const names = { '♙': 'pawn', '♖': 'rook', '♘': 'knight', '♗': 'bishop', '♕': 'queen', '♔': 'king', '★': 'Rebirth', '☠': 'Death' };
      square.setAttribute('aria-label', `${name}${piece ? `, ${owner} ${names[glyph] || 'piece'}` : ', empty square'}`);
    });
  }

  function moveSquare(from, key) {
    const delta = directions[key];
    if (!delta) return false;
    const file = from.charCodeAt(0) - 97 + delta[0];
    const rank = Number(from[1]) - delta[1];
    if (file < 0 || file > 7 || rank < 1 || rank > 8) return true;
    const next = String.fromCharCode(97 + file) + rank;
    const target = document.querySelector(`#visual-board [data-square="${next}"]`);
    if (target) {
      activeSquare = next;
      decorateSquares(document.getElementById('visual-board'));
      target.focus();
    }
    return true;
  }

  const board = document.getElementById('visual-board');
  if (board) {
    decorateSquares(board);
    board.addEventListener('focusin', (event) => {
      const square = event.target.closest('.sq[data-square]');
      if (square) {
        activeSquare = square.dataset.square;
        decorateSquares(board);
      }
    });
    board.addEventListener('keydown', (event) => {
      const square = event.target.closest('.sq[data-square]');
      if (!square || paused) return;
      if (moveSquare(square.dataset.square, event.key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activeSquare = square.dataset.square;
        square.click();
        requestAnimationFrame(() => {
          decorateSquares(board);
          document.querySelector(`#visual-board [data-square="${activeSquare}"]`)?.focus();
        });
      }
    });
    new MutationObserver(() => decorateSquares(board)).observe(board, { childList: true, subtree: true });
  }

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) {
    new MutationObserver(() => {
      if (!isGameVisible()) return;
      requestAnimationFrame(() => {
        decorateSquares(board);
        document.querySelector(`#visual-board [data-square="${activeSquare}"]`)?.focus();
      });
    }).observe(gameScreen, { attributes: true, attributeFilter: ['style'] });
  }

  function spatialMove(origin, key) {
    const direction = directions[key];
    const candidates = [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter((item) => visible(item) && !item.closest('.duet-tv-pause'));
    if (!candidates.length) return;
    if (!origin || !visible(origin)) { candidates[0].focus(); return; }
    const from = origin.getBoundingClientRect();
    const ox = from.left + from.width / 2;
    const oy = from.top + from.height / 2;
    const ranked = candidates.filter((item) => item !== origin).map((item) => {
      const rect = item.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - ox;
      const dy = rect.top + rect.height / 2 - oy;
      const forward = key === 'ArrowRight' ? dx : key === 'ArrowLeft' ? -dx : key === 'ArrowDown' ? dy : -dy;
      const cross = key === 'ArrowRight' || key === 'ArrowLeft' ? Math.abs(dy) : Math.abs(dx);
      return { item, score: forward > 0 ? forward + cross * 2.2 : Infinity };
    }).filter((entry) => Number.isFinite(entry.score)).sort((a, b) => a.score - b.score);
    if (ranked[0]) ranked[0].item.focus();
  }

  document.addEventListener('keydown', (event) => {
    const keyCode = event.keyCode || event.which;
    const playPause = keyCode === 179 || event.key === 'MediaPlayPause';
    if (playPause && isGameVisible()) {
      event.preventDefault();
      pauseGame(!paused);
      return;
    }
    if (paused) {
      if (event.key === 'Enter' || event.key === ' ' || keyCode === 4) {
        event.preventDefault();
        pauseGame(false);
      }
      return;
    }
    if (keyCode === 4 || event.key === 'Escape' || event.key === 'Backspace') {
      if (isGameVisible()) {
        event.preventDefault();
        window.location.hash = '#home';
      }
      return;
    }
    if (!directions[event.key]) return;
    const target = event.target;
    if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (target?.closest('#visual-board .sq')) return;
    event.preventDefault();
    spatialMove(target, event.key);
  });

  window.addEventListener('load', () => {
    decorateSquares(board);
    document.querySelector('#realm-intro button')?.focus();
  }, { once: true });
})();
