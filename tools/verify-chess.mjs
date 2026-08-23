/* Verifies every board puzzle in js/subjects/chess.js against real chess rules.
   Generates legal moves from each FEN and asserts that:
     - every offered move is legal,
     - the intended answer really is checkmate (for mate-in-one puzzles),
     - no other offered move is also mate,
     - for mate puzzles the solution is unique among ALL legal moves.
   Run: node tools/verify-chess.mjs */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

/* ---------- board representation: 0x88-free simple 8x8 array ---------- */
const FILES = 'abcdefgh';

function parseFen(fen) {
  const [placement, turn, castling, ep] = fen.split(' ');
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  let rank = 7, file = 0;
  for (const ch of placement) {
    if (ch === '/') { rank--; file = 0; }
    else if (/\d/.test(ch)) file += +ch;
    else { board[rank][file++] = ch; }
  }
  return { board, turn, castling, ep: ep === '-' ? null : ep };
}

const isWhite = p => p && p === p.toUpperCase();
const sq = (f, r) => FILES[f] + (r + 1);
const parseSq = s => [FILES.indexOf(s[0]), +s[1] - 1];
const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;

const SLIDES = {
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
};
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const KING = SLIDES.q;

/* Pseudo-legal moves (no self-check filtering, no castling — puzzle FENs use "-"). */
function pseudoMoves(state, white) {
  const { board, ep } = state;
  const out = [];
  const add = (f, r, tf, tr, promo) => out.push({ from: sq(f, r), to: sq(tf, tr), promo });

  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const p = board[r][f];
    if (!p || isWhite(p) !== white) continue;
    const kind = p.toLowerCase();

    if (kind === 'p') {
      const dir = white ? 1 : -1;
      const startRank = white ? 1 : 6;
      const lastRank = white ? 7 : 0;
      if (onBoard(f, r + dir) && !board[r + dir][f]) {
        if (r + dir === lastRank) add(f, r, f, r + dir, 'q'); else add(f, r, f, r + dir);
        if (r === startRank && !board[r + 2 * dir][f]) add(f, r, f, r + 2 * dir);
      }
      for (const df of [-1, 1]) {
        const tf = f + df, tr = r + dir;
        if (!onBoard(tf, tr)) continue;
        const target = board[tr][tf];
        if ((target && isWhite(target) !== white) || (ep && sq(tf, tr) === ep)) {
          if (tr === lastRank) add(f, r, tf, tr, 'q'); else add(f, r, tf, tr);
        }
      }
      continue;
    }

    if (kind === 'n' || kind === 'k') {
      for (const [df, dr] of (kind === 'n' ? KNIGHT : KING)) {
        const tf = f + df, tr = r + dr;
        if (!onBoard(tf, tr)) continue;
        const target = board[tr][tf];
        if (!target || isWhite(target) !== white) add(f, r, tf, tr);
      }
      continue;
    }

    for (const [df, dr] of SLIDES[kind]) {
      let tf = f + df, tr = r + dr;
      while (onBoard(tf, tr)) {
        const target = board[tr][tf];
        if (!target) add(f, r, tf, tr);
        else { if (isWhite(target) !== white) add(f, r, tf, tr); break; }
        tf += df; tr += dr;
      }
    }
  }
  return out;
}

function applyMove(state, move) {
  const board = state.board.map(row => row.slice());
  const [ff, fr] = parseSq(move.from), [tf, tr] = parseSq(move.to);
  const piece = board[fr][ff];
  // en passant capture removes a pawn that is not on the destination square
  if (piece.toLowerCase() === 'p' && state.ep === move.to && !board[tr][tf]) {
    board[isWhite(piece) ? tr - 1 : tr + 1][tf] = null;
  }
  board[tr][tf] = move.promo ? (isWhite(piece) ? move.promo.toUpperCase() : move.promo) : piece;
  board[fr][ff] = null;
  return { board, turn: state.turn === 'w' ? 'b' : 'w', castling: '-', ep: null };
}

function findKing(state, white) {
  const target = white ? 'K' : 'k';
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) if (state.board[r][f] === target) return sq(f, r);
  return null;
}

function inCheck(state, white) {
  const king = findKing(state, white);
  return pseudoMoves(state, !white).some(m => m.to === king);
}

function legalMoves(state, white) {
  return pseudoMoves(state, white).filter(m => !inCheck(applyMove(state, m), white));
}

function isCheckmate(state, white) {
  return inCheck(state, white) && legalMoves(state, white).length === 0;
}

/* ---------- pull the puzzle table out of the subject module ---------- */
const src = readFileSync(join(here, '..', 'js', 'subjects', 'chess.js'), 'utf8');
const start = src.indexOf('var PUZZLES = [');
const end = src.indexOf('\n  ];', start);
const literal = src.slice(src.indexOf('[', start), end + 4);
const PUZZLES = eval(literal);

/* ---------- checks ---------- */
let failures = 0;
const fail = (p, msg) => { failures++; console.log('  ✗ ' + msg + '\n    ' + p.fen); };

for (const p of PUZZLES) {
  const state = parseFen(p.fen);
  const white = state.turn === 'w';
  const label = p.ask.slice(0, 52);
  console.log('· ' + label);

  if (inCheck(state, !white)) fail(p, 'illegal position: the side NOT to move is already in check');

  if (p.static) { console.log('  (static position, no move to verify)'); continue; }

  const legal = legalMoves(state, white);
  const legalSet = new Set(legal.map(m => m.from + m.to));
  const mateMoves = legal.filter(m => isCheckmate(applyMove(state, m), !white));
  const wantsMate = /mate in one/i.test(p.ask) || p.moves[0][0].includes('#');

  p.moves.forEach(([san, uci], i) => {
    if (!legalSet.has(uci)) fail(p, `offered move ${san} (${uci}) is NOT legal`);
    const mates = mateMoves.some(m => m.from + m.to === uci);
    if (i === 0 && wantsMate && !mates) fail(p, `answer ${san} is not checkmate`);
    if (i > 0 && mates) fail(p, `distractor ${san} is ALSO checkmate`);
  });

  if (wantsMate) {
    if (mateMoves.length === 0) fail(p, 'no mate in one exists here');
    else if (mateMoves.length > 1) fail(p, 'mate is not unique: ' + mateMoves.map(m => m.from + m.to).join(', '));
    else console.log('  ✓ unique mate: ' + mateMoves[0].from + mateMoves[0].to);
  } else {
    console.log('  ✓ all ' + p.moves.length + ' offered moves legal');
  }
}

console.log(failures ? `\n${failures} problem(s) found` : `\nAll ${PUZZLES.length} puzzles verified.`);
process.exit(failures ? 1 : 0);
