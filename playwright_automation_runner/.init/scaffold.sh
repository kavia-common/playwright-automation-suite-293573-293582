#!/usr/bin/env bash
set -euo pipefail
# scaffolding - initialize project, pin deps and create scripts (module-aware, safe edits)
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
PW_VER="1.38.0"
PWTEST_VER="1.38.0"
# Init package.json if missing
[ -f package.json ] || npm init -y >/dev/null
# Detect module system (reads package.json safely)
TYPE=$(node -e "try{const p=require('./package.json');console.log(p.type||'')}catch(e){console.log('')}" )
if [ "$TYPE" = "module" ]; then EXT="mjs"; IS_ESM=1; else EXT="js"; IS_ESM=0; fi
# Safely add scripts using a temporary Node helper to avoid shell quoting issues
cat > /tmp/_pkg_write.js <<'NODE'
const fs=require('fs');const ext=process.argv[2]||'js';
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts=p.scripts||{};
// only set or preserve; do not overwrite existing scripts if present
p.scripts.install = p.scripts.install || `node ./scripts/start-headless.${ext}`;
p.scripts['install-browser'] = p.scripts['install-browser'] || 'npx playwright install chromium';
p.scripts.test = p.scripts.test || 'npx playwright test --reporter=list --forbid-only --workers=1';
p.scripts['test:headed'] = p.scripts['test:headed'] || 'npx playwright test --headed --reporter=list --forbid-only --workers=1';
fs.writeFileSync('package.json',JSON.stringify(p,null,2));
NODE
node /tmp/_pkg_write.js "$EXT" && rm -f /tmp/_pkg_write.js || true
# Install pinned dev-deps only when missing
NEED_INSTALL=0
node -e "try{require('./node_modules/playwright');process.exit(1)}catch(e){process.exit(0)}" 2>/dev/null || NEED_INSTALL=1
node -e "try{require('./node_modules/@playwright/test');process.exit(1)}catch(e){process.exit(0)}" 2>/dev/null || NEED_INSTALL=1
if [ "$NEED_INSTALL" -eq 1 ]; then
  npm i -D "playwright@${PW_VER}" "@playwright/test@${PWTEST_VER}" --no-audit --no-fund --silent
fi
# Create module-aware Playwright config if missing
if [ "$IS_ESM" -eq 1 ]; then
  [ -f playwright.config.mjs ] || cat > playwright.config.mjs <<'CFG'
export default { use: { headless: true, launchOptions: { args: [] } }, timeout: 30000 };
CFG
else
  [ -f playwright.config.js ] || cat > playwright.config.js <<'CFG'
module.exports = { use: { headless: true, launchOptions: { args: [] } }, timeout: 30000 };
CFG
fi
# Create example test
mkdir -p tests
if [ "$IS_ESM" -eq 1 ]; then
  [ -f tests/example.spec.mjs ] || cat > tests/example.spec.mjs <<'JS'
import { test, expect } from '@playwright/test';
test('simple headless run', async ({ page }) => { await page.goto('about:blank'); const title = await page.title(); expect(typeof title).toBe('string'); });
JS
else
  [ -f tests/example.spec.js ] || cat > tests/example.spec.js <<'JS'
const { test, expect } = require('@playwright/test');
test('simple headless run', async ({ page }) => { await page.goto('about:blank'); const title = await page.title(); expect(typeof title).toBe('string'); });
JS
fi
# Create short-lived start-headless probe script (module-aware) without overwriting existing user files
mkdir -p scripts
START_FILE="scripts/start-headless.${EXT}"
if [ ! -f "$START_FILE" ]; then
  if [ "$IS_ESM" -eq 1 ]; then
    cat > "$START_FILE" <<'NODE'
import playwright from 'playwright';
(async()=>{
  const isRoot = typeof process.getuid==='function' && process.getuid()===0;
  const args = isRoot ? ['--no-sandbox','--disable-setuid-sandbox'] : [];
  const b = await playwright.chromium.launch({ headless: true, args });
  const p = await b.newPage();
  await p.goto('about:blank');
  console.log('OK: chromium launched');
  await b.close();
  process.exit(0);
})();
NODE
  else
    cat > "$START_FILE" <<'NODE'
const playwright = require('playwright');
(async()=>{
  const isRoot = typeof process.getuid==='function' && process.getuid()===0;
  const args = isRoot ? ['--no-sandbox','--disable-setuid-sandbox'] : [];
  const b = await playwright.chromium.launch({ headless: true, args });
  const p = await b.newPage();
  await p.goto('about:blank');
  console.log('OK: chromium launched');
  await b.close();
  process.exit(0);
})();
NODE
  fi
  chmod +x "$START_FILE"
fi
# Create a simple long-running agent script only if missing
AGENT_FILE="scripts/agent.js"
if [ ! -f "$AGENT_FILE" ]; then
  cat > "$AGENT_FILE" <<'NODE'
const http = require('http');
const server = http.createServer((req,res)=>res.end('ok'));
server.listen(3000,()=>console.log('AGENT_OK'));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
NODE
  chmod +x "$AGENT_FILE"
fi
# Summary output for traceability
node -e "try{const p=require('./package.json');console.error('PACKAGE.TITLE:',p.name||'<unnamed>')}catch(e){console.error('no package.json')};console.error('MODULE_TYPE:',process.argv[1])" dummy >/dev/null || true
command -v node >/dev/null && node -v || true
command -v npm >/dev/null && npm -v || true
