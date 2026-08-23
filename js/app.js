/* Shell: onboarding, the HUD, the lesson path and the stats pages. */
(function (SH) {
  'use strict';

  var hudEl, appEl;
  var state = { view: 'path', subjectId: 'english', onboardStep: 0, draftAge: null };

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
  function profile() { return SH.Profile.get(); }
  function stage() { var p = profile(); return p ? p.stageIndex : 2; }

  var COURSE_KEY = 'studyhub.course';

  function go(view, subjectId) {
    state.view = view;
    if (subjectId) {
      state.subjectId = subjectId;
      try { localStorage.setItem(COURSE_KEY, subjectId); } catch (e) {}
    }
    render();
  }
  SH.go = go;

  /* ---------------------------- HUD ---------------------------- */
  function renderHud() {
    hudEl.innerHTML = '';
    if (state.view === 'onboard' || state.view === 'lesson') return;

    var bar = el('div', 'hud');
    bar.appendChild(btn('brand', '📚 StudyHub', function () { go('path'); }));
    bar.appendChild(el('div', 'hud-spacer'));

    var data = SH.Progress.all();
    bar.appendChild(el('span', 'stat-pill fire', '🔥 ' + data.streak.current));
    bar.appendChild(el('span', 'stat-pill gem', '💎 ' + data.xp));
    bar.appendChild(el('span', 'stat-pill heart', '❤️ ' + data.hearts.n));
    bar.appendChild(btn('icon-btn', '📊', function () { go('stats'); }));
    bar.appendChild(btn('icon-btn', '👤', function () { go('profile'); }));
    bar.appendChild(btn('icon-btn', document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙',
      function () { SH.Theme.toggle(); render(); }));
    hudEl.appendChild(bar);

    if (state.view !== 'path') return;
    var chips = el('div', 'courses');
    SH.subjects.forEach(function (s) {
      var c = el('button', 'course-chip' + (s.id === state.subjectId ? ' on' : ''));
      c.type = 'button';
      c.style.color = s.id === state.subjectId ? s.color : '';
      c.appendChild(el('span', 'emoji', s.emoji));
      c.appendChild(el('span', null, s.name + (s.native ? ' ' + s.native : '')));
      c.onclick = function () { go('path', s.id); };
      chips.appendChild(c);
    });
    hudEl.appendChild(chips);
  }

  /* ------------------------- onboarding ------------------------- */
  function renderOnboard() {
    appEl.innerHTML = '';
    var box = el('div', 'onboard');

    var dots = el('div', 'step-dots');
    for (var i = 0; i < 3; i++) dots.appendChild(el('i', i <= state.onboardStep ? 'on' : ''));

    if (state.onboardStep === 0) {
      box.appendChild(el('div', 'mascot', '📚'));
      box.appendChild(el('h1', null, 'Welcome to StudyHub'));
      box.appendChild(el('p', null, 'Bite-sized lessons in English, Math, Science and Chinese — matched to your school year.'));
      box.appendChild(dots);
      box.appendChild(btn('btn btn--wide', 'Get started', function () { state.onboardStep = 1; render(); }));
      box.style.maxWidth = '420px';
      box.style.margin = '0 auto';
      appEl.appendChild(box);
      return;
    }

    if (state.onboardStep === 1) {
      box.appendChild(el('div', 'mascot', '🎂'));
      box.appendChild(el('h1', null, 'How old are you?'));
      box.appendChild(el('div', 'speech', 'Your age sets the syllabus — the questions, the vocabulary and the difficulty all follow it.'));

      var grid = el('div', 'age-grid');
      SH.Profile.stages.forEach(function (st, idx) {
        var t = el('button', 'tile' + (state.draftAge != null && SH.Profile.stageForAge(state.draftAge) === idx ? ' sel' : ''));
        t.type = 'button';
        var body = el('div');
        body.appendChild(el('div', null, st.label));
        body.appendChild(el('span', 'tile-sub', st.name));
        t.appendChild(el('span', 'emoji', ['🧸', '🎒', '📐', '🔬', '🎓'][idx]));
        t.appendChild(body);
        t.onclick = function () {
          state.draftAge = Math.min(st.max, Math.max(st.min, st.min + 1));
          render();
        };
        grid.appendChild(t);
      });
      box.appendChild(grid);

      var form = el('form', 'age-input');
      var input = el('input');
      input.type = 'number';
      input.min = '3';
      input.max = '120';
      input.placeholder = 'Exact age';
      if (state.draftAge != null) input.value = state.draftAge;
      form.appendChild(input);
      form.onsubmit = function (e) { e.preventDefault(); saveAge(); };
      box.appendChild(form);

      /* live syllabus preview, updated in place so the field keeps focus */
      var preview = el('p', 'muted small');
      preview.id = 'syllabusPreview';
      box.appendChild(preview);

      function syncAge() {
        var ok = state.draftAge >= 3 && state.draftAge <= 120;
        var next = document.getElementById('ageNext');
        if (next) next.disabled = !ok;
        preview.textContent = ok
          ? 'Syllabus: ' + SH.Profile.stages[SH.Profile.stageForAge(state.draftAge)].name +
            ' · ' + SH.Profile.stages[SH.Profile.stageForAge(state.draftAge)].grades
          : 'Pick a band above or type your exact age.';
      }
      input.oninput = function () {
        var v = parseInt(input.value, 10);
        state.draftAge = isFinite(v) ? v : null;
        syncAge();
      };
      setTimeout(syncAge, 0);

      box.appendChild(dots);
      var next = btn('btn btn--wide', 'Continue', saveAge);
      next.id = 'ageNext';
      next.disabled = !(state.draftAge >= 3 && state.draftAge <= 120);
      box.appendChild(next);
      box.style.maxWidth = '460px';
      box.style.margin = '0 auto';
      appEl.appendChild(box);
      return;
    }

    // step 2: choose the first course
    var p = profile();
    box.appendChild(el('div', 'mascot', '🚀'));
    box.appendChild(el('h1', null, 'Where would you like to start?'));
    box.appendChild(el('p', null, 'You are on the ' + p.stage.name + ' syllabus (' + p.stage.grades + '). You can switch subjects any time.'));
    var list = el('div', 'age-grid');
    list.style.gridTemplateColumns = '1fr';
    SH.subjects.forEach(function (s) {
      var t = el('button', 'tile');
      t.type = 'button';
      t.appendChild(el('span', 'emoji', s.emoji));
      var body = el('div');
      body.appendChild(el('div', null, s.name + (s.native ? '  ' + s.native : '')));
      body.appendChild(el('span', 'tile-sub', s.blurb));
      t.appendChild(body);
      t.onclick = function () { go('path', s.id); };
      list.appendChild(t);
    });
    box.appendChild(list);
    box.appendChild(dots);
    box.style.maxWidth = '460px';
    box.style.margin = '0 auto';
    appEl.appendChild(box);
  }

  function saveAge() {
    if (!(state.draftAge >= 3 && state.draftAge <= 120)) return;
    SH.Profile.set(state.draftAge);
    state.onboardStep = 2;
    render();
  }

  /* --------------------------- the path --------------------------- */
  function renderPath() {
    appEl.innerHTML = '';
    var subject = SH.subject(state.subjectId) || SH.subjects[0];
    var p = profile();
    var st = stage();
    var wrap = el('div', 'wrap');

    /* daily goal */
    var data = SH.Progress.all();
    var doneToday = SH.Progress.xpToday();
    var goal = data.goal;
    var card = el('div', 'goal-card');
    card.appendChild(el('div', 'goal-ring', doneToday >= goal ? '✅' : '🎯'));
    var gb = el('div', 'goal-body');
    gb.appendChild(el('div', 'goal-title', doneToday >= goal ? 'Daily goal complete!' : 'Daily goal'));
    gb.appendChild(el('div', 'muted small', doneToday + ' / ' + goal + ' questions answered today · 🔥 ' + data.streak.current + ' day streak'));
    var track = el('div', 'track');
    var fill = el('i');
    fill.style.width = Math.min(100, Math.round((doneToday / goal) * 100)) + '%';
    track.appendChild(fill);
    gb.appendChild(track);
    card.appendChild(gb);
    wrap.appendChild(card);

    var head = el('div', 'section-head');
    var h = el('div');
    h.appendChild(el('h2', null, subject.name + (subject.native ? ' ' + subject.native : '')));
    h.appendChild(el('div', 'muted small', p.stage.name + ' syllabus · ' + p.stage.grades));
    head.appendChild(h);
    wrap.appendChild(head);

    subject.topics.forEach(function (topic, unitIndex) {
      var crowns = SH.Progress.crowns(subject.id, topic.id);
      var prevComplete = unitIndex === 0 || SH.Progress.unitComplete(subject.id, subject.topics[unitIndex - 1].id);

      var unit = el('div', 'unit');
      unit.style.setProperty('--sub', subject.color);
      var left = el('div');
      left.appendChild(el('div', 'unit-title', 'Unit ' + (unitIndex + 1) + ' · ' + topic.name));
      left.appendChild(el('div', 'unit-sub', (topic.stageDesc && topic.stageDesc[st]) || topic.desc));
      unit.appendChild(left);
      unit.appendChild(el('div', 'unit-crowns', '👑 ' + crowns + '/' + SH.Progress.LESSONS_PER_UNIT));
      wrap.appendChild(unit);

      var path = el('div', 'path');
      for (var i = 0; i < SH.Progress.LESSONS_PER_UNIT; i++) {
        (function (lessonIndex) {
          var done = !!SH.Progress.lesson(subject.id, topic.id, lessonIndex);
          var prevLessonDone = lessonIndex === 0 || !!SH.Progress.lesson(subject.id, topic.id, lessonIndex - 1);
          var open = prevComplete && prevLessonDone;
          var isCurrent = open && !done;

          var row = el('div', 'path-row');
          // stepping stones: the path snakes left and right down the page
          row.style.transform = 'translateX(' + [0, 62, 90, 62, 0][lessonIndex] * (unitIndex % 2 ? -1 : 1) + 'px)';

          var node = el('button', 'node' + (done ? ' done' : open ? '' : ' locked') + (isCurrent ? ' current' : ''));
          node.type = 'button';
          node.style.setProperty('--sub', subject.color);
          node.textContent = done ? '👑' : open ? '★' : '🔒';
          node.title = 'Lesson ' + (lessonIndex + 1);
          if (isCurrent) {
            node.appendChild(el('span', 'node-flag', lessonIndex === 0 && crowns === 0 ? 'Start' : 'Continue'));
            row.style.marginTop = '24px';   // room for the flag above the node
          }
          node.onclick = function () {
            if (!open) return lockedModal(subject, topic, lessonIndex);
            startLesson(subject, topic, lessonIndex, done ? 'practice' : 'lesson');
          };
          row.appendChild(node);
          path.appendChild(row);
        })(i);
      }
      wrap.appendChild(path);

      var actions = el('div', 'section-head');
      actions.style.margin = '4px 0 0';
      var practice = btn('btn btn--ghost', '🔁 Practice', function () {
        startLesson(subject, topic, 0, 'practice');
      });
      actions.appendChild(practice);
      if (topic.flashcards) {
        actions.appendChild(btn('btn btn--ghost', '🗂 Cards', function () {
          state.view = 'lesson';
          renderHud();
          appEl.innerHTML = '';
          SH.renderFlashcards(appEl, subject, topic, st, function () { go('path'); });
        }));
      }
      wrap.appendChild(actions);
    });

    appEl.appendChild(wrap);
  }

  function startLesson(subject, topic, lessonIndex, mode) {
    if (mode === 'lesson' && SH.Progress.hearts() <= 0) return noHeartsModal();
    state.view = 'lesson';
    renderHud();
    appEl.innerHTML = '';
    SH.startLesson(appEl, {
      subject: subject, topic: topic, lesson: lessonIndex, stage: stage(), mode: mode,
      onExit: function () { go('path'); }
    });
  }

  function modal(title, text, buttons) {
    var back = el('div', 'modal-backdrop');
    var box = el('div', 'modal');
    box.appendChild(el('h2', null, title));
    box.appendChild(el('p', null, text));
    buttons.forEach(function (b) {
      box.appendChild(btn(b.cls || 'btn btn--wide', b.label, function () {
        document.body.removeChild(back);
        if (b.action) b.action();
      }));
    });
    back.appendChild(box);
    back.onclick = function (e) { if (e.target === back) document.body.removeChild(back); };
    document.body.appendChild(back);
  }

  function lockedModal(subject, topic, lessonIndex) {
    modal('Locked for now', 'Finish the lessons before it to unlock this one — or jump straight in if you already know the material.', [
      { label: 'Jump ahead', action: function () { startLesson(subject, topic, lessonIndex, 'lesson'); } },
      { label: 'Not yet', cls: 'btn btn--ghost btn--wide' }
    ]);
  }

  function noHeartsModal() {
    var mins = Math.ceil(SH.Progress.msToNextHeart() / 60000);
    modal('Out of hearts', 'The next heart arrives in about ' + mins + ' minute' + (mins === 1 ? '' : 's') +
      '. Practising a finished lesson earns one back straight away.', [
      { label: 'Refill now', action: function () { SH.Progress.refillHearts(); render(); } },
      { label: 'Wait', cls: 'btn btn--ghost btn--wide' }
    ]);
  }

  /* ---------------------------- stats ---------------------------- */
  function renderStats() {
    appEl.innerHTML = '';
    var data = SH.Progress.all();
    var wrap = el('div', 'wrap wrap--wide');
    wrap.appendChild(el('h1', null, 'Your progress'));
    wrap.appendChild(el('p', 'muted', 'Everything is stored on this device only.'));

    var acc = data.totals.asked ? Math.round((data.totals.correct / data.totals.asked) * 100) : 0;
    var crowns = Object.keys(data.lessons).length;
    var grid = el('div', 'stat-grid');
    [['💎', data.xp, 'Total XP'], ['🔥', data.streak.current, 'Day streak'],
     ['👑', crowns, 'Lessons cleared'], ['🎯', acc + '%', 'Accuracy'],
     ['❓', data.totals.asked, 'Questions answered'], ['🏅', data.streak.best, 'Best streak']]
      .forEach(function (s) {
        var c = el('div', 'stat-card');
        c.appendChild(el('div', 'big', s[0]));
        var b = el('div');
        b.appendChild(el('div', 'big', String(s[1])));
        b.appendChild(el('div', 'cap', s[2]));
        c.appendChild(b);
        grid.appendChild(c);
      });
    wrap.appendChild(grid);

    SH.subjects.forEach(function (s) {
      var sub = SH.Progress.subject(s.id);
      wrap.appendChild(el('h2', 'section-head', ''));
      var head = wrap.lastChild;
      head.appendChild(el('h2', null, s.emoji + '  ' + s.name));
      head.appendChild(el('span', 'muted small',
        sub.asked ? Math.round((sub.correct / sub.asked) * 100) + '% over ' + sub.asked + ' questions' : 'not started'));

      var rows = el('div', 'rows');
      s.topics.forEach(function (t) {
        var stats = SH.Progress.topic(s.id, t.id);
        var crownCount = SH.Progress.crowns(s.id, t.id);
        var row = el('div', 'row');
        var main = el('div', 'row-main');
        main.appendChild(el('div', 'row-title', t.name));
        var track = el('div', 'track blue');
        var fill = el('i');
        fill.style.width = Math.round((crownCount / SH.Progress.LESSONS_PER_UNIT) * 100) + '%';
        track.appendChild(fill);
        main.appendChild(track);
        row.appendChild(main);
        row.appendChild(el('div', 'row-num',
          stats.asked ? Math.round((stats.correct / stats.asked) * 100) + '%' : '—'));
        row.appendChild(el('div', 'row-num', '👑 ' + crownCount));
        rows.appendChild(row);
      });
      wrap.appendChild(rows);
    });

    appEl.appendChild(wrap);
  }

  /* --------------------------- profile --------------------------- */
  function renderProfile() {
    appEl.innerHTML = '';
    var p = profile();
    var wrap = el('div', 'wrap');
    wrap.appendChild(el('h1', null, 'Your syllabus'));

    var card = el('div', 'goal-card');
    card.appendChild(el('div', 'goal-ring', '🎓'));
    var body = el('div', 'goal-body');
    body.appendChild(el('div', 'goal-title', 'Age ' + p.age + ' · ' + p.stage.name));
    body.appendChild(el('div', 'muted small', p.stage.grades));
    card.appendChild(body);
    wrap.appendChild(card);

    wrap.appendChild(el('h2', 'section-head', ''));
    wrap.lastChild.appendChild(el('h2', null, 'What you are studying'));
    var rows = el('div', 'rows');
    SH.subjects.forEach(function (s) {
      s.topics.forEach(function (t) {
        var row = el('div', 'row');
        var main = el('div', 'row-main');
        main.appendChild(el('div', 'row-title', s.emoji + '  ' + t.name));
        main.appendChild(el('div', 'row-sub', (t.stageDesc && t.stageDesc[p.stageIndex]) || t.desc));
        row.appendChild(main);
        rows.appendChild(row);
      });
    });
    wrap.appendChild(rows);

    wrap.appendChild(el('h2', 'section-head', ''));
    wrap.lastChild.appendChild(el('h2', null, 'Settings'));

    var goalRow = el('div', 'row');
    var goalMain = el('div', 'row-main');
    goalMain.appendChild(el('div', 'row-title', 'Daily goal'));
    goalMain.appendChild(el('div', 'row-sub', 'Questions to answer each day'));
    goalRow.appendChild(goalMain);
    [10, 30, 50].forEach(function (g) {
      var b = btn('btn btn--ghost' + (SH.Progress.all().goal === g ? ' sel' : ''), String(g), function () {
        SH.Progress.setGoal(g);
        render();
      });
      b.style.minHeight = '38px';
      b.style.padding = '6px 12px';
      if (SH.Progress.all().goal === g) { b.style.borderColor = 'var(--green)'; b.style.color = 'var(--green)'; }
      goalRow.appendChild(b);
    });
    wrap.appendChild(goalRow);

    var actions = el('div', 'rows');
    actions.appendChild(btn('btn btn--ghost btn--wide', 'Change my age', function () {
      state.draftAge = p.age;
      state.onboardStep = 1;
      go('onboard');
    }));
    actions.appendChild(btn('btn btn--ghost btn--wide', 'Refill hearts', function () {
      SH.Progress.refillHearts();
      render();
    }));
    actions.appendChild(btn('btn btn--red btn--wide', 'Reset all progress', function () {
      modal('Reset everything?', 'This clears your XP, streak, crowns and age. It cannot be undone.', [
        { label: 'Yes, reset', cls: 'btn btn--red btn--wide', action: function () {
          SH.Progress.reset();
          SH.Profile.clear();
          state.onboardStep = 0;
          state.draftAge = null;
          go('onboard');
        } },
        { label: 'Cancel', cls: 'btn btn--ghost btn--wide' }
      ]);
    }));
    wrap.appendChild(actions);

    appEl.appendChild(wrap);
  }

  /* ---------------------------- render ---------------------------- */
  function render() {
    if (!profile() && state.view !== 'onboard') state.view = 'onboard';
    renderHud();
    if (state.view === 'onboard') return renderOnboard();
    if (state.view === 'stats') return renderStats();
    if (state.view === 'profile') return renderProfile();
    if (state.view === 'lesson') return;   // the lesson runner owns the screen
    renderPath();
  }

  document.addEventListener('DOMContentLoaded', function () {
    hudEl = document.getElementById('hud');
    appEl = document.getElementById('app');
    SH.Theme.init();
    try {
      var saved = localStorage.getItem(COURSE_KEY);
      if (saved && SH.subject(saved)) state.subjectId = saved;
    } catch (e) {}
    if (!profile()) { state.view = 'onboard'; state.onboardStep = 0; }
    render();
  });
})(window.StudyHub);
