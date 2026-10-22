// Shared helpers for analytics scripts (credentials, date windows, snapshot dir, args).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export function credentialsDir() {
  return process.env.RAFFY_ANALYTICS_DIR || path.join(os.homedir(), '.config', 'raffy-analytics');
}

function missing(file) {
  console.error(`Missing credentials file: ${file} (see docs/analytics.md#setup)`);
  process.exit(2);
}

function readCredential(name) {
  const file = path.join(credentialsDir(), name);
  if (!fs.existsSync(file)) missing(file);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    console.error(`Invalid JSON in credentials file: ${file} (see docs/analytics.md#setup)`);
    process.exit(2);
  }
}

export function loadConfig() {
  return readCredential('config.json');
}

export function loadGscKey() {
  return readCredential('gsc-service-account.json');
}

const iso = (d) => d.toISOString().slice(0, 10);

// current = 28 complete days ending 3 days ago (UTC); previous = the 28 days before.
export function dateWindows(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = 86400000;
  const end = new Date(today - 3 * day);
  const start = new Date(end - 27 * day);
  const pEnd = new Date(start - day);
  const pStart = new Date(pEnd - 27 * day);
  return { current: [iso(start), iso(end)], previous: [iso(pStart), iso(pEnd)] };
}

// Does not create the directory; callers mkdir right before writing.
export function snapshotDir(args = {}, now = new Date()) {
  if (args.out) return path.resolve(String(args.out));
  return path.join(REPO_ROOT, '.lead', 'analytics', iso(now));
}

// --flag, --key value, --key=value
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq > 0) { args[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++; }
    else args[key] = true;
  }
  return args;
}
