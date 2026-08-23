/* Chess — pieces, rules, tactics, mating patterns, openings and endgames.
   Bank items end with a difficulty band: 1 = ages 4–10, 2 = 11–13, 3 = 14+.
   Puzzle positions are FEN strings; every one is checked by tools/verify-chess.mjs. */
(function (SH) {
  'use strict';
  var U = SH.U;

  /* [question, [options — first is correct], explanation, band] */
  var PIECES = [
    ['Which piece is worth about the same as three pawns?', ['A bishop', 'A rook', 'The queen', 'Another pawn'], 'Bishops and knights are both worth roughly three pawns.', 2],
    ['From a central square on an empty board, a knight can reach how many squares?', ['8', '4', '6', '2'], 'On the rim that drops to four, and in the corner to just two.', 2],
    ['In a closed position with locked pawn chains, which piece is usually stronger?', ['A knight', 'A bishop', 'A rook', 'The king'], 'Knights jump over the blockage; bishops get shut in behind their own pawns.', 3],
    ['Why is the "bishop pair" considered an advantage?', ['Together the two bishops cover squares of both colours', 'Bishops can jump over pieces', 'Each is worth five pawns', 'They allow you to castle twice'], 'A single bishop is permanently blind to half the board.', 3],
    ['What does winning "the exchange" mean?', ['Winning a rook for a bishop or knight', 'Trading queens', 'Any capture at all', 'Castling first'], 'It is worth roughly one and a half to two pawns.', 3],
    ['Why does a knight lose value on the edge of the board?', ['It controls far fewer squares there', 'It cannot move backwards', 'It becomes pinned automatically', 'It loses its ability to jump'], 'Hence the old saying, "a knight on the rim is dim".', 3],
    ['A bishop is at its best when...', ['Pawns are on both wings and the diagonals are open', 'The position is completely blocked', 'It sits in the corner', 'Its own pawns fix it in place'], 'Open lines are what give a bishop its long reach.', 3],
    ['Two rooks, compared with a queen, are generally...', ['Slightly stronger in open positions', 'Far weaker in every position', 'Worth about three pawns', 'Unable to defend each other'], 'Two rooks total ten points against the queen\'s nine.', 3],
    ['Which pieces are called the "minor pieces"?', ['Knights and bishops', 'Rooks and queens', 'Pawns and kings', 'Only the queen'], 'Rooks and queens are the "major" or "heavy" pieces.', 3],
    ['How many squares are there on a chessboard?', ['64', '32', '81', '100'], 'Eight files by eight ranks makes 64 squares.', 1],
    ['How does a rook move?', ['In straight lines along ranks and files', 'Diagonally only', 'One square at a time in any direction', 'In an L-shape'], 'Rooks travel any distance forwards, backwards or sideways.', 1],
    ['How does a bishop move?', ['Diagonally, staying on one colour', 'Along ranks and files', 'In an L-shape', 'One square forward'], 'A bishop that starts on a light square stays on light squares all game.', 1],
    ['How does a knight move?', ['Two squares one way, then one at a right angle', 'Three squares diagonally', 'Any distance diagonally', 'One square in any direction'], 'The knight is the only piece that jumps over others.', 1],
    ['How does the queen move?', ['Any distance in a straight or diagonal line', 'Only diagonally', 'Only two squares at a time', 'In an L-shape'], 'The queen combines the rook and the bishop.', 1],
    ['How far can the king move?', ['One square in any direction', 'Two squares in any direction', 'Any distance in a straight line', 'In an L-shape'], 'The king is slow, which is why it needs protecting.', 1],
    ['How do pawns capture?', ['Diagonally forward, one square', 'Straight forward', 'Backwards', 'In an L-shape'], 'Pawns move straight ahead but capture on the diagonal.', 1],
    ['Which piece can jump over other pieces?', ['The knight', 'The rook', 'The bishop', 'The queen'], 'Every other piece is blocked by anything in its path.', 1],
    ['How many pieces does each player start with?', ['16', '8', '12', '20'], 'Eight pawns and eight other pieces each.', 1],
    ['Which piece starts in the corner of the board?', ['The rook', 'The knight', 'The bishop', 'The queen'], 'Rooks occupy a1, h1, a8 and h8.', 1],
    ['On its very first move, a pawn may...', ['Move one or two squares forward', 'Move three squares forward', 'Move backwards', 'Move diagonally'], 'After that first move, pawns only ever advance one square at a time.', 1],
    ['Which piece is the most valuable?', ['The queen', 'The rook', 'The knight', 'The bishop'], 'The queen is worth about nine pawns — but the king is priceless.', 1],
    ['A rook is worth about how many pawns?', ['5', '2', '9', '3'], 'Standard values: pawn 1, knight 3, bishop 3, rook 5, queen 9.', 2],
    ['A knight and a bishop are each worth about...', ['3 pawns', '5 pawns', '1 pawn', '9 pawns'], 'They are roughly equal; bishops prefer open positions, knights closed ones.', 2],
    ['At the start, the white queen stands on...', ['A light square, d1', 'A dark square, d1', 'A light square, e1', 'A dark square, e1'], 'Remember "queen on her own colour" — the white queen starts light.', 2],
    ['The square h1 is what colour?', ['Light', 'Dark', 'It varies', 'Green'], 'Set the board up "light on the right".', 2],
    ['Which pieces stand either side of the king at the start?', ['The queen and a bishop', 'Two knights', 'Two rooks', 'Two pawns'], 'From a1: rook, knight, bishop, queen, king, bishop, knight, rook.', 2],
    ['Which is generally stronger in a wide-open position?', ['A bishop', 'A knight', 'They are always equal', 'A pawn'], 'Bishops like long open diagonals; knights prefer blocked positions.', 3]
  ];

  var RULES = [
    ['If your king is in check, you must...', ['Deal with the check straight away', 'Ignore it if you prefer', 'Move a pawn', 'Offer a draw'], 'You can move the king, block the line, or capture the attacker.', 1],
    ['Can you actually capture the king to win?', ['No — the game ends at checkmate', 'Yes, always', 'Only with the queen', 'Only in the endgame'], 'A player must never leave their king in check, so it is never captured.', 1],
    ['How many kings does each player have?', ['One', 'Two', 'Eight', 'None'], 'Losing your only king by checkmate ends the game.', 1],
    ['Castling queenside moves the king from e1 to...', ['c1', 'b1', 'd1', 'g1'], 'The king always travels exactly two squares; the rook lands beside it on d1.', 3],
    ['A draw by "insufficient material" happens when...', ['Neither side has enough pieces to force mate', 'Both players agree to stop', 'One player runs out of time', 'The same position repeats'], 'King versus king, or king and bishop versus king, are the common cases.', 3],
    ['If a player runs out of time but the opponent could never checkmate, the result is...', ['A draw', 'A win for the opponent', 'A win on time', 'A replay'], 'You cannot win on time without the material to mate.', 3],
    ['What is it called when a king is attacked?', ['Check', 'Checkmate', 'Stalemate', 'Castling'], 'In check you must get out of it immediately.', 1],
    ['What happens when a pawn reaches the far end of the board?', ['It promotes, usually to a queen', 'It is removed', 'It becomes a king', 'Nothing at all'], 'A pawn may become a queen, rook, bishop or knight — never a king.', 1],
    ['How do you win a game of chess?', ['By checkmating the opponent\'s king', 'By taking every pawn', 'By reaching the other side first', 'By taking the queen'], 'Checkmate means the king is attacked and has no legal escape.', 1],
    ['Who moves first?', ['White', 'Black', 'The younger player', 'It is decided by a dice roll'], 'White always has the first move.', 1],
    ['Can you ever move your king next to the opponent\'s king?', ['No, kings must never touch', 'Yes, at any time', 'Only when castling', 'Only in the endgame'], 'That would move your king into check, which is illegal.', 1],
    ['What is castling?', ['The king moves two squares toward a rook and the rook hops over it', 'Swapping the king and queen', 'Moving the rook two squares', 'Promoting a pawn'], 'It is the only move where two of your pieces move at once.', 2],
    ['When are you NOT allowed to castle?', ['Out of, through, or into check', 'When you have both rooks', 'On the kingside only', 'After ten moves'], 'You also cannot castle if the king or that rook has already moved.', 2],
    ['What is stalemate?', ['A player has no legal move but is not in check — the game is drawn', 'A checkmate in one move', 'A repeated position', 'A pawn reaching the eighth rank'], 'Stalemate saves many lost positions, so watch for it when winning.', 2],
    ['What does the symbol "+" mean in chess notation?', ['Check', 'Checkmate', 'A good move', 'A capture'], '"#" (or "++") means checkmate.', 2],
    ['What does "Nf3" mean?', ['The knight moves to f3', 'A pawn moves to f3', 'The king moves to f3', 'A knight is captured on f3'], 'N is the knight, because K is already taken by the king.', 2],
    ['What does "O-O" mean?', ['Castling kingside', 'Castling queenside', 'A draw offer', 'A double check'], 'Queenside castling — the longer one — is written O-O-O.', 2],
    ['What does "exd5" mean?', ['A pawn on the e-file captures on d5', 'The king moves to d5', 'A pawn moves to e5', 'A bishop captures on d5'], 'Pawn captures are written with the file the pawn came from.', 2],
    ['Which square is in the bottom-left corner from White\'s side?', ['a1', 'h1', 'a8', 'e1'], 'Files run a–h left to right; ranks run 1–8 away from White.', 2],
    ['What is "en passant"?', ['Capturing a pawn that just passed your pawn with a double step', 'Castling on the queenside', 'Promoting to a knight', 'Offering a draw'], 'It can only be played on the very next move, or the right is lost.', 3],
    ['A position repeating three times means...', ['Either player may claim a draw', 'The game is a win for White', 'The moves must be replayed', 'Nothing at all'], 'Threefold repetition is one of several drawing rules.', 3],
    ['What is the fifty-move rule?', ['A draw may be claimed after 50 moves with no capture and no pawn move', 'The game ends after exactly 50 moves', 'Each player gets 50 minutes', 'A pawn must move every 50 turns'], 'It stops endless shuffling in positions with no progress.', 3],
    ['If you touch a piece in a serious game, you must...', ['Move it, if it has a legal move', 'Pass your turn', 'Give it to your opponent', 'Restart the game'], 'The touch-move rule; say "j\'adoube" first if you only mean to adjust.', 3],
    ['Can a pawn promote to a second queen while you still have your first?', ['Yes', 'No, only one queen is allowed', 'Only if the first is captured', 'Only in the endgame'], 'You may have as many queens as you can promote pawns.', 3]
  ];

  var TACTICS = [
    ['If one of your pieces is attacked and cannot be defended, you should usually...', ['Move it somewhere safe', 'Leave it where it is', 'Move your king instead', 'Offer a draw'], 'Losing material for nothing is the most common way beginners lose games.', 1],
    ['Before each move, the most useful question is...', ['What did my opponent\'s last move threaten?', 'How long has the game lasted?', 'Which piece looks nicest?', 'How many pieces are left?'], 'Most blunders come from answering your own plan and ignoring theirs.', 1],
    ['Which is worth more, a knight or a pawn?', ['The knight', 'The pawn', 'They are exactly equal', 'Neither has any value'], 'A knight is worth about three pawns.', 1],
    ['If a pawn attacks your queen, you should usually...', ['Move the queen to safety', 'Ignore it', 'Take the pawn with the queen', 'Castle immediately'], 'Trading a nine-point queen for a one-point pawn is a disaster.', 1],
    ['Taking a piece for free is good because...', ['Extra material usually decides the game', 'It looks impressive', 'It ends the game at once', 'It gives you more time'], 'Material advantage is the simplest path to winning.', 1],
    ['A "desperado" is a piece that...', ['Is lost anyway, so it sells itself as dearly as possible', 'Never moves from its square', 'Only defends the king', 'Cannot be captured'], 'Grab whatever you can with a piece that is doomed regardless.', 3],
    ['An in-between move (zwischenzug) is...', ['A surprising move inserted before the expected recapture', 'A move played twice in a row', 'Castling in the middlegame', 'Any pawn push'], 'It often changes the whole evaluation of a sequence.', 3],
    ['What is interference?', ['Cutting the line between a defender and the thing it guards', 'Attacking two pieces at once', 'Trading off queens', 'Promoting a pawn'], 'A piece is often sacrificed onto the critical square to do it.', 3],
    ['What is a fork?', ['One piece attacking two or more enemy pieces at once', 'Two pawns side by side', 'Trapping the king in the corner', 'Castling on the queenside'], 'Knights are the classic forking piece because their attacks are hard to see.', 1],
    ['Which piece is famous for forking two pieces at once?', ['The knight', 'The pawn', 'The king', 'The rook'], 'A knight fork on king and queen wins material immediately.', 1],
    ['If your opponent leaves a piece undefended, you should...', ['Look for a way to win it safely', 'Ignore it', 'Offer a draw', 'Move your king'], 'Undefended pieces are what most tactics target.', 1],
    ['What is a pin?', ['A piece cannot move because a more valuable one sits behind it', 'A piece attacking two things at once', 'A pawn blocked by another pawn', 'A king with no moves'], 'A pin against the king is absolute: the pinned piece legally cannot move.', 2],
    ['What is a skewer?', ['A valuable piece is attacked and a piece behind it is won when it moves', 'Two pawns defending each other', 'A knight attacking two pieces', 'Castling into safety'], 'A skewer is a pin turned around: the big piece is in front.', 2],
    ['What is a discovered attack?', ['Moving one piece uncovers an attack from another', 'Attacking with the queen twice', 'Promoting a pawn', 'Trapping a bishop'], 'The moving piece can also make a threat of its own, which makes it very strong.', 2],
    ['What is a back-rank mate?', ['A rook or queen mates a king trapped behind its own pawns', 'Mate delivered by a pawn', 'Mate in the centre of the board', 'A draw by repetition'], 'Giving your king "luft" — an escape square — prevents it.', 2],
    ['Why is double check so dangerous?', ['The king must move, because you cannot block or capture two checkers', 'It wins the queen automatically', 'It ends the game instantly', 'It cannot be answered at all'], 'That forcing quality powers many combinations.', 3],
    ['What is deflection?', ['Forcing a defending piece away from what it guards', 'Attacking with two pawns', 'Moving the king to safety', 'Trading queens'], 'Also called "removing the defender".', 3],
    ['What is zugzwang?', ['Any move a player makes worsens their position', 'A double attack by a knight', 'A drawn endgame', 'A pawn on the seventh rank'], 'It decides many king-and-pawn endings.', 3],
    ['An "overloaded" piece is one that...', ['Has too many defensive jobs to do at once', 'Has moved too many times', 'Is worth more than nine pawns', 'Is pinned to the king'], 'Attack one of its duties and the other collapses.', 3],
    ['Before grabbing a free pawn you should ask...', ['Whether it is a trap that costs time or material', 'Whether it is your favourite colour', 'How many moves the game has lasted', 'Whether you can castle first'], 'Poisoned pawns have lost a great many games.', 3]
  ];

  var MATES = [
    ['If a king is attacked but can move to a safe square, that is...', ['Check, not checkmate', 'Checkmate', 'Stalemate', 'A draw'], 'Mate only happens when there is no legal escape at all.', 1],
    ['Checkmate ends the game...', ['Immediately', 'After ten more moves', 'Only if both players agree', 'Never'], 'Nothing is played after mate.', 1],
    ['Which piece delivers checkmate most often?', ['The queen', 'A pawn', 'The king', 'A knight'], 'Her range lets her attack the king and cover escape squares at once.', 1],
    ['To checkmate, you usually need to...', ['Attack the king and cover every escape square', 'Capture all the pawns first', 'Promote a pawn first', 'Castle first'], 'An attack the king can walk away from is only a check.', 1],
    ['Can a king be checkmated in the middle of the board?', ['Yes, if every escape square is covered', 'No, never', 'Only by a pawn', 'Only on the first move'], 'It is rarer, because a central king has eight squares to cover.', 1],
    ['A checkmated king...', ['Cannot escape, block, or capture the attacker', 'Is taken off the board', 'May move twice', 'Can castle out of it'], 'Those three answers to a check are exactly what mate rules out.', 1],
    ['Which is easier to mate with: king and queen, or king and knight?', ['King and queen', 'King and knight', 'They are equally easy', 'Neither can mate'], 'King and knight cannot force mate at all.', 2],
    ['Anastasia\'s mate is delivered by which pair of pieces?', ['A knight and a rook', 'Two bishops', 'Two pawns', 'The king and queen'], 'The knight covers the escape squares while the rook mates on the h-file.', 3],
    ['In a smothered mate, the queen is usually sacrificed in order to...', ['Force the king\'s own rook onto its last escape square', 'Win a pawn', 'Promote', 'Deliver two checks'], 'The famous finish is Qg8+ Rxg8 Nf7#.', 3],
    ['Boden\'s mate is delivered by...', ['Two bishops on criss-crossing diagonals', 'Two knights', 'A rook and a pawn', 'The king alone'], 'It usually strikes a king that has castled queenside.', 3],
    ['The back-rank weakness is best prevented by...', ['Making "luft" — a square for the king to step into', 'Castling queenside instead', 'Trading queens early', 'Advancing the a-pawn'], 'One quiet pawn move can save the game later.', 3],
    ['To mate with king and rook you should...', ['Use your king to take squares away while the rook cuts the enemy king off', 'Give checks at random', 'Keep the rook as far away as possible', 'Promote another pawn first'], 'The technique is called the box or the shrinking rectangle.', 3],
    ['What is checkmate?', ['The king is attacked and has no legal way out', 'The king is captured and removed', 'A player runs out of pieces', 'A player runs out of time'], 'The king is never actually taken — the game ends at mate.', 1],
    ['Can a lone king ever be checkmated by a lone king?', ['No', 'Yes', 'Only in the corner', 'Only with a pawn'], 'You need enough material to force mate.', 1],
    ['Which single piece plus a king can force checkmate?', ['A rook', 'A knight', 'A bishop', 'None of them'], 'King and queen or king and rook can force mate; a lone bishop or knight cannot.', 2],
    ['King and bishop against a lone king is...', ['A draw — mate cannot be forced', 'A win for the bishop', 'A win for the lone king', 'Illegal'], 'The same is true of king and knight against king.', 2],
    ['What is the fastest possible checkmate?', ['Fool\'s mate, in two moves', 'Scholar\'s mate, in four moves', 'In seven moves', 'In ten moves'], 'It needs terrible cooperation: 1.f3 e5 2.g4 Qh4#.', 2],
    ['Scholar\'s mate finishes with...', ['Qxf7#, supported by a bishop on c4', 'A knight on f7', 'A rook on the back rank', 'A pawn promotion'], 'f7 is the weakest square in the opening because only the king defends it.', 2],
    ['What is a smothered mate?', ['A knight mates a king hemmed in by its own pieces', 'A mate by two rooks', 'A mate with pawns only', 'A stalemate'], 'Usually the queen is sacrificed to force the king\'s own rook into the corner square.', 3],
    ['Two rooks mate a lone king by...', ['Cutting off ranks one at a time, like a staircase', 'Checking from the same file', 'Trapping it in the centre', 'Waiting for zugzwang'], 'The "ladder" or "lawnmower" mate needs no king help at all.', 3],
    ['To mate with king and queen, you should...', ['Push the king to the edge, keeping your king close', 'Give endless checks in the centre', 'Keep the queen far away', 'Trade the queen off'], 'Beware stalemate: leave the enemy king a square until you can mate.', 3]
  ];

  var OPENINGS = [
    ['What does "developing a piece" mean?', ['Bringing it out to a useful square', 'Trading it off', 'Promoting it', 'Losing it deliberately'], 'Pieces on their starting squares are doing nothing.', 1],
    ['Which of these is a central square?', ['e4', 'a1', 'h8', 'a8'], 'The four central squares are d4, e4, d5 and e5.', 1],
    ['A knight is usually best developed towards...', ['The centre', 'The edge of the board', 'Its own back rank', 'The corner'], 'From the centre a knight attacks eight squares; from the rim, four.', 1],
    ['Should you push lots of pawns in the opening?', ['No — develop your pieces instead', 'Yes, push them all', 'Only the a-pawn', 'Only on the first move'], 'Every pawn move is a move your pieces did not make.', 1],
    ['Where is the king safest in the opening?', ['Castled behind its own pawns', 'In the centre of the board', 'On an open file', 'On the eighth rank'], 'The centre is exactly where the lines open first.', 1],
    ['1.e4 c6 is the...', ['Caro-Kann Defence', 'French Defence', 'Sicilian Defence', 'Scandinavian Defence'], 'Black prepares d5 without shutting in the light-squared bishop.', 3],
    ['1.d4 Nf6 2.c4 g6 leads to the...', ['King\'s Indian Defence', 'Queen\'s Gambit Declined', 'Ruy Lopez', 'Italian Game'], 'Black gives up the centre early, then strikes back at it.', 3],
    ['The Scandinavian Defence begins with...', ['1.e4 d5', '1.d4 d5', '1.e4 e5', '1.c4 e5'], 'Black challenges the e-pawn on the very first move.', 3],
    ['An isolated queen\'s pawn is...', ['A pawn with no friendly pawns on either adjacent file', 'A pawn on the edge of the board', 'Two pawns on one file', 'A pawn that cannot be stopped'], 'It is weak in the endgame but grants active piece play earlier.', 3],
    ['In the opening you should try to control...', ['The centre', 'The corners', 'The a-file', 'Your own back rank'], 'Central pieces reach more squares and move faster.', 1],
    ['A good first move for White is...', ['e4 or d4', 'a4 or h4', 'Na3', 'f3'], 'Both stake a claim in the centre and open lines for pieces.', 1],
    ['Early in the game you should get your king...', ['Castled and safe', 'Into the centre', 'Onto an open file', 'In front of the pawns'], 'Castling tucks the king away and connects the rooks.', 1],
    ['In the opening it is usually best to...', ['Develop a new piece each move', 'Move the same piece repeatedly', 'Bring the queen out immediately', 'Push every pawn'], 'Time — "tempo" — is the currency of the opening.', 2],
    ['Why is bringing the queen out very early usually bad?', ['It gets chased around, losing time', 'The queen is too weak', 'It is against the rules', 'It blocks your king'], 'Every attack on her develops an opponent piece for free.', 2],
    ['1.e4 e5 2.Nf3 Nc6 3.Bb5 is the...', ['Ruy Lopez', 'Sicilian Defence', 'French Defence', 'Queen\'s Gambit'], 'Also called the Spanish Opening — one of the oldest and deepest.', 2],
    ['1.e4 c5 is the...', ['Sicilian Defence', 'French Defence', 'Caro-Kann', 'Italian Game'], 'The most popular answer to 1.e4 at every level.', 2],
    ['1.d4 d5 2.c4 is the...', ['Queen\'s Gambit', 'King\'s Indian', 'Ruy Lopez', 'Scotch Game'], 'White offers a pawn to deflect Black\'s d-pawn from the centre.', 2],
    ['1.e4 e6 is the...', ['French Defence', 'Caro-Kann Defence', 'Sicilian Defence', 'Pirc Defence'], 'Black prepares d5 with a solid but slightly cramped structure.', 3],
    ['What is a gambit?', ['Offering material, usually a pawn, for speed or attack', 'A forced checkmate', 'A drawn opening', 'A double check'], 'The Queen\'s Gambit and King\'s Gambit are the best-known examples.', 3],
    ['What is a fianchetto?', ['Developing a bishop to b2, g2, b7 or g7 behind a knight-pawn', 'Castling queenside', 'Doubling rooks', 'Trading both bishops'], 'It aims the bishop along the board\'s longest diagonal.', 3],
    ['A common piece of opening advice is to develop...', ['Knights before bishops', 'Rooks before knights', 'The queen before everything', 'Only pawns for ten moves'], 'A knight\'s best square is usually obvious; a bishop\'s often is not.', 3]
  ];

  var ENDGAMES = [
    ['Why is a single extra pawn often enough to win an endgame?', ['It can be promoted into a queen', 'It blocks the enemy king', 'It is worth five points', 'It ends the game at once'], 'With few pieces left, there is little to stop it marching down the board.', 1],
    ['In the endgame there are...', ['Few pieces left on the board', 'More pieces than at the start', 'No kings', 'Only queens'], 'With the queens gone, the rules of thumb change completely.', 1],
    ['Which pawn is closest to promoting?', ['One on the seventh rank', 'One on the second rank', 'One on the first rank', 'One in the centre'], 'From the seventh, it promotes on the very next move.', 1],
    ['If only the two kings are left, the game is...', ['A draw', 'A win for White', 'A win for Black', 'Played on forever'], 'Neither side has the material to mate.', 1],
    ['Which piece is it usually best to promote to?', ['A queen', 'Another pawn', 'A king', 'Almost always a knight'], 'Underpromotion to a knight is occasionally right, but rarely.', 1],
    ['To stop an enemy passed pawn, your king should try to...', ['Get in front of it', 'Stay behind it', 'Stay in the corner', 'Ignore it and attack elsewhere'], 'A king in front of a pawn blocks it completely.', 1],
    ['In a king-and-pawn endgame, the most important factor is usually...', ['King activity', 'How many moves have been played', 'The colour of the squares', 'Castling rights'], 'An active king is worth more than an extra pawn in many endings.', 2],
    ['The Lucena position is a winning method using...', ['A rook and a pawn on the seventh, "building a bridge"', 'Two knights', 'The bishop pair', 'Three connected pawns'], 'The rook shields its king from checks so the pawn can promote.', 3],
    ['In the Philidor position the defender draws by...', ['Holding the rook on the third rank until the pawn advances', 'Giving up the rook for the pawn', 'Marching the king forward', 'Trading all the pawns'], 'Once the pawn comes to the sixth, the rook swings behind for checks.', 3],
    ['Bishops of opposite colours in an endgame tend to...', ['Make a draw more likely, even a pawn or two down', 'Guarantee a win for the stronger side', 'Force checkmate quickly', 'Lose for whoever has them'], 'Neither bishop can ever challenge the other\'s squares.', 3],
    ['The "wrong rook pawn" draw happens when the bishop...', ['Does not control the pawn\'s promotion square', 'Is pinned to the king', 'Sits on the wrong file', 'Has already been captured'], 'The defending king simply sits in the corner and cannot be shifted.', 3],
    ['In the endgame, the king should...', ['Come out and fight — it is a strong piece', 'Hide in the corner', 'Stay behind its pawns forever', 'Be traded off'], 'With few pieces left, the king is worth about four pawns in attacking power.', 1],
    ['A pawn that reaches the eighth rank usually becomes...', ['A queen', 'A king', 'A second pawn', 'Nothing'], 'Promotion is why even a single extra pawn can win a game.', 1],
    ['A "passed pawn" is one that...', ['Has no enemy pawn able to stop it', 'Has moved twice', 'Sits on the edge of the board', 'Is defended by a rook'], 'Passed pawns must be pushed — they only get stronger.', 2],
    ['King and rook against a lone king is...', ['A forced win', 'A draw', 'A loss', 'Only a win with a pawn'], 'You drive the king to the edge with the rook and your own king.', 2],
    ['What is the "opposition"?', ['Kings facing each other with one square between; the player to move must give way', 'Two rooks on one file', 'A pawn blocked by a pawn', 'Castling on opposite sides'], 'Whoever does NOT have to move holds the opposition and makes progress.', 2],
    ['Where does a rook usually belong relative to a passed pawn?', ['Behind it', 'In front of it', 'Beside it', 'On the other side of the board'], 'Tarrasch\'s rule: the rook gains scope as the pawn advances.', 3],
    ['What is the "rule of the square"?', ['A way to see at a glance whether a king can catch a passed pawn', 'A rule about castling', 'A method of counting material', 'A way to set up the board'], 'Draw a square from the pawn to the promotion rank; if the king can step inside, it catches the pawn.', 3],
    ['In king-and-pawn endings, having an extra tempo often means...', ['Winning, because the opponent is in zugzwang', 'Nothing at all', 'An automatic draw', 'Losing a pawn'], 'These endings are decided by single moves more than any other.', 3],
    ['Two knights against a lone king can...', ['Not force checkmate', 'Force mate in under ten moves', 'Force mate easily', 'Only stalemate'], 'Mate is possible but cannot be forced against best defence.', 3]
  ];

  /* Board puzzles. `moves` lists [notation, from-to]; the first entry is the answer.
     Each is verified by tools/verify-chess.mjs, which generates legal moves from the FEN. */
  var PUZZLES = [
    { fen: '4k3/8/8/3q4/8/1B6/8/4K3 w - - 0 1', band: 1, static: true,
      ask: 'Which white piece can capture the black queen?',
      options: ['The bishop, along the b3–c4–d5 diagonal',
                'The king, by walking up the board',
                'A pawn, by capturing forwards',
                'No white piece can reach it'],
      why: 'Bishops move diagonally. From b3 the path runs b3–c4–d5, and d5 is exactly where the queen stands.' },

    { fen: '4k3/8/8/8/7r/8/8/4K2R w - - 0 1', band: 1,
      ask: 'White to play. Black has left a rook undefended — take it.',
      moves: [['Rxh4', 'h1h4'], ['Rh3', 'h1h3'], ['Rg1', 'h1g1'], ['Kf2', 'e1f2']],
      why: 'The rooks share the h-file with nothing in between, so Rxh4 simply wins a whole rook for free.' },

    { fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1', band: 2,
      ask: 'White to play. Find checkmate in one move.',
      moves: [['Rd8#', 'd1d8'], ['Rd7', 'd1d7'], ['Rd4', 'd1d4'], ['Kf2', 'g1f2']],
      why: 'Rd8 is mate on the back rank: the king is walled in by its own pawns on f7, g7 and h7.' },

    { fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', band: 2,
      ask: 'White to play. Find checkmate in one move.',
      moves: [['Qg7#', 'g1g7'], ['Qg8+', 'g1g8'], ['Qh1+', 'g1h1'], ['Qb6', 'g1b6']],
      why: 'Qg7 is protected by the king on f6, so the black king can neither capture it nor escape. Qg8+ fails because the queen is undefended there — the king just takes it.' },

    { fen: '7k/8/7K/8/8/8/8/R7 w - - 0 1', band: 2,
      ask: 'White to play. Find checkmate in one move.',
      moves: [['Ra8#', 'a1a8'], ['Ra7', 'a1a7'], ['Rh1+', 'a1h1'], ['Kg6', 'h6g6']],
      why: 'The rook takes the eighth rank while the white king covers g7 and h7. This is the basic king-and-rook mate.' },

    { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', band: 2,
      ask: 'White to play. This is Scholar\'s mate — finish it.',
      moves: [['Qxf7#', 'h5f7'], ['Qxe5+', 'h5e5'], ['Bxf7+', 'c4f7'], ['Qf3', 'h5f3']],
      why: 'Qxf7 is mate because the bishop on c4 defends the queen. Bxf7+ is only a check — the king simply takes the bishop.' },

    { fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', band: 2,
      ask: 'White to play. Win the rook with a knight fork.',
      moves: [['Nc7+', 'd5c7'], ['Nf6+', 'd5f6'], ['Nb6', 'd5b6'], ['Ne3', 'd5e3']],
      why: 'Nc7 checks the king on e8 and attacks the rook on a8 at the same time. The king must move, and the rook falls.' },

    { fen: '3q4/8/8/3k4/8/8/8/R3K3 w - - 0 1', band: 3,
      ask: 'White to play. Win the queen with a skewer.',
      moves: [['Rd1+', 'a1d1'], ['Ra5+', 'a1a5'], ['Ra8', 'a1a8'], ['Ke2', 'e1e2']],
      why: 'Rd1 checks the king along the d-file. When the king steps aside, Rxd8 wins the queen behind it. Ra5+ is also check, but nothing stands behind the king.' },

    { fen: '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1', band: 2, static: true,
      ask: 'Which black piece is pinned, and why?',
      options: ['The knight on c6 — moving it would expose the king on e8',
                'The king on e8 — it cannot move at all',
                'Nothing is pinned in this position',
                'The bishop on b5 is pinned'],
      why: 'The bishop on b5 attacks along b5–c6–d7–e8. The knight is stuck: moving it would leave the king in check, which is illegal.' }
  ];

  /* ---------------- generators ---------------- */

  function bank(items, kicker) {
    return function (n, stage) {
      return U.sample(U.forStage(items, stage), n).map(function (it) {
        var correct = it[1][0];
        var options = U.shuffle(it[1]);
        return {
          type: 'choice', kicker: kicker,
          prompt: it[0], choices: options,
          answer: options.indexOf(correct), explanation: it[2]
        };
      });
    };
  }

  function puzzleQuestion(p) {
    if (p.static) {
      var opts = U.shuffle(p.options);
      return {
        type: 'choice', kicker: 'position', board: p.fen,
        prompt: p.ask, choices: opts,
        answer: opts.indexOf(p.options[0]), explanation: p.why
      };
    }
    var correct = p.moves[0][0];
    var choices = U.shuffle(p.moves.map(function (m) { return m[0]; }));
    return {
      type: 'choice', kicker: 'find the move', board: p.fen,
      prompt: p.ask, choices: choices,
      answer: choices.indexOf(correct), explanation: p.why
    };
  }

  /* Puzzles are few, so a puzzle lesson mixes them with related theory. */
  function puzzles(n, stage) {
    var pool = U.forStage(PUZZLES.map(function (p) { return [p, p.band]; }), stage)
                .map(function (x) { return x[0]; });
    var out = U.shuffle(pool).map(puzzleQuestion);
    if (out.length >= n) return out.slice(0, n);
    var theory = bank(MATES.concat(TACTICS), 'tactics')(n - out.length, stage);
    return U.shuffle(out.concat(theory));
  }

  SH.register({
    id: 'chess',
    name: 'Chess',
    native: '',
    emoji: '♟️',
    color: 'var(--chess)',
    blurb: 'Pieces, rules, tactics, mating patterns, openings and endgames.',
    topics: [
      { id: 'pieces', name: 'The Pieces', desc: 'How everything moves, and what it is worth', generate: bank(PIECES, 'the pieces') },
      { id: 'rules', name: 'Rules & Notation', desc: 'Castling, promotion, stalemate, reading moves', generate: bank(RULES, 'rules') },
      { id: 'tactics', name: 'Tactics', desc: 'Forks, pins, skewers and discovered attacks', generate: bank(TACTICS, 'tactics') },
      { id: 'puzzles', name: 'Board Puzzles', desc: 'Real positions — find the winning move', generate: puzzles },
      { id: 'mates', name: 'Checkmate Patterns', desc: 'Back rank, smothered, and forcing mate with few pieces', generate: bank(MATES, 'checkmate') },
      { id: 'openings', name: 'Openings', desc: 'Opening principles and the named classics', generate: bank(OPENINGS, 'openings') },
      { id: 'endgames', name: 'Endgames', desc: 'Opposition, passed pawns and basic wins', generate: bank(ENDGAMES, 'endgames') }
    ]
  });
})(window.StudyHub);
