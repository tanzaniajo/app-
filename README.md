# StudyHub

A study app for **English, Math, Science, Chinese and Chess**, built as a lesson path
with hearts, XP, streaks and sound. It asks your age first, then serves the syllabus
that matches your school year. You can also play chess against a bot, and have the
Coach walk you back through anything you got wrong.

Open `index.html` in a browser. No build step, no dependencies, no network calls —
it runs straight from the filesystem and stores progress in `localStorage`.

## How it works

**1 · Age gate.** The first screen asks how old you are (pick a band or type an exact
age). That choice maps to one of five syllabus stages:

| Stage | Age | Roughly |
|---|---|---|
| Early Years | 4–7 | Reception–Year 2 · Grades K–2 |
| Primary | 8–10 | Years 3–6 · Grades 3–5 |
| Middle School | 11–13 | Years 7–9 · Grades 6–8 |
| Secondary | 14–16 | GCSE · Grades 9–11 |
| Advanced | 17+ | A-level · College |

**2 · The path.** Each subject is a course; each topic is a unit of five lessons laid
out as stepping stones. Clear a lesson (60% or better) to earn a crown and unlock the
next one. Finished lessons can be replayed as unlimited practice, and a locked lesson
can be jumped into if you already know the material.

**3 · Lessons.** Eight questions, one screen at a time: pick an answer (or type it),
press **Check**, read the explanation, continue. A wrong answer costs a heart — five
hearts, one back every 20 minutes, or earn one instantly by practising a cleared
lesson. Every question ends with a short explanation of *why*.

**4 · Sound.** Selecting, right, wrong, losing a heart and finishing a lesson each have
their own cue, synthesised in the browser with the Web Audio API — no audio files, so
the app stays one offline page. The 🔊 button in the header mutes it, and the choice
is remembered.

Progress is stored per syllabus stage, so changing your age gives you a fresh path
rather than a row of crowns you never earned. Change back and the old path returns;
XP and streak are yours either way.

## Playing chess

The Chess course has a **Play against the bot** card at the top. Choose a strength from
≈400 to ≈2000 and a colour, then tap a piece and tap where it should go. Legal moves,
the last move, check and the material balance are all shown, with the move list in
algebraic notation. Promotion, castling, en passant, undo and resign all work, and
every drawing rule is reported properly — stalemate, threefold repetition, the
fifty-move rule and insufficient material.

**What you can see while you play.** The opening is named as you go — 84 lines, from
"King's Pawn Opening" down to the Najdorf and the Berlin — matched by the longest
sequence that fits, and kept once you leave the book, because a game is still "a
Sicilian" on move 30. Beside each side sits the pieces it has captured and how many
points it is ahead by.

**Arrows.** Right-drag from one square to another to draw an arrow, right-click a
single square to ring it. Drawing the same arrow again removes it; a left click or a
move clears them. Touch devices have no right button, so the **Arrows** button turns
on a drawing mode where the same gestures work with a normal tap.

**Premoves.** While the bot is thinking you can already play your reply: tap a piece
and a square and it is queued, shown in blue with a Cancel next to it. It is played
the instant the bot moves, or quietly dropped if the bot's move made it illegal. For
that to work the search must not freeze the page, so it runs in short slices and hands
control back to the browser between them.

**Animation.** Pieces slide to their new square rather than teleporting, castling moves
the rook alongside the king, and the board is drawn with its own set of pieces — SVG
rather than Unicode chess glyphs, which are drawn by whatever font the device happens
to have and vary from hairline outlines to solid blocks.

Those ratings are a rough guide for picking an opponent, not calibrated Elo. A weak
level is not merely a shallow search: it also has a blunder chance and picks freely
among moves close to the best, because a shallow engine still never hangs a queen and
plays nothing like a beginner. It will not, however, blunder away an obvious free
capture.

Every level answers within about two seconds. The search uses iterative deepening with
a wall-clock deadline, so it goes as deep as the time allows and no deeper.

## The Coach

Get a question wrong in any subject except Chess and it goes into your mistake log —
the 🧑‍🏫 button in the header. Reviewing one runs in two steps:

1. **What went wrong?** You write, in your own words, what your mistake was. The Coach
   tells you whether you have it right, and corrects you if not.
2. **Write the answer again.** You type the corrected answer, and it checks that too.

You can also add a question yourself: paste the question and the answer you gave. Give
the correct answer as well, or leave it blank for a plain sum and the Coach will work
it out.

The Coach is deterministic analysis, not a language model — no network, no API key. It
can be specific because it already knows the question, your answer, the right answer
and the reasoning, so it compares them and recognises the classic error patterns:

| You answered | It tells you |
|---|---|
| `27` to `4 + 5 × 3` | you worked left to right; × comes first |
| `60 cm²` for a triangle with base 10, height 6 | exactly double — you forgot to halve |
| `26 cm²` for the area of an 8×5 rectangle | that is the perimeter formula |
| `4` to `(−15) + 11` | right size, wrong sign |
| `2/5` to `1/2 + 1/3` | you added the tops and bottoms separately |
| `2000` to `25% of 80` | out by 100 — 25% means 0.25 |
| `fāxiǎn` for 发现 | right syllables, wrong tone — syllable 2 is tone 4 |
| `电脑` for "television" | you picked a word sharing the character 电 |
| `necesary` | you wrote one "s" where the word has two |

## The syllabus, by age

Difficulty is not cosmetic. Math questions are generated by stage-specific rules, and
every English, Science and Chinese question carries a difficulty band that is filtered
against the learner's stage.

| Subject | Early Years | Middle School | Advanced |
|---|---|---|---|
| **Math** | counting to 20, naming shapes | negatives, two-step equations, angles | surds, quadratics, trigonometry |
| **English** | simple word meanings, `a`/`an`, opposites | tenses, idioms, spelling traps | inversion, third conditional, inference |
| **Science** | living things, floating, day and night | cells, states of matter, circuits | enzymes, isotopes, kinetic energy |
| **Chinese** | 你好, numbers 1–10, single characters | measure words, word order, 了 | 把/被/得, 成语, six-figure numbers |
| **Chess** | how the pieces move, what wins | forks, pins, back-rank mate | Lucena, opposite-coloured bishops, isolated queen's pawn |

## Subjects

- **English** — vocabulary, synonyms & antonyms, grammar, spelling, idioms, reading passages
- **Math** — number & arithmetic, fractions/decimals/percents, algebra, shape & geometry, problem solving
- **Science** — biology, chemistry, physics, earth & space, scientific method, mixed review
- **Chinese** — pinyin, tones, meaning, English → Chinese, tricky characters, sentence patterns, grammar & measure words, numbers, phrases, 成语
- **Chess** — the pieces, rules & notation, tactics, board puzzles, checkmate patterns, openings, endgames

Math and Chinese numbers are generated on the fly, so they never run out. The other
topics draw from banked questions, each with its own explanation. Vocabulary topics
also have a flashcard mode (**Cards** under any unit).

Chinese is deliberately unforgiving. In the pronunciation and tone units the wrong
answers are the *right syllables with the wrong tones* (fāxiàn / fāxiǎn / fāxiān /
fǎxiàn), and in the meaning units they are words that share a character with the
answer (电脑 / 电视 / 电话). You cannot pass by recognising the shape of the answer.

Chess board puzzles are shown on a real board drawn from a FEN string.

## Keyboard

`1`–`4` pick an answer · `Enter` checks, then continues · `←` `→` `Space` move and flip flashcards.

## Files

```
index.html            markup and script order
build.py              inlines everything into a single studyhub.html
css/styles.css        design tokens, components, light + dark themes, the board
js/storage.js         profile, XP, hearts, streak, lesson progress, shared helpers
js/audio.js           synthesised sound effects
js/chess-pieces.js    the piece artwork, drawn as SVG
js/chess-openings.js  opening names, matched by longest move sequence
js/chess-engine.js    full chess rules, shared by the game and the tests
js/chess-ai.js        the opponent: search, evaluation, strength levels
js/play.js            the chess game screen
js/coach.js           works out what specifically went wrong in an answer
js/review.js          the Coach's two-step review screens
js/app.js             onboarding, HUD, learning path, stats, settings
js/lesson.js          the lesson runner, board rendering and flashcards
js/subjects/*.js      one module per subject, each registering its topics
tools/                checks you can run yourself (below)
```

## Checks

```
node tools/perft.mjs           # chess move generation, against published counts
node tools/verify-chess.mjs    # every puzzle, against real chess rules
node tools/test-ai.mjs         # the opponent finds mates and beats weaker levels
node tools/audit-levels.mjs    # every question, against the learner's age
```

`perft.mjs` counts leaf nodes from the six standard test positions and compares them
against published values — 4,085,603 nodes at depth 4 on Kiwipete, and so on. A single
mistake anywhere in castling, en passant, promotion or pinned pieces changes the count,
so a clean run means move generation is exact.

`verify-chess.mjs` also plays every line of the opening book through the engine, since
a typo in a line would mean it silently never matches. It uses that same engine to
check the puzzles in the course: the
answer really is mate, no distractor is also mate, the solution is unique, and the
notation shown matches what the engine calls the move. It has caught two real errors
so far — a position where the white king blocked its own queen's path, and a move
labelled "Rh1+" that was not actually check.

`audit-levels.mjs` extracts every banked question's difficulty band from the source,
runs each generator 60 times per stage, and fails if a question ever reaches a learner
it was not written for — in either direction.

A subject module registers itself with `StudyHub.register({ id, name, emoji, color, topics })`.
Each topic exposes `generate(count, stageIndex)` returning question objects
(`{ type, prompt, choices, answer, explanation }`, plus optional `board` or `passage`),
so adding a subject means adding one file and one `<script>` tag. Banked questions end
with a difficulty band — 1, 2 or 3 — and a topic may set `minStage` when it has no
business appearing for young learners at all.
