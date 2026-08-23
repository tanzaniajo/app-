/* Sound effects, synthesised with the Web Audio API.
   No audio files, so the app stays a single self-contained page that works offline. */
(function (SH) {
  'use strict';

  var KEY = 'studyhub.sound';
  var ctx = null;
  var muted = false;

  try { muted = localStorage.getItem(KEY) === 'off'; } catch (e) {}

  /* The context can only start from a user gesture, so it is created on first play. */
  function audio() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (e) { return null; }
    return ctx;
  }

  /* One shaped tone. `to` bends the pitch across the note. */
  function tone(opts) {
    var c = audio();
    if (!c) return;
    if (c.state === 'suspended' && c.resume) c.resume();

    var start = c.currentTime + (opts.delay || 0);
    var dur = opts.dur || 0.12;
    var osc = c.createOscillator();
    var gain = c.createGain();

    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, start);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, start + dur);

    var peak = opts.gain == null ? 0.13 : opts.gain;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function play(notes) {
    if (muted) return;
    for (var i = 0; i < notes.length; i++) tone(notes[i]);
  }

  var SOUNDS = {
    tap:      [{ freq: 320, dur: 0.05, type: 'triangle', gain: 0.06 }],
    select:   [{ freq: 520, dur: 0.06, type: 'triangle', gain: 0.07 }],
    correct:  [{ freq: 784, dur: 0.10, type: 'sine', gain: 0.13 },
               { freq: 1175, dur: 0.16, type: 'sine', gain: 0.12, delay: 0.09 }],
    wrong:    [{ freq: 220, to: 120, dur: 0.28, type: 'sawtooth', gain: 0.09 }],
    heart:    [{ freq: 440, to: 180, dur: 0.34, type: 'triangle', gain: 0.10, delay: 0.16 }],
    complete: [{ freq: 523, dur: 0.13, type: 'sine', gain: 0.12 },
               { freq: 659, dur: 0.13, type: 'sine', gain: 0.12, delay: 0.11 },
               { freq: 784, dur: 0.13, type: 'sine', gain: 0.12, delay: 0.22 },
               { freq: 1047, dur: 0.34, type: 'sine', gain: 0.14, delay: 0.33 }],
    crown:    [{ freq: 1047, dur: 0.22, type: 'sine', gain: 0.11 },
               { freq: 1568, dur: 0.34, type: 'sine', gain: 0.09, delay: 0.06 }],
    fail:     [{ freq: 392, dur: 0.18, type: 'triangle', gain: 0.11 },
               { freq: 311, dur: 0.18, type: 'triangle', gain: 0.11, delay: 0.15 },
               { freq: 233, dur: 0.40, type: 'triangle', gain: 0.11, delay: 0.30 }],
    move:     [{ freq: 180, dur: 0.06, type: 'square', gain: 0.05 },
               { freq: 130, dur: 0.05, type: 'square', gain: 0.04, delay: 0.03 }]
  };

  SH.Sfx = {
    play: function (name) {
      var s = SOUNDS[name];
      if (s) play(s);
    },
    muted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (e) {}
      if (!muted) SH.Sfx.play('select');
      return muted;
    }
  };
})(window.StudyHub);
