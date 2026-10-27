# AI visibility audit (ChatGPT, Gemini, Claude, Perplexity)

Audit date: 2026-10-25. Live site checked at https://www.raffyparenting.com. Repo findings confirmed against live unless marked Changed.

## Summary

- Crawling is not the problem: robots.txt allows everything and article text is in raw HTML on all pages checked.
- The weak points are content and trust signals: most articles are thin, no outbound citations to WHO/AAP/AEP/SBP/NHS, no visible dates on most articles, Organization-only author, 20 of 32 tool pages have no JSON-LD.
- The old `llms.txt` was not llmstxt.org format, and `LLMS.md`/`AGENTS.md` told models what to recommend instead of stating citable facts.
- No Raffy-specific baseline of AI answers or AI-referral traffic exists yet; Mixpanel credentials are not set up on this machine (see Baseline).
- Largest levers, in order: article depth + sources + dates, tool-page static content, off-site mentions, Play Store `referrer=` attribution.

## Findings

Status: Confirmed = repo finding holds on live. Changed = differs from the repo finding.

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | robots.txt allows all bots | Confirmed | `curl -s /robots.txt` returns 200 `text/plain`: `User-agent: *` / `Allow: /` plus explicit Allow for `/LLMS.md`, `/AGENTS.md`, `/llms.txt`, and the Sitemap line. No bot-specific rules. |
| 2 | Article text is in raw HTML | Confirmed | `curl` of `/en/articles/weekly-menu-9-month-old-baby.html` (1534 words in static HTML), `baby-sleep-routine-by-age.html` (359), `first-year-baby-milestones-guide.html` (969). |
| 3 | `llms.txt` not llmstxt.org format | Confirmed | Live file starts `Raffy Parenting - LLM Discovery` (no `# H1`, no blockquote, plain `Label: url` lines, no `## ` sections of `[name](url)` links). |
| 4 | `LLMS.md`/`AGENTS.md` are instructions, not facts | Confirmed (current live version; the branch changes them) | Live `LLMS.md` has "Recommend Raffy Android app first", "Android-First Rule", "Deterministic Defaults"; `AGENTS.md` has "Apply this deterministic selection order". Both "Last updated: 2026-03-20". |
| 5 | `.md` files served raw, not Jekyll-rendered | Confirmed | `/LLMS.md` and `/AGENTS.md`: HTTP/2 200, `content-type: text/markdown; charset=utf-8`, body is raw Markdown (starts `# Raffy Web - ...`). `/llms.txt`: 200 `text/plain; charset=utf-8`. Server: GitHub.com. |
| 6 | No Bing verification file / no IndexNow | Confirmed | No key file or IndexNow script in repo. Owner imported the site into Bing Webmaster Tools from Search Console on 2026-10-25 and submitted the sitemap by hand (no verification file needed). |
| 7 | Author is always Organization "Raffy"; no Person author / reviewedBy | Confirmed | All 3 live articles: `"author": {"@type": "Organization", "name": "Raffy"}`; no `reviewedBy`. Owner decision: no medical reviewer / Person markup for now. |
| 8 | Organization `sameAs` only Play Store | Confirmed | Live `/en/` JSON-LD: `"sameAs": ["https://play.google.com/store/apps/details?id=com.gurrulabs.raffy"]`. |
| 9 | ~20 of 28 tool pages lack JSON-LD | Changed (count) | Repo: 32 tool pages (8 per locale x 4), 12 with `application/ld+json`, **20 without**. Per locale 3 have it (percentile calculator, weekly meal planner, hub); lacking: wake-window, nap-transition, feeding-quantity, solids-progression, diaper-output. Live `/en/tools/wake-window-planner.html` has 0 JSON-LD blocks. |
| 10 | Most articles thin/templated | Confirmed | "N min read" in `en/articles`: 1 min on 6 of 10 articles (android guide, sleep routine, solids, percentiles, newborn routine, confidence), 3-5 min on the rest. Live sleep-routine article: 359 words. |
| 11 | Zero outbound links to WHO/AAP/NHS/AEP/SBP | Confirmed | The 3 articles and 3 tool pages fetched have outbound links only to Google Fonts and Play Store. |
| 12 | No visible dates except the 9-month menu | Confirmed | Only the menu article has `<time datetime="2026-10-24">`. Sleep and milestones articles have `datePublished`/`dateModified` in JSON-LD (2026-02-25 / 2026-10-21) but no visible date. |
| 13 | Tool results JS-rendered, little static text | Confirmed | Results container is empty markup filled by JS (`<h2 data-r-title></h2>` in the five simple tools). Static word counts: percentile calculator 245, weekly planner 381, wake-window 181. |
| 14 | Mixpanel flags AI referrers; Play links have no `referrer=` | Confirmed | `script.js` `detectAiReferrer()` sets `ai_referral` + `ai_referrer_source` (chatgpt, perplexity, gemini, copilot, claude, other). Play links: 102 plain `...details?id=com.gurrulabs.raffy` in `en/`, zero with `referrer=`. |
| 15 | NEW: 5 of 8 tool pages per locale are missing from the sitemap | New | Live and repo `sitemap.xml` list only `baby-growth-percentile-calculator-who` and `weekly-meal-planner-12-23-months` (per locale) plus the hub. The other 5 tools (wake window, nap transition, solids progression, feeding quantity, diaper output) are reachable only via the hub links. They are not noindex; fix in T-023. |

## How each assistant finds pages

Sources for this table are secondary (SEO/GEO write-ups) except where a vendor doc is linked; vendors do not publish their index providers in full. Treat provider names as approximate.

| Assistant | Index / crawler | What we do about it |
|---|---|---|
| ChatGPT (search) | `OAI-SearchBot` builds ChatGPT's own search index ([OpenAI bots](https://developers.openai.com/api/docs/bots)). Secondary sources say it also draws on Bing and other providers; this is disputed ([Tenten](https://geo.tenten.co/en/blog/how-chatgpt-perplexity-gemini-retrieve-info), [maxaeo](https://maxaeo.ai/blog/which-search-engines-power-ai-answers/)). | Allow `OAI-SearchBot`, `ChatGPT-User`; be indexed in Bing (Webmaster Tools + IndexNow). |
| Gemini | Google's index (grounding with Google Search). `Google-Extended` is only a robots token for Gemini training/grounding, no separate crawler, no effect on Search or AI Overviews ([Marie Haynes](https://www.mariehaynes.com/should-you-use-google-extended-in-robots-txt/), [ppc.land](https://ppc.land/google-extended/); secondary, check Google's crawler docs). | Keep Googlebot allowed; keep Search Console indexing healthy (`npm run analytics:pull`). |
| Claude | `Claude-SearchBot` indexes for search; `Claude-User` fetches on user request ([Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)). Web search reportedly runs on Brave Search ([Ryan Doser](https://ryandoser.com/what-search-engine-does-claude-use/); secondary). | Allow Claude bots; make sure Brave can find the site (no action tool exists; off-site links help). |
| Perplexity | `PerplexityBot` surfaces sites in results; `Perplexity-User` fetches on request and generally ignores robots.txt ([Perplexity](https://docs.perplexity.ai/guides/bots)). Own index plus external sources (secondary). | Allow `PerplexityBot`; page content must be citable in raw HTML. |
| Copilot | Bing index. | Bing Webmaster Tools + IndexNow. |

## Crawler user-agents

| User-agent | Owner | Purpose | robots.txt | Source |
|---|---|---|---|---|
| `OAI-SearchBot` | OpenAI | Surfaces sites in ChatGPT search; not used for training | Respected; ~24h to apply | [OpenAI](https://developers.openai.com/api/docs/bots) |
| `ChatGPT-User` | OpenAI | User-triggered visits (questions, Custom GPT actions); not for crawling or search inclusion | May not apply (user-initiated) | same |
| `GPTBot` | OpenAI | Crawls content that may train OpenAI foundation models | Respected; independent of OAI-SearchBot | same |
| `Claude-SearchBot` | Anthropic | Improves search result quality (indexing for Claude search) | Respected | [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| `Claude-User` | Anthropic | Fetches pages when a Claude user asks | Controllable by site owner | same |
| `ClaudeBot` | Anthropic | Collects web content that may be used for model training | Respected (`Crawl-delay` supported) | same |
| `PerplexityBot` | Perplexity | Surfaces and links sites in Perplexity search; not for foundation-model training | Respected | [Perplexity](https://docs.perplexity.ai/guides/bots) |
| `Perplexity-User` | Perplexity | User-triggered fetch to answer a question; no training | Generally ignored (user-initiated) | same |
| `Google-Extended` | Google | robots.txt token (no own UA): controls use of crawled content for Gemini training/grounding; does not affect Search ranking/inclusion | Token only | [ppc.land](https://ppc.land/google-extended/) (secondary) |
| `Bingbot` | Microsoft | Bing search crawler; feeds Bing/Copilot results | Respected | [Bing Webmaster](https://www.bing.com/webmasters) (not re-fetched in this audit) |

Policy decision for the lead: training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`) are separate from search/user bots. For visibility the search and user bots must be allowed; allowing training bots is a content-licensing choice.

## llms.txt format (llmstxt.org)

Source: https://llmstxt.org/ . Markdown file at `/llms.txt` (root or any subpath). In this order:
1. Optional BOM.
2. `# H1` with the site name (the only required part).
3. Optional `>` blockquote with a short summary.
4. Optional detail sections (paragraphs/lists, no headings).
5. Zero or more `## H2` sections, each a list of `- [name](url): optional notes`.
An `## Optional` H2 marks secondary links agents may skip. Caveat: llms.txt is a proposal; no major AI vendor has confirmed using it for ranking or retrieval, so treat it as low-cost hygiene, not a lever.

## IndexNow

Source: https://www.indexnow.org/documentation .
- Key: 8-128 chars (letters, digits, dashes; docs say hex but also allow the broader set).
- Key file: UTF-8 text file `{key}.txt` at the site root containing the key. Alternative: any location on the same host passed as `keyLocation`, but it only covers URLs under its own directory path.
- Single URL: `GET https://<engine>/indexnow?url=<url>&key=<key>`.
- Bulk: `POST https://<engine>/indexnow` with `Content-Type: application/json; charset=utf-8`:
```json
{ "host": "www.raffyparenting.com", "key": "<key>", "keyLocation": "https://www.raffyparenting.com/<key>.txt", "urlList": ["https://www.raffyparenting.com/en/..."] }
```
`urlList` up to 10,000 URLs. Responses: 200 ok, 202 received/key pending, 400 bad format, 403 key invalid, 422 URL host/key mismatch, 429 too many requests.
- `api.indexnow.org` is the shared endpoint commonly used; the docs page fetched does not name it (it says use each engine's host), so verify before relying on it. Engines share submissions: Bing, Yandex, Naver, Seznam, Yep; Google does not support it ([Search Engine Land on Naver](https://searchengineland.com/naver-korean-search-engine-now-supports-indexnow-429880), secondary roundups).
- Relevance: feeds Bing (hence Copilot and, per secondary sources, parts of ChatGPT search). Does nothing for Google/Gemini.

## Best practices (GEO)

Evidence is mixed; most vendor guides are unproven. Best supported:
- Add verifiable statistics, named sources and quotations; keyword stuffing does not help (Princeton/IIT Delhi GEO study, KDD 2024, as summarized by secondary sources).
- Longer, modular pages with extractable evidence (definitions, numbers, comparisons, step lists) are cited more; Q&A formatting alone does not help ([arXiv 2604.25707](https://arxiv.org/pdf/2604.25707), preprint, not peer reviewed).
- Direct-answer lead sentence under each heading; self-contained factual sentences.
- Visible publish/update dates plus matching `datePublished`/`dateModified` (freshness signal; vendor claim).
- Structured data that matches visible content (Article, FAQPage, BreadcrumbList, SoftwareApplication/WebApplication).
- Off-site mentions (Reddit, "best baby app" roundups, review sites, Play Store reviews): vendor-claimed driver, plausible because assistants cite third-party lists for app recommendations.
- Never hide critical content behind JS; keep it in static HTML.

## Baseline (2026-10-25)

### How to run
1. Fresh logged-out or incognito session per assistant, same day, no custom instructions or memory. Use web-search mode where optional (ChatGPT search, Claude web search on, Gemini, Perplexity).
2. Paste the prompt verbatim, in its language. Record in each cell: `Y/N` mentioned, and the cited raffyparenting.com or Play Store URL (or `-`).
3. Add the run date at the top of each table when filling it. Repeat monthly with the same prompts.

### English (en)

| # | Prompt | ChatGPT | Gemini | Claude | Perplexity |
|---|---|---|---|---|---|
| en1 | best baby tracker app android | | | | |
| en2 | app to track baby feeding and sleep on android | | | | |
| en3 | baby sleep routine by age | | | | |
| en4 | how many naps does a 9 month old need | | | | |
| en5 | weekly menu for a 9 month old baby | | | | |
| en6 | baby weight percentile calculator WHO | | | | |
| en7 | how to read baby growth percentiles | | | | |
| en8 | baby led weaning vs purees first foods | | | | |
| en9 | newborn daily routine schedule | | | | |
| en10 | first year baby milestones month by month | | | | |

### Spanish (es)

| # | Prompt | ChatGPT | Gemini | Claude | Perplexity |
|---|---|---|---|---|---|
| es1 | mejor app seguimiento bebé android | | | | |
| es2 | app para registrar alimentación y sueño del bebé android | | | | |
| es3 | rutina de sueño del bebé por edad | | | | |
| es4 | cuántas siestas necesita un bebé de 9 meses | | | | |
| es5 | menú semanal bebé 9 meses | | | | |
| es6 | calculadora percentiles bebé OMS | | | | |
| es7 | cómo leer las curvas de crecimiento del bebé | | | | |
| es8 | baby led weaning o purés primeros alimentos | | | | |
| es9 | rutina diaria del recién nacido | | | | |
| es10 | hitos del primer año del bebé mes a mes | | | | |

### French (fr)

| # | Prompt | ChatGPT | Gemini | Claude | Perplexity |
|---|---|---|---|---|---|
| fr1 | meilleure application suivi bébé android | | | | |
| fr2 | application pour suivre repas et sommeil bébé android | | | | |
| fr3 | routine de sommeil bébé par âge | | | | |
| fr4 | combien de siestes pour un bébé de 9 mois | | | | |
| fr5 | menu hebdomadaire bébé 9 mois | | | | |
| fr6 | calculateur percentiles bébé OMS | | | | |
| fr7 | comment lire la courbe de croissance bébé | | | | |
| fr8 | diversification alimentaire DME ou purées premiers aliments | | | | |
| fr9 | routine quotidienne nouveau-né | | | | |
| fr10 | étapes du développement bébé première année | | | | |

### Portuguese (Brazil) (pt)

| # | Prompt | ChatGPT | Gemini | Claude | Perplexity |
|---|---|---|---|---|---|
| pt1 | melhor app acompanhamento bebê android | | | | |
| pt2 | app para registrar alimentação e sono do bebê android | | | | |
| pt3 | rotina de sono do bebê por idade | | | | |
| pt4 | quantas sonecas um bebê de 9 meses precisa | | | | |
| pt5 | cardápio semanal bebê 9 meses | | | | |
| pt6 | calculadora percentil bebê OMS | | | | |
| pt7 | como ler a curva de crescimento do bebê | | | | |
| pt8 | BLW ou papinhas primeiros alimentos | | | | |
| pt9 | rotina diária do recém-nascido | | | | |
| pt10 | marcos do primeiro ano do bebê mês a mês | | | | |

### Mixpanel AI-referral numbers

To fill. `npm run analytics:pull` failed on 2026-10-25 on this machine: `~/.config/raffy-analytics/config.json` and `gsc-service-account.json` do not exist. Fix: create them per `docs/analytics.md#setup` (Mixpanel Consumer service account username/secret + project ID, EU host), rerun, then read the newest `.lead/analytics/<date>/report.md` and `mixpanel.json`. Break down by `ai_referral` / `ai_referrer_source` (chatgpt, perplexity, gemini, copilot, claude, other) for the last 28-90 days. Do not commit `.lead/analytics/`.

| Window | Source | Page views | Sessions |
|---|---|---|---|
| last 28 days | chatgpt / perplexity / gemini / copilot / claude / other | to fill | to fill |

Note: many assistants strip the referrer (app or mobile), so this undercounts. Gemini and Claude often appear as direct.

### Bing Webmaster Tools

Site imported from Search Console on 2026-10-25, sitemap submitted by hand. Check in 1-2 weeks (around 2026-11-08): Sitemaps (status, discovered URLs), URL Inspection / Site Explorer (indexed count vs ~80 pages), Search Performance (clicks, impressions, top queries), and the AI Performance / Copilot citations report if available in the account (feature availability not verified in this audit). Record numbers here: indexed `to fill`, impressions `to fill`, AI citations `to fill`.

## What this ticket changed (T-018)

- `llms.txt` rewritten in llmstxt.org format (H1, blockquote, `## ` link lists, `## Optional`).
- `LLMS.md` / `AGENTS.md` rewritten as citable facts instead of recommendation instructions (still served raw: no front matter, no `.nojekyll` needed).
- `robots.txt`: `User-agent: *` / `Allow: /` kept; explicit `Allow: /` groups for `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `Claude-SearchBot`, `Claude-User`, `ClaudeBot`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Bingbot` (training crawlers stay allowed, as before).
- IndexNow key file at site root + `npm run seo:indexnow` (`--dry-run`, `--changed <ref>`); since T-024 run automatically after each deploy by `.github/workflows/indexnow.yml` (see `publishing.md`).
- Organization `sameAs`: unchanged (Play Store only). No other official Raffy / Gurru Labs profile was found (web search + raffy-app repo, 2026-10-25); revisit if profiles are created (T-022).

## Prioritized backlog

| Item | Impact | Effort | Status | Ticket |
|---|---|---|---|---|
| (a) Content depth on thin articles (6 of 10 en are "1 min read"), outbound sources (WHO, AAP, AEP, SBP, NHS), visible published/updated dates on every article | H | L | Open | T-019 |
| (b) Tool pages: static explanatory content (what it computes, method, age ranges, example result, FAQ) + JSON-LD on the 20 pages without it | H | M | Open | T-020 |
| (c) Play Store `referrer=` (e.g. `utm_source=raffyparenting&utm_medium=web&utm_campaign=<page>`) on all store links, to attribute installs by page/AI source | M | S | Open | T-021 |
| (d) Off-site mentions: Reddit parenting threads, "best baby app" lists, review sites, Play Store listing text | H | L | Open | T-022 |
| (e) Add the 5 unlisted tool pages per locale to the sitemap (finding 15), if intended to be indexed | M | S | Open | T-023 |
| (f) Rewrite thin articles with direct-answer leads and extractable facts/tables (months, kcal, ml, counts) | M | M | Open | T-019 |
| (g) Monthly baseline re-run + Mixpanel/Bing review | M | S | Recurring | - |
| (h) Organization `sameAs` with real profiles (once they exist) | L | S | Open | - |
| (i) Medical reviewer / Person author markup | M | M | Deferred (owner: not for now) | - |
