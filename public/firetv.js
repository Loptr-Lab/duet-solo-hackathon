(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('firetv') !== '1' && params.get('tv') !== '1') return;

  document.documentElement.classList.add('duet-tv');

  const directions = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };
  const activeSquares = { 'visual-board': 'e2', 'remote-board': 'e2' };
  let focusIntentBoard = null;
  let paused = false;
  let pausedFocusBoard = null;

  const hintText = 'Controls: D-pad or arrows move; A, Select, Enter, or Space choose; B or Back returns; Start or Play/Pause pauses. Keyboard controls also work with compatible accessibility switches.';
  function addHint(target) {
    if (!target) return;
    const hint = document.createElement('p');
    hint.className = 'duet-tv-hint';
    hint.id = `duet-tv-hint-${target.id}`;
    hint.textContent = hintText;
    target.prepend(hint);
  }

  const realmIntro = document.getElementById('realm-intro');
  const remoteLobby = document.getElementById('remote-lobby');
  addHint(realmIntro);
  addHint(remoteLobby);

  const pauseLayer = document.createElement('div');
  pauseLayer.className = 'duet-tv-pause';
  pauseLayer.hidden = true;
  pauseLayer.setAttribute('role', 'dialog');
  pauseLayer.setAttribute('aria-modal', 'true');
  pauseLayer.setAttribute('aria-labelledby', 'duet-tv-pause-title');
  pauseLayer.innerHTML = '<div class="duet-tv-pause-card"><h2 id="duet-tv-pause-title">Game paused</h2><p>Your match is saved on this screen. Press Start or Play/Pause, or choose Resume when you are ready.</p><button type="button" class="btn-primary">Resume</button></div>';
  document.body.append(pauseLayer);
  const resumeButton = pauseLayer.querySelector('button');
  resumeButton.addEventListener('click', () => pauseGame(false));

  function isVisible(element) {
    if (!element || element.disabled || element.closest('[hidden]')) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  }

  function visibleScreen(id) {
    const screen = document.getElementById(id);
    return !!screen && getComputedStyle(screen).display !== 'none';
  }

  function isGameVisible() {
    return visibleScreen('game-screen') || visibleScreen('remote-game-screen');
  }

  function boardIsVisible(board) {
    const screen = board?.closest('#game-screen, #remote-game-screen');
    return !!screen && getComputedStyle(screen).display !== 'none';
  }

  function squareDescription(square) {
    if (square.classList.contains('fog-unexplored')) return 'unexplored square';
    const piece = square.querySelector('.piece-token');
    if (!piece) return square.classList.contains('fog-stale') ? 'empty square, last seen' : 'empty square';
    const owner = piece.classList.contains('owner-w') ? 'White' : 'Black';
    const glyph = piece.childNodes[0]?.textContent?.trim();
    const names = { '♙': 'pawn', '♖': 'rook', '♘': 'knight', '♗': 'bishop', '♕': 'queen', '♔': 'king', '★': 'Rebirth', '☠': 'Death' };
    return `${owner} ${names[glyph] || 'piece'}${square.classList.contains('veiled') ? ', veiled' : ''}${square.classList.contains('fog-stale') ? ', last seen' : ''}`;
  }

  function decorateSquares(board) {
    if (!board) return;
    board.removeAttribute('aria-hidden');
    board.setAttribute('role', 'group');
    board.setAttribute('aria-label', board.id === 'remote-board' ? 'Remote DUET game board. Use arrow keys or a controller direction to move; select a square to play.' : 'DUET game board. Use arrow keys or a controller direction to move; select a square to play.');
    const activeSquare = activeSquares[board.id] || 'e2';
    board.querySelectorAll('.sq[data-square]').forEach((square) => {
      const name = square.dataset.square;
      square.tabIndex = name === activeSquare ? 0 : -1;
      square.setAttribute('role', 'button');
      square.setAttribute('aria-pressed', square.classList.contains('selected') ? 'true' : 'false');
      square.setAttribute('aria-label', `${name}, ${squareDescription(square)}${square.classList.contains('selected') ? ', selected' : ''}`);
    });
  }

  function focusActiveSquare(board) {
    if (!board || !boardIsVisible(board) || paused) return;
    decorateSquares(board);
    const square = board.querySelector(`[data-square="${activeSquares[board.id] || 'e2'}"]`);
    if (!square) return;
    try {
      square.focus({ preventScroll: true });
    } catch (_) {
      square.focus();
    }
  }

  function pauseGame(value) {
    if (paused === value) return;
    paused = value;
    pauseLayer.hidden = !value;
    if (typeof audioCtx !== 'undefined' && audioCtx) {
      if (value) audioCtx.suspend?.();
      else if (typeof audioEnabled !== 'undefined' && audioEnabled) audioCtx.resume?.();
    }
    if (value) {
      pausedFocusBoard = focusIntentBoard;
      resumeButton.focus();
      return;
    }
    const board = pausedFocusBoard || focusIntentBoard;
    pausedFocusBoard = null;
    if (board && boardIsVisible(board)) requestAnimationFrame(() => focusActiveSquare(board));
  }

  function moveSquare(board, from, key) {
    const delta = directions[key];
    if (!delta) return false;
    const file = from.charCodeAt(0) - 97 + delta[0];
    const rank = Number(from[1]) - delta[1];
    if (file < 0 || file > 7 || rank < 1 || rank > 8) return true;
    const next = String.fromCharCode(97 + file) + rank;
    const target = board.querySelector(`[data-square="${next}"]`);
    if (target) {
      activeSquares[board.id] = next;
      focusIntentBoard = board;
      decorateSquares(board);
      target.focus();
    }
    return true;
  }

  function attachBoard(board) {
    if (!board) return;
    decorateSquares(board);

    board.addEventListener('focusin', (event) => {
      const square = event.target.closest('.sq[data-square]');
      if (!square) return;
      activeSquares[board.id] = square.dataset.square;
      focusIntentBoard = board;
      decorateSquares(board);
    });

    board.addEventListener('click', (event) => {
      const square = event.target.closest('.sq[data-square]');
      if (!square) return;
      activeSquares[board.id] = square.dataset.square;
      focusIntentBoard = board;
      requestAnimationFrame(() => focusActiveSquare(board));
    }, true);

    board.addEventListener('keydown', (event) => {
      const square = event.target.closest('.sq[data-square]');
      if (!square || paused) return;
      if (moveSquare(board, square.dataset.square, event.key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        activeSquares[board.id] = square.dataset.square;
        focusIntentBoard = board;
        square.click();
        requestAnimationFrame(() => focusActiveSquare(board));
      }
    });

    new MutationObserver(() => {
      decorateSquares(board);
      if (focusIntentBoard === board && boardIsVisible(board) && !paused) {
        requestAnimationFrame(() => focusActiveSquare(board));
      }
    }).observe(board, { childList: true, subtree: true });
  }

  const localBoard = document.getElementById('visual-board');
  const remoteBoard = document.getElementById('remote-board');
  attachBoard(localBoard);
  attachBoard(remoteBoard);

  document.addEventListener('focusin', (event) => {
    if (event.target === document.body || pauseLayer.contains(event.target)) return;
    const board = event.target.closest?.('#visual-board, #remote-board');
    if (board) {
      const square = event.target.closest('.sq[data-square]');
      if (square) activeSquares[board.id] = square.dataset.square;
      focusIntentBoard = board;
    } else {
      focusIntentBoard = null;
    }
  });

  function observeScreen(screenId, board) {
    const screen = document.getElementById(screenId);
    if (!screen || !board) return;
    new MutationObserver(() => {
      if (!boardIsVisible(board)) return;
      focusIntentBoard = board;
      requestAnimationFrame(() => focusActiveSquare(board));
    }).observe(screen, { attributes: true, attributeFilter: ['style'] });
  }

  observeScreen('game-screen', localBoard);
  observeScreen('remote-game-screen', remoteBoard);

  function spatialMove(origin, key) {
    const candidates = [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
      .filter((item) => isVisible(item) && !item.closest('.duet-tv-pause'));
    if (!candidates.length) return;
    if (!origin || !isVisible(origin)) {
      candidates[0].focus();
      return;
    }
    const from = origin.getBoundingClientRect();
    const ox = from.left + from.width / 2;
    const oy = from.top + from.height / 2;
    const ranked = candidates.filter((item) => item !== origin).map((item) => {
      const rect = item.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - ox;
      const dy = rect.top + rect.height / 2 - oy;
      const forward = key === 'ArrowRight' ? dx : key === 'ArrowLeft' ? -dx : key === 'ArrowDown' ? dy : -dy;
      const cross = key === 'ArrowRight' || key === 'ArrowLeft' ? Math.abs(dy) : Math.abs(dx);
      return { item, score: forward > 0 ? forward + cross * 0.75 : Infinity };
    }).filter((entry) => Number.isFinite(entry.score)).sort((a, b) => a.score - b.score);
    if (ranked[0]) ranked[0].item.focus();
  }

  function returnToHome() {
    if (window.location.hash !== '#home') window.location.hash = '#home';
    if (typeof SiteNavigation !== 'undefined') SiteNavigation.showLobby();
    const lobby = document.getElementById('remote-lobby');
    if (lobby) lobby.style.display = 'none';
    const intro = document.getElementById('realm-intro');
    if (intro) intro.hidden = false;
    document.querySelector('#realm-intro button')?.focus();
    document.getElementById('front-page')?.scrollIntoView({ block: 'start' });
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
      if (event.key === 'Tab') {
        event.preventDefault();
        resumeButton.focus();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape' || event.key === 'Backspace' || keyCode === 4) {
        event.preventDefault();
        pauseGame(false);
      }
      return;
    }
    if (keyCode === 4 || event.key === 'Escape' || event.key === 'Backspace') {
      if (isGameVisible()) {
        event.preventDefault();
        returnToHome();
      }
      return;
    }
    if (!directions[event.key]) return;
    const target = event.target;
    if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (target?.closest('#visual-board .sq, #remote-board .sq')) return;
    event.preventDefault();
    spatialMove(target, event.key);
  });

  function dispatchKey(key, keyCode) {
    const target = document.activeElement || document.body;
    const event = new KeyboardEvent('keydown', {
      key,
      code: key === 'MediaPlayPause' ? 'MediaPlayPause' : key,
      bubbles: true,
      cancelable: true,
    });
    if (keyCode !== undefined) {
      Object.defineProperty(event, 'keyCode', { get: () => keyCode });
      Object.defineProperty(event, 'which', { get: () => keyCode });
    }
    target.dispatchEvent(event);
  }

  function activateFocused() {
    const active = document.activeElement;
    if (active?.matches('button, a[href]')) {
      active.click();
      return;
    }
    dispatchKey('Enter', 13);
  }

  const standardButtons = [0, 1, 8, 9];
  let previousButtons = new Set();
  let currentGamepadIndex = null;
  let heldDirection = null;
  let directionStartedAt = 0;
  let directionActionAt = 0;

  function pressed(gamepad, index) {
    const button = gamepad.buttons?.[index];
    return !!button && (button.pressed || button.value > 0.55);
  }

  function gamepadDirection(gamepad) {
    const dpad = [
      [12, 'ArrowUp'], [13, 'ArrowDown'], [14, 'ArrowLeft'], [15, 'ArrowRight'],
    ].find(([index]) => pressed(gamepad, index));
    if (dpad) return dpad[1];
    const x = gamepad.axes?.[0] || 0;
    const y = gamepad.axes?.[1] || 0;
    if (Math.max(Math.abs(x), Math.abs(y)) < 0.55) return null;
    if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'ArrowLeft' : 'ArrowRight';
    return y < 0 ? 'ArrowUp' : 'ArrowDown';
  }

  function processGamepad(gamepad, now) {
    if (currentGamepadIndex !== gamepad.index) {
      currentGamepadIndex = gamepad.index;
      previousButtons = new Set();
      heldDirection = null;
    }

    for (const index of standardButtons) {
      const down = pressed(gamepad, index);
      if (down && !previousButtons.has(index)) {
        if (index === 0) activateFocused();
        if (index === 1 || index === 8) dispatchKey('Escape', 27);
        if (index === 9 && isGameVisible()) pauseGame(!paused);
      }
    }

    const direction = gamepadDirection(gamepad);
    if (direction !== heldDirection) {
      heldDirection = direction;
      directionStartedAt = now;
      directionActionAt = now;
      if (direction) dispatchKey(direction);
    } else if (direction && now - directionStartedAt >= 380 && now - directionActionAt >= 150) {
      directionActionAt = now;
      dispatchKey(direction);
    }

    previousButtons = new Set(standardButtons.filter((index) => pressed(gamepad, index)));
  }

  let gamepadTimer = null;
  function pollGamepads() {
    if (document.visibilityState !== 'hidden' && typeof navigator.getGamepads === 'function') {
      let pads = [];
      try {
        pads = Array.from(navigator.getGamepads() || []);
      } catch (_) {
        pads = [];
      }
      const gamepad = pads.find((pad) => pad && pad.connected && pad.mapping === 'standard');
      if (gamepad) {
        processGamepad(gamepad, performance.now());
      } else {
        currentGamepadIndex = null;
        previousButtons = new Set();
        heldDirection = null;
      }
    }
    gamepadTimer = window.setTimeout(pollGamepads, 50);
  }

  if (typeof navigator.getGamepads === 'function') pollGamepads();
  window.addEventListener('pagehide', () => window.clearTimeout(gamepadTimer), { once: true });

  window.addEventListener('load', () => {
    decorateSquares(localBoard);
    document.querySelector('#realm-intro button')?.focus();
  }, { once: true });
})();
