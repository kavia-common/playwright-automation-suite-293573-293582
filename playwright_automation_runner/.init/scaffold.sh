#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WORKSPACE"
mkdir -p "$WORKSPACE"

# Verify node and npm (require Node >=18)
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed or not on PATH. Install Node.js v18+." >&2
  exit 2
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed or not on PATH. Install npm for Node.js." >&2
  exit 3
fi
NODE_VERSION=$(node -v | sed 's/^v//')
NODE_MAJOR=$(printf "%s" "$NODE_VERSION" | cut -d. -f1)
if [ "${NODE_MAJOR:-0}" -lt 18 ]; then
  echo "ERROR: Node.js v18+ required, found v$NODE_VERSION" >&2
  exit 4
fi

# Persist npm global bin to /etc/profile.d for future shells (idempotent)
NPM_GLOBAL_BIN=$(npm bin -g 2>/dev/null || true)
if [ -n "$NPM_GLOBAL_BIN" ]; then
  PROFILE_SH="/etc/profile.d/playwright_env.sh"
  sudo mkdir -p /etc/profile.d
  sudo tee "$PROFILE_SH" >/dev/null <<PROFILE
# Added by scaffold: ensure npm global bin is on PATH for future sessions
if [ -d "$NPM_GLOBAL_BIN" ] && [[ ":$PATH:" != *":$NPM_GLOBAL_BIN:"* ]]; then
  export PATH="$NPM_GLOBAL_BIN:$PATH"
fi
PROFILE
  sudo chmod 644 "$PROFILE_SH"
fi

# Export NODE_ENV=development for this run only (do not persist)
export NODE_ENV=development

# Idempotent project files
if [ ! -f package.json ]; then
  cat > package.json <<'JSON'
{
  "name": "playwright-automation-suite",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  }
}
JSON
  echo "# Note: add 'playwright' devDependency if you want guaranteed browser binaries and CLI parity" > .playwright_note
fi

if [ ! -f playwright.config.js ]; then
  cat > playwright.config.js <<'JS'
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  timeout: 30000,
  use: { headless: true, viewport: { width: 1280, height: 720 } },
  reporter: [['list']]
});
JS
fi

mkdir -p tests
if [ ! -f tests/example.spec.js ]; then
  cat > tests/example.spec.js <<'TEST'
const { test, expect } = require('@playwright/test');

// Prefer a local URL (LOCAL_TEST_URL) to allow offline CI validation; fallback to example.com
const LOCAL_URL = process.env.LOCAL_TEST_URL || 'https://example.com';

test('simple page title', async ({ page }) => {
  await page.goto(LOCAL_URL);
  await expect(page).toHaveTitle(/Example Domain/);
});
TEST
fi

# Local index.html to enable offline validation when present
if [ ! -f index.html ]; then
  cat > index.html <<'HTML'
<!doctype html>
<html><head><title>Example Domain</title></head><body><h1>Example Domain</h1></body></html>
HTML
fi

# Ensure file permissions are sane
chmod -R a+rX "$WORKSPACE" || true

# Done
exit 0
