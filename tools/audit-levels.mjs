/* Checks that questions served to a learner really match their age stage.
   Extracts every bank item's text and difficulty band straight from the subject
   sources, runs each generator many times, and flags any question whose band is
   not allowed for that stage.  Run: node tools/audit-levels.mjs */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SUBJECTS = ['english', 'math', 'science', 'chinese', 'chess'];

/* --- load the app the way a browser would --- */
const store = {};
const sandbox = {
  window: {}, console,
  document: { documentElement: { setAttribute() {} }, addEventListener() {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => (store[k] = v), removeItem: k => delete store[k] }
};
sandbox.window.localStorage = sandbox.localStorage;
vm.createContext(sandbox);
for (const f of ['js/storage.js', ...SUBJECTS.map(s => `js/subjects/${s}.js`)]) {
  vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
}
const SH = sandbox.window.StudyHub;

/* --- map question text -> band, by reading the source of each subject --- */
const bandOfText = new Map();
for (const s of SUBJECTS) {
  const src = readFileSync(join(root, `js/subjects/${s}.js`), 'utf8');
  // bank rows look like:  ['question…', [ …options… ], 'explanation', 2],
  const row = /\[\s*(['"])((?:\\.|(?!\1)[^\\])*?)\1\s*,\s*\[[\s\S]*?\]\s*,\s*(['"])(?:\\.|(?!\3)[^\\])*?\3\s*,\s*([123])\s*\]/g;
  let m;
  while ((m = row.exec(src))) {
    const text = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
    bandOfText.set(text, +m[4]);
  }
}
console.log(`indexed ${bandOfText.size} banked questions with a difficulty band\n`);

/* --- run every generator at every stage and check what comes back --- */
const REPS = 60;
let checked = 0, leaks = [];

for (const subject of SH.subjects) {
  for (const topic of subject.topics) {
    for (let stage = 0; stage < SH.STAGES.length; stage++) {
      const allowed = SH.STAGES[stage].bands;
      for (let r = 0; r < REPS; r++) {
        for (const q of topic.generate(8, stage)) {
          const band = bandOfText.get(q.prompt);
          if (band == null) continue;          // generated (math/numbers) or reworded prompt
          checked++;
          if (!allowed.includes(band)) {
            leaks.push({ subject: subject.id, topic: topic.id, stage, stageName: SH.STAGES[stage].name,
                         allowed: allowed.join('/'), band, prompt: q.prompt });
          }
        }
      }
    }
  }
}

const seen = new Set();
const unique = leaks.filter(l => {
  const k = l.subject + l.topic + l.stage + l.prompt;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

console.log(`checked ${checked} banked questions against their learner's stage`);
if (!unique.length) {
  console.log('No out-of-level questions found.');
  process.exit(0);
}

console.log(`\n${unique.length} out-of-level question(s):\n`);
const byTopic = {};
for (const l of unique) {
  const key = `${l.subject}/${l.topic} @ ${l.stageName} (allows band ${l.allowed})`;
  (byTopic[key] ||= []).push(`band ${l.band}: ${l.prompt}`);
}
for (const [key, items] of Object.entries(byTopic)) {
  console.log(`${key} — ${items.length} leaked`);
  items.slice(0, 3).forEach(i => console.log('   ' + i));
}
process.exit(1);
