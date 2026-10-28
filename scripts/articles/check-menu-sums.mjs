// Check weekly-menu article arithmetic. Usage: node check-menu-sums.mjs <page.html> [more pages...]
// Locale-agnostic: numbers are read by position (kcal, then carbs/protein/fat), never by label.
import { readFileSync } from 'node:fs';

const nums = (s) => (s.match(/\d+/g) || []).map(Number);
const tag = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

function check(file) {
  const html = readFileSync(file, 'utf8');
  const errs = [];
  const fail = (day, msg) => errs.push(`${file} ${day ? `day ${day}` : 'page'}: ${msg}`);
  const days = html.split('<section class="day-menu').slice(1).map((s) => s.split('</section>')[0]);
  if (days.length !== 7) fail(0, `expected 7 day-menu sections, found ${days.length}`);

  // answer box: energy range ("A-B kcal") and "this menu: ~N"
  const dds = tag(html.split('class="answer-box"')[1] || '', /<dd>([\s\S]*?)<\/dd>/g);
  const [lo, hi] = nums((dds[1] || '').replace(/<small>[\s\S]*/, ''));
  const boxAvg = nums((dds[1] || '').replace(/[\s\S]*<small>/, ''))[0];
  if (!lo || !hi) fail(0, 'cannot parse answer-box energy range');

  const totals = [];
  days.forEach((d, i) => {
    const n = i + 1;
    const h3 = nums((d.match(/<h3>([^<]*)<\/h3>/) || [])[1] || '')[0];
    const meals = tag(d, /<span class="macros">([^<]*)<\/span>/g).map(nums);
    const dt = nums((d.match(/<p class="day-total">([^<]*)<\/p>/) || [])[1] || '');
    if (!meals.length || dt.length !== 7) return fail(n, `unparsable (meals ${meals.length}, day-total numbers ${dt.length})`);
    // labels by text: each meal line has a real, distinct label (a generator once wrote "undefined")
    const labels = tag(d.split('day-total')[0], /<span class="meal-label">([^<]*)<\/span>/g);
    if (labels.length !== meals.length || new Set(labels).size !== labels.length || labels.some((l) => !l.trim() || /undefined|null/.test(l))) fail(n, `bad meal labels [${labels}]`);
    const [k, c, cp, p, pp, f, fp] = dt;
    totals.push(k);
    // 1. sums
    const sum = (j) => meals.reduce((s, m) => s + m[j], 0);
    if (Math.abs(sum(0) - k) > 5) fail(n, `meal kcal sum ${sum(0)} vs day total ${k}`);
    [[1, c, 'carbs'], [2, p, 'protein'], [3, f, 'fat']].forEach(([j, v, name]) => {
      if (Math.abs(sum(j) - v) > 1) fail(n, `meal ${name} sum ${sum(j)} g vs day total ${v} g`);
    });
    if (h3 !== k) fail(n, `h3 kcal ${h3} vs day total ${k}`);
    // 2. 4/4/9 energy per meal and per day (small meals: absolute tolerance)
    [...meals, [k, c, p, f]].forEach(([mk, mc, mp, mf], j) => {
      const e = 4 * mc + 4 * mp + 9 * mf;
      const tol = mk < 40 ? 5 : mk * 0.1;
      if (Math.abs(e - mk) > tol) fail(n, `${j < meals.length ? `meal ${j + 1}` : 'day'}: 4/4/9 gives ${e} kcal vs stated ${mk}`);
    });
    // 3. percentages
    if (cp + pp + fp !== 100) fail(n, `percentages sum to ${cp + pp + fp}`);
    const e = 4 * c + 4 * p + 9 * f;
    [[cp, 4 * c, 'carbs'], [pp, 4 * p, 'protein'], [fp, 9 * f, 'fat']].forEach(([pc, kc, name]) => {
      if (Math.abs(pc - (100 * kc) / e) > 2) fail(n, `${name} ${pc}% vs ${((100 * kc) / e).toFixed(1)}% from grams`);
    });
    // 4. energy range
    if (lo && (k < lo || k > hi)) fail(n, `${k} kcal outside stated range ${lo}-${hi}`);
  });

  // 5. overview table, answer-box average, weekly average
  const table = html.split('class="menu-table"')[1] || '';
  const rows = tag(table.split('</table>')[0], /<tr>([\s\S]*?)<\/tr>/g).filter((r) => r.includes('<td>')).map((r) => nums([...r.matchAll(/<td>([^<]*)<\/td>/g)].pop()[1])[0]);
  if (rows.join() !== totals.join()) fail(0, `overview table [${rows}] vs day totals [${totals}]`);
  const mean = totals.reduce((s, v) => s + v, 0) / (totals.length || 1);
  const weekly = nums(((html.split('id="weekly-nutritional-average"')[1] || '').match(/<li>([\s\S]*?)<\/li>/) || [])[1]?.replace(/<[^>]*>/g, '') || '')[0];
  if (Math.abs(boxAvg - mean) > 5) fail(0, `answer-box average ${boxAvg} vs mean ${mean.toFixed(1)}`);
  if (Math.abs(weekly - mean) > 5) fail(0, `weekly average ${weekly} vs mean ${mean.toFixed(1)}`);
  return { errs, totals, mean };
}

let bad = 0;
for (const file of process.argv.slice(2)) {
  const { errs, totals, mean } = check(file);
  if (errs.length) { bad++; errs.forEach((e) => console.error('FAIL', e)); }
  else console.log(`OK ${file}: ${totals.length} days, mean ${mean.toFixed(0)} kcal`);
}
process.exit(bad || process.argv.length < 3 ? 1 : 0);
