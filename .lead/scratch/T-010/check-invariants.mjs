#!/usr/bin/env node
// T-010 redesign guard: compares every page with its version on a base git ref.
// Usage: node check-invariants.mjs [--base main] [--head WORKTREE|<git-ref>] [--head-dir <dir>]
//        [--verbose|--new-strings] [paths or dirs...]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const PLAY = 'https://play.google.com/store/apps/details?id=com.gurrulabs.raffy';

// ---------- args ----------
const argv = process.argv.slice(2);
let base = 'main', head = 'WORKTREE', headDir = null, verbose = false;
const inputs = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--base') base = argv[++i];
  else if (a === '--head') head = argv[++i];
  else if (a === '--head-dir') headDir = path.resolve(argv[++i]);
  else if (a === '--verbose' || a === '--new-strings') verbose = true;
  else if (a.startsWith('--')) { console.error(`unknown option ${a}`); process.exit(2); }
  else inputs.push(a);
}

// ---------- file access ----------
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
const readBase = (p) => { try { return git(['show', `${base}:${p}`]); } catch { return null; } };
function readHead(p) {
  if (head === 'WORKTREE') {
    const f = path.join(headDir || ROOT, p);
    return existsSync(f) ? readFileSync(f, 'utf8') : null;
  }
  try { return git(['show', `${head}:${p}`]); } catch { return null; }
}
const isPage = (p) => /\.html$/.test(p) && (/^(en|es|fr|pt)\//.test(p) || p === 'index.html' || p === '404.html');
function walk(dir, out) {
  for (const n of readdirSync(dir)) {
    if (n === '.git' || n === 'node_modules' || n === '.lead') continue;
    const f = path.join(dir, n);
    const st = statSync(f);
    if (st.isDirectory()) walk(f, out); else out.push(f);
  }
}
const lsTree = (ref) => { try { return git(['ls-tree', '-r', '--name-only', ref]).split('\n').filter(Boolean); } catch { return []; } };
function headFiles() {
  if (head !== 'WORKTREE') return lsTree(head);
  const r = headDir || ROOT, out = [];
  walk(r, out);
  return out.map((f) => path.relative(r, f).split(path.sep).join('/'));
}

let pages;
if (inputs.length) {
  pages = new Set();
  const all = new Set([...lsTree(base), ...headFiles()].filter(isPage));
  for (const inp of inputs) {
    let rel = path.relative(ROOT, path.resolve(inp)).split(path.sep).join('/');
    if (rel === '') rel = '.';
    const hits = [...all].filter((p) => p === rel || p.startsWith(rel.replace(/\/$/, '') + '/') || rel === '.');
    if (!hits.length) { if (/\.html$/.test(rel)) pages.add(rel); else console.error(`no pages match ${inp}`); }
    hits.forEach((h) => pages.add(h));
  }
  pages = [...pages].sort();
} else {
  pages = [...new Set([...lsTree(base), ...headFiles()].filter(isPage))].sort();
}

// ---------- parsing ----------
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', copy: '©', reg: '®', middot: '·', bull: '•', laquo: '«', raquo: '»', euro: '€', deg: '°', times: '×', trade: '™', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(n); } catch { return m; }
    }
    return Object.prototype.hasOwnProperty.call(NAMED, e) ? NAMED[e] : (NAMED[e.toLowerCase()] ?? m);
  });
}
const norm = (s) => decode(s).replace(/[\s ​]+/g, ' ').trim();
function attrs(tagSrc) {
  const out = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  const inner = tagSrc.replace(/^<\s*[^\s>\/]+/, '');
  let m;
  while ((m = re.exec(inner))) {
    const k = m[1].toLowerCase();
    if (!(k in out)) out[k] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}
const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi'))].map((m) => m[0]);
const stripComments = (h) => h.replace(/<!--[\s\S]*?-->/g, '');
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

function analyse(html) {
  const noc = stripComments(html);
  const headM = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(noc);
  const headHtml = headM ? headM[1] : '';
  const rest = headM ? noc.slice(headM.index + headM[0].length) : noc;
  const r = {};
  const t = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(headHtml);
  r.title = t ? norm(t[1]) : null;
  const hl = /<html\b[^>]*>/i.exec(noc);
  r.lang = hl ? (attrs(hl[0]).lang ?? null) : null;
  const metas = tagsOf(headHtml, 'meta').map(attrs);
  const mval = (pred) => metas.filter(pred).map((m) => norm(m.content ?? ''));
  r.description = mval((m) => (m.name || '').toLowerCase() === 'description').join(' || ');
  r.robots = mval((m) => (m.name || '').toLowerCase() === 'robots').join(' || ');
  r.social = {};
  for (const m of metas) {
    const key = m.property || m.name;
    if (key && /^(og:|twitter:)/i.test(key)) (r.social[key.toLowerCase()] ??= []).push(norm(m.content ?? ''));
  }
  const links = tagsOf(headHtml, 'link').map(attrs);
  const rel = (m) => (m.rel || '').toLowerCase().split(/\s+/);
  r.canonical = links.filter((l) => rel(l).includes('canonical')).map((l) => l.href).sort().join(' || ');
  r.hreflang = links.filter((l) => rel(l).includes('alternate') && l.hreflang).map((l) => `${l.hreflang.toLowerCase()} => ${l.href}`).sort();
  r.jsonld = [...noc.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => /application\/ld\+json/i.test(m[1]))
    .map((m) => { try { return JSON.stringify(sortKeys(JSON.parse(m[2]))); } catch { return 'RAW:' + m[2].replace(/\s+/g, ' ').trim(); } })
    .sort();
  // body-level structures (anchors in whole doc, comments removed)
  const aTags = tagsOf(noc, 'a').map(attrs);
  r.hrefs = new Set(aTags.map((a) => a.href).filter((h) => h != null));
  r.ids = new Set([...noc.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)].map((m) => m[1] ?? m[2] ?? m[3]));
  r.play = aTags.filter((a) => (a.href || '').includes('id=com.gurrulabs.raffy') && /play\.google\.com/.test(a.href));
  r.cta = new Set(tagsOf(noc, '[a-z0-9]+').map(attrs).map((a) => a['data-cta-location']).filter((v) => v));
  // visible text
  let body = rest.replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  const foot = /<footer\b[^>]*class\s*=\s*["'][^"']*\bfooter\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i.exec(body);
  const footerHtml = foot ? foot[0] : '';
  if (foot) body = body.replace(foot[0], ' ');
  r.nodes = textNodes(body);
  r.footerNodes = textNodes(footerHtml);
  r.attrNodes = [];
  for (const m of body.matchAll(/<[a-z][^>]*>/gi)) {
    const a = attrs(m[0]);
    for (const k of ['alt', 'aria-label', 'title', 'placeholder']) if (a[k] && norm(a[k])) r.attrNodes.push(norm(a[k]));
  }
  return r;
}
function textNodes(html) {
  return html.split(/<[^>]*>/).map(norm).filter((s) => s && /[\p{L}\p{N}]/u.test(s));
}
const squash = (s) => s.replace(/\s+/g, '');
function makeHaystack(nodes) { const full = nodes.join(' '); return { full, sq: squash(full) }; }
const contains = (h, n) => h.full.includes(n) || h.sq.includes(squash(n));

// ---------- compare ----------
const eqJSON = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clip = (s, n = 90) => { s = String(s); return s.length > n ? s.slice(0, n) + '...' : s; };
let nPass = 0, nFail = 0, nWarn = 0, totalNew = 0;
const newReport = [];
const t0 = Date.now();

for (const p of pages) {
  const bHtml = readBase(p), hHtml = readHead(p);
  const fails = [], warns = [];
  if (bHtml == null && hHtml == null) continue;
  if (hHtml == null) { fails.push('page missing in head'); }
  else if (bHtml == null) { warns.push('new page (missing in base): nothing to compare'); }
  else {
    const B = analyse(bHtml), H = analyse(hHtml);
    const same = (label, a, b) => { if (!eqJSON(a, b)) fails.push(`${label} changed: base=${clip(JSON.stringify(a))} head=${clip(JSON.stringify(b))}`); };
    same('<title>', B.title, H.title);
    same('<html lang>', B.lang, H.lang);
    same('meta description', B.description, H.description);
    same('meta robots', B.robots, H.robots);
    same('canonical', B.canonical, H.canonical);
    same('hreflang alternates', B.hreflang, H.hreflang);
    for (const k of new Set([...Object.keys(B.social), ...Object.keys(H.social)])) same(`meta ${k}`, B.social[k] ?? null, H.social[k] ?? null);
    if (!eqJSON(B.jsonld, H.jsonld)) fails.push(`JSON-LD changed (base ${B.jsonld.length} blocks, head ${H.jsonld.length}); first diff: ${clip(B.jsonld.find((x) => !H.jsonld.includes(x)) ?? '(only added in head: ' + clip(H.jsonld.find((x) => !B.jsonld.includes(x)) ?? '') + ')')}`);
    // hrefs
    for (const h of B.hrefs) {
      if (H.hrefs.has(h)) continue;
      if (h.startsWith('#')) { if (!H.ids.has(h.slice(1))) warns.push(`fragment link ${h} gone and id missing in head`); else fails.push(`href ${h} missing in head`); }
      else fails.push(`href missing in head: ${h}`);
    }
    // play links
    if (H.play.length < B.play.length) fails.push(`Play Store links dropped: base ${B.play.length}, head ${H.play.length}`);
    for (const a of H.play) {
      if (a.href !== PLAY) warns.push(`Play link with non-canonical href: ${a.href}`);
      if (a['data-track-download'] !== 'true') fails.push(`Play link without data-track-download="true" (${a['data-cta-location'] || 'no cta'})`);
      if (!a['data-cta-location']?.trim()) fails.push('Play link without data-cta-location');
    }
    for (const c of B.cta) if (!H.cta.has(c)) fails.push(`data-cta-location "${c}" missing in head`);
    // text
    const hayH = makeHaystack(H.nodes), hayB = makeHaystack(B.nodes);
    const lost = [...new Set(B.nodes)].filter((n) => !contains(hayH, n));
    for (const n of lost) fails.push(`text removed/changed: "${clip(n, 140)}"`);
    const fHay = makeHaystack([...H.footerNodes, ...H.nodes]);
    const lostFoot = [...new Set(B.footerNodes)].filter((n) => !contains(fHay, n));
    for (const n of lostFoot) warns.push(`footer text changed: "${clip(n, 100)}"`);
    const attrHay = makeHaystack([...H.attrNodes, ...H.nodes, ...H.footerNodes]);
    for (const n of new Set(B.attrNodes)) if (!contains(attrHay, n)) warns.push(`alt/aria-label/title/placeholder changed: "${clip(n, 100)}"`);
    const fresh = [...new Set(H.nodes)].filter((n) => !contains(hayB, n));
    if (fresh.length) { totalNew += fresh.length; newReport.push([p, fresh]); }
  }
  const status = fails.length ? 'FAIL' : 'PASS';
  if (fails.length) nFail++; else nPass++;
  if (warns.length) nWarn++;
  const tail = !fails.length && warns.length ? ` (${warns.length} warn)` : '';
  console.log(`${status} ${p}${tail}`);
  for (const f of fails) console.log(`    FAIL ${f}`);
  for (const w of warns) console.log(`    WARN ${w}`);
}

console.log('\n--- new strings (in head, not in base) ---');
console.log(`${totalNew} new text nodes across ${newReport.length} pages${verbose ? '' : ' (use --verbose to list)'}`);
if (verbose) for (const [p, list] of newReport) { console.log(p); for (const n of list) console.log(`    + ${clip(n, 160)}`); }
console.log(`\nbase=${base} head=${head}${headDir ? ' (' + headDir + ')' : ''}  pages=${nPass + nFail}  PASS=${nPass}  FAIL=${nFail}  pages-with-warnings=${nWarn}  (${Date.now() - t0}ms)`);
process.exit(nFail ? 1 : 0);
