#!/usr/bin/env node
// Compares growth percentile maths: main:tools/percentile-calculator.js vs working tree (or --head-file).
// Usage: node growth-same-outputs.mjs [--base main] [--head-file <path>] [--data <who-lms-data.json>]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const REL = 'tools/percentile-calculator.js';
const base = opt('--base', 'main');
const headFile = opt('--head-file', path.join(root, REL));
const dataFile = opt('--data', path.join(root, 'tools/who-lms-data.json'));

const baseSrc = execFileSync('git', ['show', `${base}:${REL}`], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 });
const headSrc = readFileSync(headFile, 'utf8');
const data = JSON.parse(readFileSync(dataFile, 'utf8'));

const FUNCS = ['indexRows', 'interpolateLms', 'zFromMeasurement', 'valueAtZ', 'selectMetric', 'normalCdf', 'erf',
  'measurementConfig', 'isMeasurementInRange', 'toSi', 'fromSi', 'formatValue', 'formatMeasurementValue', 'formatAge'];
const CONSTS = ['Z_POINTS', 'KG_TO_LB', 'CM_TO_IN'];
// inline maths inside runCalculation: [label, regex capturing the expression]
const INLINE = [
  ['percentile expression', /const percentile = ([^;]+);/],
  ['correctionDays expression', /const correctionDays = ([^;]+);/],
];

function extractFunction(src, name) {
  const m = new RegExp(`(^|\\n)(async\\s+)?function\\s+${name}\\s*\\(`).exec(src);
  if (!m) return null;
  let i = src.indexOf('{', m.index + m[0].length);
  // skip parameter list (may contain default-value braces? only handle simple case)
  let depth = 0; const start = m.index + (m[1] ? m[1].length : 0);
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      for (; i < src.length && src[i] !== q; i++) if (src[i] === '\\') i++;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractConst(src, name) {
  const m = new RegExp(`const\\s+${name}\\s*=`).exec(src);
  if (!m) return null;
  let i = m.index, depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if (c === ';' && depth === 0) return src.slice(m.index, i + 1);
  }
  return null;
}

function load(label, src) {
  const missing = [];
  const parts = [];
  for (const c of CONSTS) { const s = extractConst(src, c); s ? parts.push(s) : missing.push(`const ${c}`); }
  for (const f of FUNCS) { const s = extractFunction(src, f); s ? parts.push(s) : missing.push(`function ${f}()`); }
  const inl = {};
  for (const [l, re] of INLINE) { const m = re.exec(src); m ? (inl[l] = m[1]) : missing.push(`inline "${l}" in runCalculation`); }
  if (missing.length) {
    console.error(`FAIL: ${label} is missing required math code (renamed/moved?): ${missing.join(', ')}`);
    process.exit(1);
  }
  const code = `let daysPerMonth = 30.4375; let unitSystem = 'metric'; const copy = new Proxy({}, { get: () => '' });
${parts.join('\n')}
({ ${FUNCS.join(', ')}, Z_POINTS, KG_TO_LB, CM_TO_IN,
  set(d, u) { daysPerMonth = d; unitSystem = u; },
  percentile: (normalCdfFn, zScore) => { const normalCdf = normalCdfFn; return (${inl['percentile expression']}); },
  correctionDays: (gestationalWeeks) => (${inl['correctionDays expression']}) })`;
  const ctx = vm.createContext({ Math, Number, Object, Array, Date, String, Proxy });
  try { return vm.runInContext(code, ctx, { filename: label }); }
  catch (e) { console.error(`FAIL: ${label} could not be evaluated: ${e.message}`); process.exit(1); }
}

const A = load(`${base}:${REL}`, baseSrc);
const B = load(headFile, headSrc);
const dpm = Number(data.meta?.daysPerMonth || 30.4375);

// sanity: run percentile exprs with their own normalCdf
const idx = A.indexRows(data.rows);
const mismatches = [];
let cases = 0;
const same = (a, b) => (typeof a === 'number' && typeof b === 'number')
  ? (Number.isNaN(a) && Number.isNaN(b)) || a === b || Math.abs(a - b) < 1e-9
  : JSON.stringify(a) === JSON.stringify(b);
function cmp(desc, fa, fb) {
  cases++;
  let ra, rb;
  try { ra = fa(); } catch (e) { ra = 'THROW ' + e.message; }
  try { rb = fb(); } catch (e) { rb = 'THROW ' + e.message; }
  if (!same(ra, rb)) mismatches.push({ desc, base: ra, head: rb });
}

// constants
cmp('Z_POINTS', () => A.Z_POINTS, () => B.Z_POINTS);
cmp('KG_TO_LB', () => A.KG_TO_LB, () => B.KG_TO_LB);
cmp('CM_TO_IN', () => A.CM_TO_IN, () => B.CM_TO_IN);
for (const g of [22, 24, 28, 32, 34.5, 36, 37, 40]) cmp(`correctionDays(${g})`, () => A.correctionDays(g), () => B.correctionDays(g));

// ages (days): every table row, midpoints, +-1, fractional, threshold boundaries
const ageSet = new Set([0, 0.5, 1, 7, 10.5, 29.99, 30.4375, 100.37, 365.25, 729, 729.5, 730, 730.5, 731, 1000.25, 1825.5, 1826]);
const thr = Math.round(24 * dpm);
[thr - 1, thr - 0.01, thr, thr + 0.01, thr + 1].forEach((x) => ageSet.add(x));
for (const k of Object.keys(idx)) for (const sex of Object.keys(idx[k])) {
  const rows = idx[k][sex];
  rows.forEach((r, i) => {
    ageSet.add(r.ageDays); ageSet.add(r.ageDays + 0.5); ageSet.add(Math.max(0, r.ageDays - 1)); ageSet.add(r.ageDays + 1);
    if (rows[i + 1]) ageSet.add((r.ageDays + rows[i + 1].ageDays) / 2);
  });
}
for (let m = 0; m <= 24; m += 0.25) ageSet.add(m * dpm);
// premature corrected ages: chronological age minus correction
for (const g of [24, 28, 32, 36]) for (const chrono of [60, 120, 200, 365, 600, 900]) {
  const c = A.correctionDays(g); if (chrono - c >= 0) ageSet.add(chrono - c);
}
const ages = [...ageSet].filter((a) => a >= 0 && a <= 1826).sort((a, b) => a - b);

const types = [['weight', 'wfa'], ['lengthHeight', null], ['headCircumference', 'hcfa']];
const zs = [-4, -3, -2, -1.8807936081512509, -1, 0, 1, 1.8807936081512509, 2, 3, 4];
const sexes = ['male', 'female'];

for (const dm of [dpm, 30.4375]) {
  A.set(dm, 'metric'); B.set(dm, 'metric');
  for (const age of ages) for (const [type] of types) {
    cmp(`selectMetric(${type},${age})`, () => A.selectMetric(type, age), () => B.selectMetric(type, age));
  }
}
A.set(dpm, 'metric'); B.set(dpm, 'metric');
const idxB = B.indexRows(data.rows);
cmp('indexRows', () => idx, () => idxB);

for (const sex of sexes) for (const age of ages) for (const [type] of types) {
  const sel = A.selectMetric(type, age);
  const rows = idx[sel.metric]?.[sex];
  if (!rows) continue;
  const rowsB = idxB[B.selectMetric(type, age).metric]?.[sex] || rows;
  const lmsA = A.interpolateLms(rows, age);
  cmp(`interpolateLms ${sel.metric} ${sex} age=${age}`, () => lmsA, () => B.interpolateLms(rowsB, age));
  const lmsB = B.interpolateLms(rowsB, age);
  for (const z of zs) {
    const tag = `${sex} ${type} age=${age}d z=${z}`;
    cmp(`valueAtZ ${tag}`, () => A.valueAtZ(lmsA, z), () => B.valueAtZ(lmsB, z));
    const v = A.valueAtZ(lmsA, z);
    const values = Number.isFinite(v) ? [v, v * 0.999, v * 1.001] : [];
    for (const val of values) {
      const zA = A.zFromMeasurement(val, lmsA);
      const pctA = A.percentile(A.normalCdf, zA), pctB = B.percentile(B.normalCdf, B.zFromMeasurement(val, lmsB));
      cmp(`z ${tag} v=${val}`, () => zA, () => B.zFromMeasurement(val, lmsB));
      cmp(`percentile ${tag} v=${val}`, () => pctA, () => pctB);
      cmp(`display P ${tag} v=${val}`, () => A.formatValue(pctA, 1), () => B.formatValue(pctB, 1));
      cmp(`inRange ${tag} v=${val}`, () => A.isMeasurementInRange(type, val), () => B.isMeasurementInRange(type, val));
      // metric display + imperial round trip
      for (const system of ['metric', 'imperial']) {
        A.set(dpm, system); B.set(dpm, system);
        const dispA = A.fromSi(type, val, system), dispB = B.fromSi(type, val, system);
        cmp(`fromSi/${system} ${tag} v=${val}`, () => dispA, () => dispB);
        cmp(`formatMeasurementValue/${system} ${tag} v=${val}`, () => A.formatMeasurementValue(dispA, type, system), () => B.formatMeasurementValue(dispB, type, system));
        // user typed a rounded imperial value -> SI -> z
        const typed = Number(dispA.toFixed(system === 'imperial' ? 1 : 2));
        const siA = A.toSi(type, typed, system);
        cmp(`toSi/${system} ${tag} typed=${typed}`, () => siA, () => B.toSi(type, typed, system));
        cmp(`z(typed)/${system} ${tag}`, () => A.zFromMeasurement(siA, lmsA), () => B.zFromMeasurement(B.toSi(type, typed, system), lmsB));
        A.set(dpm, 'metric'); B.set(dpm, 'metric');
      }
    }
  }
}
// ages + config + helpers
for (const age of ages) cmp(`formatAge(${age})`, () => A.formatAge(age), () => B.formatAge(age));
for (const x of [-5, -1, -0.3, 0, 0.3, 1, 2, 5]) cmp(`normalCdf(${x})`, () => A.normalCdf(x), () => B.normalCdf(x));
for (const [t] of types) for (const s of ['metric', 'imperial']) cmp(`measurementConfig ${t} ${s}`, () => A.measurementConfig(t, s), () => B.measurementConfig(t, s));
for (const [t] of types) for (const v of [0.4, 0.5, 1, 20, 35, 35.01, 65, 130, 130.1]) cmp(`isMeasurementInRange ${t} ${v}`, () => A.isMeasurementInRange(t, v), () => B.isMeasurementInRange(t, v));
for (const v of [0, 1.5, 1.50, 10, 2.005, 12.345, 99.95, 0.04]) for (const d of [1, 2]) cmp(`formatValue(${v},${d})`, () => A.formatValue(v, d), () => B.formatValue(v, d));

console.log(`cases: ${cases}  mismatches: ${mismatches.length}`);
for (const m of mismatches.slice(0, 20)) console.log(`  MISMATCH ${m.desc}\n    base=${JSON.stringify(m.base)}\n    head=${JSON.stringify(m.head)}`);
if (mismatches.length > 20) console.log(`  ... ${mismatches.length - 20} more`);
console.log(mismatches.length ? 'FAIL' : `PASS (${cases} cases)`);
process.exit(mismatches.length ? 1 : 0);
