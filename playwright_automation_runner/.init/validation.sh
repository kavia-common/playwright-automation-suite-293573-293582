#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
# Deterministic install/build
if [ -f package-lock.json ]; then npm ci --omit=optional --no-audit --no-fund; else npm install --omit=optional --no-audit --no-fund; fi
# Run short-lived probe
START_SCRIPT=""
if [ -f scripts/start-headless.mjs ]; then START_SCRIPT=scripts/start-headless.mjs; elif [ -f scripts/start-headless.js ]; then START_SCRIPT=scripts/start-headless.js; else echo "ERROR: start script missing" >&2; exit 2; fi
PROBE_LOG=/tmp/playwright_probe.log
node "$START_SCRIPT" > "$PROBE_LOG" 2>&1 || { tail -n 200 "$PROBE_LOG" >&2; echo "VALIDATION_FAILED: probe failed" >&2; exit 3; }
# Start long-running agent (scripts/agent.js)
AGENT_SCRIPT="scripts/agent.js"
if [ ! -f "$AGENT_SCRIPT" ]; then echo "ERROR: agent script missing" >&2; exit 4; fi
nohup node "$AGENT_SCRIPT" > /tmp/playwright_agent.log 2>&1 &
PID=$!
sleep 2
if ! kill -0 "$PID" >/dev/null 2>&1; then echo "VALIDATION_FAILED: agent failed to start; log:" >&2; tail -n 200 /tmp/playwright_agent.log || true; exit 5; fi
# Stop agent gracefully
kill -TERM "$PID" >/dev/null 2>&1 || true
for i in 1 2 3 4 5; do if ! kill -0 "$PID" >/dev/null 2>&1; then break; fi; sleep 1; done
if kill -0 "$PID" >/dev/null 2>&1; then echo "VALIDATION_FAILED: agent did not stop" >&2; kill -KILL "$PID" >/dev/null 2>&1 || true; exit 6; fi
# Show agent log for evidence
tail -n 200 /tmp/playwright_agent.log || true
# Run a single quick playwright test as final verification
npx playwright test tests/example.spec.* --reporter=list --forbid-only --workers=1 || (echo "VALIDATION_FAILED: playwright tests failed" >&2; exit 7)
echo "VALIDATION_OK: build/probe/agent-start-stop/test lifecycle succeeded"
