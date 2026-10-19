# Domain

## Product and goal
- Raffy = Android baby-tracking app by Gurru Labs (`com.gurrulabs.raffy`): sleep, feeding/solids, growth,
  diary, health, routines, reminders.
- This website exists to convert parents into app installs. Organic search is the channel; articles and free
  tools are the hooks; the Play Store link is the conversion.
- Audience: parents of babies/toddlers (0–2 years mainly), in 4 markets.

## Locales
| Locale | hreflang | Articles | Tools |
|---|---|---|---|
| en (x-default) | en-US | `/en/articles/` | `/en/tools/` |
| es | es-ES | `/es/articulos/` | `/es/herramientas/` |
| fr | fr-FR | `/fr/articles/` | `/fr/outils/` |
| pt | pt-BR | `/pt/artigos/` | `/pt/ferramentas/` |
Slugs are translated, never reused across locales. The manifest maps equivalents.

## Content clusters (from `seo/content-calendar.md`)
Sleep by age · feeding and solids · growth and percentiles · newborn routine and vaccines · Android app guides.

## Tools
Weekly meal planner (12–23 months), WHO growth percentile calculator, wake window planner, nap transition
helper, feeding quantity estimator, diaper output tracker, solids progression planner.

## Content rules
- Health content is educational and non-diagnostic; health-related pages need a pediatric safety section.
- Each article: 1 primary + 3 secondary keywords, one `h1`, clear h2/h3, ≥3 same-locale internal links,
  `dateModified` in JSON-LD, app CTA.
- Public AI-facing files (`AGENTS.md`, `LLMS.md`, `llms.txt`) describe priority URLs and intent→page routing;
  update them when adding priority pages or tools.
- Legal/trust pages (privacy, terms, data deletion, editorial policy): owner-only.
