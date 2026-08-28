/* Opening names, matched by the longest sequence of moves that fits the game.

   Keyed by algebraic notation, which is what the move list already holds. Once a
   game leaves the book the last name that matched is kept, which is how openings
   are talked about in practice — a game is still "a Sicilian" on move 30. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.StudyHub = root.StudyHub || {}; root.StudyHub.ChessOpenings = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var BOOK = [
    /* --- 1.e4 --- */
    ['e4', "King's Pawn Opening"],
    ['e4 e5', 'Open Game'],
    ['e4 e5 Nf3', "King's Knight Opening"],
    ['e4 e5 Nf3 Nc6', "King's Knight, Normal Variation"],
    ['e4 e5 Nf3 Nc6 Bb5', 'Ruy Lopez (Spanish)'],
    ['e4 e5 Nf3 Nc6 Bb5 a6', 'Ruy Lopez, Morphy Defence'],
    ['e4 e5 Nf3 Nc6 Bb5 Nf6', 'Ruy Lopez, Berlin Defence'],
    ['e4 e5 Nf3 Nc6 Bc4', 'Italian Game'],
    ['e4 e5 Nf3 Nc6 Bc4 Bc5', 'Italian Game, Giuoco Piano'],
    ['e4 e5 Nf3 Nc6 Bc4 Bc5 b4', 'Evans Gambit'],
    ['e4 e5 Nf3 Nc6 Bc4 Nf6', 'Two Knights Defence'],
    ['e4 e5 Nf3 Nc6 d4', 'Scotch Game'],
    ['e4 e5 Nf3 Nc6 Nc3', 'Four Knights Game'],
    ['e4 e5 Nf3 d6', 'Philidor Defence'],
    ['e4 e5 Nf3 Nf6', "Petrov's Defence"],
    ['e4 e5 Nc3', 'Vienna Game'],
    ['e4 e5 f4', "King's Gambit"],
    ['e4 e5 Bc4', "Bishop's Opening"],
    ['e4 e5 d4', 'Centre Game'],

    ['e4 c5', 'Sicilian Defence'],
    ['e4 c5 Nf3', 'Sicilian Defence'],
    ['e4 c5 Nf3 d6', 'Sicilian, Classical setup'],
    ['e4 c5 Nf3 Nc6', 'Sicilian, Old Sicilian'],
    ['e4 c5 Nf3 e6', 'Sicilian, French Variation'],
    ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', 'Sicilian, Najdorf'],
    ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6', 'Sicilian, Dragon'],
    ['e4 c5 c3', 'Sicilian, Alapin'],
    ['e4 c5 Nc3', 'Sicilian, Closed'],
    ['e4 c5 d4', 'Sicilian, Smith-Morra Gambit'],

    ['e4 e6', 'French Defence'],
    ['e4 e6 d4 d5', 'French Defence, Main Line'],
    ['e4 e6 d4 d5 Nc3', 'French, Paulsen Variation'],
    ['e4 e6 d4 d5 e5', 'French, Advance Variation'],
    ['e4 e6 d4 d5 exd5', 'French, Exchange Variation'],
    ['e4 c6', 'Caro-Kann Defence'],
    ['e4 c6 d4 d5', 'Caro-Kann, Main Line'],
    ['e4 d5', 'Scandinavian Defence'],
    ['e4 Nf6', "Alekhine's Defence"],
    ['e4 d6', 'Pirc Defence'],
    ['e4 g6', 'Modern Defence'],
    ['e4 Nc6', 'Nimzowitsch Defence'],
    ['e4 b6', "Owen's Defence"],

    /* --- 1.d4 --- */
    ['d4', "Queen's Pawn Opening"],
    ['d4 d5', 'Closed Game'],
    ['d4 d5 c4', "Queen's Gambit"],
    ['d4 d5 c4 dxc4', "Queen's Gambit Accepted"],
    ['d4 d5 c4 e6', "Queen's Gambit Declined"],
    ['d4 d5 c4 e6 Nc3 Nf6 Bg5', 'QGD, Classical Variation'],
    ['d4 d5 c4 c6', 'Slav Defence'],
    ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4', 'Slav Defence, Accepted'],
    ['d4 d5 c4 Nc6', 'Chigorin Defence'],
    ['d4 d5 Nf3', "Queen's Pawn Game"],
    ['d4 d5 e4', 'Blackmar-Diemer Gambit'],
    ['d4 d5 Bf4', 'London System'],
    ['d4 d5 Nf3 Nf6 Bf4', 'London System'],

    ['d4 Nf6', 'Indian Defence'],
    ['d4 Nf6 c4', 'Indian Game'],
    ['d4 Nf6 c4 g6', "King's Indian Defence"],
    ['d4 Nf6 c4 g6 Nc3 d5', 'Grünfeld Defence'],
    ['d4 Nf6 c4 e6', 'Indian, East Indian Defence'],
    ['d4 Nf6 c4 e6 Nc3 Bb4', 'Nimzo-Indian Defence'],
    ['d4 Nf6 c4 e6 Nf3 b6', "Queen's Indian Defence"],
    ['d4 Nf6 c4 c5', 'Benoni Defence'],
    ['d4 Nf6 c4 e5', 'Budapest Gambit'],
    ['d4 Nf6 Bg5', 'Trompowsky Attack'],
    ['d4 f5', 'Dutch Defence'],
    ['d4 e6', 'Horwitz Defence'],
    ['d4 g6', 'Modern Defence'],

    /* --- flank openings --- */
    ['c4', 'English Opening'],
    ['c4 e5', 'English, Reversed Sicilian'],
    ['c4 c5', 'English, Symmetrical Variation'],
    ['c4 Nf6', 'English, Anglo-Indian Defence'],
    ['Nf3', 'Réti Opening'],
    ['Nf3 d5 c4', 'Réti Opening'],
    ['Nf3 Nf6 c4', 'Réti / Indian transposition'],
    ['g3', "King's Fianchetto Opening"],
    ['f4', "Bird's Opening"],
    ['b3', "Larsen's Opening"],
    ['b4', 'Polish (Sokolsky) Opening'],
    ['Nc3', 'Dunst Opening'],
    ['e3', "Van 't Kruijs Opening"],
    ['d3', 'Mieses Opening'],
    ['a3', "Anderssen's Opening"],
    ['h4', 'Desprez Opening']
  ];

  /* Longest prefix wins, so deeper lines beat their parents. */
  var INDEX = {};
  var LONGEST = 0;
  BOOK.forEach(function (entry) {
    INDEX[entry[0]] = entry[1];
    var n = entry[0].split(' ').length;
    if (n > LONGEST) LONGEST = n;
  });

  /* `sans` is the list of moves played, in algebraic notation.
     Check and mate symbols are ignored so Nc7+ matches Nc7. */
  function identify(sans) {
    var clean = sans.map(function (s) { return String(s).replace(/[+#]/g, ''); });
    var best = null;
    for (var n = Math.min(clean.length, LONGEST); n > 0; n--) {
      var key = clean.slice(0, n).join(' ');
      if (INDEX[key]) { best = { name: INDEX[key], moves: n }; break; }
    }
    return best;
  }

  return { identify: identify, BOOK: BOOK };
});
