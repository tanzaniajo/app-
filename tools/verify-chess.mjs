/* Verifies every board puzzle in js/subjects/chess.js, using the same rules
   engine that runs the playable game (js/chess-engine.js — itself proven by
   tools/perft.mjs). Asserts that:
     - the position is legal,
     - every offered move is legal,
     - the intended answer really is checkmate, for mate-in-one puzzles,
     - no distractor is also mate,
     - the mate is unique among all legal moves.
   Run: node tools/verify-chess.mjs */
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Chess = require(join(here, '..', 'js', 'chess-engine.js'));

const src = readFileSync(join(here, '..', 'js', 'subjects', 'chess.js'), 'utf8');
const start = src.indexOf('var PUZZLES = [');
const end = src.indexOf('\n  ];', start);
const PUZZLES = eval(src.slice(src.indexOf('[', start), end + 4));

let failures = 0;
const fail = (p, msg) => { failures++; console.log('  ✗ ' + msg + '\n    ' + p.fen); };

for (const p of PUZZLES) {
  const state = Chess.fromFen(p.fen);
  const mover = state.turn;
  const waiting = mover === Chess.WHITE ? Chess.BLACK : Chess.WHITE;
  console.log('· ' + p.ask.slice(0, 56));

  if (Chess.inCheck(state, waiting)) fail(p, 'illegal position: the side NOT to move is already in check');

  if (p.static) { console.log('  (static position — nothing to move)'); continue; }

  const legal = Chess.legalMoves(state);
  const uci = m => Chess.sqName(m.from) + Chess.sqName(m.to);
  const legalSet = new Set(legal.map(uci));

  const mateMoves = legal.filter(m => {
    const undo = Chess.make(state, m);
    const mated = Chess.status(state) === 'checkmate';
    Chess.unmake(state, m, undo);
    return mated;
  });

  const wantsMate = /mate in one/i.test(p.ask) || p.moves[0][0].includes('#');

  p.moves.forEach(([notation, move], i) => {
    if (!legalSet.has(move)) fail(p, `offered move ${notation} (${move}) is NOT legal`);
    const mates = mateMoves.some(m => uci(m) === move);
    if (i === 0 && wantsMate && !mates) fail(p, `answer ${notation} is not checkmate`);
    if (i > 0 && mates) fail(p, `distractor ${notation} is ALSO checkmate`);

    // the notation shown to the learner must match what the engine calls the move
    const found = Chess.findMove(state, move);
    if (found) {
      const realSan = Chess.san(state, found);
      if (realSan !== notation) fail(p, `notation mismatch: shown as "${notation}", engine says "${realSan}"`);
    }
  });

  if (wantsMate) {
    if (mateMoves.length === 0) fail(p, 'no mate in one exists here');
    else if (mateMoves.length > 1) fail(p, 'mate is not unique: ' + mateMoves.map(uci).join(', '));
    else console.log('  ✓ unique mate: ' + Chess.san(state, mateMoves[0]));
  } else {
    console.log('  ✓ all ' + p.moves.length + ' offered moves legal, notation matches');
  }
}

console.log(failures ? `\n${failures} problem(s) found` : `\nAll ${PUZZLES.length} puzzles verified.`);
process.exit(failures ? 1 : 0);
