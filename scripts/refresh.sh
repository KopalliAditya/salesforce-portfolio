#!/bin/zsh
# Daily portfolio stats refresh (invoked by launchd).
# Runs locally because the internal sources — git.soma/core clones and GUS —
# are only reachable from this machine, never from a cloud runner.
set -eu

REPO="$HOME/sf-portfolio"
LOG="$REPO/scripts/refresh.log"

# Make node / sf / gh / fd / jq resolvable under launchd's bare PATH.
export PATH="$HOME/.devbar/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/current/bin:$PATH"

{
  echo "---- $(date '+%Y-%m-%d %H:%M:%S') ----"
  cd "$REPO"
  node scripts/update-stats.mjs --push
} >> "$LOG" 2>&1
