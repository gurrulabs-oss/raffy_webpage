---
name: analytics
description: Pull fresh Search Console + Mixpanel data for raffyparenting.com, check which sitemap URLs Google has indexed, and interpret it. Use when defining/planning a content ticket, when the owner asks about traffic, queries, indexing or conversions, and in the weekly (Monday) report run, which also files up to 2 article proposals as inbox tickets.
---

Read-only analytics for the Lead. Setup and credentials: `docs/analytics.md`.

## 1. Pull
- `npm run analytics:pull` (gsc + URL inspection + sitemap resubmit → mixpanel → report). Takes ~1 min
  (83 URL inspections). Writes `.lead/analytics/<UTC date>/{gsc,index,mixpanel}.json` + `report.md`.
- Exit 2 = credentials missing: tell the owner which file (the message names it) and point to
  `docs/analytics.md#setup`. Do not retry or invent numbers. A failed source still leaves the others' report.
- Already pulled today and only need the numbers? Read the existing `report.md` instead of pulling again
  (GSC data only moves daily; the URL Inspection quota is ~2,000/day).
- Never commit `.lead/analytics/`; never print or copy credential files.

## 2. Read
Read `report.md` first; open the JSON only for a detail the report lacks (e.g. all pages for one query:
filter `gsc.json` `current.rows`). Older snapshots in sibling dated dirs give week-over-week trends.
Caveats to state when relevant: GSC lags ~3 days and anonymises rare queries (query rows sum to less than
page totals); Mixpanel counts only `Raffy Webpage - ` events from browsers that load it; downloads are Play
Store clicks, not installs. Small counts (< ~30 views, < ~100 impressions) are noise, say so.

## 3. On-demand use (define/plan of a content ticket, owner questions)
Answer with the few numbers that matter for the decision, with the window and their uncertainty.

## 4. Weekly mode (scheduled Monday run, prompt says "weekly")
1. Pull. Write a short report (≤ ~150 words) to `.lead/analytics/<date>/weekly.md`:
   clicks/impressions by locale with Δ, 3-5 notable top/rising queries, high-impression/low-CTR pages
   (title/meta fix candidates), best/worst converting pages, and the URLs needing a manual
   "Request indexing" (list them; sitemap resubmitted yes/no).
2. Propose **at most 2** new articles or content lines, only if the data supports them (0 is fine):
   - Evidence: queries with impressions where no page targets them well (position > 10, or the ranking page is
     off-topic), rising query clusters, or a locale with demand but no equivalent page.
   - Deduplicate: skip ideas already covered by an existing page (`seo/articles.manifest.json`, page titles)
     or by any ticket in `.lead/tickets/*.md` (title + Spec), whatever its status.
   - File each with the `ticket` skill (`status: inbox`). Fill the Summary with **Need / Why it matters /
     Proposed / Size guess** (≤ 60 words) and put the supporting numbers (queries, impressions, position,
     window, locale) in the Spec. Content ships in all 4 locales; name the target query per locale if known.
3. Do not edit site files, commit, or push in weekly mode. Only `.lead/analytics/` and new ticket files change.
