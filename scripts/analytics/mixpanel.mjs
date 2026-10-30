#!/usr/bin/env node
// Mixpanel raw-export aggregator for raffyparenting.com.
// Usage: node scripts/analytics/mixpanel.mjs [--fixtures <dir>] [--out <dir>]
// Exit codes: 0 ok, 1 API error, 2 missing credentials.
import fs from 'node:fs';
import path from 'node:path';
import { credentialsDir, dateWindows, snapshotDir, parseArgs } from './lib/common.mjs';

const PREFIX = 'Raffy Webpage - ';
const DOWNLOAD = PREFIX + 'Download Button Clicked';
// Click events that are neither downloads nor tool funnel steps; never counted as page views.
const NON_PAGE_VIEW_EVENTS = new Set([PREFIX + 'Meal Planner Link Clicked']);
const SUBMIT_SUFFIX = ' Submit Clicked';
const RESULTS_SUFFIX = ' Results Shown';
const LOCALES = new Set(['en', 'es', 'fr', 'pt', 'it']);

function loadCredentials() {
  const file = path.join(credentialsDir(), 'config.json');
  const fail = (msg) => {
    console.error(`${msg} - see docs/analytics.md#setup`);
    process.exit(2);
  };
  if (!fs.existsSync(file)) fail(`Missing credentials file ${file}`);
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`Cannot parse ${file}: ${e.message}`);
  }
  const mp = cfg.mixpanel || {};
  for (const k of ['username', 'secret', 'projectId']) {
    if (!mp[k]) fail(`Missing field mixpanel.${k} in ${file}`);
  }
  return { username: mp.username, secret: mp.secret, projectId: String(mp.projectId), host: mp.host || 'eu' };
}

function pathOf(props) {
  const raw = props.path || props.$current_url || props.url;
  if (!raw || typeof raw !== 'string') return null;
  let p = raw;
  if (/^https?:\/\//i.test(p)) {
    try { p = new URL(p).pathname; } catch { return null; }
  }
  p = p.split('#')[0].split('?')[0];
  return p.startsWith('/') ? p : '/' + p;
}

function newWindow() {
  return { pages: new Map(), visitors: new Set(), aiReferrals: {}, utmSources: {}, toolEvents: [] };
}

function newPage(p) {
  const seg = p.split('/')[1];
  return {
    path: p, locale: LOCALES.has(seg) ? seg : 'other',
    pageViews: 0, visitors: new Set(), downloads: 0, downloadsByCta: {},
    toolSubmits: 0, toolResults: 0,
  };
}

function localeOf(props, p) {
  if (LOCALES.has(props.language)) return props.language;
  const seg = p.split('/')[1];
  return LOCALES.has(seg) ? seg : 'other';
}

// Trailing-slash-insensitive path key (query/hash already stripped by pathOf).
function normPath(p) { return p.length > 1 ? p.replace(/\/+$/, '') : p; }

function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }

function addEvent(win, ev) {
  const name = ev && ev.event;
  if (typeof name !== 'string' || !name.startsWith(PREFIX)) return;
  if (NON_PAGE_VIEW_EVENTS.has(name)) return;
  const props = ev.properties || {};
  const p = pathOf(props);
  if (!p) return;
  let page = win.pages.get(p);
  if (!page) { page = newPage(p); win.pages.set(p, page); }
  const id = props.distinct_id;
  const time = Number(props.time);
  const rest = name.slice(PREFIX.length);
  const isSubmit = rest.length > SUBMIT_SUFFIX.length && rest.endsWith(SUBMIT_SUFFIX);
  const isResults = rest.length > RESULTS_SUFFIX.length && rest.endsWith(RESULTS_SUFFIX);
  const tracked = id != null && Number.isFinite(time);
  const locale = localeOf(props, p);
  if (name === DOWNLOAD) {
    page.downloads++;
    bump(page.downloadsByCta, props.cta_location || 'unknown');
    if (tracked) win.toolEvents.push({ kind: 'download', tool: null, id, locale, path: normPath(p), time });
  } else if (isSubmit || isResults) {
    const suffix = isSubmit ? SUBMIT_SUFFIX : RESULTS_SUFFIX;
    if (isSubmit) page.toolSubmits++; else page.toolResults++;
    if (tracked) win.toolEvents.push({ kind: isSubmit ? 'submit' : 'results', tool: rest.slice(0, -suffix.length), id, locale, path: normPath(p), time });
  } else {
    page.pageViews++;
    if (id != null) { page.visitors.add(id); win.visitors.add(id); }
    if (props.ai_referral === true || props.ai_referral === 'true') {
      bump(win.aiReferrals, props.ai_referrer_source || 'unknown');
    }
    if (props.utm_source) bump(win.utmSources, String(props.utm_source));
  }
}

// Per tool x locale: distinct ids with Submit -> later Results (same path) -> later Download (same path).
// Export `time` is whole seconds and Submit/Results fire in the same handler, so ties count as "later".
function toolFunnel(events) {
  const byPath = new Map(); // key: tool|locale|id|path -> {submit, results[], }
  const downloads = new Map(); // key: id|path -> times
  for (const e of events) {
    if (e.kind === 'download') {
      const k = `${e.id}\u0000${e.path}`;
      if (!downloads.has(k)) downloads.set(k, []);
      downloads.get(k).push(e.time);
      continue;
    }
    const k = [e.tool, e.locale, e.id, e.path].join('\u0000');
    const r = byPath.get(k) || { tool: e.tool, locale: e.locale, id: e.id, path: e.path, submits: [], results: [] };
    (e.kind === 'submit' ? r.submits : r.results).push(e.time);
    byPath.set(k, r);
  }
  const groups = new Map(); // tool|locale -> {submit:Set, results:Set, download:Set}
  for (const r of byPath.values()) {
    if (!r.submits.length) continue;
    const g = groups.get(`${r.tool}\u0000${r.locale}`) || { tool: r.tool, locale: r.locale, submit: new Set(), results: new Set(), download: new Set() };
    groups.set(`${r.tool}\u0000${r.locale}`, g);
    g.submit.add(r.id);
    const tSubmit = Math.min(...r.submits);
    const laterResults = r.results.filter((t) => t >= tSubmit);
    if (!laterResults.length) continue;
    g.results.add(r.id);
    const tResults = Math.min(...laterResults);
    if ((downloads.get(`${r.id}\u0000${r.path}`) || []).some((t) => t >= tResults)) g.download.add(r.id);
  }
  return [...groups.values()]
    .map((g) => ({ tool: g.tool, locale: g.locale, submitted: g.submit.size, resultsShown: g.results.size, downloaded: g.download.size }))
    .sort((a, b) => b.submitted - a.submitted || a.tool.localeCompare(b.tool) || a.locale.localeCompare(b.locale));
}

function finalize(win) {
  const pages = [...win.pages.values()].map((p) => ({
    path: p.path, locale: p.locale, pageViews: p.pageViews, uniqueVisitors: p.visitors.size,
    downloads: p.downloads, downloadsByCta: p.downloadsByCta,
    conversion: p.pageViews > 0 ? p.downloads / p.pageViews : null,
    toolSubmits: p.toolSubmits, toolResults: p.toolResults,
  })).sort((a, b) => b.pageViews - a.pageViews || a.path.localeCompare(b.path));
  const sum = (k) => pages.reduce((s, p) => s + p[k], 0);
  const pageViews = sum('pageViews');
  const downloads = sum('downloads');
  return {
    totals: {
      pageViews, uniqueVisitors: win.visitors.size, downloads,
      conversion: pageViews > 0 ? downloads / pageViews : null,
      toolSubmits: sum('toolSubmits'), toolResults: sum('toolResults'),
    },
    pages, aiReferrals: win.aiReferrals, utmSources: win.utmSources, toolFunnel: toolFunnel(win.toolEvents),
  };
}

async function consumeLines(chunks, win) {
  const dec = new TextDecoder();
  let buf = '';
  const handle = (line) => {
    line = line.trim();
    if (!line) return;
    try { addEvent(win, JSON.parse(line)); } catch { /* skip malformed line */ }
  };
  for await (const chunk of chunks) {
    buf += typeof chunk === 'string' ? chunk : dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      handle(buf.slice(0, i));
      buf = buf.slice(i + 1);
    }
  }
  buf += dec.decode();
  handle(buf);
}

async function* webStream(body) {
  const reader = body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally { reader.releaseLock?.(); }
}

async function fetchWindow(creds, [from, to]) {
  const host = creds.host === 'us' ? 'data.mixpanel.com' : 'data-eu.mixpanel.com';
  const url = `https://${host}/api/2.0/export?project_id=${encodeURIComponent(creds.projectId)}&from_date=${from}&to_date=${to}`;
  const auth = Buffer.from(`${creds.username}:${creds.secret}`).toString('base64');
  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: 'text/plain' } });
  } catch (e) {
    console.error(`Mixpanel request failed: ${String(e.message).replaceAll(creds.secret, '***')}`);
    process.exit(1);
  }
  if (!res.ok) {
    const body = (await res.text()).replaceAll(creds.secret, '***').slice(0, 300);
    console.error(`Mixpanel API error ${res.status} for ${from}..${to}: ${body}`);
    process.exit(1);
  }
  const win = newWindow();
  await consumeLines(webStream(res.body), win);
  return finalize(win);
}

async function fixtureWindow(dir, name) {
  const file = path.join(dir, `mixpanel-export-${name}.ndjson`);
  if (!fs.existsSync(file)) {
    console.error(`Missing fixture file ${file}`);
    process.exit(1);
  }
  const win = newWindow();
  await consumeLines(fs.createReadStream(file, { encoding: 'utf8' }), win);
  return finalize(win);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date();
  const range = dateWindows(now);
  let creds = null;
  if (!args.fixtures) creds = loadCredentials();

  const current = args.fixtures ? await fixtureWindow(args.fixtures, 'current') : await fetchWindow(creds, range.current);
  const previous = args.fixtures ? await fixtureWindow(args.fixtures, 'previous') : await fetchWindow(creds, range.previous);

  const outDir = snapshotDir(args, now);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'mixpanel.json');
  const doc = {
    generatedAt: now.toISOString(),
    projectId: creds ? creds.projectId : null,
    range, current, previous,
  };
  fs.writeFileSync(outFile, JSON.stringify(doc, null, 2) + '\n');
  console.log(`Wrote ${outFile} (current: ${current.totals.pageViews} views, ${current.totals.downloads} downloads; previous: ${previous.totals.pageViews} views, ${previous.totals.downloads} downloads)`);
}

main().catch((e) => {
  console.error(`mixpanel.mjs failed: ${e.message}`);
  process.exit(1);
});
