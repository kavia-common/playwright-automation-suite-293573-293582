# Playwright Automation Runner

## Overview
This project contains a comprehensive test automation suite for browser actions and UI testing using Playwright in Node.js. It is designed to execute browser automation scripts, verify application behavior, and provide detailed test reports.

## 🚀 Quick Start

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npm run install:browsers
   ```
   
   Or install specific browsers:
   ```bash
   npm run install:browsers:chromium
   npm run install:browsers:firefox
   npm run install:browsers:webkit
   ```

3. **Configure Environment (Optional)**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

## 📚 Documentation

For comprehensive testing information, see **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** which covers:

- **Test Patterns and Architecture** - How tests are organized and structured
- **Fixtures System** - Custom fixtures for reusable test setup
- **Helper Functions** - Utility functions for common test operations
- **Page Object Model** - Page objects and base classes
- **Debugging Techniques** - Tools and methods for debugging tests
- **Environment Configuration** - Managing test environments and variables
- **CI/CD Integration** - Setting up continuous integration
- **GitHub Actions Details** - Comprehensive CI workflow configuration
- **Best Practices** - Guidelines for writing maintainable tests
- **Troubleshooting** - Common issues and solutions

## 🧪 Test Suites

Tests are organized into three primary categories:

### Smoke Tests (`tests/smoke/`)
Fast, critical checks to verify the application is operational.
- **Purpose:** Validate core functionality and page loads
- **Execution time:** < 30 seconds
- **Tag:** `@smoke`
- **When to run:** On every commit, before deployment

### E2E Tests (`tests/e2e/`)
Full user journey tests simulating complete workflows.
- **Purpose:** Test multi-step user interactions
- **Execution time:** 1-5 minutes per test
- **Tag:** `@e2e`
- **When to run:** Pre-merge, nightly builds

### API Tests (`tests/api/`)
API validation tests checking responses and data structures.
- **Purpose:** Verify API behavior and responses
- **Execution time:** < 1 minute
- **Tag:** `@api`
- **When to run:** On every commit

## 🎯 Running Tests

### Standard Test Runs

```bash
npm run test              # Run all tests (headless)
npm run test:smoke        # Run smoke tests only
npm run test:e2e          # Run E2E tests only
npm run test:api          # Run API tests only
```

### Run by Folder

```bash
npm run test:smoke:folder # All tests in tests/smoke/
npm run test:e2e:folder   # All tests in tests/e2e/
npm run test:api:folder   # All tests in tests/api/
```

### Browser-Specific Tests

```bash
npm run test:chromium     # Run on Chromium only
npm run test:firefox      # Run on Firefox only
npm run test:webkit       # Run on WebKit only
```

### Headed Mode (Visible Browser)

```bash
npm run test:headed       # Run all tests with visible browser
npm run test:headed:chromium
npm run test:headed:firefox
npm run test:headed:webkit
```

### Combined Suite + Browser

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

### Suite-Specific Headed Mode

```bash
npm run test:smoke:headed # Smoke tests with visible browser
npm run test:e2e:headed   # E2E tests with visible browser
npm run test:api:headed   # API tests with visible browser
```

## 🔍 Debugging Tests

### Debug Mode

Run tests with Playwright Inspector for step-by-step debugging:

```bash
npm run test:debug        # Debug all tests
npm run test:debug:chromium
npm run test:debug:firefox
npm run test:debug:webkit
```

**Debug Mode Features:**
- Step through test execution
- Pause at any point
- Inspect page state
- View console logs
- Execute commands interactively

### Playwright UI Mode

Interactive interface for running, debugging, and exploring tests:

```bash
npm run ui                # Open UI mode for all tests
npm run ui:chromium       # UI with Chromium only
npm run ui:firefox        # UI with Firefox only
npm run ui:webkit         # UI with WebKit only
```

### UI Mode with Test Filters

```bash
npm run ui:smoke          # UI mode filtered to smoke tests
npm run ui:e2e            # UI mode filtered to E2E tests
npm run ui:api            # UI mode filtered to API tests
```

**UI Mode Features:**
- Interactive test execution
- Time travel debugging
- Watch mode (auto-rerun on file changes)
- DOM snapshots for each action
- Filter and search tests
- Compare across browsers

**Note:** Playwright UI is intended for local development. For CI/CD pipelines, use `npm run test` which generates HTML reports.

See [TESTING_GUIDE.md - Playwright UI Mode](./TESTING_GUIDE.md#playwright-ui-mode) for detailed usage.

## 📊 Viewing Reports

### HTML Report

Playwright automatically generates an HTML report after test execution:

```bash
npm run report            # Open the HTML report
npm run show-report       # Alternative command
npm run report:open       # Alternative command
```

**HTML Report Features:**
- Comprehensive test results overview
- Screenshots on failures
- Test traces for debugging
- Detailed logs and timing information
- Filterable by status, suite, and browser

### Report Files Location

Reports are saved in:
- **HTML Report:** `playwright-report/`
- **JUnit XML:** `reports/junit/results.xml`
- **JSON Report:** `reports/json/results.json`
- **Test Results:** `test-results/` (screenshots, videos, traces)

## 🗂️ Test Organization

```
tests/
├── smoke/              # Fast critical checks (@smoke)
│   └── smoke.spec.ts
├── e2e/                # Full user journeys (@e2e)
│   └── user-journey.spec.ts
├── api/                # API validation (@api)
│   └── api-validation.spec.ts
├── pages/              # Page Object Models
│   ├── BasePage.ts     # Base class for all pages
│   └── HomePage.ts     # Homepage page object
├── fixtures/           # Custom test fixtures
│   └── test-fixtures.ts
├── helpers/            # Utility functions
│   └── test-helpers.ts
└── data/               # Test data and constants
    └── test-data.ts
```

## 🛠️ Utility Commands

### List Tests

List all tests without running them:

```bash
npm run list:tests        # List all tests
npm run list:tests:smoke  # List smoke tests only
npm run list:tests:e2e    # List E2E tests only
npm run list:tests:api    # List API tests only
```

### Cleanup

Clean up generated files and caches:

```bash
npm run clean             # Clean all reports and caches
npm run clean:reports     # Clean only test reports
npm run clean:cache       # Clean only cache directories
```

### Browser Management

```bash
npm run install:browsers            # Install all browsers
npm run install:browsers:chromium   # Install Chromium only
npm run install:browsers:firefox    # Install Firefox only
npm run install:browsers:webkit     # Install WebKit only
npm run install:browsers:deps       # Install system dependencies
```

## 🌐 Web Server Configuration

The test suite is configured to run against a local application server.

- **Base URL:** Tests use `http://localhost:3000` (configured in `playwright.config.ts`)
- **Auto-start:** Playwright attempts to start the server using `npm run start` if not running
- **Reuse Existing:** If a server is already on port 3000, Playwright uses it (`reuseExistingServer: true`)

**Benefits:**
- Speeds up local development by reusing running servers
- No need to manually start/stop server between test runs
- Automatically starts server in CI environments

## 🔧 Environment Variables

Configure test behavior using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `ENV` | Environment name | `local` |
| `TIMEOUT` | Default timeout (ms) | `30000` |
| `CI` | CI mode flag | `false` |
| `TEST_USER` | Test user username | `user@test.com` |
| `TEST_PASSWORD` | Test user password | `User123!` |
| `ENABLE_AUTH` | Enable auth tests | `false` |
| `DEBUG` | Debug mode | `false` |

**Example:**
```bash
BASE_URL=https://staging.example.com npm run test
```

**Using .env file:**
```bash
# .env
BASE_URL=http://localhost:3000
ENV=development
TIMEOUT=30000
TEST_USER=user@test.com
TEST_PASSWORD=TestPass123!
```

See [TESTING_GUIDE.md - Environment Configuration](./TESTING_GUIDE.md#environment-configuration) for complete list and usage.

## 🚦 CI/CD Integration

For CI/CD pipelines:

```bash
CI=true npm run test
```

**CI Mode Enables:**
- Serial test execution (workers=1)
- Automatic retries (2 retries)
- Fails build on `test.only`
- Comprehensive reporting

**GitHub Actions Workflow:**

This project includes a comprehensive GitHub Actions workflow (`.github/workflows/playwright.yml`) with:

- **Test Sharding:** Distributes tests across 4 parallel jobs
- **Caching:** Caches dependencies and browsers
- **Multiple Suites:** Separate jobs for smoke, E2E, and API tests
- **Artifact Preservation:** Uploads reports and test results
- **HTML Report Publication:** Publishes results to GitHub Pages

See [TESTING_GUIDE.md - CI/CD Integration](./TESTING_GUIDE.md#cicd-integration) and [GitHub Actions Configuration](./TESTING_GUIDE.md#github-actions-configuration) for detailed setup.

## 📝 Common Workflows

### Quick Smoke Test (Fast Feedback)
```bash
npm run test:smoke:chromium
```

### Debug Failing Test
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
npm run ui:smoke          # Work on smoke tests interactively
```

### Headed Mode for Visual Verification
```bash
npm run test:e2e:headed:chromium
```

### Run Tests Against Staging
```bash
BASE_URL=https://staging.example.com npm run test
```

## 🎓 Best Practices

1. **Use Smoke Tests First:** Quick feedback with `npm run test:smoke`
2. **Use UI Mode for Development:** `npm run ui` provides the best local development experience
3. **Test Browser-Specific Issues:** Use `npm run test:chromium/firefox/webkit`
4. **Debug with Inspector:** `npm run test:debug` for step-through debugging
5. **Clean Reports Before Important Runs:** `npm run clean:reports`
6. **List Tests First:** Use `npm run list:tests` to see available tests
7. **Keep Tests Independent:** Each test should work in isolation
8. **Use Page Objects:** Keep selectors and page logic in page objects
9. **Leverage Fixtures:** Use fixtures for common setup logic
10. **Tag Appropriately:** Use `@smoke`, `@e2e`, `@api` tags for filtering

See [TESTING_GUIDE.md - Best Practices](./TESTING_GUIDE.md#best-practices) for comprehensive guidelines.

## 🏗️ Project Structure

```
playwright_automation_runner/
├── .github/
│   └── workflows/
│       └── playwright.yml      # GitHub Actions CI workflow
├── tests/
│   ├── smoke/                  # Smoke tests
│   ├── e2e/                    # End-to-end tests
│   ├── api/                    # API tests
│   ├── pages/                  # Page Object Models
│   ├── fixtures/               # Custom fixtures
│   ├── helpers/                # Helper functions
│   └── data/                   # Test data
├── playwright.config.ts        # Playwright configuration
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
└── TESTING_GUIDE.md            # Comprehensive testing guide
```

## 🐛 Troubleshooting

### Tests Timeout
```bash
# Increase timeout
TIMEOUT=60000 npm run test

# Or in playwright.config.ts
timeout: 60000
```

### Flaky Tests
```bash
# Run in debug mode to investigate
npm run test:debug

# Enable traces
# In test file: await page.context().tracing.start()
```

### CI Failures
```bash
# Run in CI mode locally
CI=true npm run test

# Check browser installation
npm run install:browsers
```

### Element Not Found
```typescript
// Use more robust selectors
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByTestId('user-profile')
```

See [TESTING_GUIDE.md - Troubleshooting](./TESTING_GUIDE.md#troubleshooting) for detailed solutions.

## 📖 Additional Resources

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing documentation
- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Examples](https://github.com/microsoft/playwright/tree/main/examples)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure and patterns
2. Use appropriate tags (`@smoke`, `@e2e`, `@api`)
3. Add descriptive test names and steps
4. Update this README if adding new features
5. Ensure tests pass locally before committing
6. Use page objects for reusable page interactions
7. Add test data to `tests/data/test-data.ts`

## 📄 License

This project is part of the Playwright Automation Suite.

---

**For detailed testing information, patterns, and advanced usage, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)**
