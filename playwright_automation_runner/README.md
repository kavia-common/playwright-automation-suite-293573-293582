# Playwright Automation Runner

## Overview
This project contains a suite for automating browser actions and UI testing using Playwright in Node.js. It is designed to execute browser automation scripts and verify application behavior.

## Installation

1. **Install Dependencies**
   Run the following command to install the necessary Node.js packages:
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   After installing the packages, you need to install the supported browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Standard Test Run
To run all tests in headless mode (default for CI/CD environments):
```bash
npm run test
```
This runs the tests using the `playwright test` command.

### Interactive UI Mode
To open the interactive Playwright UI for running and debugging tests:
```bash
npm run test:ui
```
This runs `playwright test --ui`, which provides a visual interface to explore tests, view traces, and debug steps.

## Using Playwright UI

Playwright UI mode provides an interactive interface for running, debugging, and exploring your tests. It's designed for local development and debugging workflows.

### Launch UI for All Browsers
```bash
npm run ui
```

### Launch UI for Specific Browsers
Run the UI with a specific browser project:
```bash
npm run ui:chromium   # Run UI with Chromium only
npm run ui:firefox    # Run UI with Firefox only
npm run ui:webkit     # Run UI with WebKit only
```

**Note:** The Playwright UI is intended for interactive local test runs. For CI/CD pipelines and automated reporting, use `npm run test` which generates the standard HTML report.

## Viewing Reports

Playwright generates an HTML report after test execution. To view the report in your browser:
```bash
npm run show-report
```

The HTML report is separate from the UI mode and provides a comprehensive overview of test results, including screenshots, traces, and detailed logs.

## Web Server Configuration & Port 3000

The test suite is configured to run against a local application server.

- **Base URL**: The tests are configured to use `http://localhost:3000` as the `baseURL` in `playwright.config.ts`.
- **WebServer Config**: Playwright is configured to automatically attempt to start the application server using `npm run start` if it is not already running.
- **Reusing Existing Server**: The configuration includes `reuseExistingServer: true`.
  - If a server is already running on port 3000 (e.g., you started the app manually in another terminal), Playwright will use that instance instead of starting a new one.
  - This speeds up local development iteration by avoiding the overhead of restarting the server for every test run.
