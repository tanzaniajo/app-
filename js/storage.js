/* State: learner profile, XP, hearts, streak and per-lesson progress. All in localStorage. */
window.StudyHub = window.StudyHub || {};

(function (SH) {
  'use strict';

  var KEY = 'studyhub.state.v2';
  var PROFILE_KEY = 'studyhub.profile.v2';
  var THEME_KEY = 'studyhub.theme';

  var MAX_HEARTS = 5;
  var HEART_REFILL_MS = 20 * 60 * 1000;   // one heart every 20 minutes
  var LESSONS_PER_UNIT = 5;
  var QUESTIONS_PER_LESSON = 8;
  var XP_PER_LESSON = 10;

  var blank = {
    xp: 0,
    hearts: { n: MAX_HEARTS, ts: 0 },
    lessons: {},         // "subject/topic/0" -> { done: true, best: 90 }
    topics: {},          // "subject/topic"   -> { asked, correct, sessions }
    totals: { asked: 0, correct: 0 },
    days: {},            // "YYYY-MM-DD" -> questions answered
    goal: 30,            // daily XP goal
    streak: { current: 0, best: 0, last: null }
  };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(blank);
      var data = JSON.parse(raw);
      for (var k in blank) if (!(k in data)) data[k] = clone(blank[k]);
      return data;
    } catch (e) { return clone(blank); }
  }

  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode: run unsaved */ }
    return data;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dayDiff(a, b) {
    return Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);
  }

  /* Hearts regenerate with time, so they are always recomputed on read. */
  function settleHearts(data) {
    var h = data.hearts || { n: MAX_HEARTS, ts: 0 };
    if (h.n >= MAX_HEARTS) { h.n = MAX_HEARTS; h.ts = 0; data.hearts = h; return data; }
    if (!h.ts) h.ts = Date.now();
    var gained = Math.floor((Date.now() - h.ts) / HEART_REFILL_MS);
    if (gained > 0) {
      h.n = Math.min(MAX_HEARTS, h.n + gained);
      h.ts = h.n >= MAX_HEARTS ? 0 : h.ts + gained * HEART_REFILL_MS;
    }
    data.hearts = h;
    return data;
  }

  var Progress = {
    all: function () { return write(settleHearts(read())); },

    /* ---- hearts ---- */
    hearts: function () { return Progress.all().hearts.n; },
    heartsMax: MAX_HEARTS,
    msToNextHeart: function () {
      var d = Progress.all();
      if (d.hearts.n >= MAX_HEARTS) return 0;
      return Math.max(0, HEART_REFILL_MS - (Date.now() - d.hearts.ts));
    },
    loseHeart: function () {
      var d = Progress.all();
      if (d.hearts.n === MAX_HEARTS) d.hearts.ts = Date.now();
      d.hearts.n = Math.max(0, d.hearts.n - 1);
      write(d);
      return d.hearts.n;
    },
    refillHearts: function () {
      var d = Progress.all();
      d.hearts.n = MAX_HEARTS;
      d.hearts.ts = 0;
      return write(d).hearts.n;
    },
    gainHeart: function () {
      var d = Progress.all();
      if (d.hearts.n < MAX_HEARTS) { d.hearts.n += 1; if (d.hearts.n >= MAX_HEARTS) d.hearts.ts = 0; }
      return write(d).hearts.n;
    },

    /* ---- lessons ----
       Keys carry the syllabus stage, because a lesson cleared as a nine-year-old
       is not the same lesson as an adult sees. Changing your age therefore gives
       you a fresh path, and changing back restores the one you had. */
    stageId: function () {
      var p = Profile.get();
      return p ? p.stage.id : 'middle';
    },
    lessonKey: function (s, t, i) { return Progress.stageId() + '/' + s + '/' + t + '/' + i; },
    lesson: function (s, t, i) { return Progress.all().lessons[Progress.lessonKey(s, t, i)] || null; },
    crowns: function (s, t) {
      var d = Progress.all(), n = 0;
      for (var i = 0; i < LESSONS_PER_UNIT; i++) if (d.lessons[Progress.lessonKey(s, t, i)]) n++;
      return n;
    },
    unitComplete: function (s, t) { return Progress.crowns(s, t) >= LESSONS_PER_UNIT; },

    /* Records a finished lesson: XP, streak, accuracy and the crown. */
    finishLesson: function (opts) {
      var d = Progress.all();
      var key = opts.subject + '/' + opts.topic;
      var lessonKey = Progress.lessonKey(opts.subject, opts.topic, opts.lesson);
      var pct = opts.asked ? Math.round((opts.correct / opts.asked) * 100) : 0;

      if (opts.passed) {
        var prev = d.lessons[lessonKey];
        d.lessons[lessonKey] = { done: true, best: Math.max(pct, prev ? prev.best : 0) };
        d.xp += opts.xp == null ? XP_PER_LESSON : opts.xp;
      }

      var t = d.topics[key] || { asked: 0, correct: 0, sessions: 0 };
      t.asked += opts.asked;
      t.correct += opts.correct;
      t.sessions += 1;
      d.topics[key] = t;

      d.totals.asked += opts.asked;
      d.totals.correct += opts.correct;

      var day = today();
      d.days[day] = (d.days[day] || 0) + opts.asked;

      if (d.streak.last !== day) {
        d.streak.current = (d.streak.last && dayDiff(d.streak.last, day) === 1) ? d.streak.current + 1 : 1;
        d.streak.last = day;
        if (d.streak.current > d.streak.best) d.streak.best = d.streak.current;
      }

      return write(d);
    },

    /* ---- rollups for the stats page ---- */
    subject: function (subjectId) {
      var d = Progress.all(), out = { asked: 0, correct: 0, sessions: 0, crowns: 0 };
      Object.keys(d.topics).forEach(function (k) {
        if (k.indexOf(subjectId + '/') !== 0) return;
        out.asked += d.topics[k].asked;
        out.correct += d.topics[k].correct;
        out.sessions += d.topics[k].sessions;
      });
      var prefix = Progress.stageId() + '/' + subjectId + '/';
      Object.keys(d.lessons).forEach(function (k) {
        if (k.indexOf(prefix) === 0) out.crowns++;
      });
      return out;
    },
    topic: function (s, t) {
      return Progress.all().topics[s + '/' + t] || { asked: 0, correct: 0, sessions: 0 };
    },
    xpToday: function () {
      var d = Progress.all();
      return d.days[today()] || 0;
    },
    setGoal: function (n) { var d = Progress.all(); d.goal = n; return write(d); },

    reset: function () { write(clone(blank)); },

    LESSONS_PER_UNIT: LESSONS_PER_UNIT,
    QUESTIONS_PER_LESSON: QUESTIONS_PER_LESSON,
    XP_PER_LESSON: XP_PER_LESSON
  };

  /* ---------------- learner profile: age -> syllabus stage ---------------- */
  var STAGES = [
    { id: 'early',     name: 'Early Years',   min: 4,  max: 7,   label: 'Ages 4–7',
      grades: 'Reception–Year 2 · Grades K–2', bands: [1] },
    { id: 'primary',   name: 'Primary',       min: 8,  max: 10,  label: 'Ages 8–10',
      grades: 'Years 3–6 · Grades 3–5', bands: [1] },
    { id: 'middle',    name: 'Middle School', min: 11, max: 13,  label: 'Ages 11–13',
      grades: 'Years 7–9 · Grades 6–8', bands: [1, 2] },
    { id: 'secondary', name: 'Secondary',     min: 14, max: 16,  label: 'Ages 14–16',
      grades: 'GCSE · Grades 9–11', bands: [2, 3] },
    { id: 'advanced',  name: 'Advanced',      min: 17, max: 120, label: 'Ages 17+',
      grades: 'A-level · College', bands: [3] }
  ];

  function stageForAge(age) {
    for (var i = 0; i < STAGES.length; i++) if (age <= STAGES[i].max) return i;
    return STAGES.length - 1;
  }

  var Profile = {
    get: function () {
      try {
        var raw = localStorage.getItem(PROFILE_KEY);
        if (!raw) return null;
        var p = JSON.parse(raw);
        if (typeof p.age !== 'number' || !isFinite(p.age)) return null;
        p.stageIndex = stageForAge(p.age);
        p.stage = STAGES[p.stageIndex];
        return p;
      } catch (e) { return null; }
    },
    set: function (age, name) {
      var p = { age: age, name: name || '', setAt: new Date().toISOString() };
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
      p.stageIndex = stageForAge(age);
      p.stage = STAGES[p.stageIndex];
      return p;
    },
    clear: function () { try { localStorage.removeItem(PROFILE_KEY); } catch (e) {} },
    stages: STAGES,
    stageForAge: stageForAge
  };

  var Theme = {
    get: function () { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } },
    set: function (mode) {
      try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
      document.documentElement.setAttribute('data-theme', mode);
    },
    init: function () {
      var saved = Theme.get();
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', saved || (dark ? 'dark' : 'light'));
    },
    toggle: function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      Theme.set(next);
      return next;
    }
  };

  /* ---- shared helpers used by every subject generator ---- */
  var U = {
    int: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    /* Sample n distinct items; reshuffles if the pool is smaller than n. */
    sample: function (arr, n) {
      var out = [];
      if (!arr.length) return out;
      while (out.length < n) {
        var batch = U.shuffle(arr);
        for (var i = 0; i < batch.length && out.length < n; i++) out.push(batch[i]);
      }
      return out;
    },
    /* Choose the bank items that suit a learner's stage.

       Items carry their difficulty band as the last element of the tuple. We take
       everything in the stage's own bands; only if that is too thin do we reach for
       the NEAREST band outwards, one step at a time. Never dump the whole bank —
       that is how a seven-year-old ends up with GCSE questions, and a
       seventeen-year-old with "which animal is a mammal". */
    forStage: function (bank, stageIndex) {
      var stage = STAGES[stageIndex == null ? 2 : stageIndex];
      var want = stage.bands;
      var MIN = 8;

      function bandOf(it) {
        var b = it[it.length - 1];
        return typeof b === 'number' ? b : 2;
      }
      function distance(it) {
        var b = bandOf(it), d = Infinity;
        for (var i = 0; i < want.length; i++) d = Math.min(d, Math.abs(b - want[i]));
        return d;
      }

      var buckets = [];
      bank.forEach(function (it) {
        var d = distance(it);
        (buckets[d] = buckets[d] || []).push(it);
      });

      var out = [];
      for (var d = 0; d < buckets.length && out.length < MIN; d++) {
        if (buckets[d]) out = out.concat(buckets[d]);
      }
      return out.length ? out : bank;
    },

    /* Multiple choice from a correct value plus a pool of distractors. */
    choice: function (prompt, correct, pool, extra) {
      var seen = {}; seen[String(correct)] = true;
      var wrong = [];
      U.shuffle(pool).forEach(function (x) {
        var s = String(x);
        if (seen[s] || s === 'undefined' || s === 'NaN') return;
        seen[s] = true;
        if (wrong.length < 3) wrong.push(s);
      });
      var options = U.shuffle([String(correct)].concat(wrong));
      var q = { type: 'choice', prompt: prompt, choices: options, answer: options.indexOf(String(correct)) };
      if (extra) for (var k in extra) q[k] = extra[k];
      return q;
    },
    /* Numeric distractors that stay plausible next to the real answer. */
    nearby: function (n, spread) {
      spread = spread || Math.max(2, Math.round(Math.abs(n) * 0.2) || 2);
      var set = {}, out = [], guard = 0;
      while (out.length < 6 && guard++ < 60) {
        var d = U.int(-spread, spread);
        if (d === 0 || set[n + d]) continue;
        set[n + d] = true;
        out.push(n + d);
      }
      return out;
    }
  };

  SH.Progress = Progress;
  SH.Profile = Profile;
  SH.STAGES = STAGES;
  SH.Theme = Theme;
  SH.U = U;
  SH.subjects = SH.subjects || [];
  SH.register = function (subject) { SH.subjects.push(subject); };
  SH.subject = function (id) {
    for (var i = 0; i < SH.subjects.length; i++) if (SH.subjects[i].id === id) return SH.subjects[i];
    return null;
  };
})(window.StudyHub);
