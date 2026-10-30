// Indexing history logic shared by report.mjs and test-indexing.mjs (no I/O).
// Legal/trust pages (privacy, terms, data deletion, contact, editorial policy, about; all 4 locales) are not an indexing target.
export const LEGAL_RE = /\/(privacy|privacidad|privacidade|confidentialite|terms|terminos|termos|conditions|data-deletion|delete-data|eliminacion-datos|suppression-donnees|exclusao-dados|contact|contacto|contato|editorial-policy|politica-editorial|politique-editoriale|about|sobre|a-propos|chi-siamo|politica-editoriale|termini|cancellazione-dati|contatti)\.html$/;
export const TARGET = 0.8;
export const isLegal = (url) => LEGAL_RE.test(String(url));
const rows = (idx) => (Array.isArray(idx?.results) ? idx.results : []);
const isPass = (r) => r?.verdict === 'PASS';
const days = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);

export function counts(idx) {
  const rs = rows(idx);
  const t = rs.filter((r) => !isLegal(r.url));
  return { total: rs.length, indexed: rs.filter(isPass).length, tTotal: t.length, tIndexed: t.filter(isPass).length };
}

// cur: {date, idx}; priors: [{date, idx}] ascending, all dated before cur.
export function analyze(cur, priors) {
  const c = counts(cur.idx);
  const target = { ...c, goal: Math.ceil(c.tTotal * TARGET) };
  const prev = priors[priors.length - 1];
  const prevMap = new Map(rows(prev?.idx).map((r) => [r.url, r]));
  // Rows with `error` carry no verdict: they are unknown, never evidence of being out of the index.
  const out = rows(cur.idx).filter((r) => !isPass(r) && !r.error);
  const newly = out.filter((r) => isPass(prevMap.get(r.url))).map((r) => r.url);
  const long = [];
  for (const r of out) {
    if (isLegal(r.url)) continue;
    let oldest = null;
    for (let i = priors.length - 1; i >= 0; i--) {
      const p = rows(priors[i].idx).find((x) => x.url === r.url);
      if (!p || p.error) continue;
      if (isPass(p)) break;
      oldest = priors[i].date;
    }
    if (oldest && days(cur.date, oldest) >= 13) long.push({ url: r.url, since: oldest, coverageState: r.coverageState });
  }
  return { trend: [...priors.slice(-4), cur].map((s) => ({ date: s.date, ...counts(s.idx) })), target, newly, long };
}
