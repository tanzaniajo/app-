/* The opponent: negamax with alpha-beta, quiescence search and piece-square
   evaluation, wrapped in strength levels.

   A weaker level is not just a shallower search — it also plays humanly bad moves,
   because a purely shallow engine still never hangs a queen and feels nothing like
   a beginner. Each level mixes: search depth, a "noise" window that lets it pick
   any move close to the best, and an outright blunder chance.

   Ratings are approximations for picking an opponent, not calibrated Elo. */
(function (root, factory) {
  var api = factory(typeof module === 'object' && module.exports
    ? require('./chess-engine.js')
    : root.StudyHub.Chess);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.StudyHub = root.StudyHub || {}; root.StudyHub.ChessAI = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Chess) {
  'use strict';

  var VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  var MATE = 100000;

  /* Piece-square tables, written from White's view with a8 first. */
  var PST = {
    p: [ 0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20],
    r: [  0,  0,  0,  0,  0,  0,  0,  0,
          5, 10, 10, 10, 10, 10, 10,  5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
          0,  0,  0,  5,  5,  0,  0,  0],
    q: [-20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20],
    kEnd: [-50,-40,-30,-20,-20,-30,-40,-50,
           -30,-20,-10,  0,  0,-10,-20,-30,
           -30,-10, 20, 30, 30, 20,-10,-30,
           -30,-10, 30, 40, 40, 30,-10,-30,
           -30,-10, 30, 40, 40, 30,-10,-30,
           -30,-10, 20, 30, 30, 20,-10,-30,
           -30,-30,  0,  0,  0,  0,-30,-30,
           -50,-30,-30,-30,-30,-30,-30,-50]
  };

  function pstValue(table, sq, white) {
    var file = Chess.fileOf(sq), rank = Chess.rankOf(sq);
    return table[white ? (7 - rank) * 8 + file : rank * 8 + file];
  }

  /* Score from the side-to-move's point of view. */
  function evaluate(state) {
    var board = state.board;
    var score = 0, material = 0;
    var bishops = { w: 0, b: 0 };
    var sq, p;

    for (sq = 0; sq < 64; sq++) {
      p = board[sq];
      if (p === 0) continue;
      var kind = p.toLowerCase();
      if (kind !== 'k' && kind !== 'p') material += VALUE[kind];
    }
    var endgame = material < 1800;

    for (sq = 0; sq < 64; sq++) {
      p = board[sq];
      if (p === 0) continue;
      var white = Chess.isWhitePiece(p);
      var k = p.toLowerCase();
      var value = VALUE[k] + pstValue(k === 'k' && endgame ? PST.kEnd : PST[k], sq, white);
      score += white ? value : -value;
      if (k === 'b') bishops[white ? 'w' : 'b']++;
    }

    if (bishops.w >= 2) score += 30;      // the bishop pair is worth about a third of a pawn
    if (bishops.b >= 2) score -= 30;

    return state.turn === Chess.WHITE ? score : -score;
  }

  /* Most Valuable Victim / Least Valuable Attacker, so good captures are tried first. */
  function scoreMove(move) {
    var s = 0;
    if (move.captured) s += 10 * VALUE[String(move.captured).toLowerCase()] - VALUE[String(move.piece).toLowerCase()];
    if (move.promo) s += VALUE[String(move.promo).toLowerCase()];
    return s;
  }
  function ordered(moves) {
    return moves.slice().sort(function (a, b) { return scoreMove(b) - scoreMove(a); });
  }

  /* Search captures only, so we never stop counting in the middle of a trade. */
  function outOfTime(budget) {
    if (budget.stop) return true;
    if (budget.nodes > budget.max) { budget.stop = true; return true; }
    // checking the clock is not free, so only do it every so often
    if ((budget.nodes & 2047) === 0 && budget.deadline && Date.now() > budget.deadline) {
      budget.stop = true;
      return true;
    }
    return false;
  }

  function quiesce(state, alpha, beta, budget) {
    budget.nodes++;
    var stand = evaluate(state);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (outOfTime(budget)) return alpha;

    var captures = ordered(Chess.legalCaptures(state));
    for (var i = 0; i < captures.length; i++) {
      var undo = Chess.make(state, captures[i]);
      var score = -quiesce(state, -beta, -alpha, budget);
      Chess.unmake(state, captures[i], undo);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function negamax(state, depth, alpha, beta, ply, budget) {
    budget.nodes++;
    if (outOfTime(budget)) return evaluate(state);

    var moves = Chess.legalMoves(state);
    if (moves.length === 0) {
      return Chess.inCheck(state, state.turn) ? -(MATE - ply) : 0;   // mate or stalemate
    }
    if (state.halfmove >= 100 || Chess.repetitionCount(state) >= 3) return 0;
    if (depth === 0) return quiesce(state, alpha, beta, budget);

    moves = ordered(moves);
    for (var i = 0; i < moves.length; i++) {
      var undo = Chess.make(state, moves[i]);
      var score = -negamax(state, depth - 1, -beta, -alpha, ply + 1, budget);
      Chess.unmake(state, moves[i], undo);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  /* How far below the best a root move may score and still be scored exactly.
     It must exceed the widest "noise" window any level uses. */
  var ROOT_WINDOW = 200;

  /* Search the root with iterative deepening.

     Two things keep this fast enough to play in a browser without freezing it:
     the alpha bound is carried from one root move to the next instead of every
     move starting from scratch, and each deeper iteration reorders the moves by
     the previous iteration's scores. A wall-clock deadline stops the search
     wherever it is, and the last completed depth is the one that gets used. */
  function rankMoves(state, depth, maxNodes, timeMs) {
    var budget = { nodes: 0, max: maxNodes || 400000, deadline: timeMs ? Date.now() + timeMs : 0, stop: false };
    var moves = ordered(Chess.legalMoves(state));
    var result = moves.map(function (m) { return { move: m, score: 0 }; });
    if (moves.length <= 1) return { moves: result, nodes: 0, depth: 0 };

    var reached = 0;
    for (var d = 1; d <= depth; d++) {
      var scored = [], alpha = -MATE, aborted = false;

      for (var i = 0; i < moves.length; i++) {
        var undo = Chess.make(state, moves[i]);
        // moves far below the best cannot matter, so search those in a narrow window
        var lower = i === 0 ? -MATE : alpha - ROOT_WINDOW;
        var score = -negamax(state, d - 1, -MATE, -lower, 1, budget);
        Chess.unmake(state, moves[i], undo);
        if (budget.stop) { aborted = true; break; }
        scored.push({ move: moves[i], score: score });
        if (score > alpha) alpha = score;
      }

      if (aborted) break;
      scored.sort(function (a, b) { return b.score - a.score; });
      result = scored;
      reached = d;
      moves = scored.map(function (x) { return x.move; });      // best-first next time
      if (Math.abs(result[0].score) > MATE - 1000) break;       // mate found, stop early
      if (budget.deadline && Date.now() > budget.deadline) break;
    }

    return { moves: result, nodes: budget.nodes, depth: reached };
  }

  var LEVELS = [
    { elo: 400,  name: 'Beginner',     blurb: 'Misses simple threats and gives pieces away',
      depth: 1, blunder: 0.45, noise: 150, nodes: 40000,   timeMs: 120 },
    { elo: 800,  name: 'Casual',       blurb: 'Takes free material, overlooks tactics',
      depth: 2, blunder: 0.22, noise: 90,  nodes: 120000,  timeMs: 250 },
    { elo: 1200, name: 'Club player',  blurb: 'Punishes hanging pieces and one-move threats',
      depth: 4, blunder: 0.08, noise: 45,  nodes: 400000,  timeMs: 600 },
    { elo: 1600, name: 'Strong',       blurb: 'Sees short tactics and defends accurately',
      depth: 6, blunder: 0.02, noise: 18,  nodes: 1200000, timeMs: 1200 },
    { elo: 2000, name: 'Expert',       blurb: 'Searches as deep as the time allows',
      depth: 8, blunder: 0,    noise: 0,   nodes: 3000000, timeMs: 2000 }
  ];

  function levelFor(elo) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].elo === elo) return LEVELS[i];
    return LEVELS[2];
  }

  /* Pick a move for the given strength. */
  function chooseMove(state, elo) {
    var level = levelFor(elo);
    var legal = Chess.legalMoves(state);
    if (!legal.length) return null;

    // an outright blunder: play something legal without looking at it properly.
    // Even a beginner takes a free queen, so never blunder away an obvious capture.
    if (level.blunder > 0 && Math.random() < level.blunder) {
      var quiet = legal.filter(function (m) { return !m.captured || VALUE[String(m.captured).toLowerCase()] < 300; });
      var pool = quiet.length ? quiet : legal;
      return { move: pool[Math.floor(Math.random() * pool.length)], level: level, blundered: true };
    }

    var ranked = rankMoves(state, level.depth, level.nodes, level.timeMs);
    var best = ranked.moves[0];

    // among moves close to the best, choose freely — this is what makes a
    // weaker opponent feel varied rather than robotic
    var window = level.noise;
    var candidates = ranked.moves.filter(function (m) { return best.score - m.score <= window; });
    var pick = candidates[Math.floor(Math.random() * candidates.length)] || best;

    return { move: pick.move, score: pick.score, best: best.score, level: level,
             nodes: ranked.nodes, depth: ranked.depth };
  }

  return {
    evaluate: evaluate,
    rankMoves: rankMoves,
    chooseMove: chooseMove,
    LEVELS: LEVELS,
    levelFor: levelFor,
    MATE: MATE,
    VALUE: VALUE
  };
});
