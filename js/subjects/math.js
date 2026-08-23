/* Math — questions are generated live and scaled to the learner's stage,
   so a six-year-old counts to twenty while a sixth-former factorises quadratics. */
(function (SH) {
  'use strict';
  var U = SH.U;

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a * b / gcd(a, b); }
  function frac(n, d) { var g = gcd(n, d) || 1; return (n / g) + '/' + (d / g); }
  function round(x, places) { var f = Math.pow(10, places == null ? 2 : places); return Math.round(x * f) / f; }
  function money(x) { return '$' + x.toFixed(2); }
  function num(prompt, value, opts) {
    var q = { type: 'input', prompt: prompt, answer: String(value), accept: [String(value)] };
    if (opts) for (var k in opts) q[k] = opts[k];
    return q;
  }

  /* ============================ arithmetic ============================ */
  var arith = {
    addSmall: function () {
      var a = U.int(1, 12), b = U.int(1, 20 - a), v = a + b;
      return U.choice(a + ' + ' + b + ' = ?', v, U.nearby(v, 4), {
        explanation: 'Start at ' + a + ' and count on ' + b + ' to reach ' + v + '.'
      });
    },
    subSmall: function () {
      var a = U.int(6, 20), b = U.int(1, a - 1), v = a - b;
      return U.choice(a + ' − ' + b + ' = ?', v, U.nearby(v, 4), {
        explanation: 'Count back ' + b + ' from ' + a + ' to land on ' + v + '. Check: ' + v + ' + ' + b + ' = ' + a + '.'
      });
    },
    doubles: function () {
      var a = U.int(2, 12), v = a * 2;
      return U.choice('Double ' + a + ' is...', v, U.nearby(v, 5), {
        explanation: a + ' + ' + a + ' = ' + v + '.'
      });
    },
    easyTables: function () {
      var a = U.pick([2, 5, 10]), b = U.int(2, 10), v = a * b;
      return U.choice(a + ' × ' + b + ' = ?', v, U.nearby(v, Math.max(4, a * 2)), {
        explanation: b + ' groups of ' + a + ' makes ' + v + '.'
      });
    },
    add: function () {
      var a = U.int(24, 480), b = U.int(24, 480), v = a + b;
      return U.choice(a + ' + ' + b + ' = ?', v, U.nearby(v, 12), {
        explanation: a + ' + ' + b + ' = ' + v + '. Add the ones, then the tens, carrying as you go.'
      });
    },
    sub: function () {
      var a = U.int(120, 900), b = U.int(20, a - 10), v = a - b;
      return U.choice(a + ' − ' + b + ' = ?', v, U.nearby(v, 12), {
        explanation: 'Check by adding back: ' + v + ' + ' + b + ' = ' + a + '.'
      });
    },
    mul: function () {
      var a = U.int(6, 19), b = U.int(6, 25), v = a * b;
      return U.choice(a + ' × ' + b + ' = ?', v, U.nearby(v, Math.max(6, Math.round(v * 0.15))), {
        explanation: 'Split it: ' + a + '×' + (b - b % 10) + ' + ' + a + '×' + (b % 10) + ' = ' + v + '.'
      });
    },
    div: function () {
      var b = U.int(3, 15), v = U.int(4, 30), a = b * v;
      return U.choice(a + ' ÷ ' + b + ' = ?', v, U.nearby(v, 6), {
        explanation: b + ' × ' + v + ' = ' + a + ', so ' + a + ' ÷ ' + b + ' = ' + v + '.'
      });
    },
    order: function () {
      var a = U.int(2, 9), b = U.int(2, 9), c = U.int(2, 12), v = a + b * c;
      return U.choice(a + ' + ' + b + ' × ' + c + ' = ?', v, [(a + b) * c, a + b + c, a * b + c, v + c, v - b], {
        explanation: 'Multiply first: ' + b + ' × ' + c + ' = ' + (b * c) + ', then add ' + a + ' to get ' + v + '.'
      });
    },
    negatives: function () {
      var a = U.int(-15, -2), b = U.int(2, 18), v = a + b;
      return U.choice('(' + a + ') + ' + b + ' = ?', v, U.nearby(v, 6), {
        explanation: 'Move ' + b + ' steps up the number line from ' + a + ' to reach ' + v + '.'
      });
    },
    factors: function () {
      var a = U.int(12, 60), b = U.int(12, 60);
      var v = gcd(a, b);
      return U.choice('What is the highest common factor of ' + a + ' and ' + b + '?', v,
        [lcm(a, b), v * 2, v + 1, Math.min(a, b), 1], {
          explanation: 'The largest number dividing both ' + a + ' and ' + b + ' exactly is ' + v + '.'
        });
    },
    lcmQ: function () {
      var a = U.int(3, 12), b = U.int(3, 12);
      var v = lcm(a, b);
      return U.choice('What is the lowest common multiple of ' + a + ' and ' + b + '?', v,
        [a * b, gcd(a, b), v + a, v - b, v * 2], {
          explanation: 'The smallest number both ' + a + ' and ' + b + ' divide into is ' + v + '.'
        });
    },
    indices: function () {
      var base = U.int(2, 7), a = U.int(2, 6), b = U.int(2, 6);
      var mult = Math.random() < 0.5;
      var v = mult ? a + b : Math.abs(a - b) || 1;
      var expr = mult ? base + '^' + a + ' × ' + base + '^' + b : base + '^' + Math.max(a, b) + ' ÷ ' + base + '^' + Math.min(a, b);
      if (!mult) v = Math.max(a, b) - Math.min(a, b);
      return U.choice('Simplify: ' + expr, base + '^' + v,
        [base + '^' + (a * b), base + '^' + (mult ? a * b : a + b), (base * base) + '^' + v, base + '^' + (v + 1), base + '^' + (v - 1)], {
          explanation: mult
            ? 'Multiplying powers of the same base adds the indices: ' + a + ' + ' + b + ' = ' + v + '.'
            : 'Dividing powers of the same base subtracts the indices: ' + Math.max(a, b) + ' − ' + Math.min(a, b) + ' = ' + v + '.'
        });
    },
    standardForm: function () {
      var mantissa = round(U.int(101, 989) / 100, 2);
      var power = U.int(3, 7);
      var value = mantissa * Math.pow(10, power);
      return U.choice('Write ' + value.toLocaleString('en-US') + ' in standard form.',
        mantissa + ' × 10^' + power,
        [mantissa + ' × 10^' + (power + 1), mantissa + ' × 10^' + (power - 1), (mantissa * 10) + ' × 10^' + power, (mantissa / 10) + ' × 10^' + power], {
          explanation: 'Move the decimal point so the first number is between 1 and 10: ' + mantissa + ' × 10^' + power + '.'
        });
    },
    sigFigs: function () {
      var value = round(U.int(10000, 999999) / 100, 2);
      var v = Number(value.toPrecision(3));
      return U.choice('Round ' + value + ' to 3 significant figures.', v,
        [Number(value.toPrecision(2)), Number(value.toPrecision(4)), Math.round(value), round(v + 1, 1)], {
          explanation: 'The first three significant digits give ' + v + '.'
        });
    },
    surds: function () {
      var sq = U.pick([4, 9, 16, 25, 36]);
      var rest = U.pick([2, 3, 5, 6, 7]);
      var inside = sq * rest;
      var v = Math.sqrt(sq) + '√' + rest;
      return U.choice('Simplify √' + inside, v,
        [inside + '√' + rest, Math.sqrt(sq) + '√' + inside, (Math.sqrt(sq) + 1) + '√' + rest, sq + '√' + rest], {
          explanation: '√' + inside + ' = √' + sq + ' × √' + rest + ' = ' + v + '.'
        });
    }
  };

  /* ====================== fractions / decimals / % ====================== */
  var fr = {
    halves: function () {
      var v = U.int(2, 12), whole = v * 2;
      return U.choice('What is half of ' + whole + '?', v, U.nearby(v, 4), {
        explanation: 'Half means split into two equal parts: ' + whole + ' ÷ 2 = ' + v + '.'
      });
    },
    fractionOf: function () {
      var d = U.pick([2, 3, 4, 5]), v = U.int(2, 8), whole = d * v;
      return U.choice('What is 1/' + d + ' of ' + whole + '?', v, U.nearby(v, 4), {
        explanation: 'Share ' + whole + ' into ' + d + ' equal groups: each is ' + v + '.'
      });
    },
    simplify: function () {
      var base = U.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6], [3, 8]]);
      var k = U.int(2, 9), a = base[0] * k, b = base[1] * k, v = frac(a, b);
      return U.choice('Write ' + a + '/' + b + ' in its simplest form.', v,
        [frac(a, b + k), frac(a + k, b), base[0] + '/' + (base[1] + 1), a + '/' + b], {
          explanation: 'Divide top and bottom by ' + gcd(a, b) + ': ' + a + '/' + b + ' = ' + v + '.'
        });
    },
    addSame: function () {
      var d = U.int(4, 12), a = U.int(1, d - 2), b = U.int(1, d - a), v = frac(a + b, d);
      return U.choice(a + '/' + d + ' + ' + b + '/' + d + ' = ?', v,
        [frac(a + b, d + d), (a + b) + '/' + (d * 2), frac(a + b + 1, d), frac(Math.abs(a - b), d)], {
          explanation: 'Same denominator, so add the numerators: ' + (a + b) + '/' + d + ' = ' + v + '.'
        });
    },
    addDiff: function () {
      var pair = U.pick([[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 6], [3, 5]]);
      var c = pair[0], d = pair[1], a = U.int(1, c - 1), b = U.int(1, d - 1);
      var den = c * d, top = a * d + b * c, v = frac(top, den);
      return U.choice(a + '/' + c + ' + ' + b + '/' + d + ' = ?', v,
        [(a + b) + '/' + (c + d), frac(top + 1, den), frac(a * b, c * d), frac(Math.abs(a * d - b * c), den)], {
          explanation: 'Common denominator ' + den + ': ' + (a * d) + '/' + den + ' + ' + (b * c) + '/' + den + ' = ' + v + '.'
        });
    },
    multiply: function () {
      var b = U.int(3, 8), a = U.int(1, b - 1), d = U.int(3, 8), c = U.int(1, d - 1);
      var v = frac(a * c, b * d);
      return U.choice(a + '/' + b + ' × ' + c + '/' + d + ' = ?', v,
        [frac(a + c, b + d), frac(a * d, b * c), frac(a * c, b + d), frac(a + c, b * d),
         frac(a * c + 1, b * d), frac(a * c, b * d + 1)], {
          explanation: 'Multiply the tops and the bottoms: ' + (a * c) + '/' + (b * d) + ' = ' + v + '.'
        });
    },
    divide: function () {
      var b = U.int(3, 8), a = U.int(1, b - 1), d = U.int(3, 8), c = U.int(1, d - 1);
      var v = frac(a * d, b * c);
      return U.choice(a + '/' + b + ' ÷ ' + c + '/' + d + ' = ?', v,
        [frac(a * c, b * d), frac(a + d, b + c), frac(b * c, a * d), frac(a * d, b + c),
         frac(a * d + 1, b * c), frac(a * d, b * c + 1)], {
          explanation: 'Dividing by a fraction means multiplying by its reciprocal: ' + a + '/' + b + ' × ' + d + '/' + c + ' = ' + v + '.'
        });
    },
    toDecimal: function () {
      var f = U.pick([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8], [1, 8, 0.125], [3, 8, 0.375], [1, 10, 0.1], [7, 10, 0.7], [1, 20, 0.05]]);
      var v = f[2];
      return U.choice('Write ' + f[0] + '/' + f[1] + ' as a decimal.', v,
        [round(v * 10, 3), round(v / 10, 4), round(v + 0.1, 3), round(v * 2, 3)], {
          explanation: f[0] + ' ÷ ' + f[1] + ' = ' + v + '.'
        });
    },
    percentOf: function () {
      var pct = U.pick([5, 10, 15, 20, 25, 40, 50, 60, 75, 80]);
      var whole = U.pick([20, 40, 60, 80, 120, 160, 200, 240, 300, 400]);
      var v = round(whole * pct / 100);
      return U.choice('What is ' + pct + '% of ' + whole + '?', v, U.nearby(v, Math.max(3, Math.round(v * 0.3))), {
        explanation: pct + '% = ' + (pct / 100) + ', and ' + (pct / 100) + ' × ' + whole + ' = ' + v + '.'
      });
    },
    percentChange: function () {
      var start = U.pick([40, 50, 80, 120, 150, 200, 250]);
      var change = U.pick([10, 20, 25, 50]);
      var up = Math.random() < 0.5;
      var delta = start * change / 100;
      var v = round(up ? start + delta : start - delta);
      return U.choice('A price of $' + start + ' ' + (up ? 'rises' : 'falls') + ' by ' + change + '%. What is the new price?',
        v, [start, round(delta), round(up ? start - delta : start + delta), round(v + change), round(v - change)], {
          explanation: change + '% of ' + start + ' is ' + round(delta) + ', so the new price is ' + v + '.'
        });
    },
    reversePercent: function () {
      var original = U.pick([40, 60, 80, 120, 200, 250]);
      var change = U.pick([10, 20, 25]);
      var after = round(original * (1 + change / 100));
      return U.choice('After a ' + change + '% increase, a price is $' + after + '. What was the original price?',
        original, [round(after * (1 - change / 100)), round(after - change), original + change, round(after / 2)], {
          explanation: 'The new price is ' + (100 + change) + '% of the original, so divide: ' + after + ' ÷ ' + (1 + change / 100) + ' = ' + original + '.'
        });
    },
    compound: function () {
      var principal = U.pick([500, 1000, 2000, 2500]);
      var rate = U.pick([2, 3, 4, 5]);
      var years = U.int(2, 4);
      var v = round(principal * Math.pow(1 + rate / 100, years));
      return U.choice('$' + principal + ' is invested at ' + rate + '% compound interest for ' + years + ' years. What is it worth?',
        money(v), [money(round(principal * (1 + rate * years / 100))), money(round(v + principal * rate / 100)), money(principal), money(round(v - principal))], {
          explanation: principal + ' × 1.0' + (rate < 10 ? rate : rate) + '^' + years + ' = ' + money(v) + '. Simple interest would give less.'
        });
    },
    compare: function () {
      var f1 = U.pick([[1, 2], [2, 3], [3, 4], [3, 5], [5, 8], [2, 5], [4, 7]]);
      var f2 = U.pick([[1, 3], [3, 8], [5, 6], [4, 5], [1, 4], [5, 9], [3, 7]]);
      var v1 = f1[0] / f1[1], v2 = f2[0] / f2[1];
      var labels = [f1[0] + '/' + f1[1], f2[0] + '/' + f2[1], 'they are equal'];
      var ans = v1 > v2 ? labels[0] : (v2 > v1 ? labels[1] : labels[2]);
      return {
        type: 'choice',
        prompt: 'Which is larger: ' + labels[0] + ' or ' + labels[1] + '?',
        choices: labels, answer: labels.indexOf(ans),
        explanation: 'As decimals: ' + round(v1, 3) + ' and ' + round(v2, 3) + '.'
      };
    }
  };

  /* ============================== algebra ============================== */
  var alg = {
    missing: function () {
      var x = U.int(2, 12), b = U.int(1, 10), c = x + b;
      return U.choice('What number goes in the box?   ▢ + ' + b + ' = ' + c, x, U.nearby(x, 4), {
        explanation: 'Take ' + b + ' away from ' + c + ': ' + c + ' − ' + b + ' = ' + x + '.'
      });
    },
    linear: function () {
      var x = U.int(2, 20), b = U.int(1, 30), c = x + b;
      return num('Solve for x:  x + ' + b + ' = ' + c, x, {
        explanation: 'Subtract ' + b + ' from both sides: x = ' + x + '.'
      });
    },
    twoStep: function () {
      var a = U.int(2, 9), x = U.int(2, 15), b = U.int(1, 25), c = a * x + b;
      return num('Solve for x:  ' + a + 'x + ' + b + ' = ' + c, x, {
        explanation: 'Subtract ' + b + ': ' + a + 'x = ' + (c - b) + '. Divide by ' + a + ': x = ' + x + '.'
      });
    },
    evaluate: function () {
      var a = U.int(2, 9), b = U.int(2, 12), x = U.int(2, 10), v = a * x * x - b;
      return U.choice('If x = ' + x + ', what is ' + a + 'x² − ' + b + '?', v,
        [a * x * 2 - b, a * x * x + b, (a * x) * (a * x) - b, v + b, v - x], {
          explanation: 'x² = ' + (x * x) + ', so ' + a + '×' + (x * x) + ' − ' + b + ' = ' + v + '.'
        });
    },
    simplify: function () {
      var a = U.int(2, 9), b = U.int(2, 9), c = U.int(2, 9);
      var res = (a + b) + 'x + ' + c;
      return U.choice('Simplify:  ' + a + 'x + ' + b + 'x + ' + c, res,
        [(a * b) + 'x + ' + c, (a + b + c) + 'x', (a + b) + 'x − ' + c, (a + c) + 'x + ' + b], {
          explanation: 'Only like terms combine: ' + a + 'x + ' + b + 'x = ' + (a + b) + 'x.'
        });
    },
    expand: function () {
      var a = U.int(2, 8), b = U.int(2, 9), c = U.int(2, 9);
      var out = (a * b) + 'x + ' + (a * c);
      return U.choice('Expand:  ' + a + '(' + b + 'x + ' + c + ')', out,
        [(a * b) + 'x + ' + c, (a + b) + 'x + ' + (a + c), (a * b) + 'x + ' + (a * c + a), b + 'x + ' + (a * c)], {
          explanation: 'Multiply both terms by ' + a + ': ' + (a * b) + 'x and ' + (a * c) + '.'
        });
    },
    factorise: function () {
      var k = U.int(2, 9), b = U.int(2, 9), c = U.int(2, 9);
      var expr = (k * b) + 'x + ' + (k * c);
      return U.choice('Factorise fully:  ' + expr, k + '(' + b + 'x + ' + c + ')',
        [1 + '(' + (k * b) + 'x + ' + (k * c) + ')', b + '(' + k + 'x + ' + c + ')', k + '(' + b + 'x + ' + (k * c) + ')', (k * b) + '(x + ' + c + ')'], {
          explanation: 'The highest common factor of ' + (k * b) + ' and ' + (k * c) + ' is ' + k + '.'
        });
    },
    sequence: function () {
      var start = U.int(2, 12), step = U.int(2, 11);
      var terms = [start, start + step, start + 2 * step, start + 3 * step];
      var v = start + 4 * step;
      return U.choice('What comes next?  ' + terms.join(', ') + ', __', v,
        [v + step, v - 1, v + 1, terms[3] * 2], {
          explanation: 'Each term rises by ' + step + ', so the next is ' + terms[3] + ' + ' + step + ' = ' + v + '.'
        });
    },
    nthTerm: function () {
      var a = U.int(1, 10), d = U.int(2, 9);
      var terms = [a, a + d, a + 2 * d, a + 3 * d];
      var c = a - d;
      var v = d + 'n' + (c === 0 ? '' : (c > 0 ? ' + ' + c : ' − ' + Math.abs(c)));
      return U.choice('Find the nth term of:  ' + terms.join(', ') + ', ...', v,
        [d + 'n', d + 'n + ' + a, (d + 1) + 'n + ' + c, a + 'n + ' + d, d + 'n − ' + a], {
          explanation: 'The common difference is ' + d + ', so start with ' + d + 'n. At n = 1 that gives ' + d + ', and we need ' + a + ', so the nth term is ' + v + '.'
        });
    },
    quadratic: function () {
      var p = U.int(1, 8), q = U.int(1, 8);
      var b = p + q, c = p * q;
      var v = 'x = ' + p + ' or x = ' + q;
      return U.choice('Solve:  x² − ' + b + 'x + ' + c + ' = 0', v,
        ['x = −' + p + ' or x = −' + q, 'x = ' + b + ' or x = ' + c, 'x = ' + (p + 1) + ' or x = ' + q, 'x = ' + p + ' only'], {
          explanation: 'It factorises as (x − ' + p + ')(x − ' + q + ') = 0, so x = ' + p + ' or x = ' + q + '.'
        });
    },
    simultaneous: function () {
      var x = U.int(1, 9), y = U.int(1, 9);
      var s = x + y, d = x - y;
      return U.choice('Solve:  x + y = ' + s + ' and x − y = ' + d, 'x = ' + x + ', y = ' + y,
        ['x = ' + y + ', y = ' + x, 'x = ' + s + ', y = ' + d, 'x = ' + (x + 1) + ', y = ' + (y - 1), 'x = ' + d + ', y = ' + s], {
          explanation: 'Add the equations: 2x = ' + (s + d) + ', so x = ' + x + '. Then y = ' + s + ' − ' + x + ' = ' + y + '.'
        });
    },
    rearrange: function () {
      var a = U.int(2, 8), b = U.int(2, 12);
      return U.choice('Make x the subject of:  y = ' + a + 'x + ' + b, 'x = (y − ' + b + ') / ' + a,
        ['x = y / ' + a + ' − ' + b, 'x = (y + ' + b + ') / ' + a, 'x = ' + a + 'y − ' + b, 'x = y − ' + b + ' × ' + a], {
          explanation: 'Subtract ' + b + ' from both sides, then divide everything by ' + a + '.'
        });
    }
  };

  /* ============================= geometry ============================= */
  var geo = {
    shapes: function () {
      var s = U.pick([['triangle', 3], ['square', 4], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]]);
      return U.choice('How many sides does a ' + s[0] + ' have?', s[1], [3, 4, 5, 6, 8, 10], {
        explanation: 'A ' + s[0] + ' has ' + s[1] + ' sides.'
      });
    },
    corners: function () {
      var s = U.pick([['triangle', 3], ['square', 4], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]]);
      return U.choice('How many corners does a ' + s[0] + ' have?', s[1], [3, 4, 5, 6, 8, 10], {
        explanation: 'A ' + s[0] + ' has the same number of corners as sides: ' + s[1] + '.'
      });
    },
    solids: function () {
      var s = U.pick([
        ['sphere', 'a football'], ['cube', 'a dice'], ['cylinder', 'a tin of soup'],
        ['cone', 'an ice-cream cone'], ['pyramid', 'the pyramids in Egypt']
      ]);
      return U.choice('Which 3D shape is shaped like ' + s[1] + '?', s[0],
        ['sphere', 'cube', 'cylinder', 'cone', 'pyramid'], {
          explanation: s[1].charAt(0).toUpperCase() + s[1].slice(1) + ' has the shape of a ' + s[0] + '.'
        });
    },
    faces: function () {
      var s = U.pick([['cube', 6, 'faces'], ['cube', 12, 'edges'], ['cube', 8, 'corners'],
                      ['cuboid', 6, 'faces'], ['square-based pyramid', 5, 'faces']]);
      return U.choice('How many ' + s[2] + ' does a ' + s[0] + ' have?', s[1], [4, 5, 6, 8, 10, 12], {
        explanation: 'A ' + s[0] + ' has ' + s[1] + ' ' + s[2] + '.'
      });
    },
    perimeter: function () {
      var a = U.int(4, 20), b = U.int(3, 18), v = 2 * (a + b);
      return U.choice('A rectangle is ' + a + ' m by ' + b + ' m. What is its perimeter?', v + ' m',
        [(a * b) + ' m', (a + b) + ' m', (v + 2) + ' m', (2 * a * b) + ' m'], {
          explanation: 'Perimeter = 2 × (' + a + ' + ' + b + ') = ' + v + ' m.'
        });
    },
    rectArea: function () {
      var a = U.int(4, 20), b = U.int(3, 18), v = a * b;
      return U.choice('A rectangle is ' + a + ' cm by ' + b + ' cm. What is its area?', v + ' cm²',
        [(2 * (a + b)) + ' cm²', (a + b) + ' cm²', (v + a) + ' cm²', (v * 2) + ' cm²'], {
          explanation: 'Area = length × width = ' + v + ' cm².'
        });
    },
    triArea: function () {
      var a = U.int(4, 20), b = U.pick([4, 6, 8, 10, 12, 14, 16]), v = a * b / 2;
      return U.choice('A triangle has base ' + a + ' cm and height ' + b + ' cm. What is its area?', v + ' cm²',
        [(a * b) + ' cm²', (a + b) + ' cm²', (v + a) + ' cm²', ((a + b) / 2) + ' cm²'], {
          explanation: 'Area = ½ × base × height = ' + v + ' cm².'
        });
    },
    angles: function () {
      var a = U.int(30, 80), b = U.int(30, 170 - a), v = 180 - a - b;
      return U.choice('Two angles of a triangle are ' + a + '° and ' + b + '°. What is the third?', v + '°',
        [(180 - a) + '°', (360 - a - b) + '°', (v + 10) + '°', (a + b) + '°'], {
          explanation: 'Angles in a triangle add to 180°: 180 − ' + a + ' − ' + b + ' = ' + v + '°.'
        });
    },
    circle: function () {
      var r = U.int(2, 12);
      var wantArea = Math.random() < 0.5;
      var v = wantArea ? round(Math.PI * r * r) : round(2 * Math.PI * r);
      return U.choice('A circle has radius ' + r + ' cm. What is its ' + (wantArea ? 'area' : 'circumference') + '? (π ≈ 3.14)',
        v, [round(wantArea ? 2 * Math.PI * r : Math.PI * r * r), round(Math.PI * r), round(v * 2), round(v / 2)], {
          explanation: wantArea ? 'Area = πr² = ' + v + ' cm².' : 'Circumference = 2πr = ' + v + ' cm.'
        });
    },
    boxVolume: function () {
      var a = U.int(2, 10), b = U.int(2, 10), c = U.int(2, 10), v = a * b * c;
      return U.choice('A box measures ' + a + ' × ' + b + ' × ' + c + ' cm. What is its volume?', v + ' cm³',
        [(a + b + c) + ' cm³', (a * b) + ' cm³', (2 * (a * b + b * c + a * c)) + ' cm³', (v * 2) + ' cm³'], {
          explanation: 'Volume = ' + a + ' × ' + b + ' × ' + c + ' = ' + v + ' cm³.'
        });
    },
    pythagoras: function () {
      var t = U.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25]]);
      return U.choice('A right triangle has legs ' + t[0] + ' and ' + t[1] + '. How long is the hypotenuse?', t[2],
        [t[0] + t[1], t[2] + 1, t[2] - 1, t[1] + 2], {
          explanation: 'a² + b² = c²: ' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + ' = ' + (t[2] * t[2]) + ', so c = ' + t[2] + '.'
        });
    },
    cylinder: function () {
      var r = U.int(2, 8), h = U.int(4, 15);
      var v = round(Math.PI * r * r * h);
      return U.choice('A cylinder has radius ' + r + ' cm and height ' + h + ' cm. What is its volume? (π ≈ 3.14)',
        v + ' cm³', [round(2 * Math.PI * r * h) + ' cm³', round(Math.PI * r * h) + ' cm³', round(v / 3) + ' cm³', round(Math.PI * r * r) + ' cm³'], {
          explanation: 'Volume = πr²h = 3.14 × ' + (r * r) + ' × ' + h + ' = ' + v + ' cm³.'
        });
    },
    trig: function () {
      var table = [
        ['sin', 30, '0.5'], ['cos', 60, '0.5'], ['tan', 45, '1'],
        ['sin', 90, '1'], ['cos', 0, '1'], ['sin', 0, '0'],
        ['sin', 45, '0.707'], ['cos', 45, '0.707'], ['cos', 30, '0.866'], ['sin', 60, '0.866']
      ];
      var t = U.pick(table);
      return U.choice('What is ' + t[0] + ' ' + t[1] + '°?', t[2], ['0', '0.5', '0.707', '0.866', '1', '1.732'], {
        explanation: t[0] + ' ' + t[1] + '° = ' + t[2] + '. These exact values are worth memorising.'
      });
    },
    similar: function () {
      var k = U.int(2, 5), a = U.int(3, 9), b = U.int(3, 9);
      var v = b * k;
      return U.choice('Two similar triangles have matching sides ' + a + ' cm and ' + (a * k) + ' cm. If another side of the small triangle is ' + b + ' cm, how long is the matching side of the large one?',
        v + ' cm', [(b + k) + ' cm', (b * (k + 1)) + ' cm', (a * k) + ' cm', round(b / k) + ' cm'], {
          explanation: 'The scale factor is ' + (a * k) + ' ÷ ' + a + ' = ' + k + ', so ' + b + ' × ' + k + ' = ' + v + ' cm.'
        });
    }
  };

  /* =========================== word problems =========================== */
  var NAMES = ['Maya', 'Leo', 'Amina', 'Wei', 'Jonas', 'Priya', 'Tomas', 'Zara'];
  var wp = {
    simpleStory: function () {
      var name = U.pick(NAMES), a = U.int(3, 12), b = U.int(2, 8);
      var take = Math.random() < 0.5;
      var v = take ? a - Math.min(b, a - 1) : a + b;
      if (take) b = Math.min(b, a - 1);
      return U.choice(name + ' has ' + a + ' stickers and ' + (take ? 'gives away ' : 'is given ') + b + '. How many now?',
        v, U.nearby(v, 4), {
          explanation: a + (take ? ' − ' : ' + ') + b + ' = ' + v + '.'
        });
    },
    sharing: function () {
      var people = U.int(3, 8), each = U.int(3, 12), left = U.int(1, people - 1);
      var total = people * each + left;
      return U.choice(total + ' apples are shared equally between ' + people + ' people. How many are left over?',
        left, [each, people - left, left + 1, left + 2, 0], {
          explanation: people + ' × ' + each + ' = ' + (people * each) + ', and ' + total + ' − ' + (people * each) + ' = ' + left + '.'
        });
    },
    money: function () {
      var name = U.pick(NAMES), price = U.pick([1.25, 2.5, 3, 4.5, 6, 7.5]), qty = U.int(3, 9);
      var cost = round(price * qty), paid = Math.ceil(cost / 10) * 10, v = round(paid - cost);
      return U.choice(name + ' buys ' + qty + ' notebooks at $' + price + ' each and pays with $' + paid + '. How much change?',
        money(v), [money(cost), money(round(v + price)), money(round(paid - price)), money(round(v + 1))], {
          explanation: 'Cost = ' + qty + ' × ' + price + ' = ' + money(cost) + '. Change = ' + money(v) + '.'
        });
    },
    time: function () {
      var startH = U.int(1, 10), mins = U.pick([25, 40, 45, 50, 75, 90]);
      var totalMin = startH * 60 + mins, h = Math.floor(totalMin / 60), m = totalMin % 60;
      var mm = m < 10 ? '0' + m : m;
      return U.choice('A film starts at ' + startH + ':00 and runs ' + mins + ' minutes. What time does it end?',
        h + ':' + mm, [startH + ':' + mins, (h + 1) + ':' + mm, (h - 1) + ':' + mm, h + ':' + ((m + 10) % 60)], {
          explanation: mins + ' minutes is ' + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'min, so it ends at ' + h + ':' + mm + '.'
        });
    },
    average: function () {
      var s = [U.int(60, 100), U.int(60, 100), U.int(60, 100)];
      s[2] += (3 - ((s[0] + s[1] + s[2]) % 3)) % 3;
      var sum = s[0] + s[1] + s[2], v = sum / 3;
      return U.choice(U.pick(NAMES) + ' scored ' + s.join(', ') + ' on three tests. What is the mean score?', v, U.nearby(v, 6), {
        explanation: 'Total ' + sum + ', divided by 3, gives ' + v + '.'
      });
    },
    ratio: function () {
      var name = U.pick(NAMES), a = U.int(2, 5), b = U.int(2, 5), unit = U.int(4, 12);
      var total = (a + b) * unit, v = a * unit;
      return U.choice(name + ' shares ' + total + ' stickers with a friend in the ratio ' + a + ':' + b + '. How many does ' + name + ' get?',
        v, [b * unit, total - v + 1, Math.round(total / 2), v + unit], {
          explanation: (a + b) + ' shares in total, so one share is ' + unit + '. ' + name + ' gets ' + a + ' × ' + unit + ' = ' + v + '.'
        });
    },
    rate: function () {
      var speed = U.pick([40, 50, 60, 70, 80]), hours = U.int(2, 6), v = speed * hours;
      return U.choice(U.pick(NAMES) + ' cycles at ' + speed + ' km per hour for ' + hours + ' hours. How far do they travel?',
        v + ' km', [(speed + hours) + ' km', (speed * (hours + 1)) + ' km', Math.round(speed / hours) + ' km', (v - speed) + ' km'], {
          explanation: 'Distance = speed × time = ' + v + ' km.'
        });
    },
    speedBack: function () {
      var speed = U.pick([40, 50, 60, 80]), hours = U.int(2, 5), dist = speed * hours;
      return U.choice('A train covers ' + dist + ' km in ' + hours + ' hours. What is its average speed?',
        speed + ' km/h', [(dist / (hours + 1)) + ' km/h', (dist * hours) + ' km/h', (speed + 10) + ' km/h', (speed / 2) + ' km/h'], {
          explanation: 'Speed = distance ÷ time = ' + dist + ' ÷ ' + hours + ' = ' + speed + ' km/h.'
        });
    },
    bestBuy: function () {
      var priceA = U.pick([2.4, 3.6, 4.8, 6.0]), sizeA = U.pick([4, 6, 8]);
      var sizeB = sizeA * 2, priceB = round(priceA * 2 * U.pick([0.85, 0.9, 1.1]));
      var unitA = priceA / sizeA, unitB = priceB / sizeB;
      var better = unitA < unitB ? 'Pack A' : 'Pack B';
      var labels = ['Pack A', 'Pack B', 'They cost the same per item'];
      return {
        type: 'choice',
        prompt: 'Pack A: ' + sizeA + ' items for ' + money(priceA) + '. Pack B: ' + sizeB + ' items for ' + money(priceB) + '. Which is better value?',
        choices: labels, answer: labels.indexOf(better),
        explanation: 'Per item: A = ' + money(round(unitA)) + ', B = ' + money(round(unitB)) + '.'
      };
    },
    taxTip: function () {
      var bill = U.pick([40, 60, 80, 120, 150]), pct = U.pick([12, 15, 18, 20]);
      var v = round(bill * (1 + pct / 100));
      return U.choice('A meal costs $' + bill + ' and a ' + pct + '% service charge is added. What is the total?',
        money(v), [money(round(bill * pct / 100)), money(bill + pct), money(round(bill * (1 - pct / 100))), money(round(v + pct))], {
          explanation: pct + '% of ' + bill + ' is ' + money(round(bill * pct / 100)) + ', giving a total of ' + money(v) + '.'
        });
    }
  };

  /* ---- which question kinds each stage sees ---- */
  var PLAN = {
    arithmetic: [
      ['addSmall', 'subSmall', 'doubles', 'easyTables'],
      ['add', 'sub', 'mul', 'div', 'easyTables'],
      ['add', 'sub', 'mul', 'div', 'order', 'negatives', 'factors', 'lcmQ'],
      ['order', 'negatives', 'factors', 'lcmQ', 'indices', 'standardForm', 'sigFigs'],
      ['indices', 'standardForm', 'sigFigs', 'surds', 'factors', 'lcmQ']
    ],
    fractions: [
      ['halves', 'fractionOf'],
      ['halves', 'fractionOf', 'simplify', 'addSame', 'toDecimal'],
      ['simplify', 'addSame', 'addDiff', 'toDecimal', 'percentOf', 'compare'],
      ['addDiff', 'multiply', 'divide', 'percentOf', 'percentChange', 'compare'],
      ['multiply', 'divide', 'percentChange', 'reversePercent', 'compound']
    ],
    algebra: [
      ['missing'],
      ['missing', 'linear', 'sequence'],
      ['linear', 'twoStep', 'simplify', 'sequence', 'evaluate'],
      ['twoStep', 'simplify', 'expand', 'factorise', 'evaluate', 'nthTerm'],
      ['expand', 'factorise', 'nthTerm', 'quadratic', 'simultaneous', 'rearrange']
    ],
    geometry: [
      ['shapes', 'corners', 'solids', 'faces'],
      ['shapes', 'solids', 'faces', 'perimeter', 'rectArea', 'triArea'],
      ['perimeter', 'rectArea', 'triArea', 'angles', 'boxVolume'],
      ['triArea', 'angles', 'circle', 'boxVolume', 'pythagoras'],
      ['circle', 'pythagoras', 'cylinder', 'trig', 'similar']
    ],
    word: [
      ['simpleStory'],
      ['simpleStory', 'sharing', 'money', 'time'],
      ['sharing', 'money', 'time', 'average', 'ratio', 'rate'],
      ['average', 'ratio', 'rate', 'speedBack', 'bestBuy', 'taxTip'],
      ['rate', 'speedBack', 'bestBuy', 'taxTip', 'ratio']
    ]
  };

  function topicGenerator(pool, planKey) {
    return function (n, stageIndex) {
      var kinds = PLAN[planKey][stageIndex == null ? 2 : stageIndex];
      var out = [], seen = {}, guard = 0;
      while (out.length < n && guard++ < n * 40) {
        var q = pool[U.pick(kinds)]();
        if (!q || seen[q.prompt]) continue;
        // a random draw can collapse distractors onto the answer; skip those rather than show a one-option question
        if (q.type === 'choice' && q.choices.length < 3) continue;
        seen[q.prompt] = true;
        out.push(q);
      }
      return out;
    };
  }

  SH.register({
    id: 'math',
    name: 'Math',
    native: '',
    emoji: '🔢',
    color: 'var(--math)',
    blurb: 'Number, fractions, algebra, geometry and problem solving — generated fresh at your level.',
    topics: [
      { id: 'arithmetic', name: 'Number & Arithmetic', desc: 'Counting and calculating, up to indices and standard form',
        stageDesc: ['Adding and taking away within 20', 'Column methods and times tables', 'Negatives, order of operations, factors', 'Indices, standard form, significant figures', 'Surds, index laws, precision'],
        generate: topicGenerator(arith, 'arithmetic') },
      { id: 'fractions', name: 'Fractions, Decimals & Percents', desc: 'From halving to compound interest',
        stageDesc: ['Halves and simple fractions of amounts', 'Simplifying and adding fractions', 'Percentages and comparisons', 'Multiplying, dividing, percentage change', 'Reverse percentages and compound growth'],
        generate: topicGenerator(fr, 'fractions') },
      { id: 'algebra', name: 'Algebra', desc: 'Missing numbers through to quadratics',
        stageDesc: ['Missing-number puzzles', 'Simple equations and patterns', 'Two-step equations and sequences', 'Expanding, factorising, nth term', 'Quadratics, simultaneous equations, rearranging'],
        generate: topicGenerator(alg, 'algebra') },
      { id: 'geometry', name: 'Shape & Geometry', desc: 'Shapes, area, angles, Pythagoras, trigonometry',
        stageDesc: ['Naming shapes and counting sides', 'Perimeter and area', 'Angles and volume', 'Circles and Pythagoras', 'Trigonometry and similar shapes'],
        generate: topicGenerator(geo, 'geometry') },
      { id: 'word', name: 'Problem Solving', desc: 'Real situations: money, time, rates, value',
        stageDesc: ['Simple stories with adding and taking away', 'Money, time and sharing', 'Averages, ratio and rates', 'Speed, best value, service charges', 'Multi-step rate and money problems'],
        generate: topicGenerator(wp, 'word') }
    ]
  });
})(window.StudyHub);
