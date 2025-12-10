#!/usr/bin/env bash
set -euo pipefail
# Test runner for Playwright (headless, single worker)
WORKSPACE="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WORKSPACE"
export DISPLAY="${DISPLAY:-:99}"
PLAYWRIGHT_BIN="./node_modules/.bin/playwright"
if [ -x "$PLAYWRIGHT_BIN" ]; then
  exec "$PLAYWRIGHT_BIN" test --reporter=list --workers=1
else
  if command -v npx >/dev/null 2>&1; then
    exec npx playwright test --reporter=list --workers=1
  else
    echo "Error: playwright CLI not found. Ensure you have added '@playwright/test' or 'playwright' as a devDependency and run the deps/install step." >&2
    exit 12
  fi
fi
