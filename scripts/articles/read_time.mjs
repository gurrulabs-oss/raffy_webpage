// Sync article read times (byline + cards) with the real word count. Usage: node read_time.mjs [--check] [--root <dir>]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARTICLE_DIRS = ['en/articles', 'es/articulos', 'fr/articles', 'pt/artigos', 'it/articoli', 'de/ratgeber'];
const LOCALES = ['en', 'es', 'fr', 'pt', 'it', 'de'];
const WPM = 200;
const EXCLUDE = ['toc-mobile', 'sources', 'appx', 'planner-bridge'];

// Index just past the close tag matching the open tag at `start` (same-name depth balance).
function endOfElement(html, start, name) {
  const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return html.length;
}

function removeWhere(html, openRe) {
  let out = '', pos = 0, m;
  openRe.lastIndex = 0;
  while ((m = openRe.exec(html))) {
    if (m.index < pos) continue;
    out += html.slice(pos, m.index);
    pos = endOfElement(html, m.index, m[1]);
    openRe.lastIndex = pos;
  }
  return out + html.slice(pos);
}

export function countWords(html) {
  const start = /<article\b[^>]*class="[^"]*\bprose\b[^"]*"[^>]*>/i.exec(html);
  if (!start) return null;
  let body = html.slice(start.index, endOfElement(html, start.index, 'article'));
  body = removeWhere(body.slice(start[0].length), /<(script|style)\b[^>]*>/gi);
  for (const c of EXCLUDE) {
    body = removeWhere(body, new RegExp(`<(\\w+)\\b[^>]*class="(?:[^"]*\\s)?${c}(?:\\s[^"]*)?"[^>]*>`, 'gi'));
  }
  const text = body.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0*39;|&apos;/g, "'");
  return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

export const minutesFor = (words) => Math.max(1, Math.ceil(words / WPM));

// Returns [newHtml, mismatches[{where, found, expected}]]. `minutes` maps basename -> minutes.
export function syncFile(html, ownName, minutes) {
  const issues = [];
  const fix = (where, found, expected) => { if (+found !== expected) issues.push({ where, found, expected }); return String(expected); };
  if (minutes[ownName] != null) {
    const n = minutes[ownName];
    html = html.replace(/(<span data-minutes=")(\d+)(">)(\d+)/, (_, a, attr, b, num) => {
      fix('byline data-minutes', attr, n); fix('byline text', num, n);
      return a + n + b + n;
    });
  }
  html = html.replace(/<div class="a-meta">[\s\S]*?<\/div>/g, (meta, offset, whole) => {
    let target = /href="(?:[^"]*\/)?([^"\/]+\.html)(?:#[^"]*)?"/.exec(meta)?.[1];
    if (!target) { // meta lives inside <a class="card a-card" href=...>: use the nearest preceding card opener
      const openers = [...whole.slice(0, offset).matchAll(/<a\b[^>]*a-card[^>]*href="(?:[^"]*\/)?([^"\/]+\.html)[^"]*"[^>]*>/g)];
      target = openers.at(-1)?.[1];
    }
    const n = minutes[target];
    if (n == null) return meta;
    return meta.replace(/<span>(\d+)( [^<]+)<\/span>/, (_, num, unit) => `<span>${fix(`card -> ${target}`, num, n)}${unit}</span>`);
  });
  return [html, issues];
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const ri = args.indexOf('--root');
  const root = ri >= 0 ? args[ri + 1] : join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const minutes = {};
  for (const d of ARTICLE_DIRS) {
    if (!existsSync(join(root, d))) continue;
    for (const f of readdirSync(join(root, d)).filter((f) => f.endsWith('.html') && f !== 'index.html')) {
      const words = countWords(readFileSync(join(root, d, f), 'utf8'));
      if (words == null) { console.warn(`skip (no article.prose): ${d}/${f}`); continue; }
      minutes[f] = minutesFor(words);
      console.log(`${d}/${f}: ${words} words -> ${minutes[f]} min`);
    }
  }
  let changed = 0, mismatches = 0;
  for (const l of LOCALES) {
    if (!existsSync(join(root, l))) continue;
    for (const file of walk(join(root, l))) {
      const src = readFileSync(file, 'utf8');
      const [out, issues] = syncFile(src, basename(file), minutes);
      const rel = file.slice(root.length + 1);
      for (const i of issues) console.log(`MISMATCH ${rel} [${i.where}]: found ${i.found}, expected ${i.expected}`);
      mismatches += issues.length;
      if (out !== src && !check) { writeFileSync(file, out); changed++; }
    }
  }
  console.log(check ? `${mismatches} mismatch(es)` : `${changed} file(s) changed`);
  if (check && mismatches) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
