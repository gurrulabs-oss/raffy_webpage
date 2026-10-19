---
name: verify
description: Verify changes in Raffy Web with the project's real SEO and tool validators. Use after implementing anything and before writing a ticket Summary.
---

There is no build, test suite or linter. Run from the repo root, in order, stopping at the first failure:

1. `npm run seo:sync` — then `git status --short`. Revert collateral diffs in files the ticket did not touch
   (`git checkout -- <file>`): duplicate `"publisher"` JSON-LD lines are a known bug (skip once fixed).
2. `npm run seo:sitemap` — keep `sitemap.xml` only if URLs were added/removed; otherwise `git checkout -- sitemap.xml robots.txt`.
3. `npm run seo:validate` — must print `SEO validation passed for N localized pages.` (80 as of 2026-10-19; N grows with new pages).
4. If the ticket touches `tools/meal-planner*` or the meal planner pages: `npm run meal:validate`.
   Baseline on 2026-10-19: FAILS with 206 issues. Report the issue count vs baseline; only a higher count is a regression (until the fix ticket lands).
5. `git diff --stat main...HEAD` plus uncommitted diff: confirm every page change exists in en/es/fr/pt and no legal page changed.
6. Optional visual check: `python3 -m http.server 8000` (background) and open the changed pages. In headless runs
   a browser/curl may be unavailable — say "not visually verified" instead.

Report: each command, pass/fail, and the relevant excerpt of failing output (≤20 lines).
If a command cannot run here, say so explicitly — never report it as passed.
