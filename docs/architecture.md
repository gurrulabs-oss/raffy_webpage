# Architecture

## Serving
- Pure static files on GitHub Pages; `CNAME` = `www.raffyparenting.com`. Push to `main` = deploy.
- `/index.html` (noindex) redirects to `/<locale>/` using `localStorage.raffy_locale` (default `en`).
- `404.html` at root. Root `articles/*.html` are legacy Spanish-slug redirect stubs (noindex, meta refresh).

## Pages
- Each locale folder (`en/ es/ fr/ pt/`) holds full, self-contained HTML pages (header/nav duplicated per page).
- Shared site-wide code: `/styles.css`, `/script.js` (nav, locale switcher persisting `raffy_locale`, UI).
- Articles also load `articles/article.css`. Tool pages load from `/tools/`:
  - `meal-planner.js/.css` + `meal-planner-data.json` — weekly meal planner 12–23 months. `meal-planner.js` is an
    ES module also imported by `scripts/meal_planner_validate.mjs` (`generateMealPlanner`, `computeDishNutrition`, …).
  - `percentile-calculator.js/.css` + `who-lms-data.json` — WHO growth percentile calculator (LMS method).
  - `tool-cluster.js/.css` — smaller tools (wake windows, nap transitions, feeding quantity, diaper output, solids).
- Images: `assets/` (png + webp pairs, some `_es` variants), article images under `articles/images`, `articles/menu_9_months`.

## SEO pipeline (Node, no deps)
- `seo.config.json`: origin, `indexable`, `xDefault`, locales→hreflang, extra indexable / AI discovery paths.
- `seo/articles.manifest.json`: list of page groups `{id, type, routes{en,es,fr,pt}}`. Single source for equivalence.
- `scripts/seo_sync.mjs`: for every manifest page rewrites canonical, hreflang alternates, og:url, robots meta,
  JSON-LD publisher (articles), image srcs/dims/preload, and replaces `<footer class="container footer">` with a
  generated trust/legal footer. Also writes legacy redirects.
- `scripts/seo_sitemap.mjs`: writes `sitemap.xml` (lastmod = today for all URLs) and `robots.txt`.
- `scripts/seo_validate.mjs`: canonical/og:url/hreflang/x-default/reciprocity, broken internal links, sitemap
  coverage, robots AI-discovery rules, no `example.com`.
- CI (`.github/workflows/seo-validate.yml`, Node 20) runs sync → sitemap → validate on push to main and PRs; it
  does not commit the regenerated files, so it validates the post-sync state, not necessarily the committed one.
- `scripts/seo_phase1_upgrade.rb`, `scripts/seo_phase234_generate.rb`: historical one-off generators. Not part of
  the pipeline; don't run without reading them.

## Known defects (Oct 2026)
- `seo_sync` `rewriteJsonLdPublisher` regex never sees the existing publisher → appends a duplicate each run.
- `npm run meal:validate` fails all seeds on macro and WHO/pediatric checks (cause not investigated).
