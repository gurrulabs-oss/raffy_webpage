# Agent notes — Raffy Web

Facts learned while working. One line each. Newest at the bottom. Trim via a "Refresh knowledge" ticket.

- Root `AGENTS.md` is PUBLIC site content (listed in seo.config.json + robots.txt), auto-loaded by some harnesses as "project instructions" — ignore its routing rules for coding work.
- Since T-002 `npm run seo:all` is idempotent; `seo_sync` writes only changed files. Sitemap `lastmod` = first `"dateModified"` in the HTML, else existing sitemap.xml value, else today (UTC). Home/tools/hubs have no `dateModified`, so their lastmod stays frozen until one is added.
- `npm run seo:validate` is read-only and passed on 2026-10-19 (80 localized pages). Safe to run anytime.
- `npm run meal:validate` failed on 2026-10-19 with 206 issues (every seed: macro + WHO/Pediatric). Not in CI. Pre-existing, not your regression.
- `tools/meal-planner.js` is imported as an ES module by the Node validator — keep it Node-importable (no top-level DOM access).
- `seo_sync` replaces `<footer class="container footer">…</footer>` on every manifest page; hand edits to footers are lost.
- Mixpanel is live: init `script.js:156` (token in `MIXPANEL_TOKEN`, shared Gurru Labs websites project, EU api host); events `Raffy Webpage - <page>` (page view), `Raffy Webpage - Download Button Clicked` (`script.js:552`, uses `data-cta-location`), growth tool events in `tools/percentile-calculator.js:382`. Keep the `Raffy Webpage - ` prefix: the project is shared with other sites. `download_cta_click` in `seo-operations.md` is a KPI name, not an event name.
- Play Store links carry no `referrer=` param (as of 2026-10-19), so installs can't be attributed to the site.
- Newsletter forms are `mailto:gurrulabs@gmail.com`.
- In headless runs `curl`, chained shell commands and `git -C` may require approval; plain single `git` commands from repo root work.
- Local Node is v25; CI uses Node 20. Scripts use only node: built-ins.
- `.DS_Store` files are untracked junk; `.gitignore` (untracked at onboarding) only ignores `.lead/tickets/`.
- Root `_config.yml` `exclude:` list controls what GitHub Pages (Jekyll) publishes; add new internal non-dot files there. System Ruby 2.6 can't install Jekyll locally.
- Mockups MUST go in `.lead/designs/T-NNN/*.html` (plural "designs"). The hub's Design panel only lists that folder; anything in `.lead/design/` or elsewhere is invisible to the owner. Check the folder for existing pages first and don't overwrite them. Asset paths from there are `../../../assets/...`.
