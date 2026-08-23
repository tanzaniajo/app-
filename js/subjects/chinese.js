/* Chinese (Mandarin, simplified) — characters, pinyin, meaning, numbers, phrases and grammar. */
(function (SH) {
  'use strict';
  var U = SH.U;

  /* [hanzi, pinyin, english] */
  var VOCAB = [
    ['我', 'wǒ', 'I; me', 1], ['你', 'nǐ', 'you', 1], ['他', 'tā', 'he; him', 1], ['她', 'tā', 'she; her', 1],
    ['我们', 'wǒmen', 'we; us', 1], ['好', 'hǎo', 'good; well', 1], ['是', 'shì', 'to be', 1], ['不', 'bù', 'not', 1],
    ['在', 'zài', 'at; in; to be located', 1], ['有', 'yǒu', 'to have; there is', 1], ['人', 'rén', 'person', 1],
    ['大', 'dà', 'big', 1], ['小', 'xiǎo', 'small', 1], ['中国', 'Zhōngguó', 'China', 1], ['学', 'xué', 'to study', 1],
    ['老师', 'lǎoshī', 'teacher', 1], ['学生', 'xuésheng', 'student', 1], ['朋友', 'péngyou', 'friend', 1],
    ['家', 'jiā', 'home; family', 1], ['爸爸', 'bàba', 'father', 1], ['妈妈', 'māma', 'mother', 1],
    ['儿子', 'érzi', 'son', 1], ['女儿', 'nǚ\'ér', 'daughter', 1], ['名字', 'míngzi', 'name', 1],
    ['什么', 'shénme', 'what', 1], ['谁', 'shéi', 'who', 1], ['哪儿', 'nǎr', 'where', 1], ['怎么', 'zěnme', 'how', 1],
    ['为什么', 'wèishénme', 'why', 2], ['多少', 'duōshao', 'how many; how much', 2],
    ['今天', 'jīntiān', 'today', 1], ['明天', 'míngtiān', 'tomorrow', 1], ['昨天', 'zuótiān', 'yesterday', 1],
    ['现在', 'xiànzài', 'now', 1], ['年', 'nián', 'year', 1], ['月', 'yuè', 'month; moon', 1], ['星期', 'xīngqī', 'week', 1],
    ['点', 'diǎn', 'o\'clock; dot', 2], ['分钟', 'fēnzhōng', 'minute', 2],
    ['吃', 'chī', 'to eat', 1], ['喝', 'hē', 'to drink', 1], ['水', 'shuǐ', 'water', 1], ['茶', 'chá', 'tea', 1],
    ['米饭', 'mǐfàn', 'cooked rice', 2], ['菜', 'cài', 'dish; vegetable', 2], ['苹果', 'píngguǒ', 'apple', 1],
    ['说', 'shuō', 'to speak', 1], ['看', 'kàn', 'to look; to watch', 1], ['听', 'tīng', 'to listen', 1],
    ['写', 'xiě', 'to write', 1], ['读', 'dú', 'to read', 1], ['买', 'mǎi', 'to buy', 2], ['卖', 'mài', 'to sell', 2],
    ['去', 'qù', 'to go', 1], ['来', 'lái', 'to come', 1], ['回', 'huí', 'to return', 1], ['住', 'zhù', 'to live; to stay', 2],
    ['工作', 'gōngzuò', 'work; to work', 2], ['喜欢', 'xǐhuan', 'to like', 2], ['爱', 'ài', 'to love', 1],
    ['想', 'xiǎng', 'to want; to think', 2], ['会', 'huì', 'can (learned skill)', 2], ['能', 'néng', 'can (be able to)', 2],
    ['可以', 'kěyǐ', 'may; be allowed to', 2], ['很', 'hěn', 'very', 1], ['太', 'tài', 'too (excessively)', 2],
    ['也', 'yě', 'also', 2], ['都', 'dōu', 'all; both', 2], ['和', 'hé', 'and; with', 1],
    ['书', 'shū', 'book', 1], ['学校', 'xuéxiào', 'school', 2], ['医院', 'yīyuàn', 'hospital', 3],
    ['商店', 'shāngdiàn', 'shop', 2], ['饭店', 'fàndiàn', 'restaurant', 2], ['火车站', 'huǒchēzhàn', 'train station', 3],
    ['飞机', 'fēijī', 'aeroplane', 2], ['出租车', 'chūzūchē', 'taxi', 3], ['电脑', 'diànnǎo', 'computer', 2],
    ['电视', 'diànshì', 'television', 2], ['电话', 'diànhuà', 'telephone', 2], ['钱', 'qián', 'money', 2],
    ['天气', 'tiānqì', 'weather', 2], ['冷', 'lěng', 'cold', 1], ['热', 'rè', 'hot', 1], ['下雨', 'xiàyǔ', 'to rain', 2],
    ['猫', 'māo', 'cat', 1], ['狗', 'gǒu', 'dog', 1], ['东西', 'dōngxi', 'thing; stuff', 2],
    ['高兴', 'gāoxìng', 'happy; glad', 2], ['漂亮', 'piàoliang', 'pretty', 3], ['新', 'xīn', 'new', 1],
    ['老', 'lǎo', 'old', 1], ['快', 'kuài', 'fast', 1], ['慢', 'màn', 'slow', 1], ['多', 'duō', 'many', 1], ['少', 'shǎo', 'few', 1]
  ];

  /* [hanzi, pinyin, english] */
  var PHRASES = [
    ['你好', 'nǐ hǎo', 'Hello', 1],
    ['谢谢', 'xièxie', 'Thank you', 1],
    ['不客气', 'bú kèqi', 'You\'re welcome', 2],
    ['对不起', 'duìbuqǐ', 'Sorry', 1],
    ['没关系', 'méi guānxi', 'It\'s all right', 2],
    ['再见', 'zàijiàn', 'Goodbye', 1],
    ['请问', 'qǐngwèn', 'Excuse me, may I ask...', 2],
    ['早上好', 'zǎoshang hǎo', 'Good morning', 1],
    ['晚安', 'wǎn\'ān', 'Good night', 1],
    ['我叫…', 'wǒ jiào…', 'My name is...', 1],
    ['认识你很高兴', 'rènshi nǐ hěn gāoxìng', 'Nice to meet you', 3],
    ['多少钱', 'duōshao qián', 'How much does it cost?', 2],
    ['我不明白', 'wǒ bù míngbai', 'I don\'t understand', 2],
    ['请再说一遍', 'qǐng zài shuō yí biàn', 'Please say that again', 3],
    ['你会说英语吗', 'nǐ huì shuō Yīngyǔ ma', 'Do you speak English?', 3],
    ['洗手间在哪儿', 'xǐshǒujiān zài nǎr', 'Where is the toilet?', 3],
    ['我饿了', 'wǒ è le', 'I\'m hungry', 2],
    ['没问题', 'méi wèntí', 'No problem', 2],
    ['加油', 'jiāyóu', 'Keep going! / Good luck!', 1],
    ['慢一点', 'màn yìdiǎn', 'A bit slower, please', 2]
  ];

  /* [question, [options — first is correct], explanation] */
  var GRAMMAR = [
    ['Which measure word goes with 书 (book)?', ['本', '只', '杯', '张'], '一本书 — 本 is the measure word for bound volumes.', 2],
    ['Which measure word goes with 猫 (cat)?', ['只', '本', '条', '位'], '一只猫 — 只 is used for many small animals.', 2],
    ['Which measure word goes with 茶 (a cup of tea)?', ['杯', '本', '张', '件'], '一杯茶 — 杯 means "cup".', 2],
    ['Which measure word goes with 桌子 (table)?', ['张', '本', '只', '双'], '一张桌子 — 张 is used for flat things.', 2],
    ['The default measure word, used when you are unsure, is:', ['个', '本', '只', '条'], '个 (gè) works with a very wide range of nouns.', 1],
    ['How do you turn 你是学生 into a yes/no question?', ['你是学生吗？', '你是学生呢？', '吗你是学生？', '你吗是学生？'], '吗 goes at the very end of the sentence.', 1],
    ['Which sentence correctly says "I don\'t have money"?', ['我没有钱', '我不有钱', '我不钱有', '我没钱不'], '有 is negated with 没, never with 不.', 2],
    ['Where does the time word go in Chinese?', ['Before the verb: 我明天去', 'After the verb: 我去明天', 'At the very end always', 'It cannot appear in a sentence'], 'Chinese puts time expressions before the verb phrase.', 2],
    ['What does 了 usually mark in 我吃了？', ['A completed action', 'A future action', 'A question', 'A negative'], '了 signals completion or a change of state.', 2],
    ['Which is the correct word order for "I go to school by bus"?', ['我坐公共汽车去学校', '我去学校坐公共汽车', '我学校去坐公共汽车', '去我学校公共汽车坐'], 'The means of travel comes before the main verb 去.', 3],
    ['What is the role of 的 in 我的书?', ['It marks possession', 'It marks the past', 'It asks a question', 'It negates the noun'], '我的书 = "my book".', 1],
    ['Which sentence means "He is also a teacher"?', ['他也是老师', '他是也老师', '也他是老师', '他是老师也'], '也 goes directly before the verb.', 2],
    ['With an adjective like 高兴, what usually comes before it?', ['很', '是', '的', '了'], '很高兴 — 很 links a subject to an adjective; 是 is not used there.', 2],
    ['Which question word asks "where"?', ['哪儿', '什么', '谁', '怎么'], '哪儿 (nǎr) or 哪里 (nǎlǐ) means "where".', 1],
    ['How do you say "I am not a student"?', ['我不是学生', '我没是学生', '我是不学生', '我不学生是'], '不 negates 是; 没 is used with 有 and completed actions.', 2],
    ['In 我比他高, what does 比 do?', ['It makes a comparison', 'It asks a question', 'It marks the past', 'It shows possession'], '我比他高 = "I am taller than him".', 3],
    ['Which is the correct way to say "two people"?', ['两个人', '二个人', '两人个', '个两人'], 'Before a measure word, "two" is 两, not 二.', 2],
    ['What does 呢 do at the end of 你呢？', ['Bounces the same question back', 'Makes a command', 'Negates the sentence', 'Marks the future'], '你呢？= "And you?"', 2],
    ['Which sentence means "I want to drink tea"?', ['我想喝茶', '我喝想茶', '我茶想喝', '想我喝茶'], 'Modal verb 想 comes before the main verb 喝.', 2],
    ['What is the difference between 会 and 能?', ['会 = a learned skill, 能 = physically able or permitted', 'They are identical', '会 = past, 能 = future', '会 is a noun, 能 is a verb'], '我会游泳 (I can swim — I learned) vs 我今天不能游泳 (I can\'t swim today).', 3]
  ];

  /* ---------------- numbers ---------------- */
  var DIGITS_HAN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var DIGITS_PIN = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];
  var UNITS_HAN = ['', '十', '百', '千'];
  var UNITS_PIN = ['', 'shí', 'bǎi', 'qiān'];

  function convert(n, digits, units, joiner) {
    if (n === 0) return digits[0];
    var str = String(n), len = str.length, out = [], gap = false;
    for (var i = 0; i < len; i++) {
      var d = +str.charAt(i), pos = len - 1 - i;
      if (d === 0) { gap = true; continue; }
      if (gap && out.length) out.push(digits[0]);
      gap = false;
      // 10-19 are 十一, 十二 … not 一十一
      if (!(d === 1 && pos === 1 && out.length === 0)) out.push(digits[d]);
      if (units[pos]) out.push(units[pos]);
    }
    return out.join(joiner);
  }
  function toHan(n) { return convert(n, DIGITS_HAN, UNITS_HAN, ''); }
  function toPin(n) { return convert(n, DIGITS_PIN, UNITS_PIN, ' '); }

  var NUMBER_RANGES = [
    [[1, 10]],
    [[1, 10], [11, 99]],
    [[1, 10], [11, 99], [100, 999]],
    [[11, 99], [100, 999], [1000, 9999]],
    [[100, 999], [1000, 9999]]
  ];

  function numbers(n, stage) {
    var ranges = NUMBER_RANGES[stage == null ? 2 : stage];
    var modes = (stage != null && stage === 0) ? ['read', 'han'] : ['han', 'read', 'pin'];
    var out = [], seen = {}, guard = 0;
    while (out.length < n && guard++ < n * 30) {
      var mode = U.pick(modes);
      var r = U.pick(ranges);
      var value = U.int(r[0], r[1]);
      var key = mode + value;
      if (seen[key]) continue;
      seen[key] = true;

      var han = toHan(value), pin = toPin(value);
      // distractors drawn from the same range, near the answer where the range allows
      var pool = [], used = {}, tries = 0;
      var spread = Math.max(3, Math.round(value * 0.25));
      while (pool.length < 6 && tries++ < 60) {
        var alt = value + U.int(-spread, spread);
        if (alt < r[0]) alt = U.int(r[0], r[1]);
        if (alt > r[1]) alt = U.int(r[0], r[1]);
        if (alt === value || used[alt]) continue;
        used[alt] = true;
        pool.push(alt);
      }

      if (mode === 'han') {
        out.push(U.choice('Write ' + value + ' in Chinese characters.', han, pool.map(toHan), {
          kicker: 'numbers', explanation: value + ' = ' + han + ' (' + pin + ')'
        }));
      } else if (mode === 'read') {
        out.push(U.choice('What number is 「' + han + '」?', value, pool, {
          kicker: 'numbers', promptBig: true, explanation: han + ' = ' + value + ' (' + pin + ')'
        }));
      } else {
        out.push(U.choice('How do you say ' + value + ' in pinyin?', pin, pool.map(toPin), {
          kicker: 'numbers', explanation: value + ' = ' + han + ' (' + pin + ')'
        }));
      }
    }
    return out;
  }

  /* ---------------- vocabulary generators ---------------- */
  function fromBank(fullBank, mode, kicker) {
    return function (n, stage) {
      var bank = U.forStage(fullBank, stage);
      return U.sample(bank, n).map(function (w) {
        var hanzi = w[0], pinyin = w[1], english = w[2];
        var m = mode === 'mixed' ? U.pick(['pinyin', 'meaning', 'toChinese']) : mode;

        if (m === 'pinyin') {
          var pool = bank.filter(function (x) { return x[0] !== hanzi; }).map(function (x) { return x[1]; });
          return U.choice('How is 「' + hanzi + '」 pronounced?', pinyin, pool, {
            kicker: kicker + ' · pinyin', promptBig: true,
            explanation: hanzi + ' — ' + pinyin + ' — ' + english
          });
        }
        if (m === 'meaning') {
          var pool2 = bank.filter(function (x) { return x[0] !== hanzi; }).map(function (x) { return x[2]; });
          return U.choice('What does 「' + hanzi + '」 mean?', english, pool2, {
            kicker: kicker + ' · meaning', promptBig: true,
            explanation: hanzi + ' (' + pinyin + ') means "' + english + '".'
          });
        }
        var pool3 = bank.filter(function (x) { return x[0] !== hanzi; }).map(function (x) { return x[0]; });
        return U.choice('Which characters mean "' + english + '"?', hanzi, pool3, {
          kicker: kicker + ' · English → Chinese',
          explanation: '"' + english + '" = ' + hanzi + ' (' + pinyin + ')'
        });
      });
    };
  }

  function grammar(n, stage) {
    return U.sample(U.forStage(GRAMMAR, stage), n).map(function (g) {
      var correct = g[1][0];
      var options = U.shuffle(g[1]);
      return {
        type: 'choice', kicker: 'grammar',
        prompt: g[0], choices: options,
        answer: options.indexOf(correct),
        explanation: g[2]
      };
    });
  }

  function cards(fullBank) {
    return function (stage) {
      return U.forStage(fullBank, stage).map(function (w) {
        return { front: w[0], back: w[2], sub: w[1] };
      });
    };
  }

  SH.register({
    id: 'chinese',
    name: 'Chinese',
    native: '中文',
    emoji: '🀄',
    color: 'var(--chinese)',
    blurb: 'Characters, pinyin, numbers, phrases and sentence patterns.',
    topics: [
      { id: 'pinyin', name: 'Characters → Pinyin', desc: 'Read the character, pick the pronunciation', generate: fromBank(VOCAB, 'pinyin', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'meaning', name: 'Characters → Meaning', desc: 'Read the character, pick the English', generate: fromBank(VOCAB, 'meaning', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'toChinese', name: 'English → Chinese', desc: 'Recall the characters from the English', generate: fromBank(VOCAB, 'toChinese', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'numbers', name: 'Numbers', desc: 'Read and write Chinese numbers', generate: numbers },
      { id: 'phrases', name: 'Everyday Phrases', desc: 'Greetings, politeness and getting by', generate: fromBank(PHRASES, 'mixed', 'phrase'), flashcards: cards(PHRASES) },
      { id: 'grammar', name: 'Grammar & Measure Words', desc: 'Word order, 的/了/吗, 不 vs 没, measure words', generate: grammar }
    ]
  });
})(window.StudyHub);
