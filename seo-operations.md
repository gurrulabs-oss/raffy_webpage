# Raffy SEO Operations (International)

## Current setup
- Site type: static multilingual site on GitHub Pages.
- Locales:
  - `en-US` -> `/en/`
  - `es-ES` -> `/es/`
  - `fr-FR` -> `/fr/`
  - `pt-BR` -> `/pt/`
- Primary content hubs:
  - `/en/articles/`
  - `/es/articulos/`
  - `/fr/articles/`
  - `/pt/artigos/`

## Source of truth
- SEO config: `seo.config.json`
- Page equivalence map: `seo/articles.manifest.json`
- Scripts:
  - `scripts/seo_sync.mjs`
  - `scripts/seo_sitemap.mjs`
  - `scripts/seo_validate.mjs`

## Publish workflow
1. Add/update article pages in EN/ES/FR/PT.
2. Register new route group in `seo/articles.manifest.json`.
3. Run SEO scripts:
   - `npm run seo:sync`
   - `npm run seo:sitemap`
   - `npm run seo:validate`
4. Verify no `example.com` placeholder remains.
5. Commit and deploy.

## Indexing policy by environment
- `indexable=false` in `seo.config.json`:
  - every localized page has `noindex,follow`
  - `robots.txt` generated with `Disallow: /`
- `indexable=true` in `seo.config.json`:
  - canonical pages become indexable
  - `robots.txt` generated with `Allow: /`

## Content and internal linking rules
- Every article must include:
  - one primary keyword and three secondary keywords
  - one `h1` and clear `h2/h3` structure
  - at least 3 related internal links in same locale
  - updated date (`dateModified`) in JSON-LD
  - pediatric safety section when health-related

## Monthly SEO cadence (3-6 months)
- Publish 4 new EN articles + localized ES/FR/PT versions.
- Track priority clusters:
  - sleep by age
  - feeding and solids
  - growth and percentiles
  - newborn routine and vaccines
- Run technical validation weekly and metadata uniqueness review monthly.
- Prioritize backlinks from parenting and pediatric-adjacent sites.

## KPI dashboard focus
- Organic clicks to EN landing pages.
- SERP CTR of top URLs.
- Google Play click-throughs from organic landings (`download_cta_click`).
- Click-out conversion by locale and page type.
