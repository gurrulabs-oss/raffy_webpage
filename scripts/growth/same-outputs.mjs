#!/usr/bin/env node
// Regression guard for the growth percentile maths: compares the OUTPUTS of a base version of
// tools/percentile-calculator.js + tools/who-lms-data.json with the working tree. Use it on tickets that
// must not change any number (UI/copy/refactor) and run it with the default base (main).
//
// Usage (from anywhere in the repo):
//   node scripts/growth/same-outputs.mjs [--base <git ref>] [--base-dir <dir>] [--head-dir <dir>]
//   --base      git ref to read both base files from (`git show <ref>:<path>`), default `main`
//   --base-dir  read the base files from <dir>/tools/... instead of git (e.g. a copy of the tree; or the
//               working tree itself, which must PASS)
//   --head-dir  head side directory (default: this working tree)
// Exit 0 = identical outputs, 1 = differences (or the math code could not be extracted), 2 = usage error.
//
// Both sides' functions are extracted from the real source and run in a vm sandbox. Functions introduced
// later (evaluateMeasurement, chartSampleRows, ...) are optional on a side: a side without them is run
// through the equivalent legacy sequence (selectMetric -> range check -> interpolateLms -> zFromMeasurement).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REL_JS = 'tools/percentile-calculator.js';
const REL_DATA = 'tools/who-lms-data.json';
const base = opt('--base', 'main');
const baseDir = opt('--base-dir', null);
const headDir = path.resolve(opt('--head-dir', root));

function readBase(rel) {
  if (baseDir) return readFileSync(path.join(path.resolve(baseDir), rel), 'utf8');
  try {
    return execFileSync('git', ['show', `${base}:${rel}`], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error(`cannot read ${rel} from git ref "${base}": ${String(e.stderr || e.message).trim()}`);
    process.exit(2);
  }
}
const baseLabel = baseDir ? `dir:${baseDir}` : `git:${base}`;
const baseSrc = readBase(REL_JS);
const baseData = JSON.parse(readBase(REL_DATA));
const headSrc = readFileSync(path.join(headDir, REL_JS), 'utf8');
const headData = JSON.parse(readFileSync(path.join(headDir, REL_DATA), 'utf8'));

const FUNCS = ['indexRows', 'interpolateLms', 'zFromMeasurement', 'valueAtZ', 'selectMetric', 'normalCdf', 'erf',
  'measurementConfig', 'isMeasurementInRange', 'toSi', 'fromSi', 'formatValue', 'formatMeasurementValue', 'formatAge'];
const OPTIONAL_FUNCS = ['zForMeasurement', 'evaluationAgeDays', 'evaluateMeasurement', 'chartSampleRows'];
const CONSTS = ['Z_POINTS', 'KG_TO_LB', 'CM_TO_IN'];
const OPTIONAL_CONSTS = ['CHART_SAMPLE_STEPS'];
// inline maths inside runCalculation: [label, regex capturing the expression]
const INLINE = [
  ['percentile expression', /const percentile = ([^;]+);/],
  ['correctionDays expression', /const correctionDays = ([^;]+);/]
];

function extractFunction(src, name) {
  const m = new RegExp(`(^|\\n)(async\\s+)?function\\s+${name}\\s*\\(`).exec(src);
  if (!m) return null;
  let i = src.indexOf('{', m.index + m[0].length);
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
  const funcs = [];
  for (const c of CONSTS) { const s = extractConst(src, c); s ? parts.push(s) : missing.push(`const ${c}`); }
  for (const c of OPTIONAL_CONSTS) { const s = extractConst(src, c); if (s) parts.push(s); }
  for (const f of FUNCS) { const s = extractFunction(src, f); s ? (parts.push(s), funcs.push(f)) : missing.push(`function ${f}()`); }
  for (const f of OPTIONAL_FUNCS) { const s = extractFunction(src, f); if (s) { parts.push(s); funcs.push(f); } }
  const inl = {};
  for (const [l, re] of INLINE) { const m = re.exec(src); m ? (inl[l] = m[1]) : missing.push(`inline "${l}" in runCalculation`); }
  if (missing.length) {
    console.error(`FAIL: ${label} is missing required math code (renamed/moved?): ${missing.join(', ')}`);
    process.exit(1);
  }
  const code = `let daysPerMonth = 30.4375; let unitSystem = 'metric'; const copy = new Proxy({}, { get: () => '' });
${parts.join('\n')}
({ ${funcs.join(', ')}, Z_POINTS, KG_TO_LB, CM_TO_IN,
  set(d, u) { daysPerMonth = d; unitSystem = u; },
  percentile: (normalCdfFn, zScore) => { const normalCdf = normalCdfFn; return (${inl['percentile expression']}); },
  correctionDays: (gestationalWeeks) => (${inl['correctionDays expression']}) })`;
  const ctx = vm.createContext({ Math, Number, Object, Array, Date, String, Proxy });
  try { return vm.runInContext(code, ctx, { filename: label }); }
  catch (e) { console.error(`FAIL: ${label} could not be evaluated: ${e.message}`); process.exit(1); }
}

const A = load(`${baseLabel}:${REL_JS}`, baseSrc);
const B = load(path.join(headDir, REL_JS), headSrc);
const dpmA = Number(baseData.meta?.daysPerMonth || 30.4375);
const dpmB = Number(headData.meta?.daysPerMonth || 30.4375);
const idxA = A.indexRows(baseData.rows);
const idxB = B.indexRows(headData.rows);

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

// One measurement through the lookup path each side really uses (see header).
function evalSide(S, idx, sex, type, value, rawAge) {
  if (S.evaluateMeasurement) {
    const r = S.evaluateMeasurement(idx, sex, type, value, rawAge);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, ageDays: r.ageDays, table: r.metricSelection.metric, z: r.zScore, pct: S.percentile(S.normalCdf, r.zScore) };
  }
  if (!S.isMeasurementInRange(type, value)) return { ok: false, error: 'value' };
  const sel = S.selectMetric(type, rawAge);
  const rows = idx[sel.metric]?.[sex];
  if (!rows || !rows.length || rawAge < rows[0].ageDays || rawAge > rows[rows.length - 1].ageDays) return { ok: false, error: 'range' };
  const z = S.zFromMeasurement(value, S.interpolateLms(rows, rawAge));
  if (!Number.isFinite(z)) return { ok: false, error: 'value' };
  return { ok: true, ageDays: rawAge, table: sel.metric, z, pct: S.percentile(S.normalCdf, z) };
}
// LMS row actually used by each side for the age (for valueAtZ / curve comparison)
function lmsSide(S, idx, sex, type, rawAge) {
  const age = S.evaluationAgeDays ? S.evaluationAgeDays(rawAge) : rawAge;
  const rows = idx[S.selectMetric(type, age).metric]?.[sex];
  return rows ? S.interpolateLms(rows, age) : null;
}

// constants
cmp('Z_POINTS', () => A.Z_POINTS, () => B.Z_POINTS);
cmp('KG_TO_LB', () => A.KG_TO_LB, () => B.KG_TO_LB);
cmp('CM_TO_IN', () => A.CM_TO_IN, () => B.CM_TO_IN);
cmp('daysPerMonth (meta)', () => dpmA, () => dpmB);
for (const g of [22, 24, 28, 32, 34.5, 36, 37, 39.9, 40]) cmp(`correctionDays(${g})`, () => A.correctionDays(g), () => B.correctionDays(g));

// ages (days): every row of either dataset, midpoints, +-1, fractional, threshold boundaries, round-half cases
const ageSet = new Set([0, 0.4, 0.5, 1, 7, 10.5, 29.99, 30.4375, 100.37, 365.25, 729, 729.5, 730, 730.2, 730.5, 730.8, 731, 1000.25, 1825.5, 1826]);
for (const dm of [dpmA, dpmB, 30.4375]) {
  const thr = Math.round(24 * dm);
  [thr - 1, thr - 0.51, thr - 0.5, thr - 0.01, thr, thr + 0.01, thr + 1].forEach((x) => ageSet.add(x));
}
for (const idx of [idxA, idxB]) for (const k of Object.keys(idx)) for (const sex of Object.keys(idx[k])) {
  const rows = idx[k][sex];
  rows.forEach((r, i) => {
    ageSet.add(r.ageDays); ageSet.add(r.ageDays + 0.5); ageSet.add(Math.max(0, r.ageDays - 1)); ageSet.add(r.ageDays + 1);
    if (rows[i + 1]) ageSet.add((r.ageDays + rows[i + 1].ageDays) / 2);
  });
}
for (let m = 0; m <= 24; m += 0.25) ageSet.add(m * dpmB);
// premature corrected ages: chronological age minus correction
for (const g of [24, 28, 32, 36, 39.9]) for (const chrono of [60, 120, 200, 365, 600, 900]) {
  const c = A.correctionDays(g); if (chrono - c >= 0) ageSet.add(chrono - c);
}
const ages = [...ageSet].filter((a) => a >= 0 && a <= 1826).sort((a, b) => a - b);
// subset for the (slower) display / imperial round-trip comparisons
const displayAges = ages.filter((a) => Number.isInteger(a) && (a < 40 || a % 30 === 0 || a === 730 || a === 731 || a === 1826));

const types = ['weight', 'lengthHeight', 'headCircumference'];
const zs = [-4, -3.5, -3, -2.9, -2, -1.8807936081512509, -1, 0, 1, 1.8807936081512509, 2, 2.9, 3, 3.5, 4];
const sexes = ['male', 'female'];

for (const dm of [dpmB, 30.4375]) {
  A.set(dm, 'metric'); B.set(dm, 'metric');
  for (const age of ages) for (const type of types) {
    cmp(`selectMetric(${type},${age}) dpm=${dm}`, () => A.selectMetric(type, age), () => B.selectMetric(type, age));
  }
}
A.set(dpmA, 'metric'); B.set(dpmB, 'metric');
cmp('indexRows', () => idxA, () => idxB);
if (A.evaluationAgeDays && B.evaluationAgeDays) {
  for (const a of [-0.6, -0.5, -0.4, 0, 0.49, 0.5, 0.7, 1.5, 2.5, 730.4999, 730.5, 6.299999999999990, 3.5]) cmp(`evaluationAgeDays(${a})`, () => A.evaluationAgeDays(a), () => B.evaluationAgeDays(a));
}

// full lookup (age -> table -> LMS -> z -> percentile) for values at each z, +-0.1%
for (const sex of sexes) for (const age of ages) for (const type of types) {
  const lmsA = lmsSide(A, idxA, sex, type, age);
  const lmsB = lmsSide(B, idxB, sex, type, age);
  cmp(`interpolateLms ${type} ${sex} age=${age}`, () => lmsA, () => lmsB);
  if (!lmsA || !lmsB) continue;
  for (const z of zs) {
    const tag = `${sex} ${type} age=${age}d z=${z}`;
    cmp(`valueAtZ ${tag}`, () => A.valueAtZ(lmsA, z), () => B.valueAtZ(lmsB, z));
    // values to evaluate: from each side's own curve, so a changed curve and a changed z both show up
    for (const v of new Set([A.valueAtZ(lmsA, z), B.valueAtZ(lmsB, z)])) {
      if (!Number.isFinite(v)) continue;
      for (const val of [v, v * 0.999, v * 1.001]) {
        const rA = evalSide(A, idxA, sex, type, val, age), rB = evalSide(B, idxB, sex, type, val, age);
        cmp(`lookup ${tag} v=${val}`, () => rA, () => rB);
        cmp(`display P ${tag} v=${val}`, () => (rA.ok ? A.formatValue(rA.pct, 1) : rA), () => (rB.ok ? B.formatValue(rB.pct, 1) : rB));
      }
    }
  }
}

// display / imperial round trips, in-range checks
for (const sex of sexes) for (const age of displayAges) for (const type of types) {
  const lmsA = lmsSide(A, idxA, sex, type, age);
  if (!lmsA) continue;
  for (const z of [-3, -2, 0, 2, 3]) {
    const v = A.valueAtZ(lmsA, z);
    if (!Number.isFinite(v)) continue;
    const tag = `${sex} ${type} age=${age}d z=${z} v=${v}`;
    cmp(`inRange ${tag}`, () => A.isMeasurementInRange(type, v), () => B.isMeasurementInRange(type, v));
    for (const system of ['metric', 'imperial']) {
      A.set(dpmA, system); B.set(dpmB, system);
      const dispA = A.fromSi(type, v, system), dispB = B.fromSi(type, v, system);
      cmp(`fromSi/${system} ${tag}`, () => dispA, () => dispB);
      cmp(`formatMeasurementValue/${system} ${tag}`, () => A.formatMeasurementValue(dispA, type, system), () => B.formatMeasurementValue(dispB, type, system));
      // user typed a rounded value -> SI -> z
      const typed = Number(dispA.toFixed(system === 'imperial' ? 1 : 2));
      cmp(`toSi/${system} ${tag} typed=${typed}`, () => A.toSi(type, typed, system), () => B.toSi(type, typed, system));
      cmp(`lookup(typed)/${system} ${tag}`, () => evalSide(A, idxA, sex, type, A.toSi(type, typed, system), age), () => evalSide(B, idxB, sex, type, B.toSi(type, typed, system), age));
      A.set(dpmA, 'metric'); B.set(dpmB, 'metric');
    }
  }
}

// chart curves: the points each side draws (ageMonths + value at every Z_POINT)
for (const metric of new Set([...Object.keys(idxA), ...Object.keys(idxB)])) for (const sex of sexes) {
  const curve = (S, idx) => {
    const rows = idx[metric]?.[sex];
    if (!rows) return null;
    const drawn = S.chartSampleRows ? S.chartSampleRows(rows) : rows;
    return drawn.map((r) => [r.ageMonths, ...S.Z_POINTS.map((p) => S.valueAtZ(r, p.z))]);
  };
  cmp(`chart curve points ${metric} ${sex}`, () => curve(A, idxA), () => curve(B, idxB));
}

// ages + config + helpers
for (const age of ages) cmp(`formatAge(${age})`, () => A.formatAge(age), () => B.formatAge(age));
for (const x of [-5, -1, -0.3, 0, 0.3, 1, 2, 5]) cmp(`normalCdf(${x})`, () => A.normalCdf(x), () => B.normalCdf(x));
for (const t of types) for (const s of ['metric', 'imperial']) cmp(`measurementConfig ${t} ${s}`, () => A.measurementConfig(t, s), () => B.measurementConfig(t, s));
for (const t of types) for (const v of [0.4, 0.5, 1, 20, 35, 35.01, 65, 130, 130.1]) cmp(`isMeasurementInRange ${t} ${v}`, () => A.isMeasurementInRange(t, v), () => B.isMeasurementInRange(t, v));
for (const v of [0, 1.5, 1.50, 10, 2.005, 12.345, 99.95, 0.04]) for (const d of [1, 2]) cmp(`formatValue(${v},${d})`, () => A.formatValue(v, d), () => B.formatValue(v, d));

console.log(`base: ${baseLabel}   head: ${headDir}`);
console.log(`cases: ${cases}  mismatches: ${mismatches.length}`);
const kinds = {};
for (const m of mismatches) { const k = m.desc.split(' ')[0].replace(/\(.*$/, ''); kinds[k] = (kinds[k] || 0) + 1; }
for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(7)}  ${k}`);
for (const m of mismatches.slice(0, 20)) console.log(`  MISMATCH ${m.desc}\n    base=${JSON.stringify(m.base)?.slice(0, 300)}\n    head=${JSON.stringify(m.head)?.slice(0, 300)}`);
if (mismatches.length > 20) console.log(`  ... ${mismatches.length - 20} more`);
console.log(mismatches.length ? 'FAIL' : `PASS (${cases} cases)`);
process.exit(mismatches.length ? 1 : 0);
