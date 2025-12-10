#!/usr/bin/env bash
set -euo pipefail
# validation - build, start local server if present, run tests and cleanup
WORKSPACE="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WORKSPACE"
# evidence: node/npm
if ! command -v node >/dev/null 2>&1; then
  echo "Error: node not found in PATH" >&2; exit 20
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm not found in PATH" >&2; exit 21
fi
echo "node: $(node -v) npm: $(npm -v)"
PLAYWRIGHT_BIN="./node_modules/.bin/playwright"
if [ -x "$PLAYWRIGHT_BIN" ]; then
  "$PLAYWRIGHT_BIN" --version || true
fi
# run build if package.json has a build script
if [ -f package.json ] && grep -q '"build"' package.json; then
  echo "Running npm run build..."
  if ! npm run build --silent; then
    echo "Error: npm run build failed. Inspect build logs and package scripts." >&2; exit 13
  fi
fi
# prepare to start static server if index.html present
SERVER_PID=0
PORT=3000
trap 'code=$?; if [ "$SERVER_PID" -ne 0 ] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then kill "$SERVER_PID" >/dev/null 2>&1 || true; fi; exit "$code"' EXIT
LOCAL_URL="http://127.0.0.1:$PORT"
if [ -f index.html ]; then
  # start python static server in background
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER_PID=$!
  attempts=0; max=10
  until curl -s --max-time 2 "$LOCAL_URL" >/dev/null 2>&1; do
    attempts=$((attempts+1))
    if [ $attempts -ge $max ]; then
      echo "Error: static server did not become healthy after $max attempts" >&2
      exit 14
    fi
    sleep 1
  done
  export LOCAL_TEST_URL="$LOCAL_URL"
  echo "Static server started at $LOCAL_TEST_URL (pid $SERVER_PID)"
fi
export DISPLAY="${DISPLAY:-:99}"
# run Playwright tests and capture exit code reliably
TEST_EXIT=0
if [ -x "$PLAYWRIGHT_BIN" ]; then
  "$PLAYWRIGHT_BIN" test --reporter=list --workers=1 || TEST_EXIT=$?
else
  if command -v npx >/dev/null 2>&1; then
    npx --yes playwright test --reporter=list --workers=1 || TEST_EXIT=$?
  else
    echo "Error: playwright CLI not available (no local ./node_modules/.bin/playwright and no npx). Install devDependency 'playwright' or use 'npx playwright'." >&2
    TEST_EXIT=15
  fi
fi
# If tests failed, print concise evidence then exit with same code
if [ "$TEST_EXIT" -ne 0 ]; then
  echo "Validation tests failed with exit ${TEST_EXIT}" >&2
  echo "-- Evidence --"
  echo "node: $(node -v) npm: $(npm -v)"
  if [ -x "$PLAYWRIGHT_BIN" ]; then
    "$PLAYWRIGHT_BIN" --version || true
  fi
  ls -la "$WORKSPACE" | sed -n '1,40p'
  exit "$TEST_EXIT"
fi
# success: print evidence and exit 0
echo "-- Evidence --"
echo "node: $(node -v) npm: $(npm -v)"
if [ -x "$PLAYWRIGHT_BIN" ]; then
  "$PLAYWRIGHT_BIN" --version || true
fi
ls -la "$WORKSPACE" | sed -n '1,40p'
exit 0
