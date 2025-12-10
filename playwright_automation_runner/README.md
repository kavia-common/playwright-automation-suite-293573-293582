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
   npm run install:browsers
   ```
   
   Or install specific browsers:
   ```bash
   npm run install:browsers:chromium
   npm run install:browsers:firefox
   npm run install:browsers:webkit
   ```

## Running Tests

### Standard Test Runs

Run all tests in headless mode (default for CI/CD environments):
```bash
npm run test
```

### Run Tests by Suite/Tag

Tests are organized with tags (@smoke, @e2e, @api). Run specific test suites using grep:

```bash
npm run test:smoke         # Run smoke tests only
npm run test:e2e           # Run end-to-end tests only
npm run test:api           # Run API validation tests only
```

Or run by folder:
```bash
npm run test:smoke:folder  # Run all tests in tests/smoke/
npm run test:e2e:folder    # Run all tests in tests/e2e/
npm run test:api:folder    # Run all tests in tests/api/
```

### Run Tests on Specific Browsers

Run tests on a single browser:
```bash
npm run test:chromium      # Run on Chromium only
npm run test:firefox       # Run on Firefox only
npm run test:webkit        # Run on WebKit only
```

### Run Tests in Headed Mode

View the browser during test execution:
```bash
npm run test:headed        # Run all tests in headed mode
npm run test:headed:chromium
npm run test:headed:firefox
npm run test:headed:webkit
```

### Run Tests in Debug Mode

Debug tests with Playwright Inspector:
```bash
npm run test:debug         # Debug all tests
npm run test:debug:chromium
npm run test:debug:firefox
npm run test:debug:webkit
```

### Combined Suite and Browser Selection

Run specific suites on specific browsers:
```bash
# Smoke tests on specific browsers
npm run test:smoke:chromium
npm run test:smoke:firefox
npm run test:smoke:webkit

# E2E tests on specific browsers
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# API tests on specific browsers
npm run test:api:chromium
npm run test:api:firefox
npm run test:api:webkit
```

### Run Specific Suites in Headed Mode

```bash
npm run test:smoke:headed  # Run smoke tests in headed mode
npm run test:e2e:headed    # Run e2e tests in headed mode
npm run test:api:headed    # Run API tests in headed mode
```

## Using Playwright UI Mode

Playwright UI mode provides an interactive interface for running, debugging, and exploring your tests. It's designed for local development and debugging workflows.

### Launch UI for All Tests
```bash
npm run ui                 # Open UI mode for all tests
npm run test:ui            # Alternative command
```

### Launch UI for Specific Browsers
```bash
npm run ui:chromium        # Run UI with Chromium only
npm run ui:firefox         # Run UI with Firefox only
npm run ui:webkit          # Run UI with WebKit only
```

### Launch UI with Test Filters
```bash
npm run ui:smoke           # Open UI mode filtered to smoke tests
npm run ui:e2e             # Open UI mode filtered to e2e tests
npm run ui:api             # Open UI mode filtered to API tests
```

**Note:** The Playwright UI is intended for interactive local test runs. For CI/CD pipelines and automated reporting, use `npm run test` which generates the standard HTML report.

## Viewing Reports

### Open HTML Report

Playwright automatically generates an HTML report after test execution. To view the report in your browser:
```bash
npm run report             # Open the HTML report
npm run show-report        # Alternative command
npm run report:open        # Alternative command
```

The HTML report provides:
- Comprehensive overview of test results
- Screenshots on failures
- Test traces for debugging
- Detailed logs and timing information

### Report Files Location

Reports are saved in the following directories:
- **HTML Report**: `playwright-report/`
- **JUnit XML**: `reports/junit/results.xml`
- **JSON Report**: `reports/json/results.json`
- **Test Results**: `test-results/` (screenshots, videos, traces)

## List Tests

List all tests without running them:
```bash
npm run list:tests         # List all tests
npm run list:tests:smoke   # List smoke tests only
npm run list:tests:e2e     # List e2e tests only
npm run list:tests:api     # List API tests only
```

## Cleanup Commands

Clean up generated files and caches:
```bash
npm run clean              # Clean all reports and caches
npm run clean:reports      # Clean only test reports
npm run clean:cache        # Clean only cache directories
```

## Browser Installation Management

```bash
npm run install:browsers           # Install all browsers
npm run install:browsers:chromium  # Install Chromium only
npm run install:browsers:firefox   # Install Firefox only
npm run install:browsers:webkit    # Install WebKit only
npm run install:browsers:deps      # Install system dependencies for browsers
```

## Web Server Configuration & Port 3000

The test suite is configured to run against a local application server.

- **Base URL**: The tests are configured to use `http://localhost:3000` as the `baseURL` in `playwright.config.ts`.
- **WebServer Config**: Playwright is configured to automatically attempt to start the application server using `npm run start` if it is not already running.
- **Reusing Existing Server**: The configuration includes `reuseExistingServer: true`.
  - If a server is already running on port 3000 (e.g., you started the app manually in another terminal), Playwright will use that instance instead of starting a new one.
  - This speeds up local development iteration by avoiding the overhead of restarting the server for every test run.

## Common Workflows

### Quick Smoke Test on Chromium
```bash
npm run test:smoke:chromium
```

### Debug Failing E2E Test
```bash
npm run test:debug:e2e
```

### Full Test Run with Report
```bash
npm run test
npm run report
```

### Interactive Development
```bash
npm run ui:smoke           # Work on smoke tests interactively
```

### Headed Mode for Visual Verification
```bash
npm run test:e2e:headed:chromium
```

## Environment Variables

Configure test behavior using environment variables:

- `BASE_URL`: Base URL for the application under test (default: `http://localhost:3000`)
- `ENV`: Environment name (default: `local`)
- `TIMEOUT`: Default timeout in milliseconds (default: `30000`)
- `CI`: Set to `true` to enable CI-specific behavior

Example:
```bash
BASE_URL=https://staging.example.com npm run test
```

## Test Organization

Tests are organized by type:
- **Smoke Tests** (`tests/smoke/`): Fast critical checks tagged with `@smoke`
- **E2E Tests** (`tests/e2e/`): Full user journey tests tagged with `@e2e`
- **API Tests** (`tests/api/`): API validation tests tagged with `@api`

## CI/CD Integration

For CI/CD pipelines, use:
```bash
CI=true npm run test
```

This enables:
- Serial test execution (workers=1)
- Automatic retries (2 retries)
- Fails build on `test.only`
- Generates comprehensive reports

## Tips and Best Practices

1. **Use UI Mode for Development**: `npm run ui` provides the best experience for writing and debugging tests locally.
2. **Run Smoke Tests First**: Quick feedback with `npm run test:smoke`.
3. **Browser-Specific Issues**: Test on specific browsers with `npm run test:chromium/firefox/webkit`.
4. **Debug Mode**: Use `npm run test:debug` to step through tests with Playwright Inspector.
5. **Clean Reports**: Run `npm run clean:reports` before important test runs to ensure fresh results.
6. **List Tests**: Use `npm run list:tests` to see what tests are available without running them.
