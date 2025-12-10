#!/usr/bin/env bash
set -euo pipefail
WS="/home/kavia/workspace/code-generation/playwright-automation-suite-293573-293582/playwright_automation_runner"
cd "$WS"
# Deterministic install: prefer npm ci when lockfile present
if [ -f package-lock.json ]; then npm ci --omit=optional --no-audit --no-fund; else npm install --omit=optional --no-audit --no-fund; fi
