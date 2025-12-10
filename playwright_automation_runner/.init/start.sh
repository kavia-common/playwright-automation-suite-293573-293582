#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
AGENT_SCRIPT="scripts/agent.js"
LOG=/tmp/playwright_agent.log
if [ ! -f "$AGENT_SCRIPT" ]; then echo "ERROR: agent script missing: $AGENT_SCRIPT" >&2; exit 4; fi
# Start agent in background, redirect logs
nohup node "$AGENT_SCRIPT" > "$LOG" 2>&1 &
PID=$!
# Give it a moment to come up
sleep 2
if ! kill -0 "$PID" >/dev/null 2>&1; then echo "AGENT_START_FAILED: agent failed to start; log:" >&2; tail -n 200 "$LOG" >&2 || true; exit 5; fi
# Print PID for callers
echo "$PID"
