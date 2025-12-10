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

   For container/server environments, use:
   ```bash
   npx playwright install --with-deps
   ```

## Running Tests

### Standard Test Run
To run all tests in headless mode (default for CI/CD environments):
```bash
npm run test
```
This runs the tests using the `playwright test` command.

### Interactive UI Mode

#### For Container/Server Environments (No Display)
To open the Playwright UI in a browser-accessible web interface:
```bash
npm run test:ui
```
This runs `playwright test --ui-host=0.0.0.0 --ui-port=3001`, which provides a web-based interface accessible at `http://localhost:3001` to explore tests, view traces, and debug steps. This mode works in headless server environments without requiring an X server.

#### For Local Development (With Display)
If you have a graphical display available, you can use the desktop UI:
```bash
npx playwright test --ui
```

## Viewing Reports

Playwright generates an HTML report after test execution. To view the report in your browser:
```bash
npm run show-report
```

## Web Server Configuration & Port 3000

The test suite is configured to run against a local application server.

- **Base URL**: The tests are configured to use `http://localhost:3000` as the `baseURL` in `playwright.config.ts`.
- **WebServer Config**: Playwright is configured to automatically attempt to start the application server using `npm run start` if it is not already running.
- **Reusing Existing Server**: The configuration includes `reuseExistingServer: true`.
  - If a server is already running on port 3000 (e.g., you started the app manually in another terminal), Playwright will use that instance instead of starting a new one.
  - This speeds up local development iteration by avoiding the overhead of restarting the server for every test run.

## Container Startup

When running in a container environment, the Playwright UI is served on port 3001 as a web interface that can be accessed through your browser without requiring a graphical display server (X server).
