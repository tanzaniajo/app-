/* Chinese (Mandarin, simplified) — characters, tones, sentences, idioms and grammar.
   Bank items end with a difficulty band: 1 = ages 4–10, 2 = 11–13, 3 = 14+.

   Distractors are deliberately hostile: wrong answers are tone variants of the right
   answer, or words that share a character with it, so a question cannot be solved by
   recognising the shape of the answer alone. */
(function (SH) {
  'use strict';
  var U = SH.U;

  /* ============================ tone machinery ============================ */
  var TONE_ROWS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', 'ü': 'ǖǘǚǜ' };
  var BASE_OF = {};      // 'ā' -> { base: 'a', tone: 1 }
  Object.keys(TONE_ROWS).forEach(function (base) {
    TONE_ROWS[base].split('').forEach(function (ch, i) { BASE_OF[ch] = { base: base, tone: i + 1 }; });
  });
  var VOWELS = 'aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';

  function stripTones(s) {
    return s.split('').map(function (ch) { return BASE_OF[ch] ? BASE_OF[ch].base : ch; }).join('');
  }

  /* Runs of consecutive vowels — one per syllable nucleus. */
  function vowelGroups(word) {
    var groups = [], start = -1;
    for (var i = 0; i <= word.length; i++) {
      var isVowel = i < word.length && VOWELS.indexOf(word.charAt(i)) !== -1;
      if (isVowel && start === -1) start = i;
      else if (!isVowel && start !== -1) { groups.push({ start: start, end: i }); start = -1; }
    }
    return groups;
  }

  /* Standard placement: a wins, then o/e, otherwise the last vowel of the group. */
  function markIndex(group) {
    var lower = group.toLowerCase();
    var a = lower.indexOf('a');
    if (a !== -1) return a;
    var o = lower.indexOf('o'), e = lower.indexOf('e');
    if (o !== -1) return o;
    if (e !== -1) return e;
    return group.length - 1;
  }

  /* Rewrite one syllable of `word` with a different tone (0 = neutral). */
  function setTone(word, groupIndex, tone) {
    var groups = vowelGroups(word);
    if (!groups[groupIndex]) return word;
    var g = groups[groupIndex];
    var raw = stripTones(word.slice(g.start, g.end));
    var at = markIndex(raw);
    var marked = raw.split('');
    if (tone > 0) {
      var row = TONE_ROWS[marked[at]];
      if (!row) return word;
      marked[at] = row.charAt(tone - 1);
    }
    return word.slice(0, g.start) + marked.join('') + word.slice(g.end);
  }

  function toneOf(word, groupIndex) {
    var groups = vowelGroups(word);
    if (!groups[groupIndex]) return 0;
    var seg = word.slice(groups[groupIndex].start, groups[groupIndex].end);
    for (var i = 0; i < seg.length; i++) if (BASE_OF[seg.charAt(i)]) return BASE_OF[seg.charAt(i)].tone;
    return 0;
  }

  /* Every same-spelling, different-tone version of a word. These are the hard ones. */
  function toneVariants(pinyin) {
    var groups = vowelGroups(pinyin);
    var out = [];
    for (var g = 0; g < groups.length; g++) {
      var current = toneOf(pinyin, g);
      for (var t = 0; t <= 4; t++) {
        if (t === current) continue;
        var v = setTone(pinyin, g, t);
        if (v !== pinyin && out.indexOf(v) === -1) out.push(v);
      }
    }
    return out;
  }

  /* ============================== vocabulary ============================== */
  /* [hanzi, pinyin, english, band] */
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
    ['现在', 'xiànzài', 'now', 1], ['年', 'nián', 'year', 1], ['月', 'yuè', 'month; moon', 1],
    ['星期', 'xīngqī', 'week', 1], ['点', 'diǎn', 'o\'clock; dot', 2], ['分钟', 'fēnzhōng', 'minute', 2],
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
    ['老', 'lǎo', 'old', 1], ['快', 'kuài', 'fast', 1], ['慢', 'màn', 'slow', 1], ['多', 'duō', 'many', 1],
    ['少', 'shǎo', 'few', 1],

    /* --- HSK 3–5: the material an older or returning learner actually needs --- */
    ['问题', 'wèntí', 'problem; question', 2],
    ['公司', 'gōngsī', 'company', 2],
    ['开始', 'kāishǐ', 'to begin', 2],
    ['重要', 'zhòngyào', 'important', 2],
    ['希望', 'xīwàng', 'to hope', 2],
    ['准备', 'zhǔnbèi', 'to prepare', 2],
    ['因为', 'yīnwèi', 'because', 2],
    ['所以', 'suǒyǐ', 'therefore', 2],
    ['但是', 'dànshì', 'but', 2],
    ['如果', 'rúguǒ', 'if', 2],
    ['经济', 'jīngjì', 'economy', 3],
    ['政府', 'zhèngfǔ', 'government', 3],
    ['社会', 'shèhuì', 'society', 3],
    ['文化', 'wénhuà', 'culture', 3],
    ['历史', 'lìshǐ', 'history', 3],
    ['科学', 'kēxué', 'science', 3],
    ['技术', 'jìshù', 'technology', 3],
    ['环境', 'huánjìng', 'environment', 3],
    ['方法', 'fāngfǎ', 'method', 3],
    ['结果', 'jiéguǒ', 'result', 3],
    ['原因', 'yuányīn', 'reason; cause', 3],
    ['影响', 'yǐngxiǎng', 'influence; to affect', 3],
    ['关系', 'guānxi', 'relationship; connection', 3],
    ['机会', 'jīhuì', 'opportunity', 3],
    ['计划', 'jìhuà', 'plan', 3],
    ['经验', 'jīngyàn', 'experience', 3],
    ['能力', 'nénglì', 'ability', 3],
    ['责任', 'zérèn', 'responsibility', 3],
    ['条件', 'tiáojiàn', 'condition; requirement', 3],
    ['情况', 'qíngkuàng', 'situation', 3],
    ['标准', 'biāozhǔn', 'standard', 3],
    ['质量', 'zhìliàng', 'quality', 3],
    ['价格', 'jiàgé', 'price', 3],
    ['市场', 'shìchǎng', 'market', 3],
    ['经理', 'jīnglǐ', 'manager', 3],
    ['同事', 'tóngshì', 'colleague', 3],
    ['会议', 'huìyì', 'meeting', 3],
    ['决定', 'juédìng', 'to decide', 3],
    ['选择', 'xuǎnzé', 'to choose', 3],
    ['解决', 'jiějué', 'to solve', 3],
    ['提高', 'tígāo', 'to raise; to improve', 3],
    ['增加', 'zēngjiā', 'to increase', 3],
    ['减少', 'jiǎnshǎo', 'to reduce', 3],
    ['改变', 'gǎibiàn', 'to change', 3],
    ['发展', 'fāzhǎn', 'to develop', 3],
    ['成功', 'chénggōng', 'success', 3],
    ['失败', 'shībài', 'failure', 3],
    ['努力', 'nǔlì', 'to make an effort', 3],
    ['坚持', 'jiānchí', 'to persist', 3],
    ['理解', 'lǐjiě', 'to understand', 3],
    ['认为', 'rènwéi', 'to think; to consider', 3],
    ['建议', 'jiànyì', 'to suggest', 3],
    ['讨论', 'tǎolùn', 'to discuss', 3],
    ['研究', 'yánjiū', 'to research', 3],
    ['发现', 'fāxiàn', 'to discover', 3],
    ['安排', 'ānpái', 'to arrange', 3],
    ['参加', 'cānjiā', 'to take part in', 3],
    ['完成', 'wánchéng', 'to complete', 3],
    ['继续', 'jìxù', 'to continue', 3],
    ['结束', 'jiéshù', 'to end', 3],
    ['主要', 'zhǔyào', 'main; principal', 3],
    ['特别', 'tèbié', 'especially', 3],
    ['一定', 'yídìng', 'certainly', 3],
    ['可能', 'kěnéng', 'possible; maybe', 3],
    ['必须', 'bìxū', 'must', 3],
    ['应该', 'yīnggāi', 'should', 3],
    ['虽然', 'suīrán', 'although', 3],
    ['而且', 'érqiě', 'moreover', 3]
  ];

  /* [hanzi, pinyin, english, band] */
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
    ['认识你很高兴', 'rènshi nǐ hěn gāoxìng', 'Nice to meet you', 3],
    ['多少钱', 'duōshao qián', 'How much does it cost?', 2],
    ['我不明白', 'wǒ bù míngbai', 'I don\'t understand', 2],
    ['请再说一遍', 'qǐng zài shuō yí biàn', 'Please say that again', 3],
    ['你会说英语吗', 'nǐ huì shuō Yīngyǔ ma', 'Do you speak English?', 3],
    ['洗手间在哪儿', 'xǐshǒujiān zài nǎr', 'Where is the toilet?', 3],
    ['我饿了', 'wǒ è le', 'I\'m hungry', 2],
    ['没问题', 'méi wèntí', 'No problem', 2],
    ['加油', 'jiāyóu', 'Keep going! / Good luck!', 1],
    ['慢一点', 'màn yìdiǎn', 'A bit slower, please', 2],
    ['好久不见', 'hǎojiǔ bú jiàn', 'Long time no see', 3],
    ['麻烦你了', 'máfan nǐ le', 'Sorry to trouble you', 3],
    ['随便', 'suíbiàn', 'Whatever you like; as you please', 3],
    ['不见不散', 'bú jiàn bú sàn', 'Be there or be square', 3],
    ['我尽量', 'wǒ jǐnliàng', 'I\'ll do my best', 3]
  ];

  /* [四字成语, pinyin, meaning, band] */
  var CHENGYU = [
    ['马马虎虎', 'mǎmǎhūhū', 'so-so; careless', 3],
    ['一举两得', 'yì jǔ liǎng dé', 'to kill two birds with one stone', 3],
    ['半途而废', 'bàn tú ér fèi', 'to give up halfway', 3],
    ['入乡随俗', 'rù xiāng suí sú', 'when in Rome, do as the Romans do', 3],
    ['画蛇添足', 'huà shé tiān zú', 'to ruin something by overdoing it', 3],
    ['守株待兔', 'shǒu zhū dài tù', 'to wait idly for a windfall', 3],
    ['亡羊补牢', 'wáng yáng bǔ láo', 'better late than never', 3],
    ['对牛弹琴', 'duì niú tán qín', 'to cast pearls before swine', 3],
    ['自相矛盾', 'zì xiāng máo dùn', 'to contradict oneself', 3],
    ['井底之蛙', 'jǐng dǐ zhī wā', 'someone with a narrow outlook', 3],
    ['熟能生巧', 'shú néng shēng qiǎo', 'practice makes perfect', 3],
    ['不可思议', 'bù kě sī yì', 'inconceivable; unimaginable', 3],
    ['迫不及待', 'pò bù jí dài', 'unable to wait any longer', 3],
    ['名副其实', 'míng fù qí shí', 'living up to its name', 3],
    ['一帆风顺', 'yì fān fēng shùn', 'smooth sailing all the way', 3],
    ['乱七八糟', 'luàn qī bā zāo', 'in a complete mess', 3],
    ['无论如何', 'wúlùn rúhé', 'no matter what', 3],
    ['千方百计', 'qiān fāng bǎi jì', 'by every possible means', 3],
    ['三心二意', 'sān xīn èr yì', 'to be of two minds; half-hearted', 3],
    ['入木三分', 'rù mù sān fēn', 'penetrating; deeply incisive', 3]
  ];

  /* [sentence with ___, [options — first is correct], explanation, band] */
  var SENTENCES = [
    ['我___学生。', ['是', '有', '在', '很'], '是 links two nouns: 我是学生 — "I am a student."', 1],
    ['他___老师。', ['是', '有', '很', '和'], '是 is used before a noun; 很 would only work before an adjective.', 1],
    ['我___苹果。', ['吃', '喝', '看', '写'], '吃 is for eating; 喝 is for drinking.', 1],
    ['我喜欢___茶。', ['喝', '吃', '听', '读'], 'Tea is drunk, so 喝茶.', 1],
    ['我有___个哥哥。', ['一', '是', '很', '的'], 'A number goes before the measure word: 一个哥哥.', 1],
    ['猫在桌子___。', ['上', '是', '有', '很'], 'Position words follow the noun: 桌子上 — "on the table."', 1],
    ['我___去学校。', ['要', '是', '的', '很'], '要 before a verb means "want to" or "will".', 1],
    ['这___我的书。', ['是', '有', '很', '在'], '这是我的书 — "This is my book."', 1],
    ['我___北京住了三年。', ['在', '是', '有', '和'], '在 marks location: 我在北京住了三年 — "I lived in Beijing for three years."', 2],
    ['他跑___很快。', ['得', '的', '地', '了'], 'A degree complement after a verb uses 得: 跑得很快 — "runs fast."', 2],
    ['天气越来越___了。', ['冷', '冷冷', '很冷', '不冷'], '越来越 + plain adjective. Never add 很 after 越来越.', 2],
    ['我的自行车___偷了。', ['被', '把', '在', '给了'], '被 marks the passive: "my bike was stolen."', 3],
    ['请___门关上。', ['把', '被', '让', '给'], 'The 把 construction moves the object before the verb: 把门关上 — "close the door."', 3],
    ['他八点就来了，我十点___来。', ['才', '就', '再', '又'], '就 = earlier than expected; 才 = later than expected.', 3],
    ['我昨天去了，今天___去了一次。', ['又', '再', '还', '也'], '又 is for repetition that has already happened; 再 is for repetition still to come.', 3],
    ['这本书我看___了。', ['懂', '好了', '着', '过来'], 'A resultative complement: 看懂 means "read and understood."', 3],
    ['___天气不好，我们还是去了。', ['虽然', '因为', '所以', '如果'], '虽然…还是/但是… — "although the weather was bad, we still went."', 3],
    ['他不但会说中文，___会写汉字。', ['而且', '但是', '所以', '因为'], '不但…而且… — "not only… but also…"', 3],
    ['___你有时间，我们就去看电影。', ['如果', '虽然', '因为', '但是'], '如果…就… is the standard "if… then…" pattern.', 3],
    ['我___过日本，那是三年前。', ['去', '去了', '在去', '要去'], '过 follows the bare verb to mark past experience: 去过 — "have been to."', 2],
    ['她一边听音乐，一边___作业。', ['做', '作', '坐', '座'], '一边…一边… means two actions at once. 做作业 = "do homework."', 2],
    ['除了中文___，他还会说法语。', ['以外', '以后', '的话', '一样'], '除了…以外，还… — "besides Chinese, he also speaks French."', 3],
    ['这个问题比那个___。', ['难', '很难', '难了', '太难'], 'After 比 the adjective stands alone — never with 很 or 太.', 3],
    ['我们是坐飞机___的。', ['来', '来了', '会来', '在来'], '是…的 highlights how something happened: 是坐飞机来的.', 3],
    ['他把钥匙放___桌子上了。', ['在', '到', '给', '了'], '放在 + place is the fixed pattern for setting something down somewhere.', 3],
    ['你___吃过北京烤鸭吗？', ['有没有', '不是', '没有吗', '是不是有'], '有没有 + verb forms a neutral yes/no question about experience.', 3],
    ['时间过得真___！', ['快', '快快', '很快', '快了'], 'In an exclamation with 真, the adjective stands bare: 真快!', 2],
    ['他汉语说得比我___多了。', ['好', '很好', '好的', '好了'], 'With 比 and 多了, the adjective is bare: 比我好多了 — "much better than me."', 3]
  ];

  /* [question, [options — first is correct], explanation, band] */
  var CONFUSABLE = [
    ['Which character means "big"?', ['大', '太', '犬', '天'], '大 dà = big. 太 tài (too) adds a dot; 犬 quǎn (dog) puts the dot on the other side.', 1],
    ['Which character means "person"?', ['人', '入', '八', '个'], '人 rén = person. 入 rù (to enter) has its top stroke pointing the other way.', 1],
    ['Which character means "sun; day"?', ['日', '目', '白', '月'], '日 rì has two strokes inside; 目 mù (eye) has three.', 1],
    ['Which character means "eye"?', ['目', '日', '自', '月'], '目 mù = eye — think of an eye turned on its side.', 1],
    ['Which character means "moon; month"?', ['月', '日', '目', '用'], '月 yuè = moon or month, with its curved left stroke.', 1],
    ['Which character means "water"?', ['水', '冰', '永', '米'], '水 shuǐ = water. 米 mǐ (rice) has extra strokes at the top.', 1],
    ['Which character means "small"?', ['小', '少', '大', '示'], '小 xiǎo = small. 少 shǎo (few) adds one extra stroke.', 1],
    ['Which character means "mouth"?', ['口', '日', '中', '回'], '口 kǒu = mouth, a simple square. 回 huí is a square inside a square.', 1],
    ['Which character means "to borrow or lend"?', ['借', '错', '惜', '籍'], '借 jiè = borrow/lend. 错 cuò = wrong; 惜 xī = to cherish. All share 昔.', 3],
    ['Which character means "to wear (clothes)"?', ['穿', '川', '船', '传'], '穿 chuān = to wear or pass through. The others all sound like chuán/chuān too.', 3],
    ['Which character means "already"?', ['已', '己', '巳', '包'], '已 yǐ = already; 己 jǐ = oneself. The stroke on the left is what separates them.', 2],
    ['Which character means "oneself"?', ['己', '已', '巳', '导'], '自己 zìjǐ = oneself. 已 (already) closes further at the top left.', 2],
    ['Which character means "to sell"?', ['卖', '买', '实', '头'], '卖 mài (sell) has 十 on top; 买 mǎi (buy) does not. Tone and shape both differ.', 2],
    ['Which character means "to buy"?', ['买', '卖', '关', '头'], '买 mǎi = buy (third tone); 卖 mài = sell (fourth tone).', 2],
    ['Which character means "which"?', ['哪', '那', '娜', '呐'], '哪 nǎ = which (a question word); 那 nà = that. The 口 radical marks the question.', 2],
    ['Which character means "again" (in the future)?', ['再', '在', '存', '有'], '再 zài = again; 在 zài = at/in. Same sound, completely different jobs.', 3],
    ['Which character means "end; final"?', ['末', '未', '木', '本'], '末 mò = end (long stroke on top); 未 wèi = not yet (short stroke on top).', 3],
    ['Which character means "not yet"?', ['未', '末', '朱', '来'], '未 wèi — the upper horizontal stroke is the shorter one.', 3],
    ['Which character means "to look for"?', ['找', '我', '战', '成'], '找 zhǎo = to look for; 我 wǒ = I. The hand radical 扌 marks the action.', 2],
    ['Which character means "to sit"?', ['坐', '座', '做', '作'], '坐 zuò = to sit (the verb); 座 zuò = a seat (the noun).', 2],
    ['Which of these means "to do; to make"?', ['做', '作', '坐', '座'], '做 is the everyday verb (做饭, 做作业); 作 appears in compounds like 工作.', 3],
    ['Which character means "clear"?', ['清', '请', '情', '晴'], '清 qīng = clear (water radical); 请 qǐng = please (speech radical); 情 qíng = feeling.', 3],
    ['Which character means "sunny"?', ['晴', '清', '请', '情'], '晴 qíng = sunny — the 日 (sun) radical gives it away.', 3],
    ['Which character means "to enter"?', ['入', '人', '八', '几'], '入 rù = to enter; 人 rén = person. The stroke that sticks out on top differs.', 2],
    ['Which character means "thousand"?', ['千', '干', '于', '午'], '千 qiān = thousand; 干 gān = dry. The top stroke of 千 slants.', 2],
    ['Which character means "book" as in "root/origin"?', ['本', '木', '术', '未'], '本 běn = root, origin, measure word for books — 木 (tree) with a mark at the base.', 2]
  ];

  /* [question, [options — first is correct], explanation, band] */
  var GRAMMAR = [
    ['Which word means "not" before most verbs?', ['不', '很', '的', '了'], '不 negates most verbs and adjectives; 没 is used with 有.', 1],
    ['How do you say "my"?', ['我的', '我了', '我很', '我们'], '的 turns 我 (I) into 我的 (my).', 1],
    ['Which word turns a statement into a yes/no question?', ['吗', '很', '的', '也'], '吗 is added at the very end: 你好吗？', 1],
    ['Which is correct for "I am very happy"?', ['我很高兴', '很我高兴', '我高兴很', '高兴我很'], '很 comes between the subject and the adjective.', 1],
    ['Which measure word goes with 书 (book)?', ['本', '只', '杯', '张'], '一本书 — 本 is used for bound volumes.', 2],
    ['Which measure word goes with 猫 (cat)?', ['只', '本', '条', '位'], '一只猫 — 只 covers many small animals.', 2],
    ['Which measure word goes with 茶 (a cup of tea)?', ['杯', '本', '张', '件'], '一杯茶 — 杯 means "cup".', 2],
    ['Which measure word goes with 桌子 (table)?', ['张', '本', '只', '双'], '一张桌子 — 张 is for flat things.', 2],
    ['The default measure word, used when unsure, is:', ['个', '本', '只', '条'], '个 (gè) works with a very wide range of nouns.', 1],
    ['How do you turn 你是学生 into a yes/no question?', ['你是学生吗？', '你是学生呢？', '吗你是学生？', '你吗是学生？'], '吗 goes at the very end of the sentence.', 1],
    ['Which sentence correctly says "I don\'t have money"?', ['我没有钱', '我不有钱', '我不钱有', '我没钱不'], '有 is negated with 没, never with 不.', 2],
    ['Where does a time word go in a Chinese sentence?', ['Before the verb: 我明天去', 'After the verb: 我去明天', 'Always at the very end', 'It cannot appear'], 'Time expressions precede the verb phrase.', 2],
    ['What does 了 mark in 我吃了?', ['A completed action', 'A future action', 'A question', 'A negative'], '了 signals completion or a change of state.', 2],
    ['Which word order means "I go to school by bus"?', ['我坐公共汽车去学校', '我去学校坐公共汽车', '我学校去坐公共汽车', '去我学校坐公共汽车'], 'The means of travel comes before the main verb 去.', 3],
    ['What is the role of 的 in 我的书?', ['It marks possession', 'It marks the past', 'It asks a question', 'It negates the noun'], '我的书 = "my book".', 1],
    ['Which sentence means "He is also a teacher"?', ['他也是老师', '他是也老师', '也他是老师', '他是老师也'], '也 goes directly before the verb.', 2],
    ['With an adjective like 高兴, what usually comes before it?', ['很', '是', '的', '了'], '很高兴 — 是 is not used to link a subject to a plain adjective.', 2],
    ['Which question word asks "where"?', ['哪儿', '什么', '谁', '怎么'], '哪儿 (nǎr) or 哪里 (nǎlǐ) means "where".', 1],
    ['How do you say "I am not a student"?', ['我不是学生', '我没是学生', '我是不学生', '我不学生是'], '不 negates 是; 没 is used with 有 and completed actions.', 2],
    ['In 我比他高, what does 比 do?', ['It makes a comparison', 'It asks a question', 'It marks the past', 'It shows possession'], '我比他高 = "I am taller than him".', 3],
    ['Which is the correct way to say "two people"?', ['两个人', '二个人', '两人个', '个两人'], 'Before a measure word, "two" is 两, not 二.', 2],
    ['What does 呢 do at the end of 你呢？', ['Bounces the same question back', 'Makes a command', 'Negates the sentence', 'Marks the future'], '你呢？= "And you?"', 2],
    ['What is the difference between 会 and 能?', ['会 = a learned skill, 能 = physically able or permitted', 'They are identical', '会 = past, 能 = future', '会 is a noun'], '我会游泳 (I learned to swim) vs 我今天不能游泳 (I can\'t swim today).', 3],
    ['What is the difference between 了 and 过?', ['了 marks completion; 过 marks past experience', 'They are identical', '了 is formal, 过 is informal', '过 marks the future'], '我去了北京 (I went) vs 我去过北京 (I have been there at some point).', 3],
    ['Which sentence uses 把 correctly?', ['我把作业写完了', '我写完把作业了', '把我作业写完了', '我把写完作业了'], '把 + object + verb + complement. The object jumps in front of the verb.', 3],
    ['In 他跑得很快, what does 得 do?', ['It introduces a complement describing the verb', 'It marks possession', 'It marks the past tense', 'It makes a question'], '得 links a verb to a description of how it is done.', 3],
    ['Which is correct for "a little bit cold"?', ['有点儿冷', '一点儿冷', '冷有点儿', '很有点冷'], '有点儿 + adjective is used for something mildly unwelcome; 一点儿 follows the adjective instead.', 3],
    ['Where does 都 go in "We all like tea"?', ['我们都喜欢茶', '都我们喜欢茶', '我们喜欢都茶', '我们喜欢茶都'], '都 always precedes the verb, and follows what it refers to.', 3],
    ['Which sentence correctly asks "Have you eaten?"', ['你吃饭了吗？', '你了吃饭吗？', '吗你吃饭了？', '你吃吗饭了？'], '了 attaches to the verb phrase; 吗 closes the sentence.', 2]
  ];

  /* ============================== numbers ============================== */
  var DIGITS_HAN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var DIGITS_PIN = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];
  var UNITS_HAN = ['', '十', '百', '千'];
  var UNITS_PIN = ['', 'shí', 'bǎi', 'qiān'];

  function convert4(n, digits, units, joiner) {
    if (n === 0) return '';
    var str = String(n), len = str.length, out = [], gap = false;
    for (var i = 0; i < len; i++) {
      var d = +str.charAt(i), pos = len - 1 - i;
      if (d === 0) { gap = true; continue; }
      if (gap && out.length) out.push(digits[0]);
      gap = false;
      if (!(d === 1 && pos === 1 && out.length === 0)) out.push(digits[d]);   // 十一, not 一十一
      if (units[pos]) out.push(units[pos]);
    }
    return out.join(joiner);
  }

  /* Handles 万 grouping, so numbers run well past 9,999. */
  function convert(n, digits, units, joiner, wan) {
    if (n === 0) return digits[0];
    if (n < 10000) return convert4(n, digits, units, joiner);
    var high = Math.floor(n / 10000), low = n % 10000;
    var head = convert4(high, digits, units, joiner) + joiner + wan;
    if (low === 0) return head;
    // a gap of a whole thousand needs a spoken zero: 100,001 -> 十万零一
    var bridge = low < 1000 ? joiner + digits[0] + joiner : joiner;
    return head + bridge + convert4(low, digits, units, joiner);
  }

  function toHan(n) { return convert(n, DIGITS_HAN, UNITS_HAN, '', '万'); }
  function toPin(n) { return convert(n, DIGITS_PIN, UNITS_PIN, ' ', 'wàn').replace(/\s+/g, ' ').trim(); }

  var NUMBER_RANGES = [
    [[1, 10]],
    [[1, 10], [11, 99]],
    [[11, 99], [100, 999]],
    [[100, 999], [1000, 9999]],
    [[1000, 9999], [10000, 999999]]
  ];

  function numbers(n, stage) {
    var idx = stage == null ? 2 : stage;
    var ranges = NUMBER_RANGES[idx];
    var modes = idx === 0 ? ['read', 'han'] : ['han', 'read', 'pin'];
    var out = [], seen = {}, guard = 0;

    while (out.length < n && guard++ < n * 30) {
      var mode = U.pick(modes);
      var r = U.pick(ranges);
      var value = U.int(r[0], r[1]);
      var key = mode + value;
      if (seen[key]) continue;
      seen[key] = true;

      var han = toHan(value), pin = toPin(value);
      var pool = [], used = {}, tries = 0;
      var spread = Math.max(3, Math.round(value * 0.25));
      while (pool.length < 6 && tries++ < 60) {
        var alt = value + U.int(-spread, spread);
        if (alt < r[0] || alt > r[1]) alt = U.int(r[0], r[1]);
        if (alt === value || used[alt]) continue;
        used[alt] = true;
        pool.push(alt);
      }

      if (mode === 'han') {
        out.push(U.choice('Write ' + value.toLocaleString('en-US') + ' in Chinese characters.', han, pool.map(toHan), {
          kicker: 'numbers', explanation: value.toLocaleString('en-US') + ' = ' + han + ' (' + pin + ')'
        }));
      } else if (mode === 'read') {
        out.push(U.choice('What number is 「' + han + '」?', value.toLocaleString('en-US'),
          pool.map(function (v) { return v.toLocaleString('en-US'); }), {
            kicker: 'numbers', promptBig: true,
            explanation: han + ' = ' + value.toLocaleString('en-US') + ' (' + pin + ')'
          }));
      } else {
        out.push(U.choice('How do you say ' + value.toLocaleString('en-US') + ' in pinyin?', pin, pool.map(toPin), {
          kicker: 'numbers', explanation: value.toLocaleString('en-US') + ' = ' + han + ' (' + pin + ')'
        }));
      }
    }
    return out;
  }

  /* ======================= distractor selection ======================= */

  /* Words sharing a character with the target confuse far better than random ones. */
  function sharesCharacter(bank, word) {
    var chars = word[0].split('');
    return bank.filter(function (x) {
      if (x[0] === word[0]) return false;
      return chars.some(function (c) { return x[0].indexOf(c) !== -1; });
    });
  }

  function sameSound(bank, word) {
    var base = stripTones(word[1]);
    return bank.filter(function (x) { return x[0] !== word[0] && stripTones(x[1]) === base; });
  }

  /* Pinyin distractors: real homophones first, then tone variants of the answer. */
  function pinyinDistractors(bank, word) {
    var out = sameSound(bank, word).map(function (x) { return x[1]; });
    toneVariants(word[1]).forEach(function (v) { if (out.indexOf(v) === -1) out.push(v); });
    bank.forEach(function (x) { if (x[0] !== word[0]) out.push(x[1]); });   // last-resort filler
    return out;
  }

  /* ============================= generators ============================= */

  function fromBank(fullBank, mode, kicker) {
    return function (n, stage) {
      var bank = U.forStage(fullBank, stage);
      return U.sample(bank, n).map(function (w) {
        var hanzi = w[0], pinyin = w[1], english = w[2];
        var m = mode === 'mixed' ? U.pick(['pinyin', 'meaning', 'toChinese']) : mode;

        if (m === 'pinyin') {
          return U.choice('How is 「' + hanzi + '」 pronounced?', pinyin, pinyinDistractors(bank, w), {
            kicker: kicker + ' · pinyin', promptBig: true,
            explanation: hanzi + ' — ' + pinyin + ' — ' + english
          });
        }

        if (m === 'meaning') {
          var near = sharesCharacter(bank, w).concat(sameSound(bank, w));
          var pool = near.map(function (x) { return x[2]; });
          bank.forEach(function (x) { if (x[0] !== hanzi) pool.push(x[2]); });
          return U.choice('What does 「' + hanzi + '」 mean?', english, pool, {
            kicker: kicker + ' · meaning', promptBig: true,
            explanation: hanzi + ' (' + pinyin + ') means "' + english + '".'
          });
        }

        var closest = sharesCharacter(bank, w).concat(sameSound(bank, w));
        var words = closest.map(function (x) { return x[0]; });
        bank.forEach(function (x) { if (x[0] !== hanzi) words.push(x[0]); });
        return U.choice('Which is "' + english + '" in Chinese?', hanzi, words, {
          kicker: kicker + ' · English → Chinese',
          explanation: '"' + english + '" = ' + hanzi + ' (' + pinyin + ')'
        });
      });
    };
  }

  /* Pure tone discrimination: every wrong answer is the right syllables, wrong tones. */
  function tones(n, stage) {
    var bank = U.forStage(VOCAB, stage).filter(function (w) { return toneVariants(w[1]).length >= 3; });
    return U.sample(bank, n).map(function (w) {
      return U.choice('Which is the correct tone marking for 「' + w[0] + '」?', w[1], toneVariants(w[1]), {
        kicker: 'tones', promptBig: true,
        explanation: w[0] + ' is ' + w[1] + ' — "' + w[2] + '". Tone changes meaning, so it is part of the word, not decoration.'
      });
    });
  }

  function bank4(items, kicker) {
    return function (n, stage) {
      return U.sample(U.forStage(items, stage), n).map(function (it) {
        var correct = it[1][0];
        var options = U.shuffle(it[1]);
        return {
          type: 'choice', kicker: kicker, prompt: it[0],
          choices: options, answer: options.indexOf(correct), explanation: it[2]
        };
      });
    };
  }

  function chengyu(n, stage) {
    var pool = U.forStage(CHENGYU, stage);
    return U.sample(pool, n).map(function (c) {
      if (Math.random() < 0.5) {
        var meanings = pool.filter(function (x) { return x[0] !== c[0]; }).map(function (x) { return x[2]; });
        return U.choice('What does the idiom 「' + c[0] + '」 mean?', c[2], meanings, {
          kicker: '成语', promptBig: true,
          explanation: c[0] + ' (' + c[1] + ') — ' + c[2] + '.'
        });
      }
      var forms = pool.filter(function (x) { return x[0] !== c[0]; }).map(function (x) { return x[0]; });
      return U.choice('Which idiom means "' + c[2] + '"?', c[0], forms, {
        kicker: '成语',
        explanation: c[0] + ' (' + c[1] + ') — ' + c[2] + '.'
      });
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
    blurb: 'Characters, tones, sentence patterns, idioms and grammar.',
    topics: [
      { id: 'pinyin', name: 'Characters → Pinyin', desc: 'Read the character, pick the exact pronunciation',
        generate: fromBank(VOCAB, 'pinyin', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'tones', name: 'Tones', desc: 'Same syllables, different tones — pick the right one',
        generate: tones, flashcards: cards(VOCAB) },
      { id: 'meaning', name: 'Characters → Meaning', desc: 'Read the character, pick the English',
        generate: fromBank(VOCAB, 'meaning', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'toChinese', name: 'English → Chinese', desc: 'Recall the characters from the English',
        generate: fromBank(VOCAB, 'toChinese', 'vocab'), flashcards: cards(VOCAB) },
      { id: 'confusable', name: 'Tricky Characters', desc: 'Look-alikes: 己/已, 买/卖, 那/哪',
        generate: bank4(CONFUSABLE, 'look carefully') },
      { id: 'sentences', name: 'Sentence Patterns', desc: '把, 被, 得, 越来越, 虽然…但是',
        generate: bank4(SENTENCES, 'complete the sentence') },
      { id: 'grammar', name: 'Grammar & Measure Words', desc: 'Word order, 了/过, 不 vs 没, measure words',
        generate: bank4(GRAMMAR, 'grammar') },
      { id: 'numbers', name: 'Numbers', desc: 'Read and write Chinese numbers, including 万',
        generate: numbers },
      { id: 'phrases', name: 'Everyday Phrases', desc: 'Greetings, politeness and getting by',
        generate: fromBank(PHRASES, 'mixed', 'phrase'), flashcards: cards(PHRASES) },
      { id: 'chengyu', name: 'Idioms 成语', desc: 'Four-character idioms and what they really mean',
        minStage: 3, generate: chengyu, flashcards: cards(CHENGYU) }
    ]
  });

  /* exposed for tools/verify-chinese.mjs */
  SH._chinese = { toneVariants: toneVariants, stripTones: stripTones, toHan: toHan, toPin: toPin, VOCAB: VOCAB };
})(window.StudyHub);
