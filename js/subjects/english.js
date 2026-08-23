/* English — vocabulary, grammar, spelling, idioms and reading.
   Every bank item ends with a difficulty band: 1 = ages 4–10, 2 = 11–13, 3 = 14+. */
(function (SH) {
  'use strict';
  var U = SH.U;

  /* [word, part of speech, meaning, band] */
  var VOCAB = [
    ['brave', 'adj', 'not afraid to do something difficult', 1],
    ['bright', 'adj', 'giving out a lot of light, or very clever', 1],
    ['calm', 'adj', 'quiet and not upset', 1],
    ['clever', 'adj', 'quick at learning and understanding', 1],
    ['damp', 'adj', 'slightly wet', 1],
    ['enormous', 'adj', 'extremely big', 1],
    ['gentle', 'adj', 'kind and careful, not rough', 1],
    ['gather', 'verb', 'to bring things together in one place', 1],
    ['hurry', 'verb', 'to move or do something quickly', 1],
    ['journey', 'noun', 'a trip from one place to another', 1],
    ['nervous', 'adj', 'worried about what might happen', 1],
    ['peaceful', 'adj', 'quiet and free from trouble', 1],
    ['polite', 'adj', 'behaving in a way that shows respect', 1],
    ['rescue', 'verb', 'to save someone from danger', 1],
    ['shiver', 'verb', 'to shake because you are cold or afraid', 1],
    ['stroll', 'verb', 'to walk in a slow, relaxed way', 1],
    ['sturdy', 'adj', 'strong and not easily broken', 1],
    ['whisper', 'verb', 'to speak very quietly', 1],
    ['wander', 'verb', 'to walk around with no particular aim', 1],
    ['weary', 'adj', 'very tired', 1],

    ['abundant', 'adj', 'existing in large quantities; plentiful', 2],
    ['adapt', 'verb', 'to change in order to fit a new situation', 2],
    ['anticipate', 'verb', 'to expect something and prepare for it', 2],
    ['brittle', 'adj', 'hard but easily broken', 2],
    ['compel', 'verb', 'to force or strongly persuade someone to act', 2],
    ['deliberate', 'adj', 'done on purpose, not by accident', 2],
    ['diligent', 'adj', 'careful and hardworking', 2],
    ['diminish', 'verb', 'to become or make smaller or weaker', 2],
    ['endure', 'verb', 'to suffer something patiently, or to last a long time', 2],
    ['evident', 'adj', 'plain to see or understand', 2],
    ['genuine', 'adj', 'real, not fake or pretended', 2],
    ['hostile', 'adj', 'unfriendly or opposed to something', 2],
    ['illustrate', 'verb', 'to make something clearer with an example or picture', 2],
    ['immense', 'adj', 'extremely large', 2],
    ['persist', 'verb', 'to continue firmly despite difficulty', 2],
    ['reluctant', 'adj', 'unwilling and hesitant', 2],
    ['scarce', 'adj', 'not available in sufficient quantity', 2],
    ['significant', 'adj', 'large or important enough to matter', 2],
    ['thrive', 'verb', 'to grow strongly and do well', 2],
    ['vivid', 'adj', 'producing strong, clear images in the mind', 2],

    ['ambiguous', 'adj', 'open to more than one interpretation', 3],
    ['candid', 'adj', 'honest and direct, even when it is awkward', 3],
    ['coherent', 'adj', 'logical and clearly connected', 3],
    ['concise', 'adj', 'saying a lot in few words', 3],
    ['eloquent', 'adj', 'fluent and persuasive in speech or writing', 3],
    ['feasible', 'adj', 'possible to do easily or conveniently', 3],
    ['fluctuate', 'verb', 'to rise and fall irregularly', 3],
    ['frugal', 'adj', 'careful with money and resources', 3],
    ['inevitable', 'adj', 'certain to happen and impossible to avoid', 3],
    ['intricate', 'adj', 'having many small parts arranged in a complicated way', 3],
    ['justify', 'verb', 'to show that something is reasonable or right', 3],
    ['lenient', 'adj', 'more merciful or tolerant than expected', 3],
    ['meticulous', 'adj', 'showing great attention to detail', 3],
    ['monotonous', 'adj', 'dull and repetitive, never changing', 3],
    ['obsolete', 'adj', 'no longer used because something better exists', 3],
    ['plausible', 'adj', 'seeming reasonable or probable', 3],
    ['resilient', 'adj', 'able to recover quickly from difficulties', 3],
    ['sceptical', 'adj', 'not easily convinced; having doubts', 3],
    ['subtle', 'adj', 'so slight that it is hard to notice', 3],
    ['tentative', 'adj', 'not certain or fixed; provisional', 3],
    ['versatile', 'adj', 'able to be used for many different purposes', 3]
  ];

  /* [word, synonym, antonym, band] */
  var PAIRS = [
    ['big', 'large', 'small', 1],
    ['happy', 'glad', 'sad', 1],
    ['hot', 'warm', 'cold', 1],
    ['fast', 'quick', 'slow', 1],
    ['begin', 'start', 'finish', 1],
    ['near', 'close', 'far', 1],
    ['hard', 'difficult', 'easy', 1],
    ['loud', 'noisy', 'quiet', 1],
    ['old', 'ancient', 'new', 1],
    ['brave', 'courageous', 'cowardly', 1],
    ['clever', 'intelligent', 'foolish', 1],
    ['polite', 'courteous', 'rude', 1],

    ['brief', 'short', 'lengthy', 2],
    ['calm', 'peaceful', 'agitated', 2],
    ['common', 'ordinary', 'rare', 2],
    ['generous', 'giving', 'stingy', 2],
    ['increase', 'grow', 'decrease', 2],
    ['rapid', 'swift', 'sluggish', 2],
    ['silent', 'quiet', 'noisy', 2],
    ['wealthy', 'rich', 'poor', 2],

    ['confident', 'self-assured', 'insecure', 3],
    ['humble', 'modest', 'arrogant', 3],
    ['permanent', 'lasting', 'temporary', 3],
    ['rigid', 'stiff', 'flexible', 3],
    ['sufficient', 'adequate', 'inadequate', 3],
    ['transparent', 'clear', 'opaque', 3],
    ['affluent', 'prosperous', 'impoverished', 3],
    ['obscure', 'unclear', 'obvious', 3]
  ];

  /* [sentence with ___, options (first is correct), explanation, band] */
  var GRAMMAR = [
    ['I have ___ apple in my bag.', ['an', 'a', 'the', 'some'], 'Use "an" before a vowel sound: an apple.', 1],
    ['There ___ three cats on the wall.', ['are', 'is', 'am', 'be'], '"Three cats" is plural, so we use "are".', 1],
    ['She ___ to school every morning.', ['walks', 'walk', 'walking', 'walked'], 'With he/she/it the present simple takes an -s: she walks.', 1],
    ['Yesterday we ___ to the park.', ['went', 'go', 'goes', 'going'], 'Yesterday means the past, so "go" becomes "went".', 1],
    ['The plural of "child" is...', ['children', 'childs', 'childes', 'childrens'], '"Child" has an irregular plural: children.', 1],
    ['Which sentence is punctuated correctly?', ['Where is my book?', 'where is my book?', 'Where is my book', 'where is my book.'], 'A sentence starts with a capital letter, and a question ends with a question mark.', 1],
    ['This is ___ book.', ['my', 'me', 'I', 'mine book'], '"My" comes before a noun; "mine" stands alone.', 1],
    ['The dog is ___ the table.', ['under', 'of', 'off', 'than'], '"Under" describes a position below something.', 1],
    ['He is ___ than his sister.', ['taller', 'more tall', 'tallest', 'more taller'], 'Short adjectives add -er for comparisons: taller.', 1],
    ['We ___ playing football now.', ['are', 'is', 'am', 'be'], '"We" takes "are" in the present continuous.', 1],

    ['They ___ dinner when the phone rang.', ['were having', 'have', 'has had', 'are having'], 'A longer past action interrupted by a shorter one uses the past continuous.', 2],
    ['I have lived here ___ 2019.', ['since', 'for', 'from', 'during'], '"Since" marks a starting point; "for" marks a length of time.', 2],
    ['If it ___ tomorrow, we will cancel the picnic.', ['rains', 'will rain', 'rained', 'would rain'], 'In a first conditional the "if" clause stays in the present simple.', 2],
    ['This is the book ___ changed my mind.', ['that', 'who', 'whose', 'what'], '"That" or "which" introduces a relative clause about a thing.', 2],
    ['I ___ finished my homework yet.', ["haven't", "didn't", "don't have", "hadn't"], '"Yet" pairs with the present perfect.', 2],
    ['The letter ___ posted yesterday.', ['was', 'is', 'has', 'were'], 'Past passive, singular subject: was posted.', 2],
    ['We look forward to ___ from you.', ['hearing', 'hear', 'heard', 'be heard'], '"Look forward to" takes the -ing form.', 2],
    ['This soup tastes ___.', ['delicious', 'deliciously', 'more delicious', 'deliciousness'], 'After a linking verb you need an adjective, not an adverb.', 2],
    ['___ you like some tea?', ['Would', 'Are', 'Do', 'Will'], '"Would you like...?" is the standard polite offer.', 2],
    ['The keys are ___ the drawer.', ['in', 'on', 'at', 'to'], '"In" is used for something inside an enclosed space.', 2],

    ['He asked me where I ___ from.', ['came', 'come', 'am coming', 'will come'], 'Reported speech shifts the present into the past.', 3],
    ['I would rather ___ at home tonight.', ['stay', 'to stay', 'staying', 'stayed'], '"Would rather" is followed by the bare infinitive.', 3],
    ['Neither of the answers ___ correct.', ['is', 'are', 'were', 'be'], '"Neither of" takes a singular verb in formal English.', 3],
    ['By the time we arrived, the film ___.', ['had started', 'started', 'has started', 'starts'], 'The earlier of two past events takes the past perfect.', 3],
    ['I wish I ___ how to swim.', ['knew', 'know', 'have known', 'will know'], 'Wishes about the present use the past simple.', 3],
    ['She apologised ___ being late.', ['for', 'to', 'of', 'about being'], 'The fixed pattern is "apologise for + -ing".', 3],
    ['You ___ smoke in here — it is against the rules.', ["mustn't", "don't have to", "needn't", "wouldn't"], '"Mustn\'t" means prohibited; "don\'t have to" only means not required.', 3],
    ['Had I known, I ___ differently.', ['would have acted', 'would act', 'will act', 'had acted'], 'A third conditional with inversion: would have + past participle.', 3],
    ['The report, ___ was published on Monday, caused a stir.', ['which', 'that', 'what', 'who'], 'A non-defining relative clause after a comma uses "which", never "that".', 3],
    ['Hardly ___ sat down when the bell rang.', ['had I', 'I had', 'did I', 'I have'], 'After a negative adverb like "hardly", the subject and auxiliary invert.', 3]
  ];

  /* [correct spelling, misspellings, hint, band] */
  var SPELLING = [
    ['because', ['becuse', 'becouse', 'becaus'], 'Big Elephants Can Always Understand Small Elephants.', 1],
    ['friend', ['freind', 'frend', 'friendd'], 'It ends with "end": fri-end.', 1],
    ['people', ['peple', 'peeple', 'peopel'], 'peo-ple — the "o" is silent.', 1],
    ['said', ['sed', 'sayd', 'saide'], 'Past tense of "say" keeps the "ai".', 1],
    ['school', ['scool', 'skool', 'schoool'], 'The "ch" makes a k sound: s-ch-ool.', 1],
    ['beautiful', ['beatiful', 'beutiful', 'beautifull'], 'Big Elephants Are Ugly: b-e-a-u.', 1],
    ['night', ['nite', 'nigt', 'niight'], 'The silent "gh" pattern: light, night, right.', 1],
    ['different', ['diffrent', 'diferent', 'differant'], 'Three syllables: dif-fer-ent.', 1],
    ['important', ['importent', 'importaint', 'inportant'], 'Ends in -ant.', 1],
    ['tomorrow', ['tommorow', 'tomorow', 'tommorrow'], 'One m, two r\'s.', 1],

    ['believe', ['beleive', 'belive', 'believ'], 'I before e except after c.', 2],
    ['calendar', ['calender', 'calandar', 'callendar'], 'Ends in -ar, not -er.', 2],
    ['definitely', ['definately', 'definitly', 'defenitely'], 'It contains the word "finite".', 2],
    ['grateful', ['greatful', 'gratefull', 'gratful'], 'From "gratitude", not "great".', 2],
    ['necessary', ['neccessary', 'necesary', 'neccesary'], 'One c, two s\'s.', 2],
    ['separate', ['seperate', 'seperete', 'saparate'], 'There is "a rat" in sep-a-rate.', 2],
    ['immediately', ['immediatly', 'imediately', 'immediatley'], 'Keep the e: immediate + ly.', 2],
    ['argument', ['arguement', 'argumant', 'arguemant'], 'The e of "argue" is dropped before -ment.', 2],

    ['accommodate', ['accomodate', 'acommodate', 'accommadate'], 'Two c\'s and two m\'s.', 3],
    ['conscious', ['concious', 'consious', 'conscius'], 'Contains "scious": con-sci-ous.', 3],
    ['embarrass', ['embarass', 'embarras', 'embaress'], 'Double r and double s.', 3],
    ['existence', ['existance', 'existense', 'exsistence'], 'Ends in -ence.', 3],
    ['maintenance', ['maintainance', 'maintenence', 'maintanance'], 'The verb is "maintain" but the noun drops the i.', 3],
    ['occurrence', ['occurence', 'ocurrence', 'occurrance'], 'Double c, double r, and -ence.', 3],
    ['perseverance', ['perseverence', 'persaverance', 'perserverance'], 'Ends in -ance.', 3],
    ['privilege', ['priviledge', 'privelege', 'privilage'], 'No "d": pri-vi-lege.', 3],
    ['rhythm', ['rythm', 'rhythem', 'rhytm'], 'Two h\'s and no vowel between them.', 3],
    ['recommend', ['reccomend', 'recomend', 'reccommend'], 'One c, two m\'s.', 3]
  ];

  /* [idiom, meaning, band] */
  var IDIOMS = [
    ['piece of cake', 'something very easy to do', 1],
    ['break the ice', 'to make people feel relaxed when they first meet', 1],
    ['under the weather', 'feeling slightly ill', 1],
    ['keep an eye on', 'to watch something carefully', 1],
    ['once in a blue moon', 'very rarely', 1],
    ['hit the books', 'to start studying seriously', 1],
    ['call it a day', 'to stop working for the day', 1],
    ['pull someone\'s leg', 'to joke by telling someone something untrue', 1],

    ['let the cat out of the bag', 'to reveal a secret by accident', 2],
    ['cost an arm and a leg', 'to be extremely expensive', 2],
    ['on the same page', 'in agreement about something', 2],
    ['get cold feet', 'to become nervous and back out of a plan', 2],
    ['spill the beans', 'to give away information meant to be kept quiet', 2],
    ['throw in the towel', 'to give up', 2],

    ['bite off more than you can chew', 'to take on more than you can manage', 3],
    ['the ball is in your court', 'it is your turn to decide or act', 3],
    ['cut corners', 'to do something badly to save time or money', 3],
    ['run out of steam', 'to lose energy or enthusiasm', 3],
    ['sit on the fence', 'to avoid choosing a side', 3],
    ['take it with a grain of salt', 'to not fully believe something', 3]
  ];

  var PASSAGES = [
    {
      title: 'Market Day', band: 1,
      text: 'Every Saturday, Nadia helps her grandfather at the market. They arrive before sunrise and set out crates of oranges, onions and bright red peppers. Nadia\'s job is to count the change. At first she was slow and her grandfather had to help, but after a few months she could add the prices in her head faster than he could. On the way home he always buys her a warm pastry.',
      questions: [
        ['When do Nadia and her grandfather arrive at the market?', ['Before sunrise', 'At lunchtime', 'After dark', 'At noon'], 'The passage says they arrive before sunrise.'],
        ['What is Nadia\'s job?', ['Counting the change', 'Driving the van', 'Growing the peppers', 'Washing the crates'], 'Her job is to count the change.'],
        ['How did Nadia change over a few months?', ['She got much faster at adding', 'She stopped helping', 'She became slower', 'She moved away'], 'She could add prices faster than her grandfather.'],
        ['What happens on the way home?', ['Her grandfather buys her a pastry', 'They visit the beach', 'They count the crates again', 'They go back to the market'], 'He always buys her a warm pastry.']
      ]
    },
    {
      title: 'The Class Garden', band: 1,
      text: 'Class 4B decided to turn a patch of bare ground behind the school into a garden. They dug out the stones, mixed in compost and planted beans, carrots and sunflowers. Everyone took a turn watering after lunch. The beans grew first, climbing up strings the caretaker tied to the fence. By July the sunflowers were taller than Mr Osei, and the class ate their own carrots at the end-of-term picnic.',
      questions: [
        ['What did the class plant?', ['Beans, carrots and sunflowers', 'Apples and pears', 'Only grass', 'Roses and tulips'], 'They planted beans, carrots and sunflowers.'],
        ['Which plant grew first?', ['The beans', 'The carrots', 'The sunflowers', 'The compost'], 'The passage says the beans grew first.'],
        ['Who tied strings to the fence?', ['The caretaker', 'Mr Osei', 'The whole class', 'A parent'], 'The caretaker tied the strings for the beans to climb.'],
        ['How do we know the sunflowers grew very tall?', ['They were taller than Mr Osei', 'They reached the roof', 'They filled the whole garden', 'They fell over'], 'By July they were taller than Mr Osei.']
      ]
    },
    {
      title: 'The First Maps of the Sea Floor', band: 2,
      text: 'Until the 1950s, most people pictured the ocean floor as a flat, muddy plain. Marie Tharp changed that. Working from thousands of depth soundings that she was not allowed to collect herself — women were barred from the research ships — she drew the Atlantic sea floor by hand and found a vast mountain range running down its middle, split by a deep valley. Her map made continental drift hard to dismiss, though it took years for her colleagues to accept what the drawing showed.',
      questions: [
        ['What did most people believe about the ocean floor before the 1950s?', ['That it was a flat, muddy plain', 'That it was full of mountains', 'That it was made of ice', 'That it had no water'], 'The passage opens with that belief.'],
        ['Why did Marie Tharp not collect the soundings herself?', ['Women were barred from the research ships', 'She preferred to stay in the office', 'The equipment was too heavy', 'She worked in a different country'], 'The passage states women were barred from the ships.'],
        ['What did her map reveal?', ['A mountain range with a deep valley down the middle', 'A single flat plain', 'An underwater desert', 'A chain of islands'], 'She found a vast mid-ocean ridge split by a rift valley.'],
        ['What does the last sentence suggest?', ['Good evidence is not always accepted quickly', 'Her colleagues agreed at once', 'The map was inaccurate', 'She stopped working on maps'], 'It took years for colleagues to accept what she had shown.']
      ]
    },
    {
      title: 'The Cost of a Shortcut', band: 3,
      text: 'When a city widens a congested road, drivers who had been avoiding it return, and within a few years the queues are as long as before. Transport planners call this induced demand: capacity does not simply absorb existing traffic, it invites more. The same logic runs in reverse. Cities that have removed urban motorways — Seoul, San Francisco, Utrecht — generally did not see the gridlock their critics predicted, because some journeys were retimed, rerouted, or never made at all. Traffic, it turns out, behaves less like water in a pipe than like a crowd deciding where to stand.',
      questions: [
        ['What is "induced demand"?', ['New capacity attracts additional traffic', 'Traffic falls when roads widen', 'Drivers pay more for fuel', 'Roads wear out faster'], 'Extra capacity invites journeys that were not previously made.'],
        ['What happened in cities that removed motorways?', ['The predicted gridlock largely did not appear', 'Traffic doubled overnight', 'All journeys stopped', 'Roads had to be rebuilt'], 'Journeys were retimed, rerouted, or not made at all.'],
        ['What does the final comparison suggest about traffic?', ['It responds to choices rather than flowing fixedly', 'It is entirely predictable', 'It cannot be measured', 'It behaves exactly like water'], 'The crowd image stresses that drivers make decisions.'],
        ['Which statement best sums up the passage?', ['Road capacity shapes demand as much as demand shapes capacity', 'Widening roads always fixes congestion', 'Cities should never change roads', 'Traffic is caused only by population growth'], 'That two-way relationship is the central point.']
      ]
    },
    {
      title: 'The Lost Kitten', band: 1,
      text: 'Sam heard a small noise behind the shed. When he looked, a grey kitten was hiding under a flowerpot, wet and shivering. Sam wrapped it in his jumper and carried it inside. His mum put a bowl of warm milk on the floor. By evening the kitten was asleep on the sofa, purring so loudly that Sam could hear it from the kitchen.',
      questions: [
        ['Where was the kitten hiding?', ['Under a flowerpot', 'In the kitchen', 'On the sofa', 'In a tree'], 'The kitten was under a flowerpot behind the shed.'],
        ['How did Sam keep the kitten warm?', ['He wrapped it in his jumper', 'He lit a fire', 'He put it in a box', 'He gave it a hat'], 'Sam wrapped the kitten in his jumper.'],
        ['What did the kitten drink?', ['Warm milk', 'Cold water', 'Tea', 'Juice'], 'His mum put a bowl of warm milk on the floor.'],
        ['How did the kitten feel by the evening?', ['Safe and sleepy', 'Frightened', 'Hungry', 'Angry'], 'It was asleep and purring loudly, so it felt safe.']
      ]
    },
    {
      title: 'Why Bread Rises', band: 2,
      text: 'Bread dough rises because yeast, a single-celled fungus, feeds on the sugars in flour and releases carbon dioxide as a waste gas. The gluten network formed by kneading traps those bubbles, stretching like a balloon. Warmth speeds the process; cold slows it, which is why bakers sometimes leave dough in a refrigerator overnight to develop flavour without letting it grow too fast. Baking finally kills the yeast, but by then the bubbles are locked into the crumb.',
      questions: [
        ['What gas makes dough rise?', ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Steam only'], 'Yeast releases carbon dioxide as it feeds on sugars.'],
        ['What traps the gas in the dough?', ['The gluten network', 'The sugar', 'The salt', 'The oven heat'], 'Kneading forms a gluten network that holds the bubbles.'],
        ['Why do bakers chill dough overnight?', ['To slow the rise while flavour develops', 'To kill the yeast', 'To add more gas', 'To harden the crust'], 'Cold slows the yeast so flavour develops without over-rising.'],
        ['What happens to the yeast during baking?', ['It is killed by the heat', 'It multiplies rapidly', 'It turns into gluten', 'It escapes as gas'], 'Baking finally kills the yeast.']
      ]
    },
    {
      title: 'The Lighthouse Keeper', band: 3,
      text: 'For thirty-one years Ana kept the light at Cape Verity burning. The work was solitary but never idle: lamps had to be trimmed, brass polished, and the log filled in every four hours, storm or calm. When the harbour authority replaced the lamp with an automatic beacon in 1994, Ana was offered a desk job in town. She refused it. Instead she bought a small boat and began ferrying supplies to the islands, telling friends she had simply moved the same job onto the water.',
      questions: [
        ['How long did Ana keep the lighthouse?', ['Thirty-one years', 'Nineteen years', 'Since 1994', 'Four years'], 'The first sentence says "For thirty-one years".'],
        ['Why did the lighthouse job end?', ['An automatic beacon replaced the lamp', 'Ana retired because of illness', 'The harbour closed', 'She was promoted'], 'The authority installed an automatic beacon in 1994.'],
        ['What does the last sentence suggest about Ana?', ['She valued being useful to the islands', 'She disliked boats', 'She wanted an office job', 'She regretted her choice'], 'She saw ferrying supplies as the same work in a new place.'],
        ['The word "solitary" here means:', ['done alone', 'dangerous', 'poorly paid', 'occasional'], 'Solitary describes work carried out alone.']
      ]
    },
    {
      title: 'The Quiet Hour', band: 3,
      text: 'The city council introduced a "quiet hour" in the central library: between two and three each afternoon, no announcements were made, the printers were switched off, and staff answered questions in writing. It began as an accommodation for a handful of readers who found noise painful. Within a year, usage during that hour had doubled, and the council extended the practice to two other branches. What had been designed for a few turned out to be preferred by many.',
      questions: [
        ['Who was the quiet hour originally for?', ['Readers who found noise painful', 'Library staff', 'Schoolchildren', 'The council'], 'It began as an accommodation for such readers.'],
        ['What happened to use of the library during that hour?', ['It doubled', 'It halved', 'It stayed the same', 'It stopped'], 'Usage during the hour had doubled within a year.'],
        ['What is the main point of the last sentence?', ['A change made for a few can benefit many', 'Libraries should always be silent', 'The council wasted money', 'Few people used the library'], 'The accommodation turned out to be widely preferred.'],
        ['How did staff answer questions?', ['In writing', 'By phone', 'They did not answer', 'Over a loudspeaker'], 'Staff answered questions in writing.']
      ]
    }
  ];

  /* ---------------- generators ---------------- */

  function vocabulary(n, stage) {
    var bank = U.forStage(VOCAB, stage);
    return U.sample(bank, n).map(function (w) {
      if (Math.random() < 0.5) {
        var defs = bank.filter(function (x) { return x[0] !== w[0]; }).map(function (x) { return x[2]; });
        return U.choice('What does "' + w[0] + '" mean?', w[2], defs, {
          kicker: w[1],
          explanation: '"' + w[0] + '" (' + w[1] + '): ' + w[2] + '.'
        });
      }
      var words = bank.filter(function (x) { return x[0] !== w[0]; }).map(function (x) { return x[0]; });
      return U.choice('Which word means "' + w[2] + '"?', w[0], words, {
        kicker: 'choose the word',
        explanation: '"' + w[0] + '" (' + w[1] + ') means ' + w[2] + '.'
      });
    });
  }

  function synonyms(n, stage) {
    var bank = U.forStage(PAIRS, stage);
    return U.sample(bank, n).map(function (p) {
      var wantSyn = Math.random() < 0.5;
      var correct = wantSyn ? p[1] : p[2];
      var pool = [wantSyn ? p[2] : p[1]];
      bank.forEach(function (q) { if (q[0] !== p[0]) { pool.push(q[1]); pool.push(q[2]); } });
      return U.choice('Which word is ' + (wantSyn ? 'closest in meaning' : 'the opposite') + ' to "' + p[0] + '"?', correct, pool, {
        kicker: wantSyn ? 'synonym' : 'antonym',
        explanation: '"' + p[0] + '" — similar: ' + p[1] + ', opposite: ' + p[2] + '.'
      });
    });
  }

  function grammar(n, stage) {
    return U.sample(U.forStage(GRAMMAR, stage), n).map(function (g) {
      var correct = g[1][0];
      var options = U.shuffle(g[1]);
      return {
        type: 'choice', kicker: 'complete the sentence',
        prompt: g[0], choices: options, answer: options.indexOf(correct), explanation: g[2]
      };
    });
  }

  function spelling(n, stage) {
    return U.sample(U.forStage(SPELLING, stage), n).map(function (s) {
      var options = U.shuffle([s[0]].concat(s[1]));
      return {
        type: 'choice', kicker: 'which spelling is correct?',
        prompt: 'Pick the correctly spelled word.',
        choices: options, answer: options.indexOf(s[0]),
        explanation: '"' + s[0] + '" — ' + s[2]
      };
    });
  }

  function idioms(n, stage) {
    var bank = U.forStage(IDIOMS, stage);
    return U.sample(bank, n).map(function (i) {
      var others = bank.filter(function (x) { return x[0] !== i[0]; }).map(function (x) { return x[1]; });
      return U.choice('What does "' + i[0] + '" mean?', i[1], others, {
        kicker: 'idiom', explanation: '"' + i[0] + '" means ' + i[1] + '.'
      });
    });
  }

  function reading(n, stage) {
    var bank = U.forStage(PASSAGES.map(function (p) { return [p, p.band]; }), stage).map(function (x) { return x[0]; });
    var out = [];
    var passages = U.shuffle(bank);
    for (var p = 0; p < passages.length && out.length < n; p++) {
      var pass = passages[p];
      var qs = U.shuffle(pass.questions);
      for (var i = 0; i < qs.length && out.length < n; i++) {
        var q = qs[i];
        var correct = q[1][0];
        var options = U.shuffle(q[1]);
        out.push({
          type: 'choice', kicker: 'reading · ' + pass.title, passage: pass.text,
          prompt: q[0], choices: options, answer: options.indexOf(correct), explanation: q[2]
        });
      }
    }
    // if one stage has few passages, cycle through them again rather than short-changing the lesson
    var guard = 0;
    while (out.length < n && passages.length && guard++ < 10) {
      var extra = out.slice(0, Math.min(out.length, n - out.length));
      out = out.concat(U.shuffle(extra));
    }
    return out.slice(0, n);
  }

  function cards(bank, front, back, sub) {
    return function (stage) {
      return U.forStage(bank, stage).map(function (w) {
        return { front: w[front], back: w[back], sub: sub == null ? '' : w[sub] };
      });
    };
  }

  SH.register({
    id: 'english',
    name: 'English',
    native: '',
    emoji: '📖',
    color: 'var(--english)',
    blurb: 'Words, grammar, spelling and reading.',
    topics: [
      { id: 'vocabulary', name: 'Vocabulary', desc: 'Word meanings, both directions',
        generate: vocabulary, flashcards: cards(VOCAB, 0, 2, 1) },
      { id: 'synonyms', name: 'Synonyms & Antonyms', desc: 'Words that match and words that clash',
        generate: synonyms, flashcards: cards(PAIRS, 0, 1, 2) },
      { id: 'grammar', name: 'Grammar', desc: 'Tenses, articles, prepositions, agreement',
        generate: grammar },
      { id: 'spelling', name: 'Spelling', desc: 'The words people most often get wrong',
        generate: spelling },
      { id: 'idioms', name: 'Idioms', desc: 'Everyday expressions and what they mean',
        generate: idioms, flashcards: cards(IDIOMS, 0, 1) },
      { id: 'reading', name: 'Reading', desc: 'Short passages with questions',
        generate: reading }
    ]
  });
})(window.StudyHub);
