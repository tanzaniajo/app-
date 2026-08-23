/* Chess piece artwork as inline SVG.

   Unicode chess glyphs are drawn by whatever font the device happens to have,
   so they vary from thin outlines to solid blocks and never match each other.
   These are drawn here instead: one 45x45 viewBox per piece, filled and
   outlined, so white and black are the same shapes in different colours. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.StudyHub = root.StudyHub || {}; root.StudyHub.ChessPieces = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* Shared foot: every piece stands on the same two-tier base. */
  var FOOT =
    '<path d="M11.2 33.2h22.6c1 0 1.6.5 1.6 1.3v1.2c0 .8-.6 1.3-1.6 1.3H11.2c-1 0-1.6-.5-1.6-1.3v-1.2c0-.8.6-1.3 1.6-1.3z"/>' +
    '<path d="M9 37.2h27c1.1 0 1.8.6 1.8 1.5v1.4c0 .9-.7 1.5-1.8 1.5H9c-1.1 0-1.8-.6-1.8-1.5v-1.4c0-.9.7-1.5 1.8-1.5z"/>';

  var SHAPES = {
    p:
      '<circle cx="22.5" cy="13.6" r="5"/>' +
      '<path d="M22.5 17.4c3.6 0 6 2.1 6 4.6 0 2-1.3 3.3-2.7 4.1 2.7 1.6 4.4 4 4.9 7.1H16.8c.5-3.1 2.2-5.5 4.9-7.1-1.4-.8-2.7-2.1-2.7-4.1 0-2.5 2.4-4.6 3.5-4.6z"/>' +
      FOOT,

    r:
      '<path d="M12 8.5h4.4v3.1h4V8.5h4.2v3.1h4V8.5H33v9.2l-2.6 2.4H14.6L12 17.7z"/>' +
      '<path d="M15.4 20.6h14.2l1.2 12.2H14.2z"/>' +
      FOOT,

    n:
      '<path d="M28.2 9.1 29.4 4.4 33.2 8.6Z"/>' +
      '<path d="M30.6 8.4c2.7.7 4.3 3.2 4.7 6.9.6 5.4.3 11.8 0 18.1H13.4c-.3-4.9 1.3-8.8 4.8-11.6' +
      '-1.8.9-3.8 1.8-5.7 2.3-1.9.5-3.2-.8-2.3-2.6 1.5-3 4.2-5.5 7.1-7.5 3-2.1 6.2-4 9-5.4' +
      '1.4-.7 3-.8 4.3-.2z"/>' +
      '<ellipse cx="25.2" cy="14.6" rx="1.35" ry="1.8" fill="#161616" stroke="none"/>' +
      '<circle cx="12.6" cy="22.1" r="0.85" fill="#161616" stroke="none"/>' +
      '<path d="M30.2 9.6c2 3.4 2.7 9.4 2.4 16.6" fill="none" stroke-width="1.2" opacity=".5"/>' +
      FOOT,

    b:
      '<circle cx="22.5" cy="8.6" r="2.6"/>' +
      '<path d="M22.5 10.8c4.7 0 8.4 5 8.4 10.1 0 3.7-2.4 6.2-5.2 7.3h-6.4c-2.8-1.1-5.2-3.6-5.2-7.3 0-5.1 3.7-10.1 8.4-10.1z"/>' +
      '<path d="M16.2 28.6h12.6c1.1 0 1.8.6 1.8 1.5v1.2c0 .9-.7 1.5-1.8 1.5H16.2c-1.1 0-1.8-.6-1.8-1.5v-1.2c0-.9.7-1.5 1.8-1.5z"/>' +
      '<path d="M22.5 15.4v7M19.4 18.5h6.2" fill="none" stroke-width="1.6"/>' +
      FOOT,

    q:
      '<circle cx="7.6" cy="12.2" r="2.6"/><circle cx="15" cy="9" r="2.6"/>' +
      '<circle cx="22.5" cy="7.8" r="2.9"/>' +
      '<circle cx="30" cy="9" r="2.6"/><circle cx="37.4" cy="12.2" r="2.6"/>' +
      '<path d="M8.8 14.6c1.6 4.4 2.8 8.4 3.4 12.2h20.6c.6-3.8 1.8-7.8 3.4-12.2' +
      'l-5.9 4.6-2.7-8.6-3.1 9h-3.1l-3.1-9-2.7 8.6z"/>' +
      '<path d="M12.4 28.2h20.2c.5 1.6.8 3.2.9 4.6H11.5c.1-1.4.4-3 .9-4.6z"/>' +
      FOOT,

    k:
      '<path d="M22.5 4.4v8.2M18.9 7.8h7.2" fill="none" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M22.5 13.6c1.6-2.4 4.2-3.6 6.9-3.1 3.5.7 5.4 4 4.6 7.6-.6 2.8-2.4 5.2-4.2 7.4H15.2' +
      'c-1.8-2.2-3.6-4.6-4.2-7.4-.8-3.6 1.1-6.9 4.6-7.6 2.7-.5 5.3.7 6.9 3.1z"/>' +
      '<path d="M14.6 25.5h15.8c.7 2.4 1.1 4.9 1.2 7.3H13.4c.1-2.4.5-4.9 1.2-7.3z"/>' +
      FOOT
  };

  var COLOURS = {
    w: { fill: '#f9f9f9', stroke: '#3f3f3f' },
    b: { fill: '#3d3d3d', stroke: '#161616' }
  };

  /* `piece` is a FEN letter: uppercase = white. */
  function svg(piece, size) {
    var white = piece === piece.toUpperCase();
    var kind = piece.toLowerCase();
    var shape = SHAPES[kind];
    if (!shape) return '';
    var c = COLOURS[white ? 'w' : 'b'];
    return '<svg viewBox="0 0 45 45" width="' + (size || '100%') + '" height="' + (size || '100%') +
      '" class="cp cp-' + (white ? 'w' : 'b') + '" aria-hidden="true" focusable="false">' +
      '<g fill="' + c.fill + '" stroke="' + c.stroke + '" stroke-width="1.5" ' +
      'stroke-linejoin="round" stroke-linecap="round">' + shape + '</g></svg>';
  }

  return { svg: svg, SHAPES: SHAPES, COLOURS: COLOURS };
});
