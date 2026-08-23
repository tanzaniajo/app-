/* The lesson runner: one screen at a time, hearts, check-then-continue. */
(function (SH) {
  'use strict';

  var LETTERS = ['1', '2', '3', '4', '5', '6'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function normalise(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, '');
  }
  function isCjk(s) { return /[㐀-鿿]/.test(s); }
  function sfx(name) { if (SH.Sfx) SH.Sfx.play(name); }

  /* Draw a position from a FEN string. Filled glyphs are used for both sides and
     coloured with CSS, because outline glyphs render inconsistently across fonts. */
  var PIECE_NAME = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

  function renderBoard(fen) {
    var rows = fen.split(' ')[0].split('/');
    var wrap = el('div', 'board-wrap');
    var grid = el('div', 'board');

    for (var r = 0; r < 8; r++) {
      var file = 0;
      var chars = rows[r].split('');
      for (var c = 0; c < chars.length; c++) {
        var ch = chars[c];
        if (/\d/.test(ch)) {
          for (var k = 0; k < +ch; k++) { grid.appendChild(square(file, r, null)); file++; }
        } else {
          grid.appendChild(square(file, r, ch));
          file++;
        }
      }
    }

    function square(fileIndex, rowIndex, piece) {
      var dark = (fileIndex + rowIndex) % 2 === 1;
      var cell = el('div', 'sq ' + (dark ? 'dark' : 'light'));
      if (piece) {
        var white = piece === piece.toUpperCase();
        var kind = piece.toLowerCase();
        var span = el('span', 'piece');
        span.innerHTML = SH.ChessPieces.svg(piece);
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', (white ? 'white ' : 'black ') + PIECE_NAME[kind] +
          ' on ' + 'abcdefgh'.charAt(fileIndex) + (8 - rowIndex));
        cell.appendChild(span);
      }
      // coordinates sit in the corner of the edge squares, as on a real board
      if (fileIndex === 0) cell.appendChild(el('span', 'coord rank', String(8 - rowIndex)));
      if (rowIndex === 7) cell.appendChild(el('span', 'coord file', 'abcdefgh'.charAt(fileIndex)));
      return cell;
    }

    wrap.appendChild(grid);
    return wrap;
  }

  /* opts: { subject, topic, lesson, stage, mode: 'lesson' | 'practice', onExit } */
  function Lesson(root, opts) {
    this.root = root;
    this.subject = opts.subject;
    this.topic = opts.topic;
    this.lessonIndex = opts.lesson;
    this.stage = opts.stage;
    this.mode = opts.mode || 'lesson';
    this.onExit = opts.onExit;

    this.count = SH.Progress.QUESTIONS_PER_LESSON;
    this.questions = this.topic.generate(this.count, this.stage);
    this.index = 0;
    this.correct = 0;
    this.log = [];
    this.picked = null;
    this.typed = '';
    this.checked = false;
    this.finished = false;

    this.onKey = this.handleKey.bind(this);
    document.addEventListener('keydown', this.onKey);
  }

  Lesson.prototype.detach = function () { document.removeEventListener('keydown', this.onKey); };

  Lesson.prototype.handleKey = function (e) {
    if (this.finished || !document.body.contains(this.root)) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.checked) this.advance();
      else if (this.picked != null || this.typed) this.check();
      return;
    }
    var q = this.questions[this.index];
    if (!q || q.type !== 'choice' || this.checked) return;
    var i = LETTERS.indexOf(e.key);
    if (i >= 0 && i < q.choices.length) {
      e.preventDefault();
      this.picked = i;
      this.draw();
    }
  };

  Lesson.prototype.check = function () {
    if (this.checked) return;
    var q = this.questions[this.index];
    var right;
    if (q.type === 'input') {
      var accepted = (q.accept || [q.answer]).map(normalise);
      right = accepted.indexOf(normalise(this.typed)) !== -1;
      this.log.push({ prompt: q.prompt, given: this.typed || '(blank)', answer: q.answer, ok: right });
    } else {
      if (this.picked == null) return;
      right = this.picked === q.answer;
      this.log.push({ prompt: q.prompt, given: q.choices[this.picked], answer: q.choices[q.answer], ok: right });
    }
    this.checked = true;
    this.lastOk = right;
    if (right) {
      this.correct++;
      sfx('correct');
    } else {
      sfx('wrong');
      if (this.mode === 'lesson') {
        this.hearts = SH.Progress.loseHeart();
        sfx('heart');
      }
      this.recordMistake(q, right);
    }
    this.draw();
  };

  /* Wrong answers are kept so the Coach can walk you back through them.
     Chess is left out: its questions are positions, not written answers. */
  Lesson.prototype.recordMistake = function (q, wasRight) {
    if (wasRight || this.subject.id === 'chess') return;
    var entry = this.log[this.log.length - 1];
    if (!entry) return;
    SH.Progress.logMistake({
      subject: this.subject.id, subjectName: this.subject.name, emoji: this.subject.emoji,
      topic: this.topic.id, topicName: this.topic.name,
      kicker: q.kicker || '', prompt: q.prompt, passage: q.passage || '',
      given: entry.given, answer: entry.answer, explanation: q.explanation || ''
    });
  };

  Lesson.prototype.advance = function () {
    if (this.mode === 'lesson' && SH.Progress.hearts() <= 0) return this.outOfHearts();
    this.index++;
    this.picked = null;
    this.typed = '';
    this.checked = false;
    if (this.index >= this.questions.length) return this.finish();
    this.draw();
  };

  Lesson.prototype.finish = function () {
    this.finished = true;
    this.detach();
    var pct = Math.round((this.correct / this.questions.length) * 100);
    var passed = this.correct >= Math.ceil(this.questions.length * 0.6);
    var xp = this.mode === 'practice' ? 5 : SH.Progress.XP_PER_LESSON + (pct === 100 ? 5 : 0);

    SH.Progress.finishLesson({
      subject: this.subject.id, topic: this.topic.id, lesson: this.lessonIndex,
      correct: this.correct, asked: this.questions.length, passed: passed, xp: xp
    });
    if (this.mode === 'practice') SH.Progress.gainHeart();

    sfx(passed ? (pct === 100 ? 'crown' : 'complete') : 'fail');
    this.renderResult(pct, passed, this.mode === 'practice' ? 5 : (passed ? xp : 0));
  };

  Lesson.prototype.outOfHearts = function () {
    this.finished = true;
    this.detach();
    sfx('fail');
    var self = this;
    SH.Progress.finishLesson({
      subject: this.subject.id, topic: this.topic.id, lesson: this.lessonIndex,
      correct: this.correct, asked: this.index + 1, passed: false, xp: 0
    });

    this.root.innerHTML = '';
    var box = el('div', 'result');
    box.appendChild(el('div', 'mascot', '💔'));
    box.appendChild(el('h1', null, 'You ran out of hearts'));
    box.appendChild(el('p', 'subline', 'Hearts come back over time — one every 20 minutes. Practice a finished lesson to earn one back straight away.'));
    var again = el('button', 'btn btn--wide', 'Back to the path');
    again.type = 'button';
    again.onclick = function () { self.onExit(); };
    var refill = el('button', 'btn btn--ghost btn--wide', 'Refill hearts now');
    refill.type = 'button';
    refill.style.marginTop = '10px';
    refill.onclick = function () { SH.Progress.refillHearts(); self.onExit(); };
    box.appendChild(again);
    box.appendChild(refill);
    this.root.appendChild(box);
  };

  Lesson.prototype.renderResult = function (pct, passed, xp) {
    var self = this;
    this.root.innerHTML = '';
    var box = el('div', 'result');
    box.appendChild(el('div', 'mascot', pct === 100 ? '🏆' : passed ? '🎉' : '💪'));
    box.appendChild(el('h1', null, pct === 100 ? 'Flawless!' : passed ? 'Lesson complete!' : 'Keep going!'));
    box.appendChild(el('p', 'subline',
      this.subject.name + ' · ' + this.topic.name + (passed ? '' : ' — get 60% to unlock the next lesson')));

    var tally = el('div', 'tally');
    [['green', 'Total XP', '+' + xp], ['blue', 'Accuracy', pct + '%'], ['', 'Correct', this.correct + '/' + this.questions.length]]
      .forEach(function (t) {
        var b = el('div', 'tally-box' + (t[0] ? ' ' + t[0] : ''));
        b.appendChild(el('div', 'tally-label', t[1]));
        b.appendChild(el('div', 'tally-value', t[2]));
        tally.appendChild(b);
      });
    box.appendChild(tally);

    var misses = this.log.filter(function (l) { return !l.ok; });
    if (misses.length) {
      var review = el('div', 'review');
      review.appendChild(el('div', 'kicker', 'Worth another look'));
      misses.forEach(function (m) {
        var row = el('div', 'review-item miss');
        row.appendChild(el('div', null, m.prompt));
        row.appendChild(el('div', 'r-a', 'You said "' + m.given + '" · answer: ' + m.answer));
        review.appendChild(row);
      });
      box.appendChild(review);
    }

    var cont = el('button', 'btn btn--wide', 'Continue');
    cont.type = 'button';
    cont.onclick = function () { self.onExit(); };
    box.appendChild(cont);

    var again = el('button', 'btn btn--ghost btn--wide', 'Practise again');
    again.type = 'button';
    again.style.marginTop = '10px';
    again.onclick = function () {
      SH.startLesson(self.root, {
        subject: self.subject, topic: self.topic, lesson: self.lessonIndex,
        stage: self.stage, mode: self.mode, onExit: self.onExit
      });
    };
    box.appendChild(again);

    this.root.appendChild(box);
    window.scrollTo(0, 0);
  };

  Lesson.prototype.draw = function () {
    var self = this;
    var q = this.questions[this.index];
    this.root.innerHTML = '';

    /* --- top bar: quit, progress, hearts --- */
    var top = el('div', 'lesson-top');
    var quit = el('button', 'close-x', '✕');
    quit.type = 'button';
    quit.title = 'Quit lesson';
    quit.onclick = function () { self.detach(); self.onExit(); };
    top.appendChild(quit);

    var track = el('div', 'track');
    track.style.flex = '1';
    var fill = el('i');
    fill.style.width = Math.round((this.index / this.questions.length) * 100) + '%';
    track.appendChild(fill);
    top.appendChild(track);

    if (this.mode === 'lesson') {
      top.appendChild(el('span', 'stat-pill heart', '❤️ ' + SH.Progress.hearts()));
    } else {
      top.appendChild(el('span', 'stat-pill dim', '∞'));
    }
    this.root.appendChild(top);

    /* --- question --- */
    var body = el('div', 'lesson-body');
    body.appendChild(el('div', 'kicker', q.kicker || this.topic.name));
    if (q.board) body.appendChild(renderBoard(q.board));
    if (q.passage) body.appendChild(el('div', 'passage', q.passage));

    var promptCls = 'prompt' + (q.promptBig ? ' big' : '') + (isCjk(q.prompt) && q.promptBig ? ' script' : '');
    body.appendChild(el('h2', promptCls, q.prompt));

    if (q.type === 'input') {
      var input = el('input', 'type-answer');
      input.type = 'text';
      input.autocomplete = 'off';
      input.placeholder = 'Type your answer';
      input.value = this.typed;
      input.disabled = this.checked;
      input.oninput = function () { self.typed = input.value; self.syncCheckButton(); };
      body.appendChild(input);
      if (!this.checked) setTimeout(function () { input.focus(); }, 0);
    } else {
      var options = el('div', 'options');
      q.choices.forEach(function (text, i) {
        var b = el('button', 'option');
        b.type = 'button';
        if (self.checked) {
          b.disabled = true;
          if (i === q.answer) b.className = 'option right';
          else if (i === self.picked) b.className = 'option wrong';
        } else if (self.picked === i) {
          b.className = 'option sel';
        }
        b.appendChild(el('span', 'key', LETTERS[i]));
        b.appendChild(el('span', null, text));
        b.onclick = function () { self.picked = i; sfx('select'); self.draw(); };
        options.appendChild(b);
      });
      body.appendChild(options);
    }
    this.root.appendChild(body);

    /* --- bottom bar --- */
    var bar = el('div', 'footbar' + (this.checked ? (this.lastOk ? ' ok' : ' no') : ''));
    var inner = el('div', 'footbar-inner');

    if (this.checked) {
      var verdict = el('div', 'verdict');
      var head = el('div', 'headline');
      head.appendChild(el('span', null, this.lastOk ? '✓' : '✕'));
      head.appendChild(el('span', null, this.lastOk ? 'Nicely done!' : 'Correct answer: ' +
        (q.type === 'input' ? q.answer : q.choices[q.answer])));
      verdict.appendChild(head);
      if (q.explanation) verdict.appendChild(el('div', 'why', q.explanation));
      inner.appendChild(verdict);

      var cont = el('button', 'btn' + (this.lastOk ? '' : ' btn--red'),
        this.index + 1 >= this.questions.length ? 'Finish' : 'Continue');
      cont.type = 'button';
      cont.onclick = function () { self.advance(); };
      inner.appendChild(cont);
      setTimeout(function () { cont.focus(); }, 0);
    } else {
      inner.appendChild(el('div', 'verdict small muted',
        q.type === 'input' ? 'Type your answer, then press Enter' : 'Pick an answer — or press 1–' + q.choices.length));
      var checkBtn = el('button', 'btn', 'Check');
      checkBtn.type = 'button';
      checkBtn.disabled = q.type === 'input' ? !this.typed : this.picked == null;
      checkBtn.onclick = function () { self.check(); };
      this.checkBtn = checkBtn;
      inner.appendChild(checkBtn);
    }

    bar.appendChild(inner);
    this.root.appendChild(bar);
  };

  Lesson.prototype.syncCheckButton = function () {
    if (this.checkBtn) this.checkBtn.disabled = !this.typed;
  };

  SH.startLesson = function (root, opts) {
    var l = new Lesson(root, opts);
    l.draw();
    window.scrollTo(0, 0);
    return l;
  };

  /* ---------------- flashcards ---------------- */
  SH.renderFlashcards = function (root, subject, topic, stage, onExit) {
    var cards = SH.U.shuffle(topic.flashcards(stage));
    var i = 0, flipped = false;

    function draw() {
      root.innerHTML = '';
      var top = el('div', 'lesson-top');
      var quit = el('button', 'close-x', '✕');
      quit.type = 'button';
      quit.onclick = function () { document.removeEventListener('keydown', keys); onExit(); };
      top.appendChild(quit);
      var track = el('div', 'track');
      track.style.flex = '1';
      var fill = el('i');
      fill.style.width = Math.round(((i + 1) / cards.length) * 100) + '%';
      track.appendChild(fill);
      top.appendChild(track);
      top.appendChild(el('span', 'stat-pill dim', (i + 1) + '/' + cards.length));
      root.appendChild(top);

      var c = cards[i];
      var body = el('div', 'lesson-body center');
      body.appendChild(el('div', 'kicker', subject.name + ' · ' + topic.name));
      var face = el('h2', 'prompt big' + (isCjk(c.front) ? ' script' : ''), c.front);
      face.style.cursor = 'pointer';
      face.onclick = function () { flipped = !flipped; sfx('tap'); draw(); };
      body.appendChild(face);
      if (flipped) {
        body.appendChild(el('div', 'prompt', c.back));
        if (c.sub) body.appendChild(el('div', 'muted', c.sub));
      } else {
        body.appendChild(el('div', 'muted', 'Tap the card or press Space to reveal'));
      }
      root.appendChild(body);

      var bar = el('div', 'footbar');
      var inner = el('div', 'footbar-inner');
      var prev = el('button', 'btn btn--ghost', 'Back');
      prev.type = 'button';
      prev.onclick = function () { i = (i - 1 + cards.length) % cards.length; flipped = false; draw(); };
      var flip = el('button', 'btn btn--blue', flipped ? 'Hide' : 'Reveal');
      flip.type = 'button';
      flip.onclick = function () { flipped = !flipped; sfx('tap'); draw(); };
      var next = el('button', 'btn', 'Next');
      next.type = 'button';
      next.onclick = function () { i = (i + 1) % cards.length; flipped = false; draw(); };
      inner.appendChild(prev);
      inner.appendChild(flip);
      inner.appendChild(next);
      bar.appendChild(inner);
      root.appendChild(bar);
    }

    function keys(e) {
      if (!document.body.contains(root)) { document.removeEventListener('keydown', keys); return; }
      if (e.key === 'ArrowRight') { i = (i + 1) % cards.length; flipped = false; draw(); }
      else if (e.key === 'ArrowLeft') { i = (i - 1 + cards.length) % cards.length; flipped = false; draw(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipped = !flipped; draw(); }
    }
    document.addEventListener('keydown', keys);
    draw();
    window.scrollTo(0, 0);
  };
})(window.StudyHub);
