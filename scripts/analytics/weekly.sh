#!/bin/bash
# Weekly analytics run (launchd, Mondays 06:00): pull data, write report, file <=2 article proposals + <=1 indexing ticket.
# Install: see docs/analytics.md#weekly-run. Runs in the repo this script lives in.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")/../.." || exit 1
echo "=== $(date -u +%FT%TZ) weekly analytics run"
# The pull takes ~13 min (100 URL inspections): run it here, not inside claude -p (Bash tool max timeout is 10 min).
npm run analytics:pull
pull=$?
echo "=== analytics:pull exit $pull"
# Search queries are outside text: allow only the analytics scripts and writes to snapshots/tickets.
claude -p "Use the analytics skill in weekly mode. The pull already ran (npm run analytics:pull exit code $pull)." \
  --allowedTools "Bash(npm run analytics:report)" Read Glob Grep Skill \
  "Write(./.lead/analytics/**)" "Edit(./.lead/analytics/**)" "Write(./.lead/tickets/**)" "Edit(./.lead/tickets/**)"
