/* The Coach screens: pick a question you got wrong, say what you think went
   wrong, get corrected, rewrite the answer, get corrected again. */
(function (SH) {
  'use strict';

  var Coach = SH.Coach;

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
  function sfx(n) { if (SH.Sfx) SH.Sfx.play(n); }

  /* Work out a plain arithmetic question, so a pasted sum can be marked
     even when you do not know the right answer yourself. */
  function trySolve(text) {
    var expr = String(text).replace(/[×x]/g, '*').replace(/[÷]/g, '/').replace(/[−–]/g, '-')
      .replace(/\^/g, '**').replace(/=\s*\?*\s*$/, '').replace(/[?]/g, '').trim();
    if (!/^[-+*/(). \d]+(\*\*[\d.]+)?$/.test(expr.replace(/\*\*/g, '**'))) return null;
    if (!/\d/.test(expr) || !/[-+*/]/.test(expr)) return null;
    try {
      // a tiny shunting-yard evaluator — no eval, no globals reachable
      var value = evaluate(expr);
      return (value == null || !isFinite(value)) ? null : String(Math.round(value * 1e6) / 1e6);
    } catch (e) { return null; }
  }

  function evaluate(src) {
    var tokens = src.match(/\d+(?:\.\d+)?|\*\*|[-+*/()]/g);
    if (!tokens) return null;
    var pos = 0;
    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }
    function primary() {
      var t = next();
      if (t === '(') { var v = addsub(); next(); return v; }
      if (t === '-') return -primary();
      return parseFloat(t);
    }
    function power() {
      var base = primary();
      if (peek() === '**') { next(); return Math.pow(base, power()); }
      return base;
    }
    function muldiv() {
      var v = power();
      while (peek() === '*' || peek() === '/') {
        var op = next();
        var rhs = power();
        v = op === '*' ? v * rhs : v / rhs;
      }
      return v;
    }
    function addsub() {
      var v = muldiv();
      while (peek() === '+' || peek() === '-') {
        var op = next();
        var rhs = muldiv();
        v = op === '+' ? v + rhs : v - rhs;
      }
      return v;
    }
    var result = addsub();
    return pos === tokens.length ? result : null;
  }

  /* ------------------------------ list screen ------------------------------ */

  function renderList(root, onExit) {
    root.innerHTML = '';
    var mistakes = SH.Progress.mistakes();

    var top = el('div', 'lesson-top');
    top.appendChild(btn('close-x', '✕', onExit));
    top.appendChild(el('div', 'quiz-count', 'Coach'));
    top.appendChild(el('div', 'hud-spacer'));
    root.appendChild(top);

    var wrap = el('div', 'wrap');
    wrap.appendChild(el('div', 'mascot center', '🧑‍🏫'));
    wrap.appendChild(el('h1', 'center', 'Go over your mistakes'));
    wrap.appendChild(el('p', 'muted center',
      'Pick a question you got wrong. You say what went wrong, the Coach tells you whether you are right, then you write the answer again.'));

    wrap.appendChild(btn('btn btn--blue btn--wide', '＋ Add a question yourself',
      function () { renderOwn(root, onExit); }));

    if (!mistakes.length) {
      var empty = el('div', 'empty');
      empty.appendChild(el('div', null, 'Nothing to review yet.'));
      empty.appendChild(el('div', 'small', 'Wrong answers from your lessons appear here automatically.'));
      wrap.appendChild(empty);
      root.appendChild(wrap);
      return;
    }

    wrap.appendChild(el('h2', 'section-head', ''));
    wrap.lastChild.appendChild(el('h2', null, mistakes.length + ' to review'));
    wrap.lastChild.appendChild(btn('link', 'Clear all', function () {
      SH.Progress.clearMistakes();
      renderList(root, onExit);
    }));

    var rows = el('div', 'rows');
    mistakes.forEach(function (m) {
      var row = el('button', 'row mistake-row');
      row.type = 'button';
      var main = el('div', 'row-main');
      main.appendChild(el('div', 'row-title', (m.emoji || '📘') + '  ' + m.prompt));
      main.appendChild(el('div', 'row-sub', m.subjectName + ' · ' + m.topicName + ' — you answered "' + m.given + '"'));
      row.appendChild(main);
      row.appendChild(el('div', 'row-num', '›'));
      row.onclick = function () { sfx('tap'); renderReview(root, m, onExit); };
      rows.appendChild(row);
    });
    wrap.appendChild(rows);
    root.appendChild(wrap);
    window.scrollTo(0, 0);
  }

  /* --------------------------- add your own question --------------------------- */

  function renderOwn(root, onExit) {
    root.innerHTML = '';
    var top = el('div', 'lesson-top');
    top.appendChild(btn('close-x', '✕', function () { renderList(root, onExit); }));
    top.appendChild(el('div', 'quiz-count', 'Your own question'));
    top.appendChild(el('div', 'hud-spacer'));
    root.appendChild(top);

    var wrap = el('div', 'wrap');
    wrap.appendChild(el('h1', null, 'Add a question you got wrong'));
    wrap.appendChild(el('p', 'muted', 'Type the question and the answer you gave. If you know the right answer, add it — otherwise the Coach will work out plain sums on its own.'));

    var subject = SH.currentSubject && SH.currentSubject() !== 'chess' ? SH.currentSubject() : 'math';
    var chips = el('div', 'mode-row');
    [['math', '🔢 Math'], ['english', '📖 English'], ['science', '🔬 Science'], ['chinese', '🀄 Chinese']].forEach(function (s) {
      var c = el('button', 'chip' + (s[0] === subject ? ' on' : ''));
      c.type = 'button';
      c.textContent = s[1];
      c.onclick = function () {
        subject = s[0];
        chips.querySelectorAll('.chip').forEach(function (x, i) {
          x.className = 'chip' + (['math', 'english', 'science', 'chinese'][i] === subject ? ' on' : '');
        });
      };
      chips.appendChild(c);
    });
    wrap.appendChild(chips);

    function field(label, placeholder, tag) {
      wrap.appendChild(el('div', 'kicker', label));
      var input = el(tag || 'input', 'type-answer');
      if (tag === 'textarea') input.rows = 3;
      input.placeholder = placeholder;
      input.style.marginBottom = '14px';
      wrap.appendChild(input);
      return input;
    }

    var qInput = field('the question', 'e.g. 4 + 5 × 3 = ?', 'textarea');
    var aInput = field('your answer', 'what you wrote');
    var cInput = field('the correct answer (optional)', 'leave blank for plain sums');

    var error = el('div', 'muted small');
    error.style.marginBottom = '10px';
    wrap.appendChild(error);

    wrap.appendChild(btn('btn btn--wide', 'Start reviewing', function () {
      var prompt = qInput.value.trim(), given = aInput.value.trim(), answer = cInput.value.trim();
      if (!prompt || !given) { error.textContent = 'Please fill in the question and your answer.'; return; }
      if (!answer) {
        answer = trySolve(prompt);
        if (!answer) {
          error.textContent = 'The Coach cannot work this one out by itself — please add the correct answer.';
          return;
        }
      }
      if (Coach.checkAnswer(given, { answer: answer, given: given }).ok) {
        error.textContent = 'That answer looks correct, so there is nothing to review.';
        return;
      }
      renderReview(root, {
        id: 'own' + Date.now(), own: true,
        subject: subject, subjectName: subject.charAt(0).toUpperCase() + subject.slice(1),
        emoji: { math: '🔢', english: '📖', science: '🔬', chinese: '🀄' }[subject],
        topic: 'own', topicName: 'Your question',
        kicker: '', prompt: prompt, given: given, answer: answer, explanation: ''
      }, onExit);
    }));
    root.appendChild(wrap);
    window.scrollTo(0, 0);
  }

  /* ------------------------------ the two steps ------------------------------ */

  function renderReview(root, mistake, onExit) {
    var diagnosis = Coach.diagnose(mistake);
    var step = 1;
    var verdict = null;      // { ok, text } for the current step
    var showHints = false;

    function draw() {
      root.innerHTML = '';

      var top = el('div', 'lesson-top');
      top.appendChild(btn('close-x', '✕', function () { renderList(root, onExit); }));
      var track = el('div', 'track');
      track.style.flex = '1';
      var fill = el('i');
      fill.style.width = (step === 1 ? 33 : step === 2 ? 66 : 100) + '%';
      track.appendChild(fill);
      top.appendChild(track);
      top.appendChild(el('span', 'stat-pill dim', 'Step ' + Math.min(step, 2) + '/2'));
      root.appendChild(top);

      var body = el('div', 'lesson-body');
      body.appendChild(el('div', 'kicker', mistake.subjectName + ' · ' + mistake.topicName));
      if (mistake.passage) body.appendChild(el('div', 'passage', mistake.passage));
      body.appendChild(el('h2', 'prompt', mistake.prompt));

      var yours = el('div', 'your-answer');
      yours.appendChild(el('span', 'your-label', 'You answered'));
      yours.appendChild(el('span', 'your-value', mistake.given));
      body.appendChild(yours);

      if (step === 1) drawStepOne(body);
      else if (step === 2) drawStepTwo(body);
      else drawDone(body);

      root.appendChild(body);
    }

    /* Step 1 — what do you think went wrong? */
    function drawStepOne(body) {
      body.appendChild(el('div', 'kicker', 'step 1 — what went wrong?'));
      body.appendChild(el('p', 'muted small', 'In your own words, say what your mistake was. The Coach will tell you whether you have it right.'));

      var input = el('textarea', 'type-answer');
      input.rows = 3;
      input.placeholder = 'e.g. I did the operations in the wrong order';
      if (verdict) { input.value = verdict.text; input.disabled = true; }
      body.appendChild(input);

      if (showHints && !verdict) {
        var hints = el('div', 'options');
        hints.style.marginTop = '12px';
        diagnosis.hints.forEach(function (h) {
          var b = el('button', 'option');
          b.type = 'button';
          b.appendChild(el('span', null, h));
          b.onclick = function () { input.value = h; sfx('select'); };
          hints.appendChild(b);
        });
        body.appendChild(hints);
      }

      if (verdict) {
        var banner = el('div', 'verdict-box ' + (verdict.ok ? 'ok' : 'no'));
        banner.appendChild(el('strong', null, verdict.ok ? '✓ That is exactly it.' : verdict.unsure ? 'No problem — here is what happened.' : '✗ Not quite.'));
        banner.appendChild(el('div', 'why', diagnosis.cause));
        body.appendChild(banner);
        body.appendChild(btn('btn btn--wide', 'Now write the answer', function () {
          step = 2; verdict = null; draw();
        }));
        return;
      }

      var actions = el('div', 'play-actions');
      actions.appendChild(btn('btn', 'Check my thinking', function () {
        var result = Coach.matchDiagnosis(input.value, diagnosis);
        if (result.empty) return;
        verdict = { ok: result.ok, unsure: result.unsure, text: input.value };
        sfx(result.ok ? 'correct' : 'wrong');
        draw();
      }));
      actions.appendChild(btn('btn btn--ghost', showHints ? 'Hide hints' : 'I am not sure', function () {
        showHints = !showHints;
        draw();
      }));
      body.appendChild(actions);
    }

    /* Step 2 — write it correctly this time. */
    function drawStepTwo(body) {
      body.appendChild(el('div', 'kicker', 'step 2 — write the correct answer'));

      var input = el('input', 'type-answer');
      input.placeholder = 'Your corrected answer';
      if (verdict) { input.value = verdict.text; input.disabled = true; }
      body.appendChild(input);

      if (verdict) {
        var banner = el('div', 'verdict-box ' + (verdict.ok ? 'ok' : 'no'));
        banner.appendChild(el('strong', null, verdict.ok
          ? '✓ Correct' + (verdict.loose ? ' — ' + verdict.loose : '')
          : verdict.repeated ? '✗ That is the same answer as before.' : '✗ Still not right.'));
        if (!verdict.ok) banner.appendChild(el('div', 'why', 'The answer is "' + mistake.answer + '".'));
        if (mistake.explanation) banner.appendChild(el('div', 'why', mistake.explanation));
        body.appendChild(banner);

        var actions = el('div', 'play-actions');
        if (!verdict.ok) {
          actions.appendChild(btn('btn btn--ghost', 'Try again', function () { verdict = null; draw(); }));
        }
        actions.appendChild(btn('btn', 'Done', function () {
          if (!mistake.own) SH.Progress.removeMistake(mistake.id);
          SH.Progress.addXp(8, 1);
          sfx('complete');
          step = 3;
          draw();
        }));
        body.appendChild(actions);
        return;
      }

      var check = btn('btn btn--wide', 'Check my answer', function () {
        var result = Coach.checkAnswer(input.value, mistake);
        if (result.empty) return;
        verdict = { ok: result.ok, loose: result.loose, repeated: result.repeated, text: input.value };
        sfx(result.ok ? 'correct' : 'wrong');
        draw();
      });
      body.appendChild(check);
      setTimeout(function () { input.focus(); }, 0);
    }

    function drawDone(body) {
      var done = el('div', 'verdict-box ok');
      done.appendChild(el('strong', null, '🎯 Reviewed  ·  +8 XP'));
      done.appendChild(el('div', 'why', 'This question has been cleared from your list.'));
      body.appendChild(done);

      var actions = el('div', 'play-actions');
      actions.appendChild(btn('btn', 'Next mistake', function () {
        var remaining = SH.Progress.mistakes();
        if (remaining.length) renderReview(root, remaining[0], onExit);
        else renderList(root, onExit);
      }));
      actions.appendChild(btn('btn btn--ghost', 'Back to the list', function () { renderList(root, onExit); }));
      body.appendChild(actions);
    }

    draw();
    window.scrollTo(0, 0);
  }

  SH.startReview = function (root, opts) { renderList(root, opts.onExit); };
  SH._trySolve = trySolve;
})(window.StudyHub);
