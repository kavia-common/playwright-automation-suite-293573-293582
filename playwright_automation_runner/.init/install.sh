#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
mkdir -p "$WS/.artifacts"
# ensure PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is not set for this process
unset PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD || true
# record runtime versions
node -v > "$WS/.artifacts/node_version.txt"
npm -v > "$WS/.artifacts/npm_version.txt"
# check package.json for required deps; return codes: 0=ok,1=missing,2=no package.json
need_install=0
node -e "try{const p=require('./package.json'); const has=((p.devDependencies&&p.devDependencies['playwright'])||(p.dependencies&&p.dependencies['playwright'])); const has2=((p.devDependencies&&p.devDependencies['@playwright/test'])||(p.dependencies&&p.dependencies['@playwright/test'])); if(!has||!has2) process.exit(1);}catch(e){process.exit(2)}" 2>/dev/null || need_install=1
# install missing packages idempotently and record installed versions
if [ "$need_install" -eq 1 ]; then
  npm i --no-audit --no-fund --save-dev playwright@latest @playwright/test@latest
  npm list --depth=0 --json > "$WS/.artifacts/installed_playwright.json" 2>/dev/null || true
fi
# deterministic install: prefer npm ci when lockfile present
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm i --no-audit --no-fund
fi
# verify playwright CLI
if ! command -v npx >/dev/null 2>&1 || ! npx playwright --version >/dev/null 2>&1; then
  echo "npx playwright CLI not available" >&2
  exit 6
fi
# install chromium and capture dependencies info
npx playwright install --with-deps chromium >/dev/null
npx playwright show-deps 2>&1 | tee "$WS/.artifacts/playwright_show_deps.txt"
if ! npx playwright show-deps >/dev/null 2>&1; then
  echo "playwright show-deps indicates missing system libraries; see .artifacts/playwright_show_deps.txt" >&2
  echo "On Ubuntu, run: sudo apt-get update && sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxrandr2 libxdamage1 libxkbcommon0 libgbm1 libasound2" >&2
  exit 7
fi
# record installed browsers
npx playwright install --list 2>&1 | tee "$WS/.artifacts/playwright_installed_browsers.txt" || true
# headless chromium smoke test
node -e "(async()=>{try{const { chromium } = require('playwright'); const b = await chromium.launch({ headless: true }); const p = await b.newPage(); await p.goto('about:blank'); await b.close(); console.log('chromium-launch-ok');}catch(e){console.error(e); process.exit(8);}})()" > "$WS/.artifacts/chromium_smoke.txt" 2>&1
