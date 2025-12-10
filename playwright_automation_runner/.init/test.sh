#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
mkdir -p "$WS/.artifacts"
export CI=true
# Ensure deterministic install before running tests (no network installs during test runtime)
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund --silent
else
  npm i --no-audit --no-fund --silent
fi
# run playwright tests, preserve exit code
rc=0
npx playwright test --config=playwright.config.js --reporter=json > "$WS/.artifacts/validation_playwright_test.json" 2> "$WS/.artifacts/validation_playwright_test.log" || rc=$?
rc=${rc:-0}
# also capture a short summary
jq -r '{status: .status, errors: .errors?}' "$WS/.artifacts/validation_playwright_test.json" > "$WS/.artifacts/validation_playwright_test_summary.json" 2>/dev/null || true
exit $rc
