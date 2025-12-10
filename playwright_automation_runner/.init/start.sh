#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
mkdir -p "$WS/.artifacts"
# Start ephemeral static server in background
python3 -m http.server 8080 --directory "$WS" >/dev/null 2>&1 &
echo $! > "$WS/.artifacts/ephemeral_server.pid"
# wait briefly for server to come up
sleep 1
# verify responsiveness within 5s
if ! curl -sS --max-time 5 http://127.0.0.1:8080/ >/dev/null 2>&1; then
  echo "Ephemeral python server failed to respond on 8080" >&2
  # attempt clean stop
  if [ -f "$WS/.artifacts/ephemeral_server.pid" ]; then
    kill "$(cat $WS/.artifacts/ephemeral_server.pid)" >/dev/null 2>&1 || true
    rm -f "$WS/.artifacts/ephemeral_server.pid" || true
  fi
  exit 10
fi
exit 0
