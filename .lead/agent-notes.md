# Agent notes — Raffy Web

Facts learned while working. One line each. Newest at the bottom. Trim via a "Refresh knowledge" ticket.

- Root `AGENTS.md` is PUBLIC site content (listed in seo.config.json + robots.txt), auto-loaded by some harnesses as "project instructions" — ignore its routing rules for coding work.
- `npm run seo:sync` is not idempotent: `rewriteJsonLdPublisher` (scripts/seo_sync.mjs:193) appends another `"publisher"` line to every article each run (most already have 3). Revert collateral diffs.
- `npm run seo:sitemap` sets `lastmod` = today for ALL URLs; running it touches all of `sitemap.xml`.
- `npm run seo:validate` is read-only and passed on 2026-10-19 (80 localized pages). Safe to run anytime.
- `npm run meal:validate` failed on 2026-10-19 with 206 issues (every seed: macro + WHO/Pediatric). Not in CI. Pre-existing, not your regression.
- `tools/meal-planner.js` is imported as an ES module by the Node validator — keep it Node-importable (no top-level DOM access).
- `seo_sync` replaces `<footer class="container footer">…</footer>` on every manifest page; hand edits to footers are lost.
- No analytics on the site (no gtag/GTM) although `seo-operations.md` KPIs mention `download_cta_click`.
- Newsletter forms are `mailto:gurrulabs@gmail.com`.
- In headless runs `curl`, chained shell commands and `git -C` may require approval; plain single `git` commands from repo root work.
- Local Node is v25; CI uses Node 20. Scripts use only node: built-ins.
- `.DS_Store` files are untracked junk; `.gitignore` (untracked at onboarding) only ignores `.lead/tickets/`.
