#!/usr/bin/env node
// Runs gsc (with indexing), mixpanel, then the report.
// Usage: node scripts/analytics/all.mjs [--fixtures <dir>] [--out <dir>] [--no-submit]
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

const fixtures = val('--fixtures');
const noSubmit = argv.includes('--no-submit');
const today = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(val('--out') || path.join(ROOT, '.lead', 'analytics', today));

const fwd = [];
if (fixtures) fwd.push('--fixtures', fixtures);
fwd.push('--out', outDir);
if (noSubmit) fwd.push('--no-submit');

const run = (script, args) => spawnSync(process.execPath, [path.join(here, script), ...args], { stdio: 'inherit', cwd: ROOT }).status ?? 1;

const steps = [
  ['gsc (+index)', 'gsc.mjs', ['--index', ...fwd]],
  ['mixpanel', 'mixpanel.mjs', fwd.filter((a) => a !== '--no-submit' || false)],
];
const codes = [];
for (const [label, script, args] of steps) {
  const code = run(script, args);
  codes.push(code);
  console.log(`[${code === 0 ? 'ok' : 'FAIL ' + code}] ${label}`);
}

let first = codes.find((c) => c !== 0) ?? 0;
if (codes.every((c) => c !== 0)) {
  console.log('[skip] report (no source succeeded)');
  process.exit(codes.every((c) => c === 2) ? 2 : first);
}
const rc = run('report.mjs', ['--dir', outDir]);
console.log(`[${rc === 0 ? 'ok' : 'FAIL ' + rc}] report`);
if (!first) first = rc;
process.exit(first);
