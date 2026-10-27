# Analytics (Search Console + Mixpanel)

Read-only pulls the Lead uses to pick article topics and get pages indexed. Driven by the `analytics` skill.

## Commands
- `npm run analytics:pull` — `scripts/analytics/all.mjs`: `gsc.mjs --index` → `mixpanel.mjs` → `site-audit.mjs` (optional, never blocks) → `report.mjs`.
  Takes ~13 min (7 s per URL inspection, 100 URLs): run it detached / without a short timeout.
  Continues past a failed source; exit 0 all ok, 2 all sources lack credentials, else first failure code.
- `npm run analytics:report [-- --dir <snapshot dir>]` — rebuild `report.md` from existing JSON.
- Flags (each script): `--fixtures scripts/analytics/fixtures` (canned fake responses, no credentials, no
  network), `--out <dir>`, `--no-submit` (gsc: read-only scope, skip sitemap resubmit).
- Output: `.lead/analytics/<UTC date>/{gsc,index,mixpanel}.json`, `report.md` (gitignored, dot folder so
  GitHub Pages never serves it).
- Windows: current = 28 days ending 3 days ago (GSC lag), previous = the 28 days before. Rising query =
  impressions ≥ 20 and +≥50% (or new). Low-CTR page = ≥ 100 impressions and CTR < half its locale's CTR.
  The index check covers sitemap pages only (`.html` or `/`), not `AGENTS.md`/`LLMS.md`.
- Report **Indexing** section: indexed trend over the last 4 prior sibling snapshots, target-pages line (excludes
  legal/trust pages, target 80%), newly non-indexed, and non-indexed ≥ 2 weeks with probable cause from `site-audit.json`.
  Offline check: `node scripts/analytics/test-indexing.mjs`.
- Mixpanel: raw export (EU), only `Raffy Webpage - ` events; page view = any prefixed event except
  Download Button Clicked / Growth Tool Submit Clicked / Growth Tool Results Shown; path from `path` property.
- Google has no API for "Request indexing" on normal pages: the report lists not-indexed sitemap URLs for a
  manual request; the sitemap is resubmitted via API (needs a "Full" GSC user, else logged and skipped).

## Setup
Credentials live outside the repo in `~/.config/raffy-analytics/` (override: `RAFFY_ANALYTICS_DIR`).
Never commit them.

**Search Console** (file `gsc-service-account.json`)
1. console.cloud.google.com → create/select a project → APIs & Services → enable **Google Search Console API**.
2. IAM & Admin → Service accounts → create (no roles needed) → Keys → Add key → JSON. Save it as
   `~/.config/raffy-analytics/gsc-service-account.json` (`chmod 600`).
3. search.google.com/search-console → property `raffyparenting.com` → Settings → Users and permissions → Add
   user: the service account's email, permission **Full** (allows sitemap resubmit; cannot add users).
   With **Restricted**, everything works except the resubmit.

**Mixpanel** (in `config.json`)
1. Mixpanel → Organization settings → Service accounts → create, role **Consumer**, access to the shared
   Gurru Labs websites project. Copy username + secret (shown once).
2. Project settings → copy the **Project ID**. The project is in the EU data residency.

`~/.config/raffy-analytics/config.json`:
```json
{ "gscProperty": "sc-domain:raffyparenting.com",
  "mixpanel": { "username": "<sa username>", "secret": "<sa secret>", "projectId": "<id>", "host": "eu" } }
```
If the GSC property is a URL-prefix property, use `"https://www.raffyparenting.com/"` instead.
Test: `npm run analytics:pull`, then open the newest `.lead/analytics/*/report.md`.

## Weekly run
Mondays 06:00 via macOS `launchd` on the owner's Mac: `scripts/analytics/weekly.sh` first runs
`npm run analytics:pull` itself (~13 min; `claude -p` Bash calls time out at 10 min max), then
`claude -p "Use the analytics skill in weekly mode."` reads the fresh report (writes `weekly.md`, files ≤ 2 article
proposals, plus 1 indexing ticket when the report lists pages non-indexed ≥ 2 weeks).
Needs the `analytics` skill in `.claude/skills/` (the hub moves it there from `.lead/pending-claude/`).
The run reads search queries (outside text), so it may only run the analytics npm scripts and write under
`.lead/analytics/` and `.lead/tickets/`; everything else is denied (it cannot start a pull).
Install once, from the main checkout:
```sh
sed -e "s#REPO_PATH#$PWD#" -e "s#HOME_PATH#$HOME#" scripts/analytics/com.raffyparenting.analytics-weekly.plist \
  > ~/Library/LaunchAgents/com.raffyparenting.analytics-weekly.plist
launchctl load ~/Library/LaunchAgents/com.raffyparenting.analytics-weekly.plist
```
Run now: `launchctl start com.raffyparenting.analytics-weekly`. Log: `~/Library/Logs/raffy-analytics.log`.
If the Mac is asleep at 06:00 it runs on wake; if it is off, that week is skipped.
Uninstall: `launchctl unload` the same file and delete it.
