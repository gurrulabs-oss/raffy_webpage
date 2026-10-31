#!/usr/bin/env node
// Self-check for rangeLevel() in tools/percentile-calculator.js (extracted like same-outputs.mjs does).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'tools/percentile-calculator.js'), 'utf8');
const start = src.indexOf('\nfunction rangeLevel(') + 1;
if (!start) { console.error('rangeLevel not found'); process.exit(1); }
const end = src.indexOf('\n}\n', start) + 3;
const ctx = vm.createContext({});
vm.runInContext(src.slice(start, end), ctx);
const W = 'weight', L = 'lengthHeight', H = 'headCircumference';
const cases = [
  [W, 2.2, 'firm'], [W, 2.3, 'soft'], [W, 2.4, 'soft'], [W, 2.9, 'soft'], [W, 3, null], [W, 97.1, 'soft'], [W, 99.6, 'soft'], [W, 99.7, 'firm'],
  [L, 0.3, 'firm'], [L, 0.4, 'soft'], [L, 0.5, 'soft'], [L, 99.7, 'firm'],
  [H, 2.9, 'firm'], [H, 3, null], [H, 97, null], [H, 97.1, 'firm'],
  [W, 50, null], [L, 50, null], [H, 50, null]
];
const bad = cases.filter(([t, p, e]) => vm.runInContext(`rangeLevel(${JSON.stringify(t)}, ${p})`, ctx) !== e);
bad.forEach(([t, p, e]) => console.error(`FAIL ${t} ${p}: expected ${e}`));
console.log(bad.length ? `${bad.length} failed` : `range-level: ${cases.length}/${cases.length} ok`);
process.exit(bad.length ? 1 : 0);
