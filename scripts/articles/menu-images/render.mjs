#!/usr/bin/env node
// Overlays localized text on the owner's photos (src/) and writes the menu covers and day images.
//   node scripts/articles/menu-images/render.mjs [--self-test] [filter ...]
// Filters are substrings of the output file name (e.g. "wednesday", "_de", "menu_9_months"); none = everything.
// Covers (cover_*, 1200x630 jpg+webp) and cards (card_*, 1200x750 webp) live in articles/menu_N_months/; use "cover_" / "card_" to skip the day images.
// Needs macOS Google Chrome and cwebp. Text for the day images is read from each locale's 6-month page.
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CWEBP = '/opt/homebrew/bin/cwebp';
const TMP = '/tmp/t030-s2-render';
const SIZE = { split: [1200, 630], card: [1200, 750], day: [1024, 1536] };
const PORT = 9347;
const LANGS = ['en', 'es', 'fr', 'pt', 'it', 'de'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ---- extractor: one locale's 6-month page -> 7 days of {kcal, meals, tot} ----
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/[\s ]+/g, ' ').trim();

export function extractDays(lang) {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'seo/articles.manifest.json'), 'utf8'));
  const route = manifest.pages.find(p => p.id === 'article_weekly_menu_6_months').routes[lang];
  const html = readFileSync(join(ROOT, route), 'utf8');
  const secs = html.split('<section class="day-menu').slice(1);
  if (secs.length !== 7) throw new Error(`${route}: expected 7 day sections, found ${secs.length}`);
  return secs.map((sec, i) => {
    const where = `${route} ${DAYS[i]}`;
    const lis = [...sec.matchAll(/<li><span class="meal-label">(.*?)<\/span>(.*?)<span class="macros">(.*?)<\/span><\/li>/gs)];
    if (lis.length !== 4) throw new Error(`${where}: expected 4 meals, found ${lis.length}`);
    const meals = lis.map(([, label, text, mac]) => {
      const nums = [...dec(mac).matchAll(/(\d+(?:\.\d+)?) g/g)].map(m => +m[1]);
      const kcal = dec(mac).match(/~(\d+) kcal/);
      if (!kcal || nums.length !== 3) throw new Error(`${where}: bad macros "${dec(mac)}"`);
      return { label: dec(label).replace(/\s*:$/, ''), text: dec(text), kcal: +kcal[1], macros: nums };
    });
    const tm = sec.match(/<p class="day-total">(.*?)<\/p>/s);
    if (!tm) throw new Error(`${where}: no day-total`);
    const [, ...rest] = dec(tm[1]).split(' · ');
    const kcal = +dec(tm[1]).match(/~(\d+) kcal/)?.[1];
    const tot = rest.join(' · ').split(' | ');
    if (!kcal || tot.length !== 3 || tot.some(x => !/\d+ g \(\d+\s?%\)/.test(x))) throw new Error(`${where}: bad day-total "${dec(tm[1])}"`);
    return { day: DAYS[i], kcal, meals, tot };
  });
}

if (process.argv.includes('--self-test')) {
  const mon = extractDays('en')[0];
  const got = JSON.stringify([mon.kcal, ...mon.meals.map(m => m.kcal)]);
  if (got !== '[630,400,95,35,100]') { console.error('self-test FAILED: ' + got); process.exit(1); }
  for (const l of LANGS) extractDays(l); // every locale must parse too
  console.log('self-test ok: en monday 630 kcal, cards 400/95/35/100; all 6 locales parse');
  process.exit(0);
}

// ---- Chrome over CDP ----
const filters = process.argv.slice(2).filter(a => !a.startsWith('--'));
const wanted = name => !filters.length || filters.some(f => name.includes(f));
mkdirSync(TMP, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/t030-s2-chrome',
  '--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const stop = () => { try { chrome.kill('SIGKILL'); } catch {} };
process.on('exit', stop);

async function connect() {
  for (let i = 0; i < 60; i++) { // the debugging port answers late
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const pg = list.find(t => t.type === 'page');
      if (pg) return pg.webSocketDebuggerUrl;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Chrome did not open the debugging port');
}
const ws = new WebSocket(await connect());
await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
let seq = 0; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.no(new Error(m.error.message)) : p.ok(m.result); } };
const cdp = (method, params = {}) => new Promise((ok, no) => { const id = ++seq; pending.set(id, { ok, no }); ws.send(JSON.stringify({ id, method, params })); });
const run = async expr => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const view = mode => cdp('Emulation.setDeviceMetricsOverride', { width: SIZE[mode][0], height: SIZE[mode][1], deviceScaleFactor: 1, mobile: false });

async function open(file) {
  await cdp('Page.navigate', { url: pathToFileURL(join(HERE, file)).href });
  for (let i = 0; i < 100 && (await run('document.readyState')) !== 'complete'; i++) await new Promise(r => setTimeout(r, 100));
}
async function shot(pngPath, mode = 'day') {
  const [width, height] = SIZE[mode];
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } });
  writeFileSync(pngPath, Buffer.from(data, 'base64'));
}
const webp = (png, out) => execFileSync(CWEBP, ['-quiet', '-q', '80', png, '-o', out]);

// ---- render ----
const problems = []; let count = 0;
try {
  await open('cover.html');
  for (const age of [6, 7, 8, 9, 10, 11, 12]) {
    const dir = join(ROOT, `articles/menu_${age}_months`);
    mkdirSync(dir, { recursive: true });
    for (const lang of LANGS) {
      const name = `cover_menu_${age}_months_${lang}`;
      if (!wanted(name)) continue;
      await view('split');
      const { tooLong } = await run(`render(${age}, ${JSON.stringify(lang)}, 'split')`);
      const png = join(TMP, name + '.png');
      await shot(png, 'split');
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '85', png, '--out', join(dir, name + '.jpg')], { stdio: 'ignore' });
      webp(png, join(dir, name + '.webp')); count++;
      if (tooLong) problems.push(`${name}: headline too-long (does not fit at 44 px)`);
    }
    const card = `card_menu_${age}_months`;
    if (!wanted(card)) continue;
    await view('card');
    await run(`render(${age}, 'en', 'card')`);
    const png = join(TMP, card + '.png');
    await shot(png, 'card'); webp(png, join(dir, card + '.webp')); count++;
  }
  await view('day');
  await open('day.html');
  for (const lang of LANGS) {
    const days = extractDays(lang);
    for (const data of days) {
      const name = `menu_6_months_${data.day}_${lang}`;
      if (!wanted(name)) continue;
      const { bad } = await run(`render(${JSON.stringify({ lang, ...data })})`);
      const tmp = join(TMP, name + '.png');
      await shot(tmp); webp(tmp, join(ROOT, 'articles/menu_6_months', name + '.webp')); count++;
      if (bad.length) problems.push(`${name}: nofit: ${bad.join(', ')}`);
    }
  }
} finally { stop(); rmSync(TMP, { recursive: true, force: true }); }
console.log(`rendered ${count} images`);
if (problems.length) { console.error('PROBLEMS:\n' + problems.join('\n')); process.exit(1); }
