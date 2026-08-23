/* A complete chess rules engine: move generation, castling, en passant,
   promotion, check, checkmate, stalemate and the drawing rules.

   Squares are 0–63 with a1 = 0 and h8 = 63, so file = sq & 7 and rank = sq >> 3.
   Moves are made and unmade in place, because the search needs to be fast.

   Loaded by the browser as StudyHub.Chess, and by the tools in tools/ as a module,
   so the code that runs your game is the same code the tests check. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.StudyHub = root.StudyHub || {}; root.StudyHub.Chess = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var WHITE = 'w', BLACK = 'b';
  var FILES = 'abcdefgh';

  function fileOf(sq) { return sq & 7; }
  function rankOf(sq) { return sq >> 3; }
  function sqName(sq) { return FILES.charAt(fileOf(sq)) + (rankOf(sq) + 1); }
  function nameToSq(name) { return (parseInt(name.charAt(1), 10) - 1) * 8 + FILES.indexOf(name.charAt(0)); }
  function isWhitePiece(p) { return p !== 0 && p === p.toUpperCase(); }
  function colorOf(p) { return isWhitePiece(p) ? WHITE : BLACK; }

  var KNIGHT_DELTAS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var KING_DELTAS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var QUEEN_DIRS = ROOK_DIRS.concat(BISHOP_DIRS);

  /* Walk one step from a square; returns -1 if it leaves the board. */
  function step(sq, df, dr) {
    var f = fileOf(sq) + df, r = rankOf(sq) + dr;
    if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
    return r * 8 + f;
  }

  /* ------------------------------ position ------------------------------ */

  function fromFen(fen) {
    var parts = fen.trim().split(/\s+/);
    var board = new Array(64).fill(0);
    var rows = parts[0].split('/');
    for (var r = 0; r < 8; r++) {
      var rank = 7 - r, file = 0;
      var row = rows[r];
      for (var i = 0; i < row.length; i++) {
        var ch = row.charAt(i);
        if (ch >= '1' && ch <= '8') file += +ch;
        else board[rank * 8 + file++] = ch;
      }
    }
    var rights = parts[2] || '-';
    var state = {
      board: board,
      turn: (parts[1] || 'w') === 'b' ? BLACK : WHITE,
      castling: {
        K: rights.indexOf('K') !== -1, Q: rights.indexOf('Q') !== -1,
        k: rights.indexOf('k') !== -1, q: rights.indexOf('q') !== -1
      },
      ep: (parts[3] && parts[3] !== '-') ? nameToSq(parts[3]) : -1,
      halfmove: parts[4] ? +parts[4] : 0,
      fullmove: parts[5] ? +parts[5] : 1,
      history: []
    };
    state.history.push(positionKey(state));
    return state;
  }

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  function create(fen) { return fromFen(fen || START_FEN); }

  function toFen(state) {
    var rows = [];
    for (var r = 7; r >= 0; r--) {
      var row = '', empty = 0;
      for (var f = 0; f < 8; f++) {
        var p = state.board[r * 8 + f];
        if (p === 0) empty++;
        else { if (empty) { row += empty; empty = 0; } row += p; }
      }
      if (empty) row += empty;
      rows.push(row);
    }
    var rights = (state.castling.K ? 'K' : '') + (state.castling.Q ? 'Q' : '') +
                 (state.castling.k ? 'k' : '') + (state.castling.q ? 'q' : '');
    return rows.join('/') + ' ' + state.turn + ' ' + (rights || '-') + ' ' +
           (state.ep >= 0 ? sqName(state.ep) : '-') + ' ' + state.halfmove + ' ' + state.fullmove;
  }

  /* Everything that defines a repetition: pieces, side to move, rights, en passant. */
  function positionKey(state) {
    var f = toFen(state).split(' ');
    return f[0] + ' ' + f[1] + ' ' + f[2] + ' ' + f[3];
  }

  function findKing(state, color) {
    var target = color === WHITE ? 'K' : 'k';
    for (var sq = 0; sq < 64; sq++) if (state.board[sq] === target) return sq;
    return -1;
  }

  /* Is `sq` attacked by `byColor`?  Used for check and for castling legality. */
  function attacked(state, sq, byColor) {
    var board = state.board;
    var white = byColor === WHITE;
    var i, s, d;

    // pawns: a white pawn on s attacks s+7/s+9, so look backwards from sq
    var pawn = white ? 'P' : 'p';
    var dr = white ? -1 : 1;
    for (i = 0; i < 2; i++) {
      s = step(sq, i === 0 ? -1 : 1, dr);
      if (s >= 0 && board[s] === pawn) return true;
    }

    var knight = white ? 'N' : 'n';
    for (i = 0; i < KNIGHT_DELTAS.length; i++) {
      s = step(sq, KNIGHT_DELTAS[i][0], KNIGHT_DELTAS[i][1]);
      if (s >= 0 && board[s] === knight) return true;
    }

    var king = white ? 'K' : 'k';
    for (i = 0; i < KING_DELTAS.length; i++) {
      s = step(sq, KING_DELTAS[i][0], KING_DELTAS[i][1]);
      if (s >= 0 && board[s] === king) return true;
    }

    var rook = white ? 'R' : 'r', bishop = white ? 'B' : 'b', queen = white ? 'Q' : 'q';
    for (i = 0; i < QUEEN_DIRS.length; i++) {
      d = QUEEN_DIRS[i];
      var diagonal = d[0] !== 0 && d[1] !== 0;
      s = step(sq, d[0], d[1]);
      while (s >= 0) {
        var p = board[s];
        if (p !== 0) {
          if (p === queen || p === (diagonal ? bishop : rook)) return true;
          break;
        }
        s = step(s, d[0], d[1]);
      }
    }
    return false;
  }

  function inCheck(state, color) {
    var king = findKing(state, color);
    if (king < 0) return false;
    return attacked(state, king, color === WHITE ? BLACK : WHITE);
  }

  /* ---------------------------- move generation ---------------------------- */

  function addMove(list, from, to, piece, captured, extra) {
    var m = { from: from, to: to, piece: piece, captured: captured || 0, promo: 0, ep: false, castle: 0 };
    if (extra) for (var k in extra) m[k] = extra[k];
    list.push(m);
  }

  /* Pseudo-legal: does not yet check whether the mover's own king is left in check. */
  function pseudoMoves(state, color, capturesOnly) {
    var board = state.board;
    var list = [];
    var white = color === WHITE;

    for (var from = 0; from < 64; from++) {
      var piece = board[from];
      if (piece === 0 || colorOf(piece) !== color) continue;
      var kind = piece.toLowerCase();
      var i, to, d, target;

      if (kind === 'p') {
        var dr = white ? 1 : -1;
        var startRank = white ? 1 : 6;
        var promoRank = white ? 7 : 0;
        var promos = white ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];

        to = step(from, 0, dr);
        if (!capturesOnly && to >= 0 && board[to] === 0) {
          if (rankOf(to) === promoRank) {
            for (i = 0; i < 4; i++) addMove(list, from, to, piece, 0, { promo: promos[i] });
          } else {
            addMove(list, from, to, piece, 0);
            if (rankOf(from) === startRank) {
              var two = step(from, 0, dr * 2);
              if (two >= 0 && board[two] === 0) addMove(list, from, two, piece, 0, { doublePush: true });
            }
          }
        }
        for (i = -1; i <= 1; i += 2) {
          to = step(from, i, dr);
          if (to < 0) continue;
          target = board[to];
          if (target !== 0 && colorOf(target) !== color) {
            if (rankOf(to) === promoRank) {
              for (var j = 0; j < 4; j++) addMove(list, from, to, piece, target, { promo: promos[j] });
            } else addMove(list, from, to, piece, target);
          } else if (target === 0 && to === state.ep) {
            addMove(list, from, to, piece, white ? 'p' : 'P', { ep: true });
          }
        }
        continue;
      }

      if (kind === 'n' || kind === 'k') {
        var deltas = kind === 'n' ? KNIGHT_DELTAS : KING_DELTAS;
        for (i = 0; i < deltas.length; i++) {
          to = step(from, deltas[i][0], deltas[i][1]);
          if (to < 0) continue;
          target = board[to];
          if (target !== 0 && colorOf(target) === color) continue;
          if (capturesOnly && target === 0) continue;
          addMove(list, from, to, piece, target);
        }
        continue;
      }

      var dirs = kind === 'r' ? ROOK_DIRS : kind === 'b' ? BISHOP_DIRS : QUEEN_DIRS;
      for (i = 0; i < dirs.length; i++) {
        d = dirs[i];
        to = step(from, d[0], d[1]);
        while (to >= 0) {
          target = board[to];
          if (target === 0) {
            if (!capturesOnly) addMove(list, from, to, piece, 0);
          } else {
            if (colorOf(target) !== color) addMove(list, from, to, piece, target);
            break;
          }
          to = step(to, d[0], d[1]);
        }
      }
    }

    /* Castling: rights intact, squares empty, and the king neither starts in,
       passes through, nor lands on an attacked square. */
    if (!capturesOnly) {
      var enemy = white ? BLACK : WHITE;
      var kingSq = white ? 4 : 60;
      if (board[kingSq] === (white ? 'K' : 'k') && !attacked(state, kingSq, enemy)) {
        var canShort = white ? state.castling.K : state.castling.k;
        var canLong = white ? state.castling.Q : state.castling.q;
        var rookShort = white ? 7 : 63, rookLong = white ? 0 : 56;

        if (canShort && board[rookShort] === (white ? 'R' : 'r') &&
            board[kingSq + 1] === 0 && board[kingSq + 2] === 0 &&
            !attacked(state, kingSq + 1, enemy) && !attacked(state, kingSq + 2, enemy)) {
          addMove(list, kingSq, kingSq + 2, board[kingSq], 0, { castle: 'K' });
        }
        if (canLong && board[rookLong] === (white ? 'R' : 'r') &&
            board[kingSq - 1] === 0 && board[kingSq - 2] === 0 && board[kingSq - 3] === 0 &&
            !attacked(state, kingSq - 1, enemy) && !attacked(state, kingSq - 2, enemy)) {
          addMove(list, kingSq, kingSq - 2, board[kingSq], 0, { castle: 'Q' });
        }
      }
    }

    return list;
  }

  function make(state, move) {
    var board = state.board;
    var undo = {
      castling: { K: state.castling.K, Q: state.castling.Q, k: state.castling.k, q: state.castling.q },
      ep: state.ep, halfmove: state.halfmove, fullmove: state.fullmove,
      captured: move.captured, capturedSq: move.to
    };

    var white = colorOf(move.piece) === WHITE;

    if (move.ep) {
      undo.capturedSq = white ? move.to - 8 : move.to + 8;
      board[undo.capturedSq] = 0;
    }

    board[move.to] = move.promo || move.piece;
    board[move.from] = 0;

    if (move.castle) {
      var rookFrom = move.castle === 'K' ? (white ? 7 : 63) : (white ? 0 : 56);
      var rookTo = move.castle === 'K' ? move.to - 1 : move.to + 1;
      board[rookTo] = board[rookFrom];
      board[rookFrom] = 0;
      undo.rookFrom = rookFrom;
      undo.rookTo = rookTo;
    }

    // castling rights fall away when a king or rook leaves, or a rook is captured
    var kind = move.piece.toLowerCase();
    if (kind === 'k') {
      if (white) { state.castling.K = state.castling.Q = false; }
      else { state.castling.k = state.castling.q = false; }
    }
    if (move.from === 0 || move.to === 0) state.castling.Q = false;
    if (move.from === 7 || move.to === 7) state.castling.K = false;
    if (move.from === 56 || move.to === 56) state.castling.q = false;
    if (move.from === 63 || move.to === 63) state.castling.k = false;

    state.ep = move.doublePush ? (white ? move.from + 8 : move.from - 8) : -1;
    state.halfmove = (kind === 'p' || move.captured) ? 0 : state.halfmove + 1;
    if (!white) state.fullmove++;
    state.turn = white ? BLACK : WHITE;
    state.history.push(positionKey(state));
    return undo;
  }

  function unmake(state, move, undo) {
    var board = state.board;
    state.history.pop();
    state.turn = colorOf(move.piece);
    state.castling = undo.castling;
    state.ep = undo.ep;
    state.halfmove = undo.halfmove;
    state.fullmove = undo.fullmove;

    board[move.from] = move.piece;
    board[move.to] = 0;
    if (move.captured) board[undo.capturedSq] = move.captured;

    if (move.castle) {
      board[undo.rookFrom] = board[undo.rookTo];
      board[undo.rookTo] = 0;
    }
  }

  function legalMoves(state, color) {
    color = color || state.turn;
    var pseudo = pseudoMoves(state, color);
    var out = [];
    for (var i = 0; i < pseudo.length; i++) {
      var m = pseudo[i];
      var undo = make(state, m);
      if (!inCheck(state, color)) out.push(m);
      unmake(state, m, undo);
    }
    return out;
  }

  function legalCaptures(state, color) {
    color = color || state.turn;
    var pseudo = pseudoMoves(state, color, true);
    var out = [];
    for (var i = 0; i < pseudo.length; i++) {
      var m = pseudo[i];
      var undo = make(state, m);
      if (!inCheck(state, color)) out.push(m);
      unmake(state, m, undo);
    }
    return out;
  }

  /* ------------------------------- outcomes ------------------------------- */

  function insufficientMaterial(state) {
    var pieces = [];
    for (var sq = 0; sq < 64; sq++) {
      var p = state.board[sq];
      if (p === 0 || p.toLowerCase() === 'k') continue;
      pieces.push({ kind: p.toLowerCase(), light: (fileOf(sq) + rankOf(sq)) % 2 === 1, white: isWhitePiece(p) });
    }
    if (pieces.length === 0) return true;                                   // K v K
    if (pieces.length === 1) return pieces[0].kind === 'b' || pieces[0].kind === 'n';  // K+minor v K
    if (pieces.length === 2 && pieces[0].kind === 'b' && pieces[1].kind === 'b' &&
        pieces[0].white !== pieces[1].white && pieces[0].light === pieces[1].light) return true;
    return false;
  }

  function repetitionCount(state) {
    var key = state.history[state.history.length - 1];
    var n = 0;
    for (var i = 0; i < state.history.length; i++) if (state.history[i] === key) n++;
    return n;
  }

  /* 'ongoing' | 'checkmate' | 'stalemate' | 'fifty-move' | 'repetition' | 'insufficient-material' */
  function status(state) {
    if (legalMoves(state).length === 0) return inCheck(state, state.turn) ? 'checkmate' : 'stalemate';
    if (insufficientMaterial(state)) return 'insufficient-material';
    if (state.halfmove >= 100) return 'fifty-move';
    if (repetitionCount(state) >= 3) return 'repetition';
    return 'ongoing';
  }

  function isCheckmate(state) { return status(state) === 'checkmate'; }
  function isStalemate(state) { return status(state) === 'stalemate'; }

  /* --------------------------------- SAN --------------------------------- */

  function san(state, move) {
    if (move.castle) {
      var text = move.castle === 'K' ? 'O-O' : 'O-O-O';
      return text + checkSuffix(state, move);
    }
    var kind = move.piece.toLowerCase();
    var out = '';

    if (kind === 'p') {
      if (move.captured) out += FILES.charAt(fileOf(move.from)) + 'x';
      out += sqName(move.to);
      if (move.promo) out += '=' + move.promo.toUpperCase();
    } else {
      out += move.piece.toUpperCase();
      // disambiguate against other identical pieces that could also go there
      var rivals = legalMoves(state, state.turn).filter(function (m) {
        return m.piece === move.piece && m.to === move.to && m.from !== move.from;
      });
      if (rivals.length) {
        var sameFile = rivals.some(function (m) { return fileOf(m.from) === fileOf(move.from); });
        var sameRank = rivals.some(function (m) { return rankOf(m.from) === rankOf(move.from); });
        if (!sameFile) out += FILES.charAt(fileOf(move.from));
        else if (!sameRank) out += (rankOf(move.from) + 1);
        else out += sqName(move.from);
      }
      if (move.captured) out += 'x';
      out += sqName(move.to);
    }
    return out + checkSuffix(state, move);
  }

  function checkSuffix(state, move) {
    var undo = make(state, move);
    var suffix = '';
    if (inCheck(state, state.turn)) suffix = legalMoves(state).length === 0 ? '#' : '+';
    unmake(state, move, undo);
    return suffix;
  }

  /* Find a legal move from "e2e4", "e7e8q", or a SAN string like "Nf3". */
  function findMove(state, notation) {
    var moves = legalMoves(state);
    var i;
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(notation)) {
      var from = nameToSq(notation.slice(0, 2)), to = nameToSq(notation.slice(2, 4));
      var promo = notation.charAt(4);
      for (i = 0; i < moves.length; i++) {
        if (moves[i].from !== from || moves[i].to !== to) continue;
        if (promo && String(moves[i].promo).toLowerCase() !== promo) continue;
        if (!promo && moves[i].promo && moves[i].promo.toLowerCase() !== 'q') continue;
        return moves[i];
      }
      return null;
    }
    for (i = 0; i < moves.length; i++) if (san(state, moves[i]) === notation) return moves[i];
    for (i = 0; i < moves.length; i++) if (san(state, moves[i]).replace(/[+#]/g, '') === notation.replace(/[+#]/g, '')) return moves[i];
    return null;
  }

  function clone(state) {
    var copy = fromFen(toFen(state));
    copy.history = state.history.slice();
    return copy;
  }

  return {
    WHITE: WHITE, BLACK: BLACK, START_FEN: START_FEN,
    create: create, fromFen: fromFen, toFen: toFen, clone: clone,
    legalMoves: legalMoves, legalCaptures: legalCaptures, pseudoMoves: pseudoMoves,
    make: make, unmake: unmake,
    inCheck: inCheck, attacked: attacked, findKing: findKing,
    status: status, isCheckmate: isCheckmate, isStalemate: isStalemate,
    insufficientMaterial: insufficientMaterial, repetitionCount: repetitionCount,
    san: san, findMove: findMove,
    sqName: sqName, nameToSq: nameToSq, fileOf: fileOf, rankOf: rankOf,
    isWhitePiece: isWhitePiece, colorOf: colorOf
  };
});
