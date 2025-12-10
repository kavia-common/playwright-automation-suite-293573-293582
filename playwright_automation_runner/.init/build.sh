#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
mkdir -p "$WS/.artifacts"
# Deterministic install: prefer npm ci when lockfile present
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund --silent
else
  npm i --no-audit --no-fund --silent
fi
# Record versions
node -v > "$WS/.artifacts/node_version.txt" 2>/dev/null || true
npm -v  > "$WS/.artifacts/npm_version.txt" 2>/dev/null || true
jq -r '.dependencies, .devDependencies' package.json > "$WS/.artifacts/package_deps_snapshot.txt" 2>/dev/null || true
exit 0
