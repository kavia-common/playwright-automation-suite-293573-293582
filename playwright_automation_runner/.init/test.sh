#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
# Ensure start script exists
START_SCRIPT=""
if [ -f scripts/start-headless.mjs ]; then START_SCRIPT=scripts/start-headless.mjs; elif [ -f scripts/start-headless.js ]; then START_SCRIPT=scripts/start-headless.js; else echo "ERROR: start script missing" >&2; exit 2; fi
PROBE_LOG=/tmp/playwright_probe.log
# Run short-lived probe and capture logs
node "$START_SCRIPT" > "$PROBE_LOG" 2>&1 || { tail -n 200 "$PROBE_LOG" >&2; echo "PROBE_FAILED" >&2; exit 3; }
# Run a single playwright test (CI-friendly)
npx playwright test tests/example.spec.* --reporter=list --forbid-only --workers=1 || { echo "PLAYWRIGHT_TESTS_FAILED" >&2; exit 7; }
