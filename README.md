# Playwright Automation Suite

A comprehensive test automation suite for browser actions and UI testing using Playwright in Node.js.

## Project Overview

This suite provides enterprise-grade browser automation and UI testing capabilities with:

- **Multi-browser testing** - Chromium, Firefox, and WebKit support
- **Comprehensive test organization** - Smoke, E2E, and API test suites
- **Advanced debugging** - Playwright Inspector and UI mode
- **CI/CD ready** - GitHub Actions integration with test sharding
- **Detailed reporting** - HTML reports, JUnit XML, and JSON output
- **Page Object Model** - Maintainable test architecture
- **Custom fixtures** - Reusable test setup and teardown

## Quick Start

```bash
# Navigate to the test runner
cd playwright_automation_runner

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Run tests
npm run test

# View report
npm run report
```

## Documentation

### 📘 Main Documentation

- **[playwright_automation_runner/README.md](./playwright_automation_runner/README.md)** - Complete usage guide, commands, and quick reference
- **[playwright_automation_runner/TESTING_GUIDE.md](./playwright_automation_runner/TESTING_GUIDE.md)** - Comprehensive testing guide covering:
  - Test patterns and architecture
  - Fixtures system
  - Helper functions
  - Page Object Model
  - Debugging techniques
  - Environment configuration
  - CI/CD integration
  - GitHub Actions details
  - Best practices
  - Troubleshooting

## Project Structure

```
playwright-automation-suite-293573-293582/
├── README.md                          # This file - project overview
└── playwright_automation_runner/      # Test automation suite
    ├── README.md                      # Usage guide and command reference
    ├── TESTING_GUIDE.md              # Comprehensive testing documentation
    ├── .github/
    │   └── workflows/
    │       └── playwright.yml         # GitHub Actions CI workflow
    ├── tests/
    │   ├── smoke/                     # Smoke tests (@smoke)
    │   ├── e2e/                       # End-to-end tests (@e2e)
    │   ├── api/                       # API tests (@api)
    │   ├── pages/                     # Page Object Models
    │   ├── fixtures/                  # Custom test fixtures
    │   ├── helpers/                   # Utility functions
    │   └── data/                      # Test data and constants
    ├── playwright.config.ts           # Playwright configuration
    ├── package.json                   # Dependencies and scripts
    └── .env.example                   # Environment variables template
```

## Test Suites

### Smoke Tests
Fast, critical checks to verify application is operational.
```bash
npm run test:smoke
```

### End-to-End Tests
Complete user journey tests simulating real workflows.
```bash
npm run test:e2e
```

### API Tests
Validation of API responses, status codes, and data structures.
```bash
npm run test:api
```

## Key Features

### 🎯 Test Organization
- Tests organized by type (smoke, E2E, API)
- Tagged for easy filtering (`@smoke`, `@e2e`, `@api`)
- Folder-based and tag-based execution

### 🔍 Debugging Tools
- **Playwright Inspector** - Step-by-step debugging
- **UI Mode** - Interactive test development and debugging
- **Headed Mode** - Visual test execution
- **Traces** - Detailed execution playback

### 📊 Reporting
- HTML reports with screenshots and traces
- JUnit XML for CI integration
- JSON output for custom parsing
- Automatic failure artifacts (screenshots, videos, traces)

### 🚀 CI/CD Integration
- GitHub Actions workflow included
- Test sharding for parallel execution
- Automatic browser caching
- HTML report publication to GitHub Pages

### 🏗️ Architecture
- **Page Object Model** - Maintainable page interactions
- **Custom Fixtures** - Reusable test setup
- **Helper Functions** - Common test utilities
- **Centralized Test Data** - Easy data management

## Common Commands

```bash
# Run all tests
npm run test

# Run specific suite
npm run test:smoke
npm run test:e2e
npm run test:api

# Run on specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Debug tests
npm run test:debug
npm run ui

# View reports
npm run report

# List tests
npm run list:tests

# Clean reports
npm run clean:reports
```

See [playwright_automation_runner/README.md](./playwright_automation_runner/README.md) for complete command reference.

## Environment Configuration

Configure tests via environment variables:

```bash
# .env
BASE_URL=http://localhost:3000
ENV=development
TIMEOUT=30000
TEST_USER=user@test.com
TEST_PASSWORD=TestPass123!
```

See [TESTING_GUIDE.md - Environment Configuration](./playwright_automation_runner/TESTING_GUIDE.md#environment-configuration) for all available variables.

## CI/CD

GitHub Actions workflow included with:
- **Parallel execution** via test sharding
- **Multiple test suites** (smoke, E2E, API)
- **Artifact preservation** (reports, screenshots, traces)
- **HTML report publishing** to GitHub Pages
- **Dependency caching** for faster runs

See [TESTING_GUIDE.md - GitHub Actions Configuration](./playwright_automation_runner/TESTING_GUIDE.md#github-actions-configuration) for detailed setup.

## Getting Help

1. **Check Documentation:**
   - [README.md](./playwright_automation_runner/README.md) - Command reference
   - [TESTING_GUIDE.md](./playwright_automation_runner/TESTING_GUIDE.md) - Comprehensive guide

2. **Debug Tests:**
   ```bash
   npm run test:debug  # Playwright Inspector
   npm run ui          # Interactive UI mode
   ```

3. **View Traces:**
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **Enable Debug Logs:**
   ```bash
   DEBUG=pw:api npm run test
   ```

## Contributing

When adding tests:
1. Follow existing patterns and structure
2. Use appropriate tags (`@smoke`, `@e2e`, `@api`)
3. Add page objects for new pages
4. Update documentation as needed
5. Ensure tests pass locally before committing

## Resources

- **[Playwright Documentation](https://playwright.dev)**
- **[Playwright API Reference](https://playwright.dev/docs/api/class-playwright)**
- **[Best Practices](https://playwright.dev/docs/best-practices)**
- **[GitHub Examples](https://github.com/microsoft/playwright/tree/main/examples)**

---

**For detailed information, see the documentation in [playwright_automation_runner/](./playwright_automation_runner/)**
