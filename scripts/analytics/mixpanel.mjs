#!/usr/bin/env node
// Mixpanel raw-export aggregator for raffyparenting.com.
// Usage: node scripts/analytics/mixpanel.mjs [--fixtures <dir>] [--out <dir>]
// Exit codes: 0 ok, 1 API error, 2 missing credentials.
import fs from 'node:fs';
import path from 'node:path';
import { credentialsDir, dateWindows, snapshotDir, parseArgs } from './lib/common.mjs';

const PREFIX = 'Raffy Webpage - ';
const DOWNLOAD = PREFIX + 'Download Button Clicked';
const GT_SUBMIT = PREFIX + 'Growth Tool Submit Clicked';
const GT_RESULTS = PREFIX + 'Growth Tool Results Shown';
const LOCALES = new Set(['en', 'es', 'fr', 'pt']);

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
  return { pages: new Map(), visitors: new Set(), aiReferrals: {}, utmSources: {} };
}

function newPage(p) {
  const seg = p.split('/')[1];
  return {
    path: p, locale: LOCALES.has(seg) ? seg : 'other',
    pageViews: 0, visitors: new Set(), downloads: 0, downloadsByCta: {},
    growthToolSubmits: 0, growthToolResults: 0,
  };
}

function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }

function addEvent(win, ev) {
  const name = ev && ev.event;
  if (typeof name !== 'string' || !name.startsWith(PREFIX)) return;
  const props = ev.properties || {};
  const p = pathOf(props);
  if (!p) return;
  let page = win.pages.get(p);
  if (!page) { page = newPage(p); win.pages.set(p, page); }
  const id = props.distinct_id;
  if (name === DOWNLOAD) {
    page.downloads++;
    bump(page.downloadsByCta, props.cta_location || 'unknown');
  } else if (name === GT_SUBMIT) {
    page.growthToolSubmits++;
  } else if (name === GT_RESULTS) {
    page.growthToolResults++;
  } else {
    page.pageViews++;
    if (id != null) { page.visitors.add(id); win.visitors.add(id); }
    if (props.ai_referral === true || props.ai_referral === 'true') {
      bump(win.aiReferrals, props.ai_referrer_source || 'unknown');
    }
    if (props.utm_source) bump(win.utmSources, String(props.utm_source));
  }
}

function finalize(win) {
  const pages = [...win.pages.values()].map((p) => ({
    path: p.path, locale: p.locale, pageViews: p.pageViews, uniqueVisitors: p.visitors.size,
    downloads: p.downloads, downloadsByCta: p.downloadsByCta,
    conversion: p.pageViews > 0 ? p.downloads / p.pageViews : null,
    growthToolSubmits: p.growthToolSubmits, growthToolResults: p.growthToolResults,
  })).sort((a, b) => b.pageViews - a.pageViews || a.path.localeCompare(b.path));
  const sum = (k) => pages.reduce((s, p) => s + p[k], 0);
  const pageViews = sum('pageViews');
  const downloads = sum('downloads');
  return {
    totals: {
      pageViews, uniqueVisitors: win.visitors.size, downloads,
      conversion: pageViews > 0 ? downloads / pageViews : null,
      growthToolSubmits: sum('growthToolSubmits'), growthToolResults: sum('growthToolResults'),
    },
    pages, aiReferrals: win.aiReferrals, utmSources: win.utmSources,
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
