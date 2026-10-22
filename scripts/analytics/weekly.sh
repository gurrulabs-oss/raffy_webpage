#!/bin/bash
# Weekly analytics run (launchd, Mondays 06:00): pull data, write report, file <=2 inbox tickets.
# Install: see docs/analytics.md#weekly-run. Runs in the repo this script lives in.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")/../.." || exit 1
echo "=== $(date -u +%FT%TZ) weekly analytics run"
claude -p "Use the analytics skill in weekly mode." \
  --permission-mode acceptEdits \
  --allowedTools "Bash(npm run analytics:pull) Bash(npm run analytics:report) Bash(node scripts/analytics/*) Read Write Edit Glob Grep Skill"
