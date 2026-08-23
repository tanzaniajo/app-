/* The Coach: works out what specifically went wrong in a question you got wrong,
   then walks you through it — you say what you think your mistake was, it tells you
   whether you're right, then you rewrite the answer and it checks that too.

   This is deterministic analysis, not a language model. It can be this specific
   because it already knows the question, your answer, the right answer and the
   reasoning — so it compares them and recognises the classic error patterns
   (sign slips, order of operations, area vs perimeter, tone errors, doubled
   letters, synonym-for-antonym, and so on). It runs offline with everything else. */
(function (SH) {
  'use strict';

  /* ------------------------------ utilities ------------------------------ */

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().trim()
      .replace(/[“”"']/g, '').replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, '');
  }

  /* Pull a number out of "$12.50", "48 cm²", "3/4", "25%". */
  function numberOf(text) {
    if (text == null) return null;
    var s = String(text).replace(/[$,\s]/g, '');
    var frac = s.match(/^(-?\d+)\/(\d+)$/);
    if (frac) return +frac[1] / +frac[2];
    var m = s.match(/-?\d+(?:\.\d+)?/);
    if (!m) return null;
    return parseFloat(m[0]);
  }

  function numbersIn(text) {
    var out = [], m, re = /-?\d+(?:\.\d+)?/g;
    while ((m = re.exec(String(text)))) out.push(parseFloat(m[0]));
    return out;
  }

  function close(a, b) { return a != null && b != null && Math.abs(a - b) < 1e-6; }

  /* Pull a chain like "12 - 4 * 2" out of a prompt and work it out twice:
     once strictly left to right, once respecting precedence. If the learner's
     answer matches the left-to-right value, that IS the mistake. */
  function operatorChain(text) {
    var s = String(text).replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-');
    var m = s.match(/\d+(?:\.\d+)?(?:\s*[-+*\/]\s*\d+(?:\.\d+)?){1,}/);
    if (!m) return null;
    var tokens = m[0].replace(/\s+/g, '').match(/\d+(?:\.\d+)?|[-+*\/]/g);
    if (!tokens || tokens.length < 5) return null;      // needs at least two operators

    function apply(a, op, b) {
      return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
    }

    var i;
    var l2r = parseFloat(tokens[0]);
    for (i = 1; i < tokens.length; i += 2) l2r = apply(l2r, tokens[i], parseFloat(tokens[i + 1]));

    var pass = [parseFloat(tokens[0])];
    for (i = 1; i < tokens.length; i += 2) {
      var op = tokens[i], rhs = parseFloat(tokens[i + 1]);
      if (op === '*' || op === '/') pass[pass.length - 1] = apply(pass[pass.length - 1], op, rhs);
      else { pass.push(op); pass.push(rhs); }
    }
    var proper = pass[0];
    for (i = 1; i < pass.length; i += 2) proper = apply(proper, pass[i], pass[i + 1]);

    return { l2r: l2r, proper: proper, text: m[0] };
  }

  var TONE_BASE = { 'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e',
                    'ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o',
                    'ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü' };
  var TONE_NUMBER = { 'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,
                      'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4 };
  function stripTones(s) {
    return String(s).split('').map(function (c) { return TONE_BASE[c] || c; }).join('');
  }
  function toneNumbers(s) {
    var out = [];
    String(s).split('').forEach(function (c) { if (TONE_NUMBER[c]) out.push(TONE_NUMBER[c]); });
    return out;
  }
  function isPinyin(s) { return /^[a-zA-Züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔù' ]+$/.test(String(s)); }
  function hasHanzi(s) { return /[㐀-鿿]/.test(String(s)); }
  function sharedChars(a, b) {
    var set = {}, out = [];
    String(a).split('').forEach(function (c) { set[c] = true; });
    String(b).split('').forEach(function (c) { if (set[c] && out.indexOf(c) === -1 && /[㐀-鿿]/.test(c)) out.push(c); });
    return out;
  }

  /* First point where two spellings differ, described in words. */
  function spellingDiff(given, right) {
    var g = norm(given), r = norm(right);
    for (var i = 0; i < Math.max(g.length, r.length); i++) {
      if (g.charAt(i) !== r.charAt(i)) {
        var gc = g.charAt(i) || '(nothing)', rc = r.charAt(i) || '(nothing)';
        // doubled-letter mistakes are the most common, so name them directly
        var rDouble = r.charAt(i) === r.charAt(i + 1);
        var gDouble = g.charAt(i) === g.charAt(i + 1);
        if (rDouble && !gDouble) return 'you wrote one "' + rc + '" where the word has two';
        if (gDouble && !rDouble) return 'you doubled the "' + gc + '" — it only has one';
        if (g.length < r.length) return 'you left out the "' + rc + '"';
        if (g.length > r.length) return 'you added an extra "' + gc + '"';
        return 'you wrote "' + gc + '" where it should be "' + rc + '"';
      }
    }
    return 'the letters are in a different order';
  }

  /* ---------------------------- the diagnosis ---------------------------- */
  /* Returns { cause, accept, hints } where `accept` lists keyword groups that
     count as correctly identifying the mistake. */

  function diagnoseMath(m) {
    var given = numberOf(m.given), right = numberOf(m.answer);
    var nums = numbersIn(m.prompt);
    var p = String(m.prompt);

    if (given != null && right != null) {
      if (close(given, -right)) return {
        cause: 'You have the right size but the wrong sign — the answer is ' + (right < 0 ? 'negative' : 'positive') + ', not ' + (given < 0 ? 'negative' : 'positive') + '.',
        accept: [['sign', 'negative', 'positive', 'minus', 'plus']],
        hints: ['I got the sign the wrong way round', 'I multiplied instead of adding', 'I misread a number', 'I used the wrong formula']
      };
      if (close(Math.abs(given - right), 1)) return {
        cause: 'You are out by exactly one — a counting or carrying slip rather than the wrong method.',
        accept: [['off by one', 'one out', 'counting', 'carry', 'carrying', 'miscounted', 'by 1', 'by one']],
        hints: ['I was out by one', 'I used the wrong operation', 'I misread the question', 'I forgot a step']
      };
      if (close(given, right * 2)) return {
        cause: 'Your answer is exactly double the right one — the most common cause is forgetting to halve, as in the ½ × base × height of a triangle.',
        accept: [['double', 'twice', 'halve', 'half', 'divide by 2', 'forgot to halve']],
        hints: ['I forgot to halve it', 'I got the sign wrong', 'I added instead of multiplying', 'I misread the numbers']
      };
      if (close(given, right / 2)) return {
        cause: 'Your answer is exactly half the right one — you halved something that should not have been halved, or missed a doubling step.',
        accept: [['half', 'halved', 'double', 'doubling', 'divided by 2']],
        hints: ['I halved it when I should not have', 'I got the sign wrong', 'I misread a number', 'I used the wrong formula']
      };
      if (close(given, right * 100) || close(given, right / 100)) return {
        cause: 'You are out by a factor of 100 — that is the percent-to-decimal step: 25% means 0.25, not 25.',
        accept: [['percent', 'decimal', '100', 'hundred', 'place value', 'point']],
        hints: ['I mixed up the percentage and the decimal', 'I added instead of multiplying', 'I was out by one', 'I used the wrong formula']
      };
      var chain = operatorChain(p);
      if (chain && close(given, chain.l2r) && close(right, chain.proper) && !close(chain.l2r, chain.proper)) return {
        cause: 'You worked "' + chain.text + '" straight from left to right. Multiplication and division come before addition and subtraction, so that part happens first — which gives ' + chain.proper + ', not ' + chain.l2r + '.',
        accept: [['order', 'bodmas', 'bidmas', 'pemdas', 'left to right', 'brackets', 'first', 'operations', 'precedence']],
        hints: ['I did the operations in the wrong order', 'I made an arithmetic slip', 'I misread a number', 'I used the wrong formula']
      };

      if (nums.length >= 2) {
        var a = nums[0], b = nums[1], c = nums[2];
        if (close(given, a + b) && close(right, a * b)) return {
          cause: 'You added ' + a + ' and ' + b + ' where the question needed you to multiply them.',
          accept: [['add', 'added', 'plus', 'sum', 'multiply', 'times', 'multiplied']],
          hints: ['I added instead of multiplying', 'I got the sign wrong', 'I was out by one', 'I misread the question']
        };
        if (close(given, a * b) && close(right, a + b)) return {
          cause: 'You multiplied ' + a + ' and ' + b + ' where the question needed you to add them.',
          accept: [['multiply', 'multiplied', 'times', 'add', 'adding', 'plus']],
          hints: ['I multiplied instead of adding', 'I was out by one', 'I got the sign wrong', 'I used the wrong formula']
        };
        if (c != null && close(given, (a + b) * c) && close(right, a + b * c)) return {
          cause: 'You worked left to right. Multiplication comes before addition, so ' + b + ' × ' + c + ' happens first.',
          accept: [['order', 'bodmas', 'bidmas', 'pemdas', 'left to right', 'brackets', 'multiplication first', 'operations']],
          hints: ['I did the operations in the wrong order', 'I added instead of multiplying', 'I misread a number', 'I was out by one']
        };
        if (close(given, 2 * (a + b)) && close(right, a * b)) return {
          cause: 'You found the perimeter instead of the area. Perimeter adds the sides; area multiplies them.',
          accept: [['perimeter', 'area', 'formula', 'wrong formula']],
          hints: ['I used the perimeter formula instead of area', 'I added instead of multiplying', 'I was out by one', 'I misread the units']
        };
        if (close(given, a * b) && close(right, 2 * (a + b))) return {
          cause: 'You found the area instead of the perimeter. Perimeter is the distance all the way round.',
          accept: [['perimeter', 'area', 'formula', 'wrong formula']],
          hints: ['I used the area formula instead of perimeter', 'I multiplied instead of adding', 'I was out by one', 'I misread the units']
        };
      }
      // fraction added straight across: 1/2 + 1/3 answered as 2/5
      var gf = String(m.given).match(/^(\d+)\/(\d+)$/), pf = p.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
      if (gf && pf && +gf[1] === +pf[1] + +pf[3] && +gf[2] === +pf[2] + +pf[4]) return {
        cause: 'You added the tops and the bottoms separately. Fractions must be given a common denominator first.',
        accept: [['denominator', 'common', 'bottom', 'across', 'separately', 'top']],
        hints: ['I added the tops and bottoms separately', 'I forgot to simplify', 'I was out by one', 'I multiplied instead']
      };
      return {
        cause: 'The method was not the problem so much as the arithmetic: you answered ' + m.given + ' where the correct value is ' + right + '. Work it through one step at a time.',
        accept: [['arithmetic', 'slip', 'calculation', 'miscalculated', 'careless', 'mental', 'rushed', 'added', 'subtracted', 'multiplied', 'divided', 'misread']],
        hints: ['I made an arithmetic slip', 'I used the wrong formula', 'I misread the question', 'I did the steps in the wrong order']
      };
    }

    return {
      cause: 'You chose "' + m.given + '" where the answer is "' + m.answer + '". ' + (m.explanation || ''),
      accept: [['formula', 'method', 'misread', 'wrong', 'steps', 'order', 'rule']],
      hints: ['I used the wrong method', 'I misread the question', 'I rushed the arithmetic', 'I did not know the rule']
    };
  }

  function diagnoseChinese(m) {
    var given = String(m.given), right = String(m.answer);

    if (isPinyin(given) && isPinyin(right) && stripTones(given) === stripTones(right)) {
      var g = toneNumbers(given), r = toneNumbers(right);
      var where = '';
      for (var i = 0; i < Math.max(g.length, r.length); i++) {
        if (g[i] !== r[i]) { where = ' The tone on syllable ' + (i + 1) + ' should be ' + (r[i] || 'neutral') + ', not ' + (g[i] || 'neutral') + '.'; break; }
      }
      return {
        cause: 'The syllables were right — the tones were not.' + where + ' In Chinese a tone is part of the word, not decoration.',
        accept: [['tone', 'tones', 'accent', 'mark', 'pitch', 'wrong tone']],
        hints: ['I got the tone wrong', 'I picked the wrong syllable', 'I confused it with another word', 'I did not know the word']
      };
    }

    if (hasHanzi(given) && hasHanzi(right)) {
      var shared = sharedChars(given, right);
      if (shared.length) return {
        cause: 'You picked a word that shares the character ' + shared.join('') + ' with the right answer. Sharing a character does not mean sharing a meaning — 电脑, 电视 and 电话 all start with 电.',
        accept: [['similar', 'looks like', 'look alike', 'shares', 'same character', 'confused', 'mixed up', 'similar character', 'looked similar']],
        hints: ['I confused it with a word that looks similar', 'I got the tone wrong', 'I guessed', 'I remembered the wrong meaning']
      };
      return {
        cause: 'You chose ' + given + ' where the answer is ' + right + '. These are different words, so this is recall rather than a slip — worth adding to your flashcards.',
        accept: [['did not know', 'didnt know', 'dont know', 'forgot', 'guess', 'guessed', 'recall', 'remember', 'memor']],
        hints: ['I did not know the word', 'I confused two similar words', 'I got the tone wrong', 'I misread the question']
      };
    }

    return {
      cause: 'You answered "' + given + '" where the answer is "' + right + '". ' + (m.explanation || ''),
      accept: [['tone', 'character', 'meaning', 'forgot', 'guess', 'confused', 'did not know', 'didnt know']],
      hints: ['I did not know it', 'I confused two similar words', 'I got the tone wrong', 'I misread the question']
    };
  }

  function diagnoseEnglish(m) {
    var kicker = norm(m.kicker), prompt = norm(m.prompt);

    if (kicker.indexOf('spelling') !== -1 || prompt.indexOf('spelled') !== -1) {
      return {
        cause: 'Spelling: ' + spellingDiff(m.given, m.answer) + '.',
        accept: [['spell', 'spelling', 'letter', 'letters', 'double', 'missed', 'missing', 'extra', 'typo']],
        hints: ['I spelled it wrong', 'I did not know the word', 'I misread the options', 'I confused it with another word']
      };
    }

    if (prompt.indexOf('opposite') !== -1) {
      return {
        cause: 'The question asked for the opposite, and you gave a word with a similar meaning instead. Read whether it wants a synonym or an antonym before choosing.',
        accept: [['opposite', 'antonym', 'synonym', 'similar', 'misread', 'read the question', 'backwards', 'reversed']],
        hints: ['I gave a similar word instead of an opposite', 'I did not know the word', 'I guessed', 'I misread the options']
      };
    }

    if (kicker.indexOf('sentence') !== -1 || kicker.indexOf('gap') !== -1 || kicker.indexOf('grammar') !== -1) {
      return {
        cause: 'A grammar rule decided this one: ' + (m.explanation || 'the form you chose does not fit the sentence.'),
        accept: [['grammar', 'tense', 'rule', 'agreement', 'plural', 'singular', 'preposition', 'article', 'form', 'verb']],
        hints: ['I did not know the grammar rule', 'It sounded right so I guessed', 'I misread the sentence', 'I confused two similar forms']
      };
    }

    return {
      cause: 'You chose "' + m.given + '" where the answer is "' + m.answer + '". ' + (m.explanation || ''),
      accept: [['meaning', 'definition', 'confused', 'did not know', 'didnt know', 'forgot', 'guess', 'mixed up', 'similar']],
      hints: ['I did not know the word', 'I confused it with a similar word', 'I guessed', 'I misread the question']
    };
  }

  function diagnoseScience(m) {
    return {
      cause: 'You chose "' + m.given + '". ' + (m.explanation || 'The correct answer is "' + m.answer + '".'),
      accept: [['did not know', 'didnt know', 'dont know', 'forgot', 'guess', 'guessed', 'confused', 'mixed up',
                'misread', 'wrong', 'remember', 'misunderstood', 'thought']],
      hints: ['I mixed up two similar ideas', 'I did not know this fact', 'I guessed', 'I misread the question']
    };
  }

  function diagnose(m) {
    var d;
    if (m.subject === 'math') d = diagnoseMath(m);
    else if (m.subject === 'chinese') d = diagnoseChinese(m);
    else if (m.subject === 'english') d = diagnoseEnglish(m);
    else d = diagnoseScience(m);
    d.hints = (d.hints || []).slice(0, 4);
    return d;
  }

  /* Did the learner correctly identify their own mistake? */
  function matchDiagnosis(text, diagnosis) {
    var t = norm(text);
    if (!t) return { ok: false, empty: true };
    if (/^(i (dont|do not|don't) know|no idea|not sure|dunno)$/.test(t)) return { ok: false, unsure: true };

    var groups = diagnosis.accept || [];
    for (var i = 0; i < groups.length; i++) {
      for (var j = 0; j < groups[i].length; j++) {
        if (t.indexOf(groups[i][j]) !== -1) return { ok: true, matched: groups[i][j] };
      }
    }
    return { ok: false };
  }

  /* Did their rewritten answer match? */
  function checkAnswer(text, mistake) {
    var given = norm(text);
    if (!given) return { ok: false, empty: true };
    var right = norm(mistake.answer);
    if (given === right) return { ok: true };

    var a = numberOf(text), b = numberOf(mistake.answer);
    if (a != null && b != null && close(a, b)) return { ok: true, loose: 'the number is right' };

    // allow the answer with or without units, and "the" / "a" in front
    var stripped = given.replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9㐀-鿿\/=+\-.]/g, '');
    var rightStripped = right.replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9㐀-鿿\/=+\-.]/g, '');
    if (stripped && stripped === rightStripped) return { ok: true, loose: 'wording differs slightly' };

    if (given === norm(mistake.given)) return { ok: false, repeated: true };
    return { ok: false };
  }

  SH.Coach = {
    diagnose: diagnose,
    matchDiagnosis: matchDiagnosis,
    checkAnswer: checkAnswer,
    norm: norm,
    numberOf: numberOf,
    spellingDiff: spellingDiff
  };
})(window.StudyHub);
