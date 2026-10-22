#!/usr/bin/env node
// Builds report.md from analytics snapshot files (gsc.json, index.json, mixpanel.json).
// Usage: node scripts/analytics/report.mjs [--dir <snapshotDir>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SNAP_ROOT = path.join(ROOT, '.lead', 'analytics');
const LOCALES = ['en', 'es', 'fr', 'pt', 'other'];

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

function datedDirs() {
  try {
    return fs.readdirSync(SNAP_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(d.name))
      .map((d) => d.name).sort();
  } catch { return []; }
}

let dir = argVal('--dir');
let prevDate = null;
const dated = datedDirs();
if (dir) {
  dir = path.resolve(dir);
  const name = path.basename(dir);
  const before = dated.filter((d) => d < name);
  prevDate = before.length ? before[before.length - 1] : null;
} else {
  if (!dated.length) {
    console.error(`No snapshot directory found in ${SNAP_ROOT}. Run scripts/analytics/all.mjs first.`);
    process.exit(1);
  }
  dir = path.join(SNAP_ROOT, dated[dated.length - 1]);
  prevDate = dated.length > 1 ? dated[dated.length - 2] : null;
}
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`Snapshot directory not found: ${dir}`);
  process.exit(1);
}

function load(file) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); } catch { return null; }
}
const gsc = load('gsc.json');
const idx = load('index.json');
const mp = load('mixpanel.json');
const na = (f) => `_Not available (${f} missing)_`;

// ---------- formatting helpers ----------
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const int = (v) => Math.round(num(v)).toLocaleString('en-US');
const pct = (v, d = 1) => `${(num(v) * 100).toFixed(d)}%`;
const pos = (v) => num(v).toFixed(1);
const delta = (cur, prev) => {
  cur = num(cur); prev = num(prev);
  if (prev === 0) return cur === 0 ? '0%' : 'new';
  const d = ((cur - prev) / prev) * 100;
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`;
};
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (head, rows) => rows.length
  ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n')
  : '_No data._';
const pagePath = (p) => { try { const u = new URL(p); return u.pathname + u.search; } catch { return String(p ?? ''); } };
const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ---------- GSC ----------
const arr = (v) => (Array.isArray(v) ? v : []);
function gscPages(win) {
  if (!win) return [];
  if (Array.isArray(win.pages) && win.pages.length) return win.pages;
  // fallback: sum rows by page
  const m = new Map();
  for (const r of arr(win.rows)) {
    const e = m.get(r.page) || { page: r.page, locale: r.locale, clicks: 0, impressions: 0, posW: 0 };
    e.clicks += num(r.clicks); e.impressions += num(r.impressions); e.posW += num(r.position) * num(r.impressions);
    m.set(r.page, e);
  }
  return [...m.values()].map((e) => ({
    page: e.page, locale: e.locale, clicks: e.clicks, impressions: e.impressions,
    ctr: e.impressions ? e.clicks / e.impressions : 0, position: e.impressions ? e.posW / e.impressions : 0,
  }));
}
function localeTotals(pages) {
  const t = {};
  for (const l of [...LOCALES, 'all']) t[l] = { clicks: 0, impressions: 0, posW: 0 };
  for (const p of pages) {
    const l = LOCALES.includes(p.locale) ? p.locale : 'other';
    for (const k of [l, 'all']) {
      t[k].clicks += num(p.clicks); t[k].impressions += num(p.impressions);
      t[k].posW += num(p.position) * num(p.impressions);
    }
  }
  return t;
}
function aggQueries(win) {
  const m = new Map();
  for (const r of arr(win?.rows)) {
    const key = `${r.query}\u0000${r.locale}`;
    const e = m.get(key) || { query: r.query, locale: r.locale, clicks: 0, impressions: 0, posW: 0 };
    e.clicks += num(r.clicks); e.impressions += num(r.impressions); e.posW += num(r.position) * num(r.impressions);
    m.set(key, e);
  }
  for (const e of m.values()) {
    e.ctr = e.impressions ? e.clicks / e.impressions : 0;
    e.position = e.impressions ? e.posW / e.impressions : 0;
  }
  return m;
}

function sectionTotals() {
  const cur = localeTotals(gscPages(gsc.current)); const prev = localeTotals(gscPages(gsc.previous));
  const rows = [...LOCALES, 'all'].map((l) => {
    const c = cur[l]; const p = prev[l];
    return [l, int(c.clicks), int(c.impressions), c.impressions ? pct(c.clicks / c.impressions, 2) : '0.00%',
      c.impressions ? pos(c.posW / c.impressions) : '-', delta(c.clicks, p.clicks), delta(c.impressions, p.impressions)];
  });
  return table(['Locale', 'Clicks', 'Impressions', 'CTR', 'Avg pos', 'Δ clicks', 'Δ impr.'], rows);
}
function sectionTop() {
  const rows = [...aggQueries(gsc.current).values()]
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 20)
    .map((q) => [q.query, q.locale, int(q.clicks), int(q.impressions), pct(q.ctr, 2), pos(q.position)]);
  return table(['Query', 'Locale', 'Clicks', 'Impressions', 'CTR', 'Pos'], rows);
}
function sectionRising() {
  const cur = aggQueries(gsc.current); const prev = aggQueries(gsc.previous);
  const out = [];
  for (const [k, c] of cur) {
    const p = prev.get(k)?.impressions || 0;
    if (c.impressions >= 20 && (p === 0 || c.impressions >= p * 1.5)) out.push({ c, p, gain: c.impressions - p });
  }
  out.sort((a, b) => b.gain - a.gain);
  return table(['Query', 'Locale', 'Impr. prev → current', 'Δ', 'Clicks', 'Pos'],
    out.slice(0, 20).map(({ c, p }) => [c.query, c.locale, `${int(p)} → ${int(c.impressions)}`, delta(c.impressions, p), int(c.clicks), pos(c.position)]));
}
function sectionLowCtr() {
  const pages = gscPages(gsc.current);
  const med = {};
  for (const l of LOCALES) med[l] = median(pages.filter((p) => (p.locale || 'other') === l && num(p.impressions) >= 1).map((p) => num(p.ctr)));
  const rows = pages
    .filter((p) => { const l = LOCALES.includes(p.locale) ? p.locale : 'other'; return num(p.impressions) >= 100 && num(p.ctr) < med[l] / 2; })
    .sort((a, b) => num(b.impressions) - num(a.impressions)).slice(0, 25)
    .map((p) => { const l = LOCALES.includes(p.locale) ? p.locale : 'other'; return [pagePath(p.page), p.locale, int(p.impressions), pct(p.ctr, 2), pct(med[l], 2), pos(p.position)]; });
  return table(['Page', 'Locale', 'Impressions', 'CTR', 'Locale median CTR', 'Pos'], rows);
}

// ---------- Mixpanel ----------
function sectionMixpanel() {
  const c = mp.current || {}; const p = mp.previous || {};
  const sum = (win, k) => arr(win.pages).reduce((a, x) => a + num(x[k]), 0);
  const topCta = (x) => {
    const e = Object.entries(x.downloadsByCta || {}).filter(([, n]) => num(n) > 0).sort((a, b) => num(b[1]) - num(a[1]))[0];
    return e ? `${e[0]} (${int(e[1])})` : '-';
  };
  const rows = [...arr(c.pages)].sort((a, b) => num(b.pageViews) - num(a.pageViews)).slice(0, 25)
    .map((x) => [x.path, int(x.pageViews), int(x.downloads),
      x.conversion != null ? pct(x.conversion, 2) : (num(x.pageViews) ? pct(num(x.downloads) / num(x.pageViews), 2) : '0.00%'), topCta(x)]);
  const cv = sum(c, 'pageViews'); const cd = sum(c, 'downloads'); const pv = sum(p, 'pageViews'); const pd = sum(p, 'downloads');
  const tot = table(['Metric', 'Current', 'Previous', 'Δ'], [
    ['Page views', int(cv), int(pv), delta(cv, pv)],
    ['Downloads', int(cd), int(pd), delta(cd, pd)],
    ['Conversion', cv ? pct(cd / cv, 2) : '0.00%', pv ? pct(pd / pv, 2) : '0.00%', delta(cv ? cd / cv : 0, pv ? pd / pv : 0)],
  ]);
  const ai = (o) => o && typeof o === 'object' ? o : {};
  const sources = [...new Set([...Object.keys(ai(c.aiReferrals)), ...Object.keys(ai(p.aiReferrals))])];
  const aiT = sources.length
    ? table(['AI source', 'Current', 'Previous', 'Δ'], sources.sort((a, b) => num(ai(c.aiReferrals)[b]) - num(ai(c.aiReferrals)[a]))
      .map((s) => [s, int(ai(c.aiReferrals)[s]), int(ai(p.aiReferrals)[s]), delta(ai(c.aiReferrals)[s], ai(p.aiReferrals)[s])]))
    : '_No AI referrals recorded._';
  return [table(['Page', 'Views', 'Downloads', 'Conversion', 'Top CTA'], rows), '', '**Totals**', '', tot, '', '**AI referrals**', '', aiT].join('\n');
}

// ---------- Indexing ----------
function sectionIndex() {
  const s = idx.summary || {};
  const sub = idx.sitemapSubmitted;
  const subTxt = sub === true ? 'yes' : sub === 'skipped' ? 'skipped' : 'no (resubmit manually in Search Console)';
  const lines = [
    `- Total checked: ${int(s.total)} | Indexed: ${int(s.indexed)} | Not indexed: ${int(s.notIndexed)} | Errors: ${int(s.errors)}`,
    `- Sitemap resubmitted: ${subTxt}${idx.sitemapUrl ? ` (${idx.sitemapUrl})` : ''}`,
    '',
  ];
  const byUrl = new Map(arr(idx.results).map((r) => [r.url, r]));
  const need = arr(idx.needsManualRequest);
  if (!need.length) lines.push('_No URLs need a manual indexing request._');
  else lines.push('**Needs manual "Request indexing" in Search Console**', '',
    table(['URL', 'Coverage state'], need.map((u) => [u, byUrl.get(u)?.coverageState || byUrl.get(u)?.error || '-'])));
  return lines.join('\n');
}

// ---------- Assemble ----------
const range = gsc?.range || mp?.range || idx?.range || {};
const fmtR = (r) => (Array.isArray(r) ? `${r[0]} → ${r[1]}` : 'n/a');
const sources = [['gsc.json', gsc], ['index.json', idx], ['mixpanel.json', mp]]
  .map(([f, v]) => `${f} ${v ? 'yes' : 'no'}`).join(', ');
const date = path.basename(dir);
const safe = (fn, file, data) => {
  if (!data) return na(file);
  try { return fn(); } catch (e) { return `_Error building section: ${e.message}_`; }
};

const md = [
  `# Raffy analytics report - ${date}`,
  '',
  `- Current window: ${fmtR(range.current)}`,
  `- Previous window: ${fmtR(range.previous)}`,
  `- Generated: ${gsc?.generatedAt || mp?.generatedAt || idx?.generatedAt || 'n/a'}`,
  `- Data sources: ${sources}`,
  `- Previous snapshot: ${prevDate || 'none'}`,
  '',
  '## Totals by locale', '', safe(sectionTotals, 'gsc.json', gsc), '',
  '## Top 20 queries', '', safe(sectionTop, 'gsc.json', gsc), '',
  '## Rising queries', '', safe(sectionRising, 'gsc.json', gsc), '',
  '## High impressions, low CTR pages', '', safe(sectionLowCtr, 'gsc.json', gsc), '',
  '## Page → download conversion', '', safe(sectionMixpanel, 'mixpanel.json', mp), '',
  '## Indexing', '', safe(sectionIndex, 'index.json', idx), '',
].join('\n');

const out = path.join(dir, 'report.md');
fs.writeFileSync(out, md);
console.log(out);
