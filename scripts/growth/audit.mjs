#!/usr/bin/env node
// Accuracy audit of the baby growth percentile calculator (tools/percentile-calculator.js +
// tools/who-lms-data.json) against the WHO Child Growth Standards expanded DAILY tables.
//
// Usage: node scripts/growth/audit.mjs [--ref-dir <dir>] [--json <file>]
//   --ref-dir  cache dir for the WHO xlsx files (default: $TMPDIR/raffy-who-ref; downloaded if missing)
//   --json     write full per-case results to <file>
// Exit code 1 if any PASS/FAIL check fails (INFO rows never fail).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  WHO_FILES, defaultRefDir, ensureDownloaded, loadTable, lmsValue, lmsZ, restrictedZ, restrictedValue, LENGTH_MAX_DAY
} from './who-tables.mjs';

const t0 = Date.now();
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const refDir = opt('--ref-dir', defaultRefDir());
const jsonOut = opt('--json', null);
const TOL_Z = 0.01;

// ---------------------------------------------------------------------------------------------
// 1. Load the tool's own maths from tools/percentile-calculator.js in a vm sandbox
//    (extraction helpers copied from .lead/scratch/T-011/growth-same-outputs.mjs)
// ---------------------------------------------------------------------------------------------
const TOOL_JS = path.join(root, 'tools/percentile-calculator.js');
const TOOL_DATA = path.join(root, 'tools/who-lms-data.json');
const FUNCS = ['indexRows', 'interpolateLms', 'zFromMeasurement', 'zForMeasurement', 'evaluationAgeDays', 'evaluateMeasurement',
  'chartSampleRows', 'valueAtZ', 'selectMetric', 'normalCdf', 'erf',
  'measurementConfig', 'isMeasurementInRange', 'toSi', 'fromSi', 'formatValue', 'formatMeasurementValue', 'formatAge'];
const CONSTS = ['Z_POINTS', 'KG_TO_LB', 'CM_TO_IN', 'CHART_SAMPLE_STEPS'];
const INLINE = [
  ['percentile expression', /const percentile = ([^;]+);/],
  ['correctionDays expression', /const correctionDays = ([^;]+);/]
];
const WIRING = [
  ['runCalculation rounds the corrected age with evaluationAgeDays()', /evaluationAgeDays\(\s*chronologicalAgeDays\s*-\s*correctionDays\s*\)/, 'calc'],
  ['runCalculation evaluates each measurement with evaluateMeasurement()', /evaluateMeasurement\(/, 'calc'],
  ['buildChartSvg draws curves from chartSampleRows()', /chartSampleRows\(rows\)/, 'chart']
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
function loadTool(label, src) {
  const missing = [], parts = [], inl = {};
  for (const c of CONSTS) { const s = extractConst(src, c); s ? parts.push(s) : missing.push(`const ${c}`); }
  for (const f of FUNCS) { const s = extractFunction(src, f); s ? parts.push(s) : missing.push(`function ${f}()`); }
  for (const [l, re] of INLINE) { const m = re.exec(src); m ? (inl[l] = m[1]) : missing.push(`inline "${l}" in runCalculation`); }
  // the audited helpers only matter if the shipped code path uses them: check the wiring
  const runCalc = extractFunction(src, 'runCalculation') || '';
  const chartSvg = src; // buildChartSvg has destructured params, which extractFunction can't parse
  for (const [l, re, body] of WIRING) if (!re.test(body === 'chart' ? chartSvg : runCalc)) missing.push(`wiring: ${l}`);
  if (missing.length) {
    console.error(`FAIL: ${label} is missing required math code (renamed/moved?): ${missing.join(', ')}`);
    process.exit(2);
  }
  const code = `let daysPerMonth = 30.4375; let unitSystem = 'metric'; const copy = new Proxy({}, { get: () => '' });
${parts.join('\n')}
({ ${FUNCS.join(', ')}, Z_POINTS, KG_TO_LB, CM_TO_IN,
  set(d, u) { daysPerMonth = d; unitSystem = u; },
  percentile: (normalCdfFn, zScore) => { const normalCdf = normalCdfFn; return (${inl['percentile expression']}); },
  correctionDays: (gestationalWeeks) => (${inl['correctionDays expression']}) })`;
  const ctx = vm.createContext({ Math, Number, Object, Array, Date, String, Proxy });
  try { return vm.runInContext(code, ctx, { filename: label }); }
  catch (e) { console.error(`FAIL: ${label} could not be evaluated: ${e.message}`); process.exit(2); }
}

const T = loadTool(TOOL_JS, readFileSync(TOOL_JS, 'utf8'));
const toolData = JSON.parse(readFileSync(TOOL_DATA, 'utf8'));
const DPM = Number(toolData.meta?.daysPerMonth || 30.4375);
T.set(DPM, 'metric');
const toolIdx = T.indexRows(toolData.rows);

// ---------------------------------------------------------------------------------------------
// 2. WHO reference (expanded daily tables)
// ---------------------------------------------------------------------------------------------
await ensureDownloaded({ refDir, log: (m) => console.error(m) });
const SEXES = ['male', 'female'];
const ref = { z: {}, p: {} }; // ref.z[metric][sex] = rows indexed by day
for (const kind of ['zscore', 'percentiles']) for (const metric of ['wfa', 'lhfa', 'hcfa']) for (const sex of SEXES) {
  const t = loadTable(metric, sex, { refDir, kind });
  const k = kind === 'zscore' ? 'z' : 'p';
  ref[k][metric] ??= {};
  ref[k][metric][sex] = t.rows;
  t.rows.forEach((r, i) => { if (r.day !== i) throw new Error(`${t.url}: day ${i} missing`); });
}

// audit metrics -> tool measurement type, WHO table, valid day range
const METRICS = {
  wfa: { type: 'weight', who: 'wfa', min: 0, max: 1826, restricted: true },
  lfa: { type: 'lengthHeight', who: 'lhfa', min: 0, max: LENGTH_MAX_DAY, restricted: false },
  hfa: { type: 'lengthHeight', who: 'lhfa', min: LENGTH_MAX_DAY + 1, max: 1826, restricted: false },
  hcfa: { type: 'headCircumference', who: 'hcfa', min: 0, max: 1826, restricted: false }
};
const refLms = (metric, sex, day) => ref.z[METRICS[metric].who][sex][day];
const refZ = (metric, x, lms) => (METRICS[metric].restricted ? restrictedZ(x, lms) : lmsZ(x, lms));
const refValue = (metric, lms, z) => (METRICS[metric].restricted ? restrictedValue(lms, z) : lmsValue(lms, z));

// precise standard normal CDF (Taylor series, |x| < 9) and its inverse (Newton)
function Phi(x) {
  if (x <= -9) return 0;
  if (x >= 9) return 1;
  let term = x, sum = x;
  for (let n = 1; n < 500 && Math.abs(term) > 1e-17 * Math.abs(sum); n++) { term *= (x * x) / (2 * n + 1); sum += term; }
  return 0.5 + sum * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}
function invPhi(p) {
  let x = 0;
  for (let i = 0; i < 100; i++) {
    const dx = (Phi(x) - p) / (Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI));
    x -= dx;
    if (Math.abs(dx) < 1e-15) break;
  }
  return x;
}
const clampPct = (p) => Math.max(0.1, Math.min(99.9, p));
const refPct = (z) => clampPct(100 * Phi(z));

// The tool's real lookup (runCalculation calls the same function): age -> whole days -> table -> LMS -> z
function toolEval(sex, type, ageDays, valueSi) {
  const r = T.evaluateMeasurement(toolIdx, sex, type, valueSi, ageDays);
  if (!r.ok) {
    if (r.error === 'value' && T.isMeasurementInRange(type, valueSi)) { // in range but z is not finite: a hard failure
      return { z: Number.NaN, pct: Number.NaN, table: T.selectMetric(type, T.evaluationAgeDays(ageDays)).metric };
    }
    return { rejected: r.error === 'value' ? 'value out of tool input range' : 'age out of tool range / no table' };
  }
  return { z: r.zScore, pct: T.percentile(T.normalCdf, r.zScore), table: r.metricSelection.metric, lms: r.lms, ageDays: r.ageDays };
}

// ---------------------------------------------------------------------------------------------
// 3. Grid
// ---------------------------------------------------------------------------------------------
const ageSet = new Set([0, 7, 14, 30, 61, 91, 730, 731]);
for (let m = 0; m <= 60; m++) ageSet.add(Math.round(m * 30.4375));
const AGES = [...ageSet].sort((a, b) => a - b);
const ZS = [-4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4];

const checks = [];
const caseLog = {};
function newCheck(id, name, opts = {}) {
  const c = { id, name, kind: opts.kind || 'test', threshold: opts.threshold ?? TOL_Z, unit: opts.unit || 'z',
    cases: 0, skipped: 0, maxDz: 0, maxDpct: 0, worst: null, worstPct: null, notes: [] };
  checks.push(c); caseLog[id] = [];
  return c;
}
function record(c, rec, { dz, dpct = 0, label }) {
  c.cases++;
  caseLog[c.id].push(rec);
  const adz = Number.isFinite(dz) ? Math.abs(dz) : 99; // NaN/Infinity from the tool counts as a hard failure
  if (c.worst === null || adz > c.maxDz) { c.maxDz = adz; c.worst = label; }
  if (Number.isFinite(dpct) && Math.abs(dpct) > c.maxDpct) { c.maxDpct = Math.abs(dpct); c.worstPct = label; }
}
const fmtZ = (z) => (Number.isInteger(z) ? String(z) : z.toFixed(z % 0.5 === 0 ? 1 : 3));
const lbl = (sex, metric, age, z, extra = '') => `${sex} ${metric} ${age}d z=${fmtZ(z)}${extra}`;

// (1) / (1b) / (2): tool z vs reference z over the grid
const c1 = newCheck('1', 'LMS interpolation, all metrics, |z|<=3');
const c1b = newCheck('1b', 'LMS interpolation, length/height/HC |z|>3 (plain LMS)');
const c2 = newCheck('2', 'Weight-for-age |z|>3 (WHO restricted LMS)');
const perMetric = {}; // breakdown for check 1
for (const sex of SEXES) for (const [metric, cfg] of Object.entries(METRICS)) for (const age of AGES) {
  if (age < cfg.min || age > cfg.max) continue;
  const lms = refLms(metric, sex, age);
  for (const z of ZS) {
    const x = refValue(metric, lms, z);
    const zr = refZ(metric, x, lms);
    const check = Math.abs(z) <= 3 ? c1 : (cfg.restricted ? c2 : c1b);
    const r = toolEval(sex, cfg.type, age, x);
    const rec = { sex, metric, age, zTarget: z, value: x, zRef: zr };
    if (r.rejected) { check.skipped++; caseLog[check.id].push({ ...rec, rejected: r.rejected }); continue; }
    const dz = r.z - zr, dpct = r.pct - refPct(zr);
    // decomposition for check 2: what plain LMS on the exact daily row would give (= restriction error only)
    if (check === c2) rec.zPlainDaily = lmsZ(x, lms);
    record(check, { ...rec, zTool: r.z, toolTable: r.table, dz, pctTool: r.pct, pctRef: refPct(zr), dpct },
      { dz, dpct, label: lbl(sex, metric, age, z, ` (tool ${r.z.toFixed(3)} vs WHO ${zr.toFixed(3)})`) });
    if (check === c1) {
      const pm = (perMetric[metric] ??= { cases: 0, maxDz: 0, worst: '' });
      pm.cases++;
      if (Math.abs(dz) > pm.maxDz) { pm.maxDz = Math.abs(dz); pm.worst = lbl(sex, metric, age, z); }
    }
  }
}
{
  const restrOnly = caseLog['2'].filter((r) => r.zPlainDaily !== undefined).map((r) => Math.abs(r.zPlainDaily - r.zRef));
  c2.notes.push(`restriction alone (plain LMS on exact WHO daily row vs restricted): max |dz| ${Math.max(...restrOnly).toFixed(3)}`);
}

// (3) length/height switch
const c3 = newCheck('3', 'Length/height table switch (WHO: length if age < 731 d)');
for (const sex of SEXES) for (const age of [700, 729, 730, 731, 732, 760]) {
  const whoMetric = age <= LENGTH_MAX_DAY ? 'lfa' : 'hfa';
  const whoTable = whoMetric === 'lfa' ? 'lhfa_0_2' : 'lhfa_2_5';
  const lms = refLms(whoMetric, sex, age);
  for (const z of [-2, 0, 2]) {
    const x = lmsValue(lms, z);
    const r = toolEval(sex, 'lengthHeight', age, x);
    const mismatch = r.table !== whoTable;
    const dz = mismatch ? Infinity : r.z - z;
    record(c3, { sex, age, zTarget: z, toolTable: r.table, whoTable, zTool: r.z, dz: mismatch ? null : dz },
      { dz: mismatch ? 99 : dz, dpct: r.pct - refPct(z), label: `${sex} ${age}d z=${z}: tool ${r.table}, WHO ${whoTable}${mismatch ? ' MISMATCH' : ''}` });
  }
}
c3.notes.push(`tool selectMetric threshold = Math.round(24*${DPM}) = ${Math.round(24 * DPM)} d (length if age < threshold)`);

// (3b) fractional (corrected) ages: WHO Anthro rounds age to whole days (half up) before choosing the
// table and looking up LMS; tool must pick the same table and give the same z as Anthro at that day
const c3b = newCheck('3b', 'Fractional (corrected) ages: whole-day rounding, table + z at the rounded day');
const WHO_OF = { weight: ['wfa', 'wfa'], headCircumference: ['hcfa', 'hcfa'] };
const TOOL_TABLE = { weight: () => 'wfa', headCircumference: () => 'hcfa', lengthHeight: (d) => (d <= LENGTH_MAX_DAY ? 'lhfa_0_2' : 'lhfa_2_5') };
for (const sex of SEXES) for (const type of ['weight', 'lengthHeight', 'headCircumference']) {
  for (const base of [0, 6, 99, 364, 365, 396, 729, 730, 1000, 1825]) for (const frac of [0.2, 0.4, 0.5, 0.7, 0.8]) {
    const age = base + frac;
    const whoDay = Math.floor(age) + (age - Math.floor(age) >= 0.5 ? 1 : 0); // half up
    if (whoDay > 1826) continue;
    const [who, metric] = type === 'lengthHeight' ? ['lhfa', whoDay <= LENGTH_MAX_DAY ? 'lfa' : 'hfa'] : WHO_OF[type];
    const lms = ref.z[who][sex][whoDay];
    const whoTable = TOOL_TABLE[type](whoDay);
    for (const z of [-2, 0, 2]) {
      const r = toolEval(sex, type, age, refValue(metric, lms, z));
      const bad = r.rejected || r.table !== whoTable;
      const dz = bad ? 99 : r.z - refZ(metric, refValue(metric, lms, z), lms);
      record(c3b, { sex, type, age, whoDay, zTarget: z, toolTable: r.table ?? null, whoTable, zTool: r.z ?? null, rejected: r.rejected ?? null, dz: bad ? null : dz },
        { dz, dpct: bad ? 0 : r.pct - refPct(z), label: `${sex} ${type} ${age}d z=${z}: ${r.rejected ? `REJECTED (${r.rejected})` : `tool ${r.table}, z ${r.z.toFixed(3)}`}; Anthro day ${whoDay} -> ${whoTable}` });
    }
  }
}
c3b.notes.push('fractional ages only arise with corrected age (GA step 0.1 w -> correction in 0.7 d steps)');

// (4) corrected age formula
const c4 = newCheck('4', 'Corrected-age days = (40 - GA) x 7', { threshold: 1e-9, unit: 'days' });
for (let g10 = 220; g10 <= 400; g10++) {
  const ga = g10 / 10;
  const got = T.correctionDays(ga), exp = (40 - ga) * 7;
  record(c4, { ga, got, exp }, { dz: got - exp, label: `GA ${ga} w: tool ${got} d, expected ${exp} d` });
}

// (5) imperial conversion
const LB_PER_KG_EXACT = 1 / 0.45359237, IN_PER_CM_EXACT = 1 / 2.54;
const c5 = newCheck('5', 'Imperial conversion constants (lb, in)');
const c5b = newCheck('5b', 'Input rounding: imperial 0.1 lb / 0.1 in', { kind: 'info' });
const c5c = newCheck('5c', 'Input rounding: metric 0.01 kg / 0.1 cm', { kind: 'info' });
c5.notes.push(`KG_TO_LB=${T.KG_TO_LB} (exact ${LB_PER_KG_EXACT}, rel err ${((T.KG_TO_LB - LB_PER_KG_EXACT) / LB_PER_KG_EXACT).toExponential(2)}); CM_TO_IN=${T.CM_TO_IN} (exact ${IN_PER_CM_EXACT}, rel err ${((T.CM_TO_IN - IN_PER_CM_EXACT) / IN_PER_CM_EXACT).toExponential(2)})`);
for (const type of ['weight', 'lengthHeight', 'headCircumference']) {
  const cfgI = T.measurementConfig(type, 'imperial'), cfgM = T.measurementConfig(type, 'metric');
  c5b.notes.push(`${type}: imperial step ${cfgI.step} ${cfgI.unit}, metric step ${cfgM.step} ${cfgM.unit}`);
}
const decimals = (step) => Math.max(0, Math.round(-Math.log10(step)));
for (const sex of SEXES) for (const [metric, cfg] of Object.entries(METRICS)) for (const age of AGES) {
  if (age < cfg.min || age > cfg.max) continue;
  const lms = refLms(metric, sex, age);
  for (const z of ZS.filter((v) => Math.abs(v) <= 3)) {
    const x = refValue(metric, lms, z);
    const zx = refZ(metric, x, lms);
    // imperial: user sees/typed value rounded to the input step
    const stepI = T.measurementConfig(cfg.type, 'imperial').step;
    const typed = Number(T.fromSi(cfg.type, x, 'imperial').toFixed(decimals(stepI)));
    const siTool = T.toSi(cfg.type, typed, 'imperial');
    const siExact = cfg.type === 'weight' ? typed * 0.45359237 : typed * 2.54;
    const dzConst = refZ(metric, siTool, lms) - refZ(metric, siExact, lms);
    record(c5, { sex, metric, age, zTarget: z, typed, siTool, siExact, dz: dzConst },
      { dz: dzConst, label: lbl(sex, metric, age, z, ` typed ${typed}`) });
    const dzI = refZ(metric, siTool, lms) - zx;
    record(c5b, { sex, metric, age, zTarget: z, exact: x, typed, dz: dzI },
      { dz: dzI, dpct: refPct(refZ(metric, siTool, lms)) - refPct(zx), label: lbl(sex, metric, age, z, ` ${x.toFixed(3)} -> ${typed} ${T.measurementConfig(cfg.type, 'imperial').unit}`) });
    const stepM = T.measurementConfig(cfg.type, 'metric').step;
    const typedM = Number(x.toFixed(decimals(stepM)));
    const dzM = refZ(metric, typedM, lms) - zx;
    record(c5c, { sex, metric, age, zTarget: z, exact: x, typed: typedM, dz: dzM },
      { dz: dzM, dpct: refPct(refZ(metric, typedM, lms)) - refPct(zx), label: lbl(sex, metric, age, z, ` ${x.toFixed(3)} -> ${typedM}`) });
  }
}

// (6) age display
const c6 = newCheck('6', 'Age display formatAge vs months = days/30.4375', { threshold: 0.5 + 1e-9, unit: 'days' });
let shows30 = 0;
for (let d10 = 0; d10 <= 18560; d10++) {
  const days = d10 % 10 === 0 ? d10 / 10 : (d10 % 3 === 0 ? d10 / 10 : null); // all whole days + a sample of fractional
  if (days === null) continue;
  const s = T.formatAge(days);
  const m = /^(\d+)m (\d+)d$/.exec(s);
  const expMonths = Math.floor(days / 30.4375);
  const expRem = days - expMonths * 30.4375;
  if (!m) { record(c6, { days, s }, { dz: 99, label: `${days}d -> "${s}" (unparseable)` }); continue; }
  const dMonths = Number(m[1]) - expMonths;
  const dDays = Number(m[2]) - expRem;
  if (Number(m[2]) >= 30) shows30++;
  const err = dMonths !== 0 ? 99 : dDays;
  record(c6, { days, s, expMonths, expRem }, { dz: err, label: `${days}d -> "${s}" (WHO ${(days / 30.4375).toFixed(3)} mo = ${expMonths}m ${expRem.toFixed(2)}d)` });
}
c6.notes.push(`displays with "30d" remainder (e.g. 60 d -> "1m 30d", WHO 1.971 mo): ${shows30} of ${c6.cases} ages; correct per floor(months) + rounded remainder, but can read oddly`);

// (7) chart curves: tool valueAtZ on its rows vs WHO published daily percentile values
const PCOL = { P3: 'P3', P15: 'P15', P50: 'P50', P85: 'P85', P97: 'P97' };
const c7 = newCheck('7', 'Chart curve nodes (every data row, P3/15/50/85/97) vs WHO published');
const c7b = newCheck('7b', 'Chart polylines (tool chartSampleRows points) vs WHO published, every day');
const c7z = newCheck('7z', 'Z_POINTS constants vs inverse normal', { threshold: 1e-9 });
const pctProbs = { P3: 0.03, P15: 0.15, P50: 0.5, P85: 0.85, P97: 0.97 };
for (const pt of T.Z_POINTS) {
  const exact = invPhi(pctProbs[pt.label]);
  record(c7z, { label: pt.label, z: pt.z, exact }, { dz: pt.z - exact, label: `${pt.label}: ${pt.z} vs ${exact}` });
}
const nSampled = {}; // points per curve the chart draws, per table (full range)
const toolTables = { wfa: ['wfa', 'wfa'], lhfa_0_2: ['lhfa', 'lfa'], lhfa_2_5: ['lhfa', 'hfa'], hcfa: ['hcfa', 'hcfa'] };
// WHO value at a fractional day restricted to one side of the length/height split (linear between whole days)
function whoAt(rowsByDay, metric, day, pick) {
  const { min, max } = METRICS[metric];
  let d0 = Math.floor(day), d1 = d0 + 1;
  if (d0 < min) { d0 = min; d1 = min + 1; }
  if (d1 > max) { d1 = max; d0 = max - 1; }
  if (day === Math.floor(day) && day >= min && day <= max) return pick(rowsByDay[day]);
  const t = (day - d0) / (d1 - d0);
  return pick(rowsByDay[d0]) + (pick(rowsByDay[d1]) - pick(rowsByDay[d0])) * t;
}
for (const [tbl, [who, metric]] of Object.entries(toolTables)) for (const sex of SEXES) {
  const rows = toolIdx[tbl][sex];
  const pRows = ref.p[who][sex], zRows = ref.z[who][sex];
  const lmsAt = (day) => ({ L: whoAt(zRows, metric, day, (r) => r.L), M: whoAt(zRows, metric, day, (r) => r.M), S: whoAt(zRows, metric, day, (r) => r.S) });
  for (const row of rows) {
    const day = row.ageDays; // the WHO day this node holds
    const lms = lmsAt(day);
    for (const pt of T.Z_POINTS) {
      const v = T.valueAtZ(row, pt.z);
      const pub = whoAt(pRows, metric, day, (r) => r.pct[PCOL[pt.label]]);
      const dz = lmsZ(v, lms) - lmsZ(pub, lms);
      record(c7, { table: tbl, sex, month: row.ageMonths, day, curve: pt.label, tool: v, who: pub, dz },
        { dz, label: `${sex} ${tbl} ${row.ageMonths}mo ${pt.label} (tool ${v.toFixed(3)} vs WHO ${pub.toFixed(3)})` });
    }
  }
  // polyline through the points the chart draws (tool's own chartSampleRows; x = ageMonths like buildChartSvg),
  // evaluated at every whole day the chart spans (x = day / daysPerMonth, where the baby's dot is placed)
  const sampled = T.chartSampleRows(rows);
  nSampled[tbl] = sampled.length;
  const dMin = Math.max(METRICS[metric].min, rows[0].ageDays);
  const dMax = Math.min(METRICS[metric].max, rows[rows.length - 1].ageDays);
  for (let day = dMin; day <= dMax; day++) {
    const x = day / DPM;
    let hi = sampled.findIndex((r) => r.ageMonths >= x); if (hi <= 0) hi = 1;
    const r0 = sampled[hi - 1], r1 = sampled[hi];
    const t = (x - r0.ageMonths) / (r1.ageMonths - r0.ageMonths);
    for (const pt of T.Z_POINTS) {
      const v = T.valueAtZ(r0, pt.z) + (T.valueAtZ(r1, pt.z) - T.valueAtZ(r0, pt.z)) * t;
      const pub = pRows[day].pct[PCOL[pt.label]];
      const dz = lmsZ(v, zRows[day]) - lmsZ(pub, zRows[day]);
      record(c7b, { table: tbl, sex, day, curve: pt.label, tool: v, who: pub, dz },
        { dz, label: `${sex} ${tbl} ${day}d ${pt.label} (line ${v.toFixed(3)} vs WHO ${pub.toFixed(3)})` });
    }
  }
}
c7b.notes.push(`points per curve drawn (full range, unwindowed): ${Object.entries(nSampled).map(([k, n]) => `${k} ${n}`).join(', ')}; data rows per table/sex: ${Object.entries(toolTables).map(([k]) => `${k} ${toolIdx[k].male.length}`).join(', ')}`);
c7.notes.push('WHO published percentile values are rounded (3-4 decimals), so ~0.001 of the residual is publication rounding');

// (8) percentile function: tool percentile(z) vs 100*Phi(z), clamped only outside 0.1-99.9
const c8 = newCheck('8', 'Percentile = 100*Phi(z), clamp 0.1-99.9 (tool z)', { threshold: 0.01, unit: 'pct' });
for (let i = -600; i <= 600; i++) {
  const z = i / 100;
  const got = T.percentile(T.normalCdf, z), exp = refPct(z);
  record(c8, { z, got, exp }, { dz: got - exp, dpct: got - exp, label: `z=${z.toFixed(2)}: tool ${got.toFixed(6)} vs ${exp.toFixed(6)}` });
}

// ---------------------------------------------------------------------------------------------
// 4. Interpolation cut-off scan: every whole day, |z|<=3, tool monthly interpolation vs WHO daily
//    "as is" = tool rows (ageDays rounded to whole days); "exact nodes" = same monthly rows placed at
//    month*30.4375 days (what a fixed monthly table would give)
// ---------------------------------------------------------------------------------------------
const scanZ = [-3, -2, -1, 0, 1, 2, 3];
function interpExact(rows, day) {
  const x = day / 30.4375;
  if (x <= rows[0].ageMonths) return rows[0];
  if (x >= rows[rows.length - 1].ageMonths) return rows[rows.length - 1];
  let hi = rows.findIndex((r) => r.ageMonths >= x); if (hi <= 0) hi = 1;
  const r0 = rows[hi - 1], r1 = rows[hi], t = (x - r0.ageMonths) / (r1.ageMonths - r0.ageMonths);
  return { L: r0.L + (r1.L - r0.L) * t, M: r0.M + (r1.M - r0.M) * t, S: r0.S + (r1.S - r0.S) * t };
}
const cutoff = {};
for (const [metric, cfg] of Object.entries(METRICS)) {
  const out = { lastBadDayAsIs: -1, lastBadDayExact: -1, maxAsIs: 0, maxExact: 0, bands: [] };
  const band = {}; // month band -> max
  for (const sex of SEXES) {
    for (let day = cfg.min; day <= cfg.max; day++) {
      const lms = refLms(metric, sex, day);
      const sel = T.selectMetric(cfg.type, day);
      const rows = toolIdx[sel.metric][sex];
      const lmsE = interpExact(rows, day);
      let eA = 0, eE = 0;
      for (const z of scanZ) {
        const x = lmsValue(lms, z);
        const r = toolEval(sex, cfg.type, day, x);
        eA = Math.max(eA, r.rejected ? 99 : Math.abs(r.z - z));
        eE = Math.max(eE, Math.abs(lmsZ(x, lmsE) - z));
      }
      if (eA > TOL_Z) out.lastBadDayAsIs = Math.max(out.lastBadDayAsIs, day);
      if (eE > TOL_Z) out.lastBadDayExact = Math.max(out.lastBadDayExact, day);
      out.maxAsIs = Math.max(out.maxAsIs, eA); out.maxExact = Math.max(out.maxExact, eE);
      const b = day < 92 ? '0-3 mo' : day < 183 ? '3-6 mo' : day < 365 ? '6-12 mo' : day < 731 ? '12-24 mo' : '24-60 mo';
      band[b] ??= { asIs: 0, exact: 0 };
      band[b].asIs = Math.max(band[b].asIs, eA); band[b].exact = Math.max(band[b].exact, eE);
    }
  }
  out.bands = band;
  cutoff[metric] = out;
}

// ---------------------------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------------------------
const fmt = (v, unit) => {
  if (v === null || v === undefined) return '-';
  if (unit === 'days') return `${v.toFixed(v < 1e-3 ? 0 : 2)} d`;
  if (v === 0) return '0';
  return v < 1e-4 ? v.toExponential(1) : v.toFixed(4);
};
for (const c of checks) {
  c.status = c.kind === 'info' ? 'INFO' : (c.maxDz <= c.threshold && c.cases > 0 ? 'PASS' : 'FAIL');
}
const lines = [];
lines.push('## Growth calculator accuracy audit (tool vs WHO expanded daily tables)', '');
lines.push(`Tool: tools/percentile-calculator.js + tools/who-lms-data.json (${toolData.rows.length} rows: daily to day ${toolData.meta?.dailyUntilDay ?? '?'}, monthly after). Reference: WHO expanded daily LMS/SD/percentile tables, day 0-1856 (${refDir}).`);
lines.push(`Pass threshold |dz| <= ${TOL_Z} unless noted. dpct = |tool percentile - clamp(100*Phi(z_WHO))| in percentile points.`, '');
lines.push('| Check | cases | max \\|Δz\\| | max \\|Δpct\\| | worst case | PASS/FAIL |');
lines.push('|---|---:|---:|---:|---|---|');
for (const c of checks) {
  const thr = c.unit === 'days' ? ` (Δ in days, tol ${c.threshold < 1e-6 ? '0' : c.threshold.toFixed(1)})` : c.unit === 'pct' ? ` (tol ${c.threshold} pp)` : c.threshold !== TOL_Z ? ` (tol ${c.threshold})` : '';
  const skipped = c.skipped ? ` (+${c.skipped} rejected by tool input range)` : '';
  const maxDz = c.unit === 'pct' ? '-' : (c.maxDz === 99 ? 'reject/mismatch' : fmt(c.maxDz, c.unit));
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  lines.push(`| ${c.id} ${esc(c.name + thr)} | ${c.cases}${skipped} | ${maxDz} | ${fmt(c.maxDpct)} | ${esc(c.worst ?? '-')} | ${c.status} |`);
}
lines.push('', '### Check 1 by metric (|z|<=3)', '', '| metric | cases | max \\|Δz\\| | worst |', '|---|---:|---:|---|');
for (const [m, v] of Object.entries(perMetric)) lines.push(`| ${m} | ${v.cases} | ${v.maxDz.toFixed(4)} | ${v.worst} |`);
lines.push('', '### Interpolation cut-off scan (every whole day, sexes pooled, |z|<=3)', '');
lines.push('"as is" = the tool\'s real lookup (age rounded to whole days, data rows as shipped); "exact nodes" = same rows placed at ageMonths x 30.4375 d (diagnostic). Last bad day = last day with |Δz| > 0.01.', '');
lines.push('| metric | max as is | max exact nodes | last bad day as is | last bad day exact nodes | 0-3 mo | 3-6 mo | 6-12 mo | 12-24 mo | 24-60 mo |');
lines.push('|---|---:|---:|---:|---:|---|---|---|---|---|');
for (const [m, v] of Object.entries(cutoff)) {
  const b = (k) => (v.bands[k] ? `${v.bands[k].asIs.toFixed(3)} / ${v.bands[k].exact.toFixed(3)}` : '-');
  lines.push(`| ${m} | ${v.maxAsIs.toFixed(4)} | ${v.maxExact.toFixed(4)} | ${v.lastBadDayAsIs < 0 ? 'none' : v.lastBadDayAsIs} | ${v.lastBadDayExact < 0 ? 'none' : v.lastBadDayExact} | ${b('0-3 mo')} | ${b('3-6 mo')} | ${b('6-12 mo')} | ${b('12-24 mo')} | ${b('24-60 mo')} |`);
}
lines.push('', '### Notes', '');
for (const c of checks) {
  if (c.worstPct && c.maxDpct >= 0.05 && c.worstPct !== c.worst) lines.push(`- [${c.id}] worst Δpct case: ${c.worstPct}`);
  for (const n of c.notes) lines.push(`- [${c.id}] ${n}`);
}
lines.push('- Reference z: WHO LMS at the integer day; restricted LMS for |z|>3 applied to weight-for-age only (WHO Anthro R package: wfa uses compute_zscore_adjusted, length/height and head circumference use plain compute_zscore; L = 1 for those, so their LMS is already normal).');
lines.push('- Product decisions, not scored: lying length vs standing height when the measurement position differs from the age convention (WHO Anthro adds/subtracts 0.7 cm), and whether to stop applying corrected age after 24 months chronological.');
lines.push('', `Elapsed ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(lines.join('\n'));

if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({
    generatedAt: new Date().toISOString(), refDir, whoFiles: WHO_FILES, tolerance: TOL_Z,
    checks: checks.map(({ notes, ...c }) => ({ ...c, notes })), perMetric, cutoff, cases: caseLog
  }, null, 1));
  console.error(`wrote ${jsonOut}`);
}
process.exit(checks.some((c) => c.status === 'FAIL') ? 1 : 0);
