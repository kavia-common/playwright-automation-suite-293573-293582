#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
# Deterministic install: use npm ci if lockfile present, otherwise npm install
if [ -f package-lock.json ]; then npm ci --omit=optional --no-audit --no-fund; else npm install --omit=optional --no-audit --no-fund; fi
# Ensure playwright CLI available (npx will fetch if not globally installed)
if ! npx playwright --version >/dev/null 2>&1; then echo "WARN: playwright CLI not responding via npx; continuing (npx will bootstrap)" >&2; fi
# Determine probe script
PROBE_LOG=/tmp/playwright_probe.log
START_SCRIPT=""
if [ -f scripts/start-headless.mjs ]; then START_SCRIPT=scripts/start-headless.mjs; elif [ -f scripts/start-headless.js ]; then START_SCRIPT=scripts/start-headless.js; else echo "ERROR: start script missing (scripts/start-headless.js or .mjs)" >&2; exit 6; fi
# Run probe once; on failure attempt to install chromium and retry once
rm -f "$PROBE_LOG" || true
if node "$START_SCRIPT" > "$PROBE_LOG" 2>&1; then :; else
  echo "Probe failed, attempting to install chromium via Playwright CLI" >&2
  # Try install chromium only
  if ! npx playwright install chromium >/dev/null 2>&1; then
    tail -n 200 "$PROBE_LOG" >&2 || true
    echo "ERROR: playwright install chromium failed" >&2
    exit 3
  fi
  # retry probe
  if ! node "$START_SCRIPT" >> "$PROBE_LOG" 2>&1; then tail -n 200 "$PROBE_LOG" >&2 || true; echo "ERROR: runtime browser validation failed after install" >&2; exit 7; fi
fi
# Print installed versions for traceability
PW_INSTALLED=$(node -e "try{console.log(require('./node_modules/playwright/package.json').version)}catch(e){process.stdout.write('')}")
PWTEST_INSTALLED=$(node -e "try{console.log(require('./node_modules/@playwright/test/package.json').version)}catch(e){process.stdout.write('')}")
echo "playwright:${PW_INSTALLED:-<not-found>} @playwright/test:${PWTEST_INSTALLED:-<not-found>}"
if [ -z "${PW_INSTALLED:-}" ] || [ -z "${PWTEST_INSTALLED:-}" ]; then echo "ERROR: playwright or @playwright/test not found in node_modules" >&2; exit 4; fi
PW_MAJ=${PW_INSTALLED%%.*}
PWT_MAJ=${PWTEST_INSTALLED%%.*}
if [ "$PW_MAJ" != "$PWT_MAJ" ]; then echo "ERROR: major version mismatch between playwright($PW_INSTALLED) and @playwright/test($PWTEST_INSTALLED)" >&2; exit 5; fi
# Success indicator
echo "Playwright dependencies installed and browser probe passed. Probe log: $PROBE_LOG"
