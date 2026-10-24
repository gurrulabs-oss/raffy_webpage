// WHO Child Growth Standards reference tables (0-5 years), downloaded from who.int and parsed
// without dependencies (minimal zip reader + xlsx XML parsing).
//
// Exports:
//   WHO_FILES                          list of source files (metric, sex, kind, url)
//   defaultRefDir()                    os.tmpdir()/raffy-who-ref
//   ensureDownloaded({refDir, kinds, metrics, log})  download missing files into refDir
//   readZip(buffer) -> Map<name, Buffer>
//   readXlsxSheets(buffer) -> [{name, rows: [[cell, ...], ...]}]   (cells: number | string | null)
//   loadTable(metric, sex, {refDir, kind}) -> {metric, sex, kind, url, sheet, columns, rows}
//       kind 'zscore'      rows: [{day, L, M, S, sd: {SD4neg, SD3neg, ..., SD0, ..., SD4}}]
//       kind 'percentiles' rows: [{day, L, M, S, pct: {P01, P1, P3, ..., P999}}]
//   loadAllTables({refDir, kind, metrics}) -> same objects for every metric x sex
//   splitLengthHeight(table) -> {length: rows day 0..730, height: rows day 731..1856}
//
// Metrics: 'wfa' (weight-for-age, kg), 'lhfa' (length/height-for-age, cm), 'hcfa' (head circ., cm).
// The WHO expanded lhfa file is one sheet covering day 0..1856: recumbent LENGTH for days 0..730 and
// standing HEIGHT from day 731 (M drops ~0.7 cm between 730 and 731). This is the same convention as
// WHO Anthro / the R `anthro` package (length table when age < 731 days).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const CDN = 'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators';

// Exact URLs linked from (fetched 2026-10-23):
//   https://www.who.int/tools/child-growth-standards/standards/weight-for-age
//   https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
//   https://www.who.int/tools/child-growth-standards/standards/head-circumference-for-age
export const WHO_FILES = [
  { metric: 'wfa', sex: 'male', kind: 'zscore', url: `${CDN}/weight-for-age/expanded-tables/wfa-boys-zscore-expanded-tables.xlsx?sfvrsn=65cce121_10` },
  { metric: 'wfa', sex: 'female', kind: 'zscore', url: `${CDN}/weight-for-age/expanded-tables/wfa-girls-zscore-expanded-tables.xlsx?sfvrsn=f01bc813_10` },
  { metric: 'lhfa', sex: 'male', kind: 'zscore', url: `${CDN}/length-height-for-age/expandable-tables/lhfa-boys-zscore-expanded-tables.xlsx?sfvrsn=7b4a3428_12` },
  { metric: 'lhfa', sex: 'female', kind: 'zscore', url: `${CDN}/length-height-for-age/expandable-tables/lhfa-girls-zscore-expanded-tables.xlsx?sfvrsn=27f1e2cb_10` },
  { metric: 'hcfa', sex: 'male', kind: 'zscore', url: `${CDN}/head-circumference-for-age/expanded-tables/hcfa-boys-zscore-expanded-tables.xlsx?sfvrsn=2ab1bec8_8` },
  { metric: 'hcfa', sex: 'female', kind: 'zscore', url: `${CDN}/head-circumference-for-age/expanded-tables/hcfa-girls-zscore-expanded-tables.xlsx?sfvrsn=3a34b8b0_8` },
  { metric: 'wfa', sex: 'male', kind: 'percentiles', url: `${CDN}/weight-for-age/expanded-tables/wfa-boys-percentiles-expanded-tables.xlsx?sfvrsn=c2f79259_11` },
  { metric: 'wfa', sex: 'female', kind: 'percentiles', url: `${CDN}/weight-for-age/expanded-tables/wfa-girls-percentiles-expanded-tables.xlsx?sfvrsn=54cfa5e8_9` },
  { metric: 'lhfa', sex: 'male', kind: 'percentiles', url: `${CDN}/length-height-for-age/expandable-tables/lhfa-boys-percentiles-expanded-tables.xlsx?sfvrsn=bc36d818_9` },
  { metric: 'lhfa', sex: 'female', kind: 'percentiles', url: `${CDN}/length-height-for-age/expandable-tables/lhfa-girls-percentiles-expanded-tables.xlsx?sfvrsn=478569a5_9` },
  { metric: 'hcfa', sex: 'male', kind: 'percentiles', url: `${CDN}/head-circumference-for-age/expanded-tables/hcfa-boys-percentiles-expanded-tables.xlsx?sfvrsn=c266c88f_7` },
  { metric: 'hcfa', sex: 'female', kind: 'percentiles', url: `${CDN}/head-circumference-for-age/expanded-tables/hcfa-girls-percentiles-expanded-tables.xlsx?sfvrsn=71b282d1_13` }
];

export const METRICS = ['wfa', 'lhfa', 'hcfa'];
export const SEXES = ['male', 'female'];
export const LENGTH_MAX_DAY = 730; // length (lying) for day < 731, height (standing) from 731

export function defaultRefDir() {
  return path.join(os.tmpdir(), 'raffy-who-ref');
}

function fileFor(metric, sex, kind) {
  const f = WHO_FILES.find((x) => x.metric === metric && x.sex === sex && x.kind === kind);
  if (!f) throw new Error(`No WHO file for ${metric}/${sex}/${kind}`);
  return f;
}

export function cachePath(file, refDir = defaultRefDir()) {
  return path.join(refDir, path.basename(new URL(file.url).pathname));
}

export async function ensureDownloaded({ refDir = defaultRefDir(), kinds = ['zscore', 'percentiles'], metrics = METRICS, log = () => {} } = {}) {
  fs.mkdirSync(refDir, { recursive: true });
  const todo = WHO_FILES.filter((f) => kinds.includes(f.kind) && metrics.includes(f.metric));
  for (const f of todo) {
    const dest = cachePath(f, refDir);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue;
    log(`downloading ${f.url}`);
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0 (raffy-growth-audit)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${f.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.readUInt32LE(0) !== 0x04034b50) throw new Error(`Not an xlsx/zip: ${f.url}`);
    fs.writeFileSync(`${dest}.part`, buf);
    fs.renameSync(`${dest}.part`, dest);
  }
  return todo.map((f) => cachePath(f, refDir));
}

// ---- minimal zip reader (central directory + raw deflate) ----
export function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('zip: end of central directory not found');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = new Map();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('zip: bad central directory entry');
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (buf.readUInt32LE(localOff) !== 0x04034b50) throw new Error(`zip: bad local header for ${name}`);
    const dataStart = localOff + 30 + buf.readUInt16LE(localOff + 26) + buf.readUInt16LE(localOff + 28);
    const raw = buf.subarray(dataStart, dataStart + compSize);
    if (method === 0) out.set(name, Buffer.from(raw));
    else if (method === 8) out.set(name, zlib.inflateRawSync(raw));
    else throw new Error(`zip: unsupported compression ${method} for ${name}`);
  }
  return out;
}

// ---- minimal xlsx reader ----
const decodeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&amp;/g, '&');

function colIndex(ref) {
  const letters = /^[A-Z]+/.exec(ref)[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  const out = [];
  for (const m of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    out.push(decodeXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  }
  return out;
}

function parseSheet(xml, shared) {
  const rows = [];
  for (const rm of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rAttr = /\br="(\d+)"/.exec(rm[0]);
    const rIdx = rAttr ? Number(rAttr[1]) - 1 : rows.length;
    const cells = [];
    for (const cm of (rm[1] || '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cm[1];
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs);
      const t = /\bt="([^"]+)"/.exec(attrs)?.[1];
      const body = cm[2] || '';
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let val = null;
      if (t === 's') val = shared[Number(v)];
      else if (t === 'inlineStr') val = decodeXml([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(''));
      else if (t === 'str' || t === 'e') val = v == null ? null : decodeXml(v);
      else if (t === 'b') val = v === '1';
      else if (v != null) val = Number(v);
      cells[ref ? colIndex(ref[1]) : cells.length] = val;
    }
    rows[rIdx] = cells;
  }
  return rows;
}

export function readXlsxSheets(buf) {
  const zip = readZip(buf);
  const text = (n) => (zip.has(n) ? zip.get(n).toString('utf8') : null);
  const shared = parseSharedStrings(text('xl/sharedStrings.xml'));
  const wb = text('xl/workbook.xml') || '';
  const rels = text('xl/_rels/workbook.xml.rels') || '';
  const relMap = new Map([...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => [
    /\bId="([^"]+)"/.exec(m[0])?.[1], /\bTarget="([^"]+)"/.exec(m[0])?.[1]
  ]));
  const sheets = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = decodeXml(/\bname="([^"]*)"/.exec(m[0])?.[1] || '');
    const rid = /\br:id="([^"]+)"/.exec(m[0])?.[1];
    let target = relMap.get(rid) || '';
    target = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
    const xml = text(target);
    if (xml) sheets.push({ name, rows: parseSheet(xml, shared) });
  }
  return sheets;
}

// ---- WHO table loading ----
function tableFromSheet(sheet) {
  const header = (sheet.rows[0] || []).map((h) => (h == null ? '' : String(h).trim()));
  const col = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  // z-score files label the age column 'Day', percentile files 'Age' (also in days)
  const iDay = col('Day') >= 0 ? col('Day') : col('Age'), iL = col('L'), iM = col('M'), iS = col('S');
  if ([iDay, iL, iM, iS].some((i) => i < 0)) throw new Error(`Unexpected WHO header in sheet ${sheet.name}: ${header.join(',')}`);
  const extra = header.map((h, i) => [h, i]).filter(([h, i]) => h && ![iDay, iL, iM, iS].includes(i));
  const rows = [];
  for (const r of sheet.rows.slice(1)) {
    if (!r || typeof r[iDay] !== 'number') continue;
    const row = { day: r[iDay], L: r[iL], M: r[iM], S: r[iS] };
    const cols = {};
    for (const [h, i] of extra) if (typeof r[i] === 'number') cols[h] = r[i];
    row.cols = cols;
    rows.push(row);
  }
  rows.sort((a, b) => a.day - b.day);
  return { columns: header, rows };
}

export function loadTable(metric, sex, { refDir = defaultRefDir(), kind = 'zscore' } = {}) {
  const f = fileFor(metric, sex, kind);
  const p = cachePath(f, refDir);
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}; call ensureDownloaded() first`);
  const sheets = readXlsxSheets(fs.readFileSync(p));
  if (!sheets.length) throw new Error(`No sheets in ${p}`);
  const { columns, rows } = tableFromSheet(sheets[0]);
  const key = kind === 'zscore' ? 'sd' : 'pct';
  return {
    metric, sex, kind, url: f.url, sheet: sheets[0].name, columns,
    rows: rows.map(({ cols, ...r }) => ({ ...r, [key]: cols }))
  };
}

export async function loadAllTables({ refDir = defaultRefDir(), kind = 'zscore', metrics = METRICS, download = true, log } = {}) {
  if (download) await ensureDownloaded({ refDir, kinds: [kind], metrics, log });
  const out = [];
  for (const metric of metrics) for (const sex of SEXES) out.push(loadTable(metric, sex, { refDir, kind }));
  return out;
}

export function splitLengthHeight(table) {
  return {
    length: table.rows.filter((r) => r.day <= LENGTH_MAX_DAY),
    height: table.rows.filter((r) => r.day > LENGTH_MAX_DAY)
  };
}

// ---- LMS helpers (WHO formulas) ----
export function lmsValue({ L, M, S }, z) {
  if (Math.abs(L) < 1e-12) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

export function lmsZ(x, { L, M, S }) {
  if (Math.abs(L) < 1e-12) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}

// WHO restricted application of the LMS method (used by WHO for weight-based indicators, incl.
// weight-for-age): beyond |z| = 3 the distance is measured in units of the 2-to-3 SD interval.
export function restrictedZ(x, lms) {
  const z = lmsZ(x, lms);
  if (z > 3) {
    const sd3 = lmsValue(lms, 3), sd2 = lmsValue(lms, 2);
    return 3 + (x - sd3) / (sd3 - sd2);
  }
  if (z < -3) {
    const sd3n = lmsValue(lms, -3), sd2n = lmsValue(lms, -2);
    return -3 + (x - sd3n) / (sd2n - sd3n);
  }
  return z;
}

// Inverse of restrictedZ (measurement at a given restricted z).
export function restrictedValue(lms, z) {
  if (z > 3) { const sd3 = lmsValue(lms, 3), sd2 = lmsValue(lms, 2); return sd3 + (z - 3) * (sd3 - sd2); }
  if (z < -3) { const sd3n = lmsValue(lms, -3), sd2n = lmsValue(lms, -2); return sd3n + (z + 3) * (sd2n - sd3n); }
  return lmsValue(lms, z);
}
