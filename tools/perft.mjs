/* Perft: the standard correctness test for chess move generation.
   Counts leaf nodes to a given depth and compares against published values.
   A single mistake in castling, en passant, promotion or pinned-piece handling
   shows up here immediately.   Run: node tools/perft.mjs [maxdepth] */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Chess = require(join(here, '..', 'js', 'chess-engine.js'));

function perft(state, depth) {
  if (depth === 0) return 1;
  const moves = Chess.legalMoves(state);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) {
    const undo = Chess.make(state, m);
    nodes += perft(state, depth - 1);
    Chess.unmake(state, m, undo);
  }
  return nodes;
}

/* Published perft values (Chess Programming Wiki standard test positions). */
const POSITIONS = [
  { name: 'start position', fen: Chess.START_FEN,
    expect: [20, 400, 8902, 197281] },
  { name: 'Kiwipete', fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    expect: [48, 2039, 97862, 4085603] },
  { name: 'endgame (position 3)', fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    expect: [14, 191, 2812, 43238, 674624] },
  { name: 'promotions (position 4)', fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    expect: [6, 264, 9467, 422333] },
  { name: 'position 5', fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    expect: [44, 1486, 62379, 2103487] },
  { name: 'position 6', fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    expect: [46, 2079, 89890] }
];

const maxDepth = process.argv[2] ? +process.argv[2] : 4;
let failures = 0;

for (const pos of POSITIONS) {
  console.log('\n' + pos.name);
  for (let d = 1; d <= Math.min(maxDepth, pos.expect.length); d++) {
    const state = Chess.fromFen(pos.fen);
    const started = Date.now();
    const got = perft(state, d);
    const want = pos.expect[d - 1];
    const ms = Date.now() - started;
    if (got === want) {
      console.log(`  depth ${d}: ${got.toLocaleString()} ✓  (${ms} ms)`);
    } else {
      failures++;
      console.log(`  depth ${d}: ${got.toLocaleString()} ✗  expected ${want.toLocaleString()}`);
    }
  }
}

console.log(failures ? `\n${failures} perft mismatch(es) — move generation is wrong` : '\nPerft clean: move generation is correct.');
process.exit(failures ? 1 : 0);
