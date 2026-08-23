/* Play a game against the bot: pick a strength, pick a colour, then move by
   tapping a piece and tapping where it should go. */
(function (SH) {
  'use strict';

  var Chess = SH.Chess;
  var AI = SH.ChessAI;

  var GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  var NAME = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
  var PREF_KEY = 'studyhub.chess.elo';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function btn(cls, text, onClick) {
    var b = el('button', cls, text);
    b.type = 'button';
    b.onclick = onClick;
    return b;
  }
  function sfx(name) { if (SH.Sfx) SH.Sfx.play(name); }

  /* ---------------------------- strength picker ---------------------------- */

  function renderPicker(root, onExit) {
    root.innerHTML = '';
    var saved = null;
    try { saved = +localStorage.getItem(PREF_KEY) || null; } catch (e) {}

    var top = el('div', 'lesson-top');
    top.appendChild(btn('close-x', '✕', onExit));
    top.appendChild(el('div', 'quiz-count', 'Play chess'));
    top.appendChild(el('div', 'hud-spacer'));
    root.appendChild(top);

    var wrap = el('div', 'wrap');
    wrap.appendChild(el('div', 'mascot center', '♟️'));
    wrap.appendChild(el('h1', 'center', 'Choose your opponent'));
    wrap.appendChild(el('p', 'muted center', 'Ratings are a rough guide to strength, not official Elo.'));

    var chosen = { elo: saved || 800, color: 'w' };

    var list = el('div', 'rows');
    list.style.marginTop = '18px';
    AI.LEVELS.forEach(function (level) {
      var tile = el('button', 'tile' + (level.elo === chosen.elo ? ' sel' : ''));
      tile.type = 'button';
      tile.appendChild(el('span', 'emoji', level.elo >= 2000 ? '🤖' : level.elo >= 1600 ? '🤓' : level.elo >= 1200 ? '😎' : level.elo >= 800 ? '🙂' : '🐣'));
      var body = el('div');
      body.appendChild(el('div', null, '≈' + level.elo + '  ·  ' + level.name));
      body.appendChild(el('span', 'tile-sub', level.blurb));
      tile.appendChild(body);
      tile.onclick = function () {
        chosen.elo = level.elo;
        sfx('select');
        try { localStorage.setItem(PREF_KEY, String(level.elo)); } catch (e) {}
        renderPickerState();
      };
      list.appendChild(tile);
    });
    wrap.appendChild(list);

    wrap.appendChild(el('h2', 'section-head', ''));
    wrap.lastChild.appendChild(el('h2', null, 'Play as'));

    var sides = el('div', 'age-grid');
    sides.style.marginTop = '0';
    [['w', 'White', '♔', 'You move first'],
     ['b', 'Black', '♚', 'The bot moves first'],
     ['?', 'Random', '🎲', 'Decided by coin flip']].forEach(function (opt) {
      var t = el('button', 'tile');
      t.type = 'button';
      t.dataset.side = opt[0];
      t.appendChild(el('span', 'emoji', opt[2]));
      var body = el('div');
      body.appendChild(el('div', null, opt[1]));
      body.appendChild(el('span', 'tile-sub', opt[3]));
      t.appendChild(body);
      t.onclick = function () { chosen.color = opt[0]; sfx('select'); renderPickerState(); };
      sides.appendChild(t);
    });
    wrap.appendChild(sides);

    var start = btn('btn btn--wide', 'Start game', function () {
      var color = chosen.color === '?' ? (Math.random() < 0.5 ? 'w' : 'b') : chosen.color;
      startGame(root, chosen.elo, color, onExit);
    });
    start.style.marginTop = '20px';
    wrap.appendChild(start);
    root.appendChild(wrap);

    function renderPickerState() {
      list.querySelectorAll('.tile').forEach(function (t, i) {
        t.className = 'tile' + (AI.LEVELS[i].elo === chosen.elo ? ' sel' : '');
      });
      sides.querySelectorAll('.tile').forEach(function (t) {
        t.className = 'tile' + (t.dataset.side === chosen.color ? ' sel' : '');
      });
    }
    renderPickerState();
    window.scrollTo(0, 0);
  }

  /* --------------------------------- game --------------------------------- */

  function startGame(root, elo, playerColor, onExit) {
    var game = {
      state: Chess.createGame(),
      elo: elo,
      level: AI.levelFor(elo),
      player: playerColor,
      history: [],          // { move, undo, san }
      selected: -1,
      targets: [],
      lastMove: null,
      thinking: false,
      over: false,
      result: null,
      resultDetail: '',
      awarded: false,
      promo: null           // { from, to, options } while the picker is open
    };

    function botColor() { return game.player === 'w' ? 'b' : 'w'; }

    function finishIfOver() {
      var s = Chess.status(game.state);
      if (s === 'ongoing') return false;
      game.over = true;
      if (s === 'checkmate') {
        var loser = game.state.turn;
        game.result = loser === game.player ? 'loss' : 'win';
        game.resultDetail = 'Checkmate';
      } else {
        game.result = 'draw';
        game.resultDetail = {
          'stalemate': 'Stalemate',
          'fifty-move': 'Draw by the fifty-move rule',
          'repetition': 'Draw by threefold repetition',
          'insufficient-material': 'Draw — not enough material to mate'
        }[s] || 'Draw';
      }
      award();
      sfx(game.result === 'win' ? 'complete' : game.result === 'draw' ? 'select' : 'fail');
      return true;
    }

    /* A finished game is worth XP, the way a finished lesson is. */
    function award() {
      if (game.awarded) return;
      game.awarded = true;
      var xp = game.result === 'win' ? 25 : game.result === 'draw' ? 12 : 5;
      SH.Progress.addXp(xp, Math.max(1, Math.round(game.history.length / 2)));
      game.xpEarned = xp;
    }

    function applyMove(move) {
      var text = Chess.san(game.state, move);
      var undo = Chess.make(game.state, move);
      game.history.push({ move: move, undo: undo, san: text });
      game.lastMove = { from: move.from, to: move.to };
      game.selected = -1;
      game.targets = [];
      if (move.captured) sfx('wrong'); else sfx('move');
      if (Chess.inCheck(game.state, game.state.turn)) sfx('select');
      return text;
    }

    function botMove() {
      if (game.over) return;
      game.thinking = true;
      draw();
      // let the browser paint "thinking" before the search blocks the thread
      setTimeout(function () {
        var choice = AI.chooseMove(game.state, game.elo);
        game.thinking = false;
        if (!choice) { finishIfOver(); draw(); return; }
        applyMove(choice.move);
        finishIfOver();
        draw();
      }, 40);
    }

    function playerMove(from, to) {
      var legal = Chess.legalMoves(game.state).filter(function (m) {
        return m.from === from && m.to === to;
      });
      if (!legal.length) return;

      if (legal.length > 1 && legal[0].promo) {     // promotion: ask which piece
        game.promo = { from: from, to: to, options: legal };
        draw();
        return;
      }
      applyMove(legal[0]);
      if (!finishIfOver()) botMove();
      draw();
    }

    function selectSquare(sq) {
      if (game.over || game.thinking || game.promo) return;
      if (game.state.turn !== game.player) return;

      var piece = game.state.board[sq];
      if (game.selected >= 0 && game.targets.indexOf(sq) !== -1) {
        playerMove(game.selected, sq);
        return;
      }
      if (piece !== 0 && Chess.colorOf(piece) === game.player) {
        game.selected = sq;
        game.targets = Chess.legalMoves(game.state)
          .filter(function (m) { return m.from === sq; })
          .map(function (m) { return m.to; });
        sfx('tap');
      } else {
        game.selected = -1;
        game.targets = [];
      }
      draw();
    }

    function undoMove() {
      if (game.thinking) return;
      // take back to the player's own turn again
      var steps = 0;
      while (game.history.length && steps < 2) {
        var last = game.history.pop();
        Chess.unmake(game.state, last.move, last.undo);
        steps++;
        if (game.state.turn === game.player) break;
      }
      game.over = false;
      game.result = null;
      game.awarded = false;
      game.selected = -1;
      game.targets = [];
      var prev = game.history[game.history.length - 1];
      game.lastMove = prev ? { from: prev.move.from, to: prev.move.to } : null;
      sfx('tap');
      draw();
    }

    function resign() {
      if (game.over) return;
      game.over = true;
      game.result = 'loss';
      game.resultDetail = 'You resigned';
      award();
      sfx('fail');
      draw();
    }

    /* ------------------------------ rendering ------------------------------ */

    function materialEdge() {
      var score = { w: 0, b: 0 };
      for (var sq = 0; sq < 64; sq++) {
        var p = game.state.board[sq];
        if (p === 0) continue;
        var k = p.toLowerCase();
        if (k === 'k') continue;
        score[Chess.isWhitePiece(p) ? 'w' : 'b'] += AI.VALUE[k];
      }
      return Math.round((score[game.player] - score[botColor()]) / 100);
    }

    function drawBoard() {
      var wrap = el('div', 'board-wrap');
      var grid = el('div', 'board board--play');
      var flipped = game.player === 'b';
      var kingInCheck = Chess.inCheck(game.state, game.state.turn)
        ? Chess.findKing(game.state, game.state.turn) : -1;

      for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
          var rank = flipped ? row : 7 - row;
          var file = flipped ? 7 - col : col;
          var sq = rank * 8 + file;
          var dark = (file + rank) % 2 === 0;
          var cell = el('button', 'sq ' + (dark ? 'dark' : 'light'));
          cell.type = 'button';
          cell.setAttribute('aria-label', Chess.sqName(sq));

          if (game.lastMove && (sq === game.lastMove.from || sq === game.lastMove.to)) cell.classList.add('last');
          if (sq === game.selected) cell.classList.add('sel');
          if (sq === kingInCheck) cell.classList.add('check');

          var piece = game.state.board[sq];
          if (piece !== 0) {
            var white = Chess.isWhitePiece(piece);
            var kind = piece.toLowerCase();
            var span = el('span', 'piece ' + (white ? 'w' : 'b'), GLYPH[kind]);
            span.setAttribute('role', 'img');
            span.setAttribute('aria-label', (white ? 'white ' : 'black ') + NAME[kind]);
            cell.appendChild(span);
          }
          if (game.targets.indexOf(sq) !== -1) {
            cell.appendChild(el('span', piece !== 0 ? 'target take' : 'target'));
          }

          (function (square) { cell.onclick = function () { selectSquare(square); }; })(sq);
          grid.appendChild(cell);
        }
      }
      wrap.appendChild(grid);

      var coords = el('div', 'board-files');
      var letters = flipped ? 'hgfedcba' : 'abcdefgh';
      letters.split('').forEach(function (f) { coords.appendChild(el('span', null, f)); });
      wrap.appendChild(coords);
      return wrap;
    }

    function drawMoveList() {
      var box = el('div', 'movelist');
      for (var i = 0; i < game.history.length; i += 2) {
        var row = el('div', 'move-row');
        row.appendChild(el('span', 'move-no', (i / 2 + 1) + '.'));
        row.appendChild(el('span', 'move-san', game.history[i].san));
        row.appendChild(el('span', 'move-san', game.history[i + 1] ? game.history[i + 1].san : ''));
        box.appendChild(row);
      }
      if (!game.history.length) box.appendChild(el('div', 'muted small', 'No moves yet.'));
      setTimeout(function () { box.scrollTop = box.scrollHeight; }, 0);
      return box;
    }

    function statusLine() {
      if (game.over) return game.resultDetail;
      if (game.thinking) return 'The bot is thinking…';
      if (Chess.inCheck(game.state, game.state.turn)) {
        return game.state.turn === game.player ? 'You are in check!' : 'The bot is in check';
      }
      return game.state.turn === game.player ? 'Your move' : 'Bot to move';
    }

    function draw() {
      root.innerHTML = '';

      var top = el('div', 'lesson-top');
      top.appendChild(btn('close-x', '✕', function () { onExit(); }));
      top.appendChild(el('div', 'quiz-count', '≈' + game.elo + ' ' + game.level.name));
      top.appendChild(el('div', 'hud-spacer'));
      var edge = materialEdge();
      top.appendChild(el('span', 'stat-pill ' + (edge > 0 ? 'gem' : edge < 0 ? 'heart' : 'dim'),
        edge > 0 ? '+' + edge : edge < 0 ? String(edge) : 'even'));
      root.appendChild(top);

      var body = el('div', 'lesson-body');
      body.appendChild(el('div', 'kicker', 'you play ' + (game.player === 'w' ? 'white' : 'black')));
      body.appendChild(drawBoard());

      var status = el('div', 'play-status' + (game.over ? ' over' : ''));
      status.appendChild(el('strong', null, statusLine()));
      if (game.over && game.xpEarned) status.appendChild(el('span', 'muted', '  +' + game.xpEarned + ' XP'));
      body.appendChild(status);

      if (game.over) {
        var again = el('div', 'play-actions');
        again.appendChild(btn('btn', 'Play again', function () { startGame(root, game.elo, game.player, onExit); }));
        again.appendChild(btn('btn btn--ghost', 'Change opponent', function () { renderPicker(root, onExit); }));
        body.appendChild(again);
      } else {
        var actions = el('div', 'play-actions');
        actions.appendChild(btn('btn btn--ghost', 'Undo', undoMove));
        actions.appendChild(btn('btn btn--ghost', 'Resign', resign));
        actions.appendChild(btn('btn btn--ghost', 'New game', function () { renderPicker(root, onExit); }));
        body.appendChild(actions);
      }

      body.appendChild(el('div', 'kicker', 'moves'));
      body.appendChild(drawMoveList());
      root.appendChild(body);

      if (game.promo) drawPromotion();
    }

    function drawPromotion() {
      var back = el('div', 'modal-backdrop');
      var box = el('div', 'modal');
      box.appendChild(el('h2', null, 'Promote your pawn'));
      var row = el('div', 'promo-row');
      game.promo.options.forEach(function (m) {
        var kind = String(m.promo).toLowerCase();
        var b = el('button', 'promo-btn');
        b.type = 'button';
        b.appendChild(el('span', 'piece ' + (game.player === 'w' ? 'w' : 'b'), GLYPH[kind]));
        b.appendChild(el('span', 'promo-name', NAME[kind]));
        b.onclick = function () {
          game.promo = null;
          document.body.removeChild(back);
          applyMove(m);
          if (!finishIfOver()) botMove();
          draw();
        };
        row.appendChild(b);
      });
      box.appendChild(row);
      back.appendChild(box);
      document.body.appendChild(back);
    }

    /* test hook: tools and the browser tests drive real games through this */
    SH._game = {
      get: function () { return game; },
      fen: function () { return Chess.toFen(game.state); },
      move: function (from, to) { playerMove(Chess.nameToSq(from), Chess.nameToSq(to)); },
      select: function (name) { selectSquare(Chess.nameToSq(name)); },
      load: function (fen) {
        game.state = Chess.createGame(fen);
        game.history = [];
        game.lastMove = null;
        game.selected = -1;
        game.targets = [];
        game.over = false;
        game.result = null;
        draw();
        if (game.state.turn !== game.player) botMove();
      },
      redraw: draw
    };

    draw();
    window.scrollTo(0, 0);
    if (game.state.turn !== game.player) botMove();
  }

  SH.startPlay = function (root, opts) {
    renderPicker(root, opts.onExit);
  };
})(window.StudyHub);
