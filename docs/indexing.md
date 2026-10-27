# Indexing audit

Why Google has indexed only 39 of the 100 sitemap pages, and how to re-check it. Baseline: URL inspection of
2026-10-26 (`.lead/analytics/2026-10-26/index.json`): 39 PASS, 56 "URL is unknown to Google", 5 "Crawled -
currently not indexed". Audit and live checks ran on 2026-10-27, before any fixes.

## Re-run

- Local link/indexability audit (no network, about 1 s): `npm run analytics:audit -- --out <dir>` writes
  `<dir>/site-audit.json` (per sitemap URL: depth from the locale home, inbound links and linking pages,
  footer-only, flags, word count, max same-locale similarity, heuristic `cause`). Without `--out` it prints a
  summary. Self-check: `node scripts/analytics/site-audit.mjs --self-test`.
- Google's view: `npm run analytics:pull` (with `--index`, about 13 min, see `analytics.md`). `index.json` now
  also has `sitemap`: Google's own status for `/sitemap.xml` (last submitted/downloaded, errors, warnings,
  submitted count). It reads `gsc-sitemap.json` in fixtures mode if that file exists.
- Live HTTP checks were a one-off script (not committed): every non-PASS URL plus 7 PASS controls was fetched
  with `redirect: 'manual'` and a Googlebot user agent.

## What was checked and is fine

- **Sitemap in GSC** (API GET, 2026-10-27): `https://www.raffyparenting.com/sitemap.xml`, lastSubmitted
  2026-10-26 20:42, lastDownloaded 2026-10-26 20:42, not pending, 0 errors, 0 warnings, 103 URLs submitted.
  The API's `indexed` count is 0, but Google no longer fills in that field, so ignore it. The API only gives
  the latest submission, so it can't say when the sitemap was first submitted.
- **Live site**: all 68 URLs checked return 200 with no redirects, a canonical that matches the sitemap URL,
  no `noindex` and no `X-Robots-Tag`. `http://`, apex `raffyparenting.com` and hub URLs without the trailing
  slash all 301 in one hop to the `https://www.` URL. The live `sitemap.xml` (103 `<loc>`) and `robots.txt`
  (`Sitemap:` line present, `Allow: /`) are byte-identical to the repo.
- **Local audit (100 pages)**: no canonical mismatches, hreflang complete for every manifest group, no
  `noindex`, no links to the legacy root `/articles/*` stubs, no orphans. Max depth from the own-locale home is
  2 (4 pages at depth 0, 72 at depth 1, 24 at depth 2). No near-duplicates: the highest same-locale 5-word
  shingle Jaccard is 0.33 (sleep routine vs newborn routine); templated tool pairs score 0.25-0.31.

So no technical blocker was found. Indexed and non-indexed pages have the same structure. What separates them
is how long a page has been in the sitemap, how many pages link to it, and how much text it has.

## Fixes applied (T-025, 2026-10-27)

- Each newer tool is now linked from 2-4 topic articles (related grid) and from sibling tool next-step blocks,
  which now point to one topic guide, one sibling tool and the meal planner, in all 4 locales.
- parenting-with-confidence and first-vaccine get related cards from newborn routine, milestones, percentiles
  and the android guide. After: every non-legal sitemap page has depth <= 2 and >= 2 inbound links
  (tools 3-6, confidence 4, vaccine 5-6; before: tools and confidence 1).
- Not changed: legal/trust pages, thin pages (follow-ups), the `index.html` nav links (follow-up).

## Findings by cause (61 non-PASS)

| Cause | Count | Pages |
|---|---|---|
| Excluded from target (legal/trust) | 18 | contact, privacy, terms and others in every locale (see table) |
| Tool pages added to the sitemap on 2026-10-26 (T-023), linked only from the tool hub (+ home for wake windows), ~115-150 words | 17 | wake-window, solids-progression, feeding-quantity, diaper-output in all 4 locales + es nap-transition (the 5th "crawled, not indexed": crawled 2026-10-09, before it was in the sitemap) |
| Weak internal linking: only the hub (and maybe home) links to the article | 6 | parenting-with-confidence en/es/fr, first-vaccine en/es/pt |
| Crawled, not indexed: Google's quality/priority choice | 4 | fr + pt article hubs, fr weekly meal planner, pt parenting-with-confidence (also only 1 inbound link) |
| Crawl pace on a young site: clean, depth 1-2, 3-10 inbound links, in the sitemap since March | 16 | sleep routine, solids guide, percentiles, newborn routine (several locales), en android guide |

Notes:
- Tool pages: the 3 nap-transition pages Google found through links (en/fr/pt) are indexed, so linking works.
  Each tool page's next-step block (e.g. `en/tools/wake-window-planner.html:123`) links only to the articles
  hub and the meal planner, never to a sibling tool or a topic article.
- Non-PASS articles have fewer words (median 411) than PASS articles (median 988). This is a pattern, not proof.
- "Unknown" is also reported for URLs that Google has discovered but not crawled yet. The API can't tell the
  two apart; the GSC Pages report ("Discovered - currently not indexed") can.

Minor, not a cause (follow-ups):
- Nav, brand and breadcrumb links use `…/index.html` (105 files). Those URLs return 200 with a canonical to the
  `/` form, so Google crawls a second URL for every hub. Switching the links to the directory form would remove it.
- `en/articles/baby-naps-transitions-and-sleep-0-2-years.html` is indexable and linked from `/en/` but is not in
  the manifest or the sitemap (en only).
- Thin-content candidates (follow-up only, do not merge or delete): the 5 newer tools in every locale
  (~115-150 visible words outside the form) and the parenting-with-confidence articles (~360-380 words).

## Non-PASS pages

Depth is clicks from the own-locale home. Inbound is the number of distinct sitemap pages linking to it,
footer included.

| Locale | Path | Coverage | Depth | Inbound | Probable cause |
|---|---|---|---|---|---|
| en | articles/android-baby-tracker-app-guide.html | unknown | 1 | 3 | crawl pace on a young site (clean, well linked) |
| en | articles/baby-sleep-routine-by-age.html | unknown | 1 | 8 | crawl pace on a young site (clean, well linked) |
| en | articles/baby-solids-guide-blw-purees.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| en | articles/baby-weight-height-percentiles-guide.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| en | articles/first-baby-vaccine-what-i-learned.html | unknown | 1 | 2 | weak linking: only /en/ + /en/articles/ |
| en | articles/newborn-daily-routine-guide.html | unknown | 2 | 4 | crawl pace on a young site (clean, well linked) |
| en | articles/parenting-with-confidence-guide.html | unknown | 2 | 1 | weak linking: only /en/articles/ |
| en | contact.html | unknown | 1 | 24 | excluded from target |
| en | privacy.html | unknown | 1 | 24 | excluded from target |
| en | terms.html | unknown | 1 | 24 | excluded from target |
| en | tools/diaper-output-tracker.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~116 words |
| en | tools/feeding-quantity-estimator.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~121 words |
| en | tools/solids-progression-planner.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~115 words |
| en | tools/wake-window-planner.html | unknown | 1 | 2 | new in sitemap 2026-10-26; only hub + home links it; ~117 words |
| es | articulos/criar-con-confianza-y-sin-culpa.html | unknown | 2 | 1 | weak linking: only /es/articulos/ |
| es | articulos/guia-alimentacion-complementaria-blw.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| es | articulos/primera-vacuna-bebe-lo-que-aprendi.html | unknown | 1 | 2 | weak linking: only /es/ + /es/articulos/ |
| es | articulos/rutina-diaria-recien-nacido.html | unknown | 2 | 4 | crawl pace on a young site (clean, well linked) |
| es | articulos/rutina-sueno-bebe-por-edad.html | unknown | 1 | 8 | crawl pace on a young site (clean, well linked) |
| es | contacto.html | unknown | 1 | 24 | excluded from target |
| es | herramientas/ayudante-transicion-siestas.html | crawled, not indexed | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~132 words; crawled 2026-10-09 |
| es | herramientas/calculadora-panales-eliminacion.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~137 words |
| es | herramientas/estimador-cantidad-alimentacion.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~142 words |
| es | herramientas/planificador-progresion-solidos.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~129 words |
| es | herramientas/planificador-ventanas-sueno.html | unknown | 1 | 2 | new in sitemap 2026-10-26; only hub + home links it; ~140 words |
| es | politica-editorial.html | unknown | 1 | 24 | excluded from target |
| es | privacidad.html | unknown | 1 | 24 | excluded from target |
| es | sobre.html | unknown | 1 | 24 | excluded from target |
| es | terminos.html | unknown | 1 | 24 | excluded from target |
| fr | articles/ | crawled, not indexed | 1 | 24 | listing page, Google chose not to index (crawled 2026-10-09) |
| fr | articles/eduquer-avec-confiance-sans-culpabilite.html | unknown | 2 | 1 | weak linking: only /fr/articles/ |
| fr | articles/guide-diversification-bebe-blw.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| fr | articles/percentiles-poids-taille-bebe.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| fr | articles/routine-quotidienne-nouveau-ne.html | unknown | 2 | 4 | crawl pace on a young site (clean, well linked) |
| fr | articles/routine-sommeil-bebe-par-age.html | unknown | 1 | 8 | crawl pace on a young site (clean, well linked) |
| fr | conditions.html | unknown | 1 | 24 | excluded from target |
| fr | confidentialite.html | unknown | 1 | 24 | excluded from target |
| fr | contact.html | unknown | 1 | 24 | excluded from target |
| fr | outils/calculateur-couches-elimination.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~141 words |
| fr | outils/estimateur-quantites-alimentation.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~144 words |
| fr | outils/planificateur-fenetres-eveil.html | unknown | 1 | 2 | new in sitemap 2026-10-26; only hub + home links it; ~148 words |
| fr | outils/planificateur-progression-diversification.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~133 words |
| fr | outils/planificateur-repas-hebdomadaire-12-23-mois.html | crawled, not indexed | 1 | 10 | Google chose not to index (crawled 2026-09-27); well linked |
| fr | politique-editoriale.html | unknown | 1 | 24 | excluded from target |
| fr | suppression-donnees.html | unknown | 1 | 24 | excluded from target |
| pt | artigos/ | crawled, not indexed | 1 | 24 | listing page, Google chose not to index (crawled 2026-08-18) |
| pt | artigos/criar-com-confianca-sem-culpa.html | crawled, not indexed | 2 | 1 | only the hub links it (crawled 2026-07-18) |
| pt | artigos/guia-introducao-alimentar-bebe-blw.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| pt | artigos/percentis-peso-altura-bebe.html | unknown | 1 | 10 | crawl pace on a young site (clean, well linked) |
| pt | artigos/primeira-vacina-bebe-o-que-aprendi.html | unknown | 1 | 2 | weak linking: only /pt/ + /pt/artigos/ |
| pt | artigos/rotina-diaria-recem-nascido.html | unknown | 2 | 4 | crawl pace on a young site (clean, well linked) |
| pt | artigos/rotina-sono-bebe-por-idade.html | unknown | 1 | 8 | crawl pace on a young site (clean, well linked) |
| pt | contato.html | unknown | 1 | 24 | excluded from target |
| pt | exclusao-dados.html | unknown | 1 | 24 | excluded from target |
| pt | ferramentas/calculadora-fraldas-eliminacao.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~139 words |
| pt | ferramentas/estimador-quantidade-alimentacao.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~138 words |
| pt | ferramentas/planejador-janelas-vigilia.html | unknown | 1 | 2 | new in sitemap 2026-10-26; only hub + home links it; ~142 words |
| pt | ferramentas/planejador-progresso-alimentacao.html | unknown | 2 | 1 | new in sitemap 2026-10-26; only hub links it; ~134 words |
| pt | privacidade.html | unknown | 1 | 24 | excluded from target |
| pt | sobre.html | unknown | 1 | 24 | excluded from target |
| pt | termos.html | unknown | 1 | 24 | excluded from target |
