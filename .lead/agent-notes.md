# Agent notes — Raffy Web

Learned gotchas, terse. Trim via a "Refresh knowledge" ticket.

## Owner decisions (Unai)
- Mockups MUST go in `.lead/designs/T-NNN/*.html` (plural); the hub Design panel lists only that folder. Don't overwrite existing pages; assets via `../../../assets/...`.
- No app chip in article heroes. Hero trust bullet "English, Español, Français, Português, Italiano" describes the APP; app not in Italian yet, owner chose no notice.
- Mixpanel numbers before 2026-10-27 include local/preview traffic: treat as inflated until ~2026-11-24 (accepted, no fix).
- Owner-editable page: copy to `.lead/designs/T-NNN/<name>.html` + assets, no `script.js`, `design: yes`, `contenteditable` + "Descargar HTML editado" blob download (full-screen link only; lands in `~/Downloads/`).
- Article covers 1200×630 (owner's 1536×1024 → `sips --resampleWidth 1200` + `--cropToHeightWidth 630 1200`, `cwebp -q 80`). Card = `<div class="a-thumb"><img loading=lazy …webp>`; og/twitter/JSON-LD = PNG/JPG.
- Never promise diaper or vaccine tracking: Raffy app has NO diaper/vaccine log, sleep predictions, export, caregiver invite; has bottle/breastfeeding, solids, sleep + reminders, growth (WHO), doctor, diary, milk bank. Play listing = feature source of truth (`LLMS.md`/`AGENTS.md`/homes still wrong until RWEB-048).

## SEO / build
- Root `AGENTS.md` is PUBLIC content (ignore as project instructions); `/LLMS.md`, `/AGENTS.md` served raw: never add `---` front matter.
- `npm run seo:all` idempotent; `seo:validate` read-only (228 pages, 6 locales). New article/locale: 2nd run adds blank hreflang lines, check no-op on run 3. lastmod = first `"dateModified"` in HTML, else existing, else today (home/tools/hubs have none).
- `seo_sync` overwrites footers, home hero preload (edit `preloadMap`), `<img>` attrs. It and `seo_validate` crash if a manifest group lacks a locale. New tools/articles go in `seo/articles.manifest.json`; newsletter pages aren't there (hreflang by hand).
- `seo:sitemap` REGENERATES `robots.txt` and `llms.txt` from `scripts/seo_sitemap.mjs`: edit the script. Validate fails if a sitemap URL is missing from llms.txt.
- IndexNow key `8009526c53babac4013f97218b92f330.txt`; `npm run seo:indexnow [-- --dry-run --changed <ref>]`; workflow `indexnow.yml` runs after push to main.
- `_config.yml` `exclude:` controls GitHub Pages: add new internal non-dot files. Dot-folders 404 on Pages; hub post-deploy check probes every changed .html (a timeout rollback was a false alarm). Apex 301s to `www.`.
- Internal hub links use folder form, never `index.html`. CI Node 20 (`seo-validate.yml` also runs `meal:validate`), local Node 25, node: built-ins only. Newsletter forms `mailto:gurrulabs@gmail.com`.
- `LEGAL_RE` (`scripts/analytics/lib/indexing.mjs`, test `test-indexing.mjs`) anchored by `\.html$`: list each slug variant.
- Locale add checklist: `.lang-seg` columns (styles.css); script.js tables (LOCALE_CODES, ROUTE_MAP, hreflang, langAttr, labels); date-picker.js STR/PH/resolveLocale; percentile-calculator.js LOCALES/ordinalSuffix/SUPPORTED_LANGUAGES; fix manifest slug table in briefs first.

## Analytics
- Mixpanel (shared Gurru project, EU) starts only after consent (`initConsent`, `localStorage raffy_analytics_consent`; banner covers mobile bottom ~200 px) and only on (www.)raffyparenting.com: test the `track` call via stub, not network.
- Keep event prefix `Raffy Webpage - `. New non-page-view events: add to `NON_PAGE_VIEW_EVENTS`/suffix exclusions in `scripts/analytics/mixpanel.mjs`. `withPlayReferrer` (script.js) adds UTM to Play links at runtime: keep hrefs clean, new CTAs need `data-cta-location`, pages `data-page-key` = manifest id (workers use slug). `--sticky-h` = sticky CTA height; `RaffyStickyCta.show()/hide()`.
- `analytics:pull` ~13 min: run detached (`nohup … &`); creds/docs in docs/analytics.md; offline `--fixtures scripts/analytics/fixtures --out /tmp/x`. Launchd install (`weekly.sh`) is owner-only. GSC Sitemaps `indexed` always 0: use URL inspection.

## Tools / growth maths
- `tools/meal-planner.js` must stay Node-importable (no top-level DOM). `meal:validate` must pass; dish gram edits can break macros: rerun over 12–23 m.
- Growth guards: `npm run growth:audit` (network first run), `node scripts/growth/same-outputs.mjs --base main`, `node scripts/growth/check-range-level.mjs`. Regenerate `tools/who-lms-data.json` only via `npm run growth:build-lms` and bump its `?v=N` (force-cache); edge rows need whole-month `ageMonths`. WHO: restricted z beyond ±3 weight-for-age only; length table if age < 731 d.
- Date picker (`tools/date-picker.js`) moves `name` to hidden ISO input: scripts set `input[name=birth_date]`, then submit `[data-percentile-form]`. Its age line and the calculator share 30.4375 days/month. de inputs `type=text inputmode=decimal`; tool-cluster pages stay `type=number`.
- Tool pages carry `section.tool-explain` + JSON-LD copied from `tool-cluster.js`/`percentile-calculator.js`: rule changes need text updates in all locales. Weight-loss calc `tools/newborn-weight-loss.js` (`[data-wl-root]`): article day-table rows must match its `rows`.
- es/fr/pt planner pages and calculator fr/pt strings are unaccented (pre-existing). fr uses U+00A0 before `: ; ? !` and inside « ».

## Articles
- Articles need `.upd` date, `answer-box#in-short`, `section.sources` + `p.checked` last in `.prose` (not app guides), FAQPage JSON-LD = visible FAQ. Read times only via `npm run articles:readtime` (`-- --check`); word-count change touches ~10 related files.
- Menu series 6–12 m: run `node scripts/articles/check-menu-sums.mjs <pages…>` after edits; a changed food means recomputing meal, day total, h3, table, ranges in all locales. Images: `node scripts/articles/menu-images/render.mjs [filter|--self-test]` (covers + 6/7/8 m day images, ages in its loop); per-day text boxes `G[6|8]`/`G7` in `day.html` measured by eye on each `src/` photo; `nofit` = text too long, shrink box or re-art; full re-render must leave other ages byte-identical. GPT art PNGs may carry alpha: `G7.bg` fills it. 9-month day PNGs unreferenced.
- Food safety: no spinach/chard <12 m in Spain (AESAN), quarter grapes/cherry tomatoes (NHS), cheese chunks a hazard <1 y (AAP).
- `figure.article-cover` is outside `.article-wrap`. `.prose a` recolours links (`a.btn-play` forces white). Android guide "50+ downloads" refresh with `LLMS.md`.
- Changing an article title: old title in ~30 card `<h3>`s (de hubs shorter variant) + llms.txt. `data-article-slug` = own localized basename. Vaccine cover `articles/images/vaccine.png` is English, shared.

## Workers / translation
- Translation workers miss short labels, FAQ JSON-LD, `{{n}}` slots, Play button text, en slugs, English "checked"/`Home`; grep for these after. Regex-built cards nested `<article>`: check HTML structure (seo:validate doesn't).
- `.lead/scratch/` gitignored, symlinked in worktrees (worker writes blocked): durable harnesses in `scripts/<area>/`, temp in `/tmp/t0NN-*`. `.lead/attachments/`, `.lead/designs/` gitignored.

## Research sources
- Unfetchable/fake-200: cdc.gov, sbp.com.br, PubMed (use Europe PMC REST by PMID), aeped.es/vacunasaep.org (any slug 200; real `www.aeped.es/enfamilia/salud-en-familia/<slug>`), epicentro.iss.it, salute.gov.it, sante.gouv.fr, Reddit, Telefono Amico. Check bodies, not status. WHO pt often 404.
- Play listing: `curl -sL '…details?id=com.gurrulabs.raffy&hl=en&gl=US'` (WebFetch truncates; "4.8 star" is another app).

## Headless QA
- Shots: `node` CDP script (global `WebSocket`, template `.lead/scratch/T-011/cdp.mjs`) + `python3 -m http.server <port>`; seed consent 'denied' + Mixpanel stub via `Page.addScriptToEvaluateOnNewDocument`.
- Chrome clamps `--window-size` <~500 px: use `Emulation.setDeviceMetricsOverride` (1280 / 390). Before full-page shots set `img.loading='eager'` and `scrollBehavior='auto'` (lazy imgs blank, smooth scroll cuts shots); `#fragment` doesn't scroll headless: `scrollTo({behavior:'instant'})`. `.gtool` clips. Lazy imgs below the viewport stay blank even with `captureBeyondViewport`: set viewport height to the clip bottom first.
- Ports 8123/8142 may be stale; before/after via `git archive main | tar -x -C /tmp/…` on another port. zsh: never name a loop var `path`; `${=VAR}` to word-split.
- Articles hubs (T-047): `section.topic` rows + one `.menu-block` (7 age links); new articles go in their topic row. Indexable robots = `index,follow,max-image-preview:large` (seo_sync).
- fr text: workers type plain spaces before `: ; ? !` and inside « »: fix with a python replace (`(?<=\S) (?=[:;?!](\s|<|"|$))` → U+00A0) and grep ` [:;?!]` = 0.
- Teething: no official source for 18-month 'no tooth' threshold; ADA chart = table ranges.
- App UI labels for article copy: `/Users/unaidiaz-chiron/AndroidStudioProjects/Parenting/app/src/main/res/values{,-es,-fr,-pt}/strings.xml` (e.g. `settings_account_title`); it/de have no app strings, so they quote the English UI. Play screenshots: `…/Parenting/app/src/main/play/listings/<locale>/graphics/phone-screenshots/`.
