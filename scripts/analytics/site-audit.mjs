#!/usr/bin/env node
// Internal-link / indexability audit of every sitemap page, from local files (no network).
// Usage: node scripts/analytics/site-audit.mjs [--out <dir>] | --self-test
// Writes <dir>/site-audit.json; pages[].url is the exact sitemap URL (join key for report.mjs).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, parseArgs } from './lib/common.mjs';

const HOMES = { en: '/en/', es: '/es/', fr: '/fr/', pt: '/pt/', it: '/it/' };
const DUP_THRESHOLD = 0.6; // Jaccard of 5-word shingles; templated hubs/tools sit well below this
const LOW_INBOUND = 2;
const DEEP = 3; // clicks from own-locale home

// Internal absolute path for an href, or null for external/non-page links. /x/index.html -> /x/.
export function toPath(href, pageUrl, origin) {
  if (!href || /^(mailto|tel|javascript|data):/i.test(href) || href.startsWith('#')) return null;
  let u;
  try { u = new URL(href.replace(/&amp;/g, '&'), pageUrl); } catch { return null; }
  if (u.hostname.replace(/^www\./, '') !== new URL(origin).hostname.replace(/^www\./, '')) return null;
  return u.pathname.replace(/\/index\.html$/, '/');
}

// <a href> targets with whether they sit inside the generated footer.
export function extractLinks(html, pageUrl, origin) {
  const footerStart = html.search(/<footer class="container footer"/);
  const footerEnd = footerStart < 0 ? -1 : html.indexOf('</footer>', footerStart);
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*?\bhref="([^"]*)"/gi)) {
    const p = toPath(m[1], pageUrl, origin);
    if (p) out.push({ path: p, inFooter: footerStart >= 0 && m.index > footerStart && m.index < footerEnd, raw: m[1] });
  }
  return out;
}

// Visible main-content words: <main> if present, minus scripts/svg/nav/forms.
export function mainText(html) {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || html.match(/<body\b[\s\S]*<\/body>/i)?.[0] || html;
  return main
    .replace(/<(script|style|svg|nav|noscript|select|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function shingles(words, k = 5) {
  const s = new Set();
  for (let i = 0; i + k <= words.length; i++) s.add(words.slice(i, i + k).join(' '));
  return s;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

const localeOf = (p) => p.split('/')[1];

// urls: sitemap page URLs; read(url) -> html or null; groups: manifest pages [{id,type,routes}].
export function audit(urls, read, groups, origin) {
  const pathOf = (u) => new URL(u).pathname;
  const byPath = new Map(urls.map((u) => [pathOf(u), u]));
  const groupOf = new Map();
  for (const g of groups) for (const r of Object.values(g.routes)) groupOf.set(r, g);

  const info = new Map();
  for (const url of urls) {
    const html = read(url);
    const p = pathOf(url);
    info.set(p, {
      html,
      links: html ? extractLinks(html, url, origin) : [],
      words: html ? mainText(html) : [],
    });
    info.get(p).sh = shingles(info.get(p).words);
  }

  // inbound[target] = Map(linkingPath -> true if every link from that page is in the footer)
  const inbound = new Map([...byPath.keys()].map((p) => [p, new Map()]));
  const edges = new Map();
  for (const [p, { links }] of info) {
    const out = new Set();
    for (const l of links) {
      if (!byPath.has(l.path) || l.path === p) continue;
      out.add(l.path);
      const m = inbound.get(l.path);
      m.set(p, (m.get(p) ?? true) && l.inFooter);
    }
    edges.set(p, out);
  }

  const bfs = (start) => {
    const d = new Map([[start, 0]]);
    const q = [start];
    while (q.length) {
      const cur = q.shift();
      for (const n of edges.get(cur) || []) if (!d.has(n)) { d.set(n, d.get(cur) + 1); q.push(n); }
    }
    return d;
  };
  const depthFrom = Object.fromEntries(Object.entries(HOMES).filter(([, h]) => byPath.has(h)).map(([l, h]) => [l, bfs(h)]));

  const pages = [];
  for (const [p, url] of byPath) {
    const { html, links, sh, words } = info.get(p);
    const locale = localeOf(p);
    const flags = [];
    const g = groupOf.get(p);
    if (!html) flags.push('missing-file');
    else {
      const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
      if (canonical !== url) flags.push(canonical ? 'canonical-mismatch' : 'canonical-missing');
      if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) flags.push('noindex');
      const alts = new Set([...html.matchAll(/<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="([^"]+)"/gi)].map((m) => m[1]));
      if (!g) flags.push('not-in-manifest');
      else if (!alts.size) flags.push('hreflang-missing');
      else if (Object.values(g.routes).some((r) => !alts.has(origin + r))) flags.push('hreflang-incomplete');
      if (links.some((l) => l.path.startsWith('/articles/'))) flags.push('legacy-stub-link');
    }
    const from = inbound.get(p);
    const inboundFrom = [...from.keys()].sort();
    const footerOnly = from.size > 0 && [...from.values()].every(Boolean);
    const own = depthFrom[locale]?.get(p) ?? null;
    const anyD = Object.values(depthFrom).map((d) => d.get(p)).filter((x) => x != null);
    const depthAnyHome = anyD.length ? Math.min(...anyD) : null;

    let maxSimilarity = 0; let mostSimilar = null;
    for (const [q, o] of info) {
      if (q === p || localeOf(q) !== locale) continue;
      const s = jaccard(sh, o.sh);
      if (s > maxSimilarity) { maxSimilarity = s; mostSimilar = byPath.get(q); }
    }
    maxSimilarity = Number(maxSimilarity.toFixed(3));

    if (own == null && p !== HOMES[locale]) flags.push('unreachable-from-home');
    else if (own >= DEEP) flags.push('deep');
    if (!from.size) flags.push('orphan');
    else if (from.size <= LOW_INBOUND) flags.push('low-inbound');
    if (footerOnly) flags.push('footer-only');
    if (maxSimilarity >= DUP_THRESHOLD) flags.push('near-duplicate');

    const causes = [];
    if (flags.includes('noindex')) causes.push('noindex');
    if (flags.includes('canonical-mismatch')) causes.push('canonical points elsewhere');
    if (flags.includes('unreachable-from-home')) causes.push('not reachable from own home');
    else if (flags.includes('deep')) causes.push(`depth ${own} from home`);
    if (flags.includes('orphan')) causes.push('no inbound links');
    else if (flags.includes('low-inbound')) causes.push(`only ${from.size} inbound link${from.size > 1 ? 's' : ''}`);
    if (footerOnly) causes.push('linked only from footer');
    if (flags.includes('near-duplicate')) causes.push(`near-duplicate of ${new URL(mostSimilar).pathname} (${maxSimilarity})`);
    if (flags.includes('legacy-stub-link')) causes.push('legacy stub link');

    pages.push({
      url, locale, type: g?.type ?? null, file: p.endsWith('/') ? `${p.slice(1)}index.html` : p.slice(1),
      words: words.length, depthOwnHome: own, depthAnyHome, inbound: from.size, inboundFrom: inboundFrom.map((x) => byPath.get(x)),
      footerOnly, flags, maxSimilarity, mostSimilar, cause: causes.length ? causes.join('; ') : null,
    });
  }
  return pages;
}

function selfTest() {
  const o = 'https://www.example.org';
  assert.equal(toPath('../index.html', `${o}/en/articles/a.html`, o), '/en/');
  assert.equal(toPath('b.html#x', `${o}/en/articles/a.html`, o), '/en/articles/b.html');
  assert.equal(toPath('https://example.org/en/', `${o}/x`, o), '/en/');
  assert.equal(toPath('https://play.google.com/store', `${o}/en/`, o), null);
  assert.equal(toPath('mailto:a@b.c', `${o}/en/`, o), null);

  const text = (t) => `<p>${t} one two three four five six seven eight nine ten</p>`;
  const page = (body, footer = '') => `<html><head><link rel="canonical" href="X"></head><body><nav><a href="/en/">Home</a></nav><main>${body}</main><footer class="container footer">${footer}</footer></body></html>`;
  const html = {
    [`${o}/en/`]: page('<a href="articles/a.html">A</a><a href="articles/b.html">B</a>', '<a href="c.html">C</a>').replace('X', `${o}/en/`),
    [`${o}/en/articles/a.html`]: page(text('alpha') + '<a href="/articles/old.html">old</a>').replace('X', `${o}/en/articles/a.html`),
    [`${o}/en/articles/b.html`]: page(text('alpha')).replace('X', `${o}/en/articles/zzz.html`),
    [`${o}/en/c.html`]: page('<p>completely different words here for the trust page body text</p>').replace('X', `${o}/en/c.html`),
  };
  const links = extractLinks(html[`${o}/en/`], `${o}/en/`, o);
  assert.deepEqual(links.map((l) => [l.path, l.inFooter]), [['/en/', false], ['/en/articles/a.html', false], ['/en/articles/b.html', false], ['/en/c.html', true]]);
  assert.deepEqual(mainText('<main><p>Hola, b&eacute;b&eacute;!</p><svg><text>x</text></svg></main>'), ['hola', 'b', 'b']);
  assert.equal(jaccard(shingles(mainText(text('a'))), shingles(mainText(text('a')))), 1);
  assert.equal(jaccard(shingles(mainText(text('a'))), shingles(mainText('<main><p>z y x w v u</p></main>'))), 0);

  const pages = Object.fromEntries(audit(Object.keys(html), (u) => html[u], [], o).map((p) => [new URL(p.url).pathname, p]));
  assert.equal(pages['/en/'].depthOwnHome, 0);
  assert.equal(pages['/en/articles/a.html'].depthOwnHome, 1);
  assert.deepEqual(pages['/en/articles/a.html'].inboundFrom, [`${o}/en/`]);
  assert.ok(pages['/en/articles/a.html'].flags.includes('legacy-stub-link'));
  assert.ok(pages['/en/articles/a.html'].flags.includes('near-duplicate'));
  assert.equal(pages['/en/articles/a.html'].mostSimilar, `${o}/en/articles/b.html`);
  assert.ok(pages['/en/articles/b.html'].flags.includes('canonical-mismatch'));
  assert.equal(pages['/en/c.html'].footerOnly, true);
  assert.ok(pages['/en/c.html'].cause.includes('linked only from footer'));
  console.log('site-audit self-test: ok');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args['self-test']) return selfTest();
  const origin = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'seo.config.json'), 'utf8')).siteOrigin;
  const groups = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'seo', 'articles.manifest.json'), 'utf8')).pages;
  const xml = fs.readFileSync(path.join(REPO_ROOT, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => /(\.html|\/)$/.test(u));
  const read = (u) => {
    const p = new URL(u).pathname;
    const f = path.join(REPO_ROOT, p.endsWith('/') ? `${p}index.html` : p);
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  };
  const pages = audit(urls, read, groups, origin);
  const result = { generatedAt: new Date().toISOString(), pages };

  if (args.out) {
    const dir = path.resolve(String(args.out));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'site-audit.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(`site-audit.json: ${pages.length} pages -> ${dir}`);
  }
  const count = {};
  for (const p of pages) for (const f of p.flags) count[f] = (count[f] || 0) + 1;
  console.log(`${pages.length} pages; flags: ${JSON.stringify(count)}`);
  for (const p of pages.filter((x) => x.cause)) console.log(`${new URL(p.url).pathname}  d=${p.depthOwnHome} in=${p.inbound}  ${p.cause}`);
}

main();
