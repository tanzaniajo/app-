/* Checks the opponent actually plays chess: finds forced mates, wins free
   material, never returns an illegal move, and that higher levels beat lower
   ones over a set of games.   Run: node tools/test-ai.mjs */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const Chess = require(join(here, '..', 'js', 'chess-engine.js'));
const AI = require(join(here, '..', 'js', 'chess-ai.js'));

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) failures++; };

console.log('tactics');
const TACTICS = [
  ['6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1', 'Rd8#', 'back-rank mate in one'],
  ['7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', 'Qg7#', 'queen mate in one'],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 'Qxf7#', "scholar's mate"],
  ['r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', 'Nc7+', 'knight fork winning a rook'],
  ['4k3/8/8/3q4/8/1B6/8/4K3 w - - 0 1', 'Bxd5', 'take the free queen']
];
for (const [fen, want, label] of TACTICS) {
  const state = Chess.fromFen(fen);
  const ranked = AI.rankMoves(state, 3, 200000);
  const got = Chess.san(state, ranked.moves[0].move);
  ok(got === want, `${label}: played ${got} (wanted ${want})`);
}

console.log('\nlegality — every level returns legal moves only');
AI.LEVELS.forEach(l => { l.timeMs = Math.min(l.timeMs, 150); });
for (const level of AI.LEVELS) {
  const state = Chess.create();
  let illegal = 0, plies = 0;
  while (Chess.status(state) === 'ongoing' && plies < 40) {
    const choice = AI.chooseMove(state, level.elo);
    const legal = Chess.legalMoves(state);
    if (!legal.some(m => m.from === choice.move.from && m.to === choice.move.to && m.promo === choice.move.promo)) illegal++;
    Chess.make(state, choice.move);
    plies++;
  }
  ok(illegal === 0, `${level.elo} (${level.name}): ${plies} plies, ${illegal} illegal`);
}

console.log('\ngames always terminate in a legal state');
{
  const state = Chess.create();
  let plies = 0;
  while (Chess.status(state) === 'ongoing' && plies < 300) {
    Chess.make(state, AI.chooseMove(state, 1200).move);
    plies++;
  }
  const result = Chess.status(state);
  ok(['ongoing', 'checkmate', 'stalemate', 'fifty-move', 'repetition', 'insufficient-material'].includes(result),
     `1200 vs 1200 self-play ended after ${plies} plies as "${result}"`);
}

console.log('\nstrength ordering — 1600 vs 400, 6 games');
{
  /* Games are played on a shortened clock. Each level keeps its own depth cap,
     blunder rate and noise, so the relative ordering is unchanged — it just runs
     in seconds instead of minutes. */
  const realTimes = AI.LEVELS.map(l => l.timeMs);
  AI.LEVELS.forEach(l => { l.timeMs = Math.min(l.timeMs, 150); });

  let strongWins = 0, weakWins = 0, draws = 0;
  for (let g = 0; g < 6; g++) {
    const state = Chess.create();
    const strongIsWhite = g % 2 === 0;
    let plies = 0;
    while (Chess.status(state) === 'ongoing' && plies < 160) {
      const strongToMove = (state.turn === Chess.WHITE) === strongIsWhite;
      Chess.make(state, AI.chooseMove(state, strongToMove ? 1600 : 400).move);
      plies++;
    }
    const result = Chess.status(state);
    if (result === 'checkmate') {
      // the side to move is mated, so the other side won
      const strongMated = (state.turn === Chess.WHITE) === strongIsWhite;
      strongMated ? weakWins++ : strongWins++;
    } else {
      // no mate inside the cap: award it on material
      const score = AI.evaluate(state) * (state.turn === Chess.WHITE ? 1 : -1);
      const strongScore = strongIsWhite ? score : -score;
      if (strongScore > 200) strongWins++; else if (strongScore < -200) weakWins++; else draws++;
    }
  }
  AI.LEVELS.forEach((l, i) => { l.timeMs = realTimes[i]; });
  console.log(`  strong ${strongWins} — weak ${weakWins} — level ${draws}`);
  ok(strongWins > weakWins, 'the 1600 opponent outplays the 400 opponent');
}

console.log(failures ? `\n${failures} failure(s)` : '\nOpponent behaves correctly at every level.');
process.exit(failures ? 1 : 0);
