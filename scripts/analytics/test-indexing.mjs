#!/usr/bin/env node
// Offline check of the Indexing report section: fixture run for "today" + synthetic prior snapshots (fixtures/history/spec.json).
// Usage: node scripts/analytics/test-indexing.mjs   (exit 1 on failure; temp files in the OS temp dir)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isLegal, analyze } from './lib/indexing.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'https://www.raffyparenting.com/';
const fx = path.join(here, 'fixtures');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't025-idx-'));
const cur = path.join(tmp, '2026-10-26');
const node = (script, args) => spawnSync(process.execPath, [path.join(here, script), ...args], { encoding: 'utf8' });

for (const u of ['en/privacy.html', 'es/privacidad.html', 'fr/conditions.html', 'pt/exclusao-dados.html', 'fr/politique-editoriale.html', 'pt/contato.html', 'en/about.html', 'es/sobre.html', 'pt/sobre.html', 'fr/a-propos.html']) assert(isLegal(ORIGIN + u), u);
for (const u of ['en/', 'en/articles/', 'fr/articles/routine-quotidienne-nouveau-ne.html']) assert(!isLegal(ORIGIN + u), u);

let r = node('all.mjs', ['--fixtures', fx, '--out', cur, '--no-submit']);
assert.equal(r.status, 0, r.stdout + r.stderr);
const base = JSON.parse(fs.readFileSync(path.join(cur, 'index.json'), 'utf8'));
const spec = JSON.parse(fs.readFileSync(path.join(fx, 'history', 'spec.json'), 'utf8'));
for (const [d, out] of Object.entries(spec).filter(([d]) => /^\d{4}-/.test(d))) {
  fs.mkdirSync(path.join(tmp, d));
  const results = base.results.map((x) => ({ ...x, verdict: out.some((o) => x.url === ORIGIN + o) ? 'NEUTRAL' : 'PASS', coverageState: 'x' }));
  fs.writeFileSync(path.join(tmp, d, 'index.json'), JSON.stringify({ results }));
}
fs.copyFileSync(path.join(fx, 'history', 'site-audit.json'), path.join(cur, 'site-audit.json'));

// fr routine + es percentiles are out in both priors and now (>=14 days) -> listed; pt planejador was PASS on 10-19 -> newly, not listed.
const priors = ['2026-10-12', '2026-10-19'].map((d) => ({ date: d, idx: JSON.parse(fs.readFileSync(path.join(tmp, d, 'index.json'), 'utf8')) }));
const a = analyze({ date: '2026-10-26', idx: base }, priors);
const short = (u) => u.replace(ORIGIN, '');
assert.deepEqual(a.long.map((l) => short(l.url)).sort(), ['es/articulos/percentiles-peso-talla-bebe.html', 'fr/articles/routine-quotidienne-nouveau-ne.html']);
assert.deepEqual(a.newly.map(short).sort(), ['pt/artigos/marcos-desenvolvimento-primeiro-ano-bebe.html', 'pt/ferramentas/planejador-cardapio-semanal-12-23-meses.html']);
assert.equal(a.trend.length, 3);
// One prior only (7 days of evidence) is not enough.
assert.equal(analyze({ date: '2026-10-26', idx: base }, priors.slice(1)).long.length, 0);

r = node('report.mjs', ['--dir', cur]);
assert.equal(r.status, 0, r.stdout + r.stderr);
const md = fs.readFileSync(path.join(cur, 'report.md'), 'utf8');
for (const needle of ['**Indexed trend**', '| 2026-10-12 |', '| 2026-10-26 |', 'Target pages (excluding legal/trust)', '**Newly non-indexed**',
  '/pt/artigos/marcos-desenvolvimento-primeiro-ano-bebe.html', '**Non-indexed ≥2 weeks**', '4 clicks from /fr/, 1 internal link', 'Discovered - currently not indexed']) {
  assert(md.includes(needle), `report.md lacks: ${needle}`);
}
console.log(md.slice(md.indexOf('## Indexing')));
console.log('test-indexing: ok');
fs.rmSync(tmp, { recursive: true, force: true });
