#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WORKSPACE"
# Force dev install environment for this run only
export NODE_ENV=development
# Ensure node and npm meet minimal requirements
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Error: node and/or npm not found. Ensure Node.js (v18+) and npm are installed." >&2; exit 2
fi
NODE_V=$(node --version | sed 's/v//')
# simple semver check for >=18
MAJOR=$(printf "%s" "$NODE_V" | cut -d. -f1)
if [ "${MAJOR:-0}" -lt 18 ]; then
  echo "Error: Node.js v18+ required. Detected: $(node --version)" >&2; exit 3
fi
# Install reproducibly
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund || { echo "Error: 'npm ci' failed; inspect npm output above" >&2; exit 5; }
else
  npm i --no-audit --no-fund || { echo "Error: 'npm install' failed; inspect npm output above" >&2; exit 6; }
fi
PLAYWRIGHT_BIN="./node_modules/.bin/playwright"
SKIP_DOWNLOAD="${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-false}"
# Install browser binaries unless explicitly skipped
if [ "$SKIP_DOWNLOAD" != "true" ]; then
  # prepare a log for failures
  rm -f /tmp/playwright_install_err.log || true
  if [ -x "$PLAYWRIGHT_BIN" ]; then
    if ! "$PLAYWRIGHT_BIN" install --with-deps 2> >(tee /tmp/playwright_install_err.log >&2); then
      echo "Error: 'playwright install --with-deps' failed. Common apt packages required: ca-certificates, fonts-liberation, libnss3, libatk1.0-0, libx11-6, libxkbcommon0, libgtk-3-0, libxss1" >&2
      echo "Inspect /tmp/playwright_install_err.log for details" >&2
      exit 7
    fi
  else
    if command -v npx >/dev/null 2>&1; then
      if ! npx playwright install --with-deps 2> >(tee /tmp/playwright_install_err.log >&2); then
        echo "Error: 'npx playwright install --with-deps' failed. Common apt packages: ca-certificates fonts-liberation libnss3 libatk1.0-0 libx11-6 libxkbcommon0 libgtk-3-0 libxss1" >&2
        echo "See /tmp/playwright_install_err.log for details" >&2
        exit 8
      fi
    else
      echo "Error: Playwright CLI not found and npx unavailable. Ensure '@playwright/test' or 'playwright' is in devDependencies and re-run install." >&2
      exit 9
    fi
  fi
fi
# Verify playwright CLI presence
if [ -x "$PLAYWRIGHT_BIN" ]; then
  if ! "$PLAYWRIGHT_BIN" --version >/dev/null 2>&1; then
    echo "Error: playwright CLI exists but failed --version check" >&2; exit 10
  fi
else
  if command -v npx >/dev/null 2>&1; then
    if ! npx playwright --version >/dev/null 2>&1; then
      echo "Error: playwright CLI not available after install" >&2; exit 11
    fi
  else
    echo "Warning: playwright CLI not found after install" >&2
  fi
fi
# Success
exit 0
