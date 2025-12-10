#!/usr/bin/env bash
set -euo pipefail
# Minimal, idempotent Playwright scaffolding matching project's module type
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
mkdir -p "$WS/.artifacts" "$WS/tests" "$WS/.artifacts/screenshots"
# ensure node and npm available
command -v node >/dev/null 2>&1 || { echo "node not found on PATH" >&2; exit 2; }
command -v npm >/dev/null 2>&1 || { echo "npm not found on PATH" >&2; exit 2; }
# init package.json if missing
if [ ! -f "$WS/package.json" ]; then
  npm init -y >/dev/null
fi
# detect module type safely
type_field=$(node -e "try{const p=require('./package.json'); console.log(p.type||'') }catch(e){process.exit(0)}" 2>/dev/null || true)
is_esm=false
if [ "${type_field}" = "module" ]; then is_esm=true; fi
# set test script only if absent
existing_test_script=$(node -e "try{const p=require('./package.json'); console.log((p.scripts&&p.scripts.test)||'') }catch(e){console.log('') }" 2>/dev/null || true)
if [ -z "${existing_test_script}" ]; then
  npm pkg set scripts.test="playwright test" >/dev/null
fi
# write playwright config matching module type; backup existing file(s) if present
if [ -f "$WS/playwright.config.js" ] || [ -f "$WS/playwright.config.mjs" ]; then
  # backup any existing configs to avoid overwrite
  ts=$(date +%s)
  [ -f "$WS/playwright.config.js" ] && cp "$WS/playwright.config.js" "$WS/playwright.config.js.bak.$ts" 2>/dev/null || true
  [ -f "$WS/playwright.config.mjs" ] && cp "$WS/playwright.config.mjs" "$WS/playwright.config.mjs.bak.$ts" 2>/dev/null || true
else
  if [ "$is_esm" = true ]; then
    cat > "$WS/playwright.config.mjs" <<'CFG'
// ESM Playwright config
export default {
  timeout: 30000,
  testDir: 'tests',
  use: { headless: true, screenshot: 'only-on-failure', video: 'retain-on-failure' },
  outputDir: './.artifacts'
};
CFG
  else
    cat > "$WS/playwright.config.js" <<'CFG'
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  timeout: 30000,
  testDir: 'tests',
  use: { headless: true, screenshot: 'only-on-failure', video: 'retain-on-failure' },
  outputDir: './.artifacts'
};
CFG
  fi
fi
# create sample test matching module type; backup existing test files if present
if [ -f "$WS/tests/example.spec.js" ] || [ -f "$WS/tests/example.spec.mjs" ]; then
  ts=$(date +%s)
  [ -f "$WS/tests/example.spec.js" ] && cp "$WS/tests/example.spec.js" "$WS/tests/example.spec.js.bak.$ts" 2>/dev/null || true
  [ -f "$WS/tests/example.spec.mjs" ] && cp "$WS/tests/example.spec.mjs" "$WS/tests/example.spec.mjs.bak.$ts" 2>/dev/null || true
else
  if [ "$is_esm" = true ]; then
    cat > "$WS/tests/example.spec.mjs" <<'TS'
import { test, expect } from '@playwright/test';

test('basic page', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
TS
  else
    cat > "$WS/tests/example.spec.js" <<'TS'
const { test, expect } = require('@playwright/test');

test('basic page', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
TS
  fi
fi
# Ensure artifacts directory exists
mkdir -p "$WS/.artifacts"
# Final validation: print created/updated files for traceability
ls -la "$WS/playwright.config."* "$WS/tests/"* 2>/dev/null || true
