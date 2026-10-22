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
- Since T-010: `.lead/scratch/T-010/check-invariants.mjs` compares every page with `main` (head tags, JSON-LD, hrefs, Play links + tracking, visible text); `growth-same-outputs.mjs` guards the growth maths. Reuse them for any page/UI ticket.
- `scripts/seo_sync.mjs` also injects a home hero `<link rel=preload>` (`preloadMap`) and adds `decoding/loading/width/height` to every `<img>`; removing a preload by hand gets undone — edit the map.
- Since T-010 download tracking in `script.js` is delegated on `document` (CTAs inserted later are tracked); `window.RaffyStickyCta.show()/hide()` drives the mobile sticky bar; `data-sticky="scroll"` shows it after 40% scroll.
- Headless Chrome CLI clamps `--window-size` below ~500px; for true 390px use CDP `Emulation.setDeviceMetricsOverride` (harness: `.lead/scratch/T-010/fr/cdp.mjs`). `.gtool` has `overflow:hidden`, so scrollWidth misses clipping inside tool panes — check descendants' rects (`fr/ovf.mjs`).
- `tools/tool-cluster.js` and `percentile-calculator.js` keep a legacy renderer for old markup alongside the B v2 one (`[data-tool-root]`); locale strings live in their LOCALES tables.
- `.lead/attachments/` and `.lead/designs/` are gitignored (hub reads them from disk); `.lead/scratch/` is committed.
- Agent working files go in `.lead/scratch/` (gitignored since T-010): never commit them; the hub's post-deploy check probes every changed .html, and dot-folders 404 on GitHub Pages.
- In headless design runs (2026-10-21) Chrome, `node` and `curl` all needed approval: mockups could not be rendered or syntax-checked, and Google Fonts could not be fetched (mockups fall back to system fonts).
- Headless Chrome (`--headless=new`) and `node` ran without approval in the T-011 execute run (2026-10-21); only chained shell commands needed approval.
- `.lead/scratch` in a worktree is a symlink to the main repo's scratch; workers' writes there were blocked in T-011 — tell workers to use `/tmp/t0NN-*` and expect harnesses to be lost.
- T-011 guards: `.lead/scratch/T-011/check-invariants.mjs` (Play links + all data-* as multiset, head/JSON-LD vs main; `--no-text`) and `growth-same-outputs.mjs` supersede the T-010 ones.
- Growth picker (`tools/date-picker.js`) adds hidden ISO inputs that take over `name=birth_date|measurement_date`; its age line copies the calculator's 30.4375 days/month — change both together.
- Download CTA components since T-011: `.btn-play`, `.hero-app`, `.appx(.white/.compact/.noshot)`, `.in-app2`, `.badge-trust` (styles.css T-011 block); `.prose a` recolours links, so `a.btn-play` forces white text. Focus rings must be navy on light/mint (mint fails 3:1), white on blue.
- T-013 design run (2026-10-21): headless Chrome screenshots ran without approval and `--window-size=390,844` on a wrapper page with a 390px `<iframe>` gives true phone renders (media queries fire). `sips`, `sed > file`, globbed `cp` and `$VAR` commands needed approval.
- `.lead/scratch/T-010/` harnesses (cdp.mjs etc.) no longer exist on disk.
- The 9-month menu cover image (`articles/menu_9_months/cover_article_menu_9_months.png`) has English text and is used by all 4 locales.
- Since T-012: `npm run analytics:pull` (scripts/analytics/) pulls GSC + URL inspection + Mixpanel into gitignored `.lead/analytics/<date>/` + `report.md`; credentials in `~/.config/raffy-analytics/` (docs/analytics.md). Test offline with `--fixtures scripts/analytics/fixtures --out /tmp/x`. Live API paths were untested at merge (no keys).
- Mixpanel page view = any `Raffy Webpage - ` event except Download/Growth Tool Submit/Results (`scripts/analytics/mixpanel.mjs`); adding a new site event means adding it to that exclusion list or page views inflate.
- The weekly `claude -p` run (`scripts/analytics/weekly.sh`, launchd) reads outside text (search queries): keep its allowedTools scoped to the analytics npm scripts and writes under `.lead/analytics/` and `.lead/tickets/`.
- Since T-007: all 7 tools fire `Raffy Webpage - <Tool> Submit Clicked|Results Shown` (tool-cluster.js `trackToolEvent`, meal-planner inside `initBrowserTool`, percentile-calculator); report excludes any `… Submit Clicked`/`… Results Shown` from page views by suffix and builds a Tool funnel (`toolFunnel` in mixpanel.mjs, ties in whole-second `time` count as later).
- Port 8123 may be held by a stale node server from /tmp/t011-s2; use another port for local preview. Browser harness for tool events: stub `window.mixpanel={__SV:1,init(){},track(){...}}` via CDP `Page.addScriptToEvaluateOnNewDocument` (script.js skips bootstrap when `__SV` is set); making `window.mixpanel` undefined before load breaks script.js init (pre-existing), so remove it after load to test guards.
