# T-010 locale port brief (S5 es / S6 fr / S7 pt)

Read RULES.md and S1-NOTES.md in this folder first. EN is finished and committed (commits 4878e84, ccd3d19, 15e4cfe on lead/T-010). Your job: bring every page of YOUR locale to the same B v2 markup as its EN equivalent, with all new strings translated natively (pt = Brazilian Portuguese; es = Spain Spanish as the site uses; fr = France French), keeping the locale page's OWN existing text, links, head, JSON-LD and CTAs exactly (checker compares each page with main).

Page map (EN → your locale) comes from `seo/articles.manifest.json`. Pages to port in your locale:
- home (`<loc>/index.html`) ← `en/index.html`
- tools hub, growth tool, 5 cluster tools (wake window, nap transition, feeding quantity, diaper output, solids progression), meal planner ← `en/tools/*`
- 10 articles + library index ← `en/articles/*` (your locale has no naps 0–2 article). Run `node .lead/scratch/T-010/articles-transform.mjs <your articles dir>` (try `--dry` first; it has es/fr/pt string tables already), then hand-check every article against its EN twin and fix what the script missed.
- newsletter page: only what EN got (light touch).
- about/contact/legal: nothing (header already done).

How: for each page, read `git diff main -- en/<page>` and the EN page now, and the locale page; restructure the locale page into the same markup, placing the locale's existing text where the EN text sits. When the locale page has text the EN page lacks (or vice versa), keep it and place it sensibly. New strings: list them with `node .lead/scratch/T-010/check-invariants.mjs --verbose en/<page>` (shows EN new strings) and translate them. Reuse translations already defined in: S1-NOTES.md (header button, sticky bar), `articles-transform.mjs` STRINGS table, `tools/percentile-calculator.js` LOCALES and `tools/tool-cluster.js` locale packs — same term for the same thing everywhere. Image choice: use locale variants where they exist (e.g. `portada_es.webp`, `doctor_es.webp`, `sleep_es.webp` for es only); otherwise the same as EN. Play badge image: keep the locale's existing badge URL.

Decided: articles keep both the existing "By Gurru Labs <date>" byline paragraph and the new "<editorial team>" line in the hero. Don't add any text claims EN doesn't have.

Do NOT edit shared files (`styles.css`, `script.js`, `tools/*`, `articles/article.css`, `articles/article.js`, `scripts/*`, `articles-transform.mjs` — if the script needs a fix, copy it to `articles-transform-<loc>.mjs` and tell the Lead). Two other locale workers run in parallel; touch only your locale folder. If shared CSS/JS breaks for your locale (e.g. long words), report it with page + width instead of fixing.

Checks (all must pass, report excerpts):
- `node .lead/scratch/T-010/check-invariants.mjs <loc>` → FAIL=0.
- `npm run seo:validate` passes.
- headless Chrome via CDP at 390 and 1200 for home, tools hub, growth tool (run a calculation), wake tool (result + error), one article with a menu table if any, library: no console errors, `document.documentElement.scrollWidth` equals the viewport width (no horizontal overflow), long labels don't break buttons/header. Look at the screenshots of home, growth result and one article at 390 and compare with the EN ones in `.lead/attachments/T-010/after-*`. Save `.lead/attachments/T-010/after-<loc>-home-390.png` and `after-<loc>-growth-result-390.png`.
- Compute equality: growth tool for girl 6 months 7.3 kg 66 cm shows 50th / length 55th as EN.

Final message: files changed, checks with excerpts, the full table of new strings you added (EN → your translation), deviations, not verified.
