#!/usr/bin/env node
// Google Search Console snapshot: search analytics (+ optional URL inspection / sitemap resubmit).
// Usage: node scripts/analytics/gsc.mjs [--index] [--no-submit] [--fixtures <dir>] [--out <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, loadConfig, loadGscKey, dateWindows, snapshotDir, parseArgs } from './lib/common.mjs';
import { getAccessToken } from './lib/google-auth.mjs';

const args = parseArgs(process.argv.slice(2));
const LOCALES = new Set(['en', 'es', 'fr', 'pt']);
const ROW_LIMIT = 25000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fixturesDir = args.fixtures ? path.resolve(String(args.fixtures)) : null;
const readFixture = (name) => JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf8'));

class ApiError extends Error {
  constructor(status, message) { super(`HTTP ${status}: ${message}`); this.status = status; }
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON body */ }
  if (!res.ok) throw new ApiError(res.status, data.error?.message || text.slice(0, 200) || res.statusText);
  return data;
}

const localeOf = (page) => {
  try {
    const seg = new URL(page).pathname.split('/')[1];
    return LOCALES.has(seg) ? seg : 'other';
  } catch { return 'other'; }
};

async function queryAll(token, property, range, dimensions) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const out = [];
  for (let startRow = 0; ; startRow += ROW_LIMIT) {
    const data = await api(token, 'POST', url, {
      startDate: range[0], endDate: range[1], dimensions, rowLimit: ROW_LIMIT, startRow, dataState: 'final',
    });
    const rows = data.rows || [];
    out.push(...rows);
    if (rows.length < ROW_LIMIT) break;
  }
  return out;
}

const num = (n, d) => Number((n || 0).toFixed(d));
const mapRow = (r) => ({
  query: r.keys[0], page: r.keys[1], locale: localeOf(r.keys[1]),
  clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: num(r.ctr, 4), position: num(r.position, 2),
});
const mapPage = (r) => ({
  page: r.keys[0], locale: localeOf(r.keys[0]),
  clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: num(r.ctr, 4), position: num(r.position, 2),
});

function siteOrigin() {
  try {
    return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'seo.config.json'), 'utf8')).siteOrigin
      || 'https://www.raffyparenting.com';
  } catch { return 'https://www.raffyparenting.com'; }
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(REPO_ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function inspectUrl(token, property, url) {
  const endpoint = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
  const body = { inspectionUrl: url, siteUrl: property };
  try {
    return await api(token, 'POST', endpoint, body);
  } catch (e) {
    if (e.status === 429 || e.status >= 500) { await sleep(2000); return api(token, 'POST', endpoint, body); }
    throw e;
  }
}

function toInspectResult(url, resp) {
  const s = resp?.inspectionResult?.indexStatusResult || {};
  return {
    url, verdict: s.verdict ?? null, coverageState: s.coverageState ?? null,
    indexingState: s.indexingState ?? null, lastCrawlTime: s.lastCrawlTime ?? null,
    googleCanonical: s.googleCanonical ?? null,
  };
}

async function main() {
  let key = null; let property = 'sc-domain:raffyparenting.com'; let token = null;
  const submit = !args['no-submit'];
  if (!fixturesDir) {
    key = loadGscKey();
    property = loadConfig().gscProperty;
    if (!property) { console.error('config.json has no "gscProperty" (see docs/analytics.md#setup)'); process.exit(2); }
    token = await getAccessToken(key, `https://www.googleapis.com/auth/webmasters${submit ? '' : '.readonly'}`);
  }

  const range = dateWindows(new Date());
  const generatedAt = new Date().toISOString();
  const outDir = snapshotDir(args);

  const gsc = { generatedAt, property, range };
  for (const w of ['current', 'previous']) {
    let rows; let pages;
    if (fixturesDir) {
      rows = readFixture(`gsc-searchanalytics-${w}.json`).rows || [];
      pages = readFixture(`gsc-pages-${w}.json`).rows || [];
    } else {
      rows = await queryAll(token, property, range[w], ['query', 'page']);
      pages = await queryAll(token, property, range[w], ['page']);
    }
    gsc[w] = { rows: rows.map(mapRow), pages: pages.map(mapPage) };
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'gsc.json'), JSON.stringify(gsc, null, 2) + '\n');
  console.log(`gsc.json: ${gsc.current.rows.length} current rows, ${gsc.previous.rows.length} previous rows -> ${outDir}`);

  if (!args.index) return;

  const sitemapUrl = `${siteOrigin()}/sitemap.xml`;
  const urls = sitemapUrls();
  const fixture = fixturesDir ? readFixture('gsc-inspect.json') : null;
  const results = [];
  for (const url of urls) {
    try {
      let resp;
      if (fixture) resp = fixture[url] || fixture.default || {};
      else { resp = await inspectUrl(token, property, url); await sleep(200); }
      results.push(toInspectResult(url, resp));
    } catch (e) {
      results.push({ url, verdict: null, coverageState: null, indexingState: null, lastCrawlTime: null, googleCanonical: null, error: e.message });
    }
  }

  let sitemapSubmitted = 'skipped';
  if (submit && !fixturesDir) {
    try {
      await api(token, 'PUT', `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`);
      sitemapSubmitted = true;
    } catch (e) {
      sitemapSubmitted = false;
      if (e.status === 403) console.error('Sitemap resubmit not permitted (account is read-only): resubmit manually in Search Console');
      else console.error(`Sitemap resubmit failed: ${e.message}`);
    }
  }

  const indexed = results.filter((r) => r.verdict === 'PASS').length;
  const errors = results.filter((r) => r.error).length;
  const index = {
    generatedAt, property, sitemapUrl, sitemapSubmitted, results,
    summary: { total: results.length, indexed, notIndexed: results.length - indexed - errors, errors },
    needsManualRequest: results.filter((r) => r.verdict !== 'PASS').map((r) => r.url),
  };
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  console.log(`index.json: ${indexed}/${results.length} indexed, ${errors} errors, sitemap ${sitemapSubmitted}`);
}

main().catch((e) => {
  console.error(`GSC failed: ${e.message}`);
  process.exit(1);
});
