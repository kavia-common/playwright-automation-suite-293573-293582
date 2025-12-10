#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
# Best-effort source persisted env
# shellcheck disable=SC1091
source /etc/profile.d/playwright_env.sh || true
mkdir -p "$WS/.artifacts"
# Build/install deterministically
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund --silent
else
  npm i --no-audit --no-fund --silent
fi
# Record versions for evidence
node -v > "$WS/.artifacts/node_version.txt" 2>/dev/null || true
npm -v  > "$WS/.artifacts/npm_version.txt" 2>/dev/null || true
npx --no-install playwright --version > "$WS/.artifacts/playwright_cli_version.txt" 2>/dev/null || true
# Start ephemeral server
python3 -m http.server 8080 --directory "$WS" >/dev/null 2>&1 &
server_pid=$!
echo "$server_pid" > "$WS/.artifacts/ephemeral_server.pid"
# Wait and verify responsiveness
sleep 1
if ! curl -sS --max-time 5 http://127.0.0.1:8080/ >/dev/null 2>&1; then
  echo "Ephemeral python server failed to respond on 8080" >&2
  kill "$server_pid" >/dev/null 2>&1 || true
  wait "$server_pid" 2>/dev/null || true
  exit 10
fi
# Run tests and collect artifacts; preserve playwright exit code
export CI=true
rc=0
npx playwright test --config=playwright.config.js --reporter=json > "$WS/.artifacts/validation_playwright_test.json" 2> "$WS/.artifacts/validation_playwright_test.log" || rc=$?
rc=${rc:-0}
# Stop server cleanly
kill "$server_pid" >/dev/null 2>&1 || true
wait "$server_pid" 2>/dev/null || true
rm -f "$WS/.artifacts/ephemeral_server.pid" || true
# List artifacts
ls -la "$WS/.artifacts" || true
if [ "$rc" -ne 0 ]; then
  echo "validation: tests failed; see $WS/.artifacts/validation_playwright_test.log" >&2
  exit "$rc"
fi
echo "validation: success; artifacts in $WS/.artifacts"
exit 0
