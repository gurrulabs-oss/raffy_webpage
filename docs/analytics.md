# Analytics (Search Console + Mixpanel)

Read-only pulls the Lead uses to pick article topics and get pages indexed. Driven by the `analytics` skill.

## Commands
- `npm run analytics:pull` — `scripts/analytics/all.mjs`: `gsc.mjs --index` → `mixpanel.mjs` → `report.mjs`.
  Continues past a failed source; exit 0 all ok, 2 all sources lack credentials, else first failure code.
- `npm run analytics:report [-- --dir <snapshot dir>]` — rebuild `report.md` from existing JSON.
- Flags (each script): `--fixtures scripts/analytics/fixtures` (canned fake responses, no credentials, no
  network), `--out <dir>`, `--no-submit` (gsc: read-only scope, skip sitemap resubmit).
- Output: `.lead/analytics/<UTC date>/{gsc,index,mixpanel}.json`, `report.md` (gitignored, dot folder so
  GitHub Pages never serves it).
- Windows: current = 28 days ending 3 days ago (GSC lag), previous = the 28 days before. Rising query =
  impressions ≥ 20 and +≥50% (or new). Low-CTR page = ≥ 100 impressions and CTR < half its locale's median.
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
Mondays 06:00 via macOS `launchd` on the owner's Mac: `scripts/analytics/weekly.sh` runs
`claude -p "Use the analytics skill in weekly mode."` in the repo (writes `weekly.md`, files ≤ 2 inbox tickets).
Install once, from the main checkout:
```sh
sed -e "s#REPO_PATH#$PWD#" -e "s#HOME_PATH#$HOME#" scripts/analytics/com.raffyparenting.analytics-weekly.plist \
  > ~/Library/LaunchAgents/com.raffyparenting.analytics-weekly.plist
launchctl load ~/Library/LaunchAgents/com.raffyparenting.analytics-weekly.plist
```
Run now: `launchctl start com.raffyparenting.analytics-weekly`. Log: `~/Library/Logs/raffy-analytics.log`.
If the Mac is asleep at 06:00 it runs on wake; if it is off, that week is skipped.
Uninstall: `launchctl unload` the same file and delete it.
