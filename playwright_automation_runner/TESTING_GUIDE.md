# Playwright Automation Suite - Testing Guide

This guide provides comprehensive information about the testing patterns, architecture, debugging techniques, and best practices used in this Playwright automation suite.

## Table of Contents

- [Test Suite Structure](#test-suite-structure)
- [Test Patterns and Organization](#test-patterns-and-organization)
- [Fixtures System](#fixtures-system)
- [Helper Functions](#helper-functions)
- [Test Data Management](#test-data-management)
- [Page Object Model](#page-object-model)
- [Debugging Tests](#debugging-tests)
- [Environment Configuration](#environment-configuration)
- [NPM Scripts Reference](#npm-scripts-reference)
- [Playwright UI Mode](#playwright-ui-mode)
- [CI/CD Integration](#cicd-integration)
- [GitHub Actions Configuration](#github-actions-configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Test Suite Structure

The test suite is organized into three primary categories, each serving a distinct purpose in the testing strategy:

### Smoke Tests (`tests/smoke/`)

Fast, critical checks that verify the application is operational. These tests run quickly and focus on essential functionality.

**Purpose:**
- Verify application starts and responds
- Check critical page loads
- Validate essential UI elements are present
- Ensure no critical console errors
- Confirm static assets load correctly

**Tags:** `@smoke`

**Characteristics:**
- Execution time: < 30 seconds for full suite
- Run frequency: On every commit, before deployment
- Failure impact: Critical - blocks deployment

**Example:**
```typescript
test.describe('Smoke Tests @smoke', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\//);
    
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });
});
```

### End-to-End Tests (`tests/e2e/`)

Comprehensive user journey tests that simulate real user workflows through the application.

**Purpose:**
- Validate complete user workflows
- Test multi-step processes
- Verify cross-page interactions
- Ensure data persistence across navigation
- Test responsive behavior across viewports

**Tags:** `@e2e`

**Characteristics:**
- Execution time: 1-5 minutes per test
- Run frequency: Pre-merge, nightly builds
- Failure impact: High - indicates user-facing issues

**Example:**
```typescript
test.describe('User Journey Tests @e2e', () => {
  test('complete user browsing journey', async ({ page }) => {
    await withStep('Step 1: User arrives at homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await withStep('Step 2: User interacts with navigation', async () => {
      const navLinks = page.locator('nav a');
      await navLinks.first().click();
    });
  });
});
```

### API Tests (`tests/api/`)

Tests that validate API responses, status codes, and data structures.

**Purpose:**
- Verify API response codes
- Validate response data structures
- Check response times
- Test error handling
- Ensure API consistency

**Tags:** `@api`

**Characteristics:**
- Execution time: < 1 minute for full suite
- Run frequency: On every commit
- Failure impact: High - indicates backend issues

**Example:**
```typescript
test.describe('API Validation Tests @api', () => {
  test('API returns valid JSON responses', async ({ page }) => {
    page.on('response', async response => {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
});
```

---

## Test Patterns and Organization

### File Naming Conventions

All test files follow these conventions:

- Test files: `*.spec.ts`
- Page objects: `*Page.ts` (PascalCase)
- Fixtures: `test-fixtures.ts`
- Helpers: `test-helpers.ts`
- Test data: `test-data.ts`

### Test Organization Pattern

```
tests/
├── smoke/          # Fast critical checks
│   └── smoke.spec.ts
├── e2e/            # Full user journeys
│   └── user-journey.spec.ts
├── api/            # API validation
│   └── api-validation.spec.ts
├── pages/          # Page Object Models
│   ├── BasePage.ts
│   └── HomePage.ts
├── fixtures/       # Custom test fixtures
│   └── test-fixtures.ts
├── helpers/        # Utility functions
│   └── test-helpers.ts
└── data/           # Test data and constants
    └── test-data.ts
```

### Test Structure Best Practices

**1. Use Descriptive Test Names:**
```typescript
// Good
test('user can complete checkout with valid payment details', async ({ page }) => {});

// Avoid
test('test1', async ({ page }) => {});
```

**2. Group Related Tests:**
```typescript
test.describe('Authentication Flow', () => {
  test('login with valid credentials', async ({ page }) => {});
  test('login with invalid credentials shows error', async ({ page }) => {});
  test('logout clears session', async ({ page }) => {});
});
```

**3. Use Test Steps for Clarity:**
```typescript
test('multi-step workflow', async ({ page }) => {
  await withStep('Step 1: Navigate to page', async () => {
    await page.goto('/');
  });

  await withStep('Step 2: Fill form', async () => {
    await page.fill('#input', 'value');
  });

  await withStep('Step 3: Submit and verify', async () => {
    await page.click('button[type="submit"]');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

---

## Fixtures System

Fixtures provide a way to set up and tear down test environments, making tests more maintainable and reducing code duplication.

### Understanding Fixtures

Fixtures are reusable test setup code that Playwright automatically manages. They're defined in `tests/fixtures/test-fixtures.ts`.

### Built-in Fixtures

Playwright provides these fixtures by default:

- `page`: Browser page instance
- `context`: Browser context
- `browser`: Browser instance
- `request`: API request context

### Custom Fixtures

This suite extends Playwright's fixtures with custom ones:

#### HomePage Fixture

Automatically navigates to the homepage and returns a HomePage instance.

```typescript
export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },
});
```

**Usage:**
```typescript
test('use homepage fixture', async ({ homePage }) => {
  const headerText = await homePage.getHeaderText();
  expect(headerText).toBeTruthy();
});
```

#### Authenticated Page Fixture

Provides a pre-authenticated page instance (implementation placeholder).

```typescript
authenticatedPage: async ({ page }, use) => {
  // Add authentication logic here
  await page.goto('/login');
  await page.fill('[name="username"]', process.env.TEST_USER || 'testuser');
  await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'testpass');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  
  await use(page);
}
```

**Usage:**
```typescript
test('access protected page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('.user-profile')).toBeVisible();
});
```

### Creating Custom Fixtures

To add new fixtures, extend the test object:

```typescript
type MyFixtures = {
  customFixture: MyCustomType;
};

export const test = base.extend<MyFixtures>({
  customFixture: async ({ page }, use) => {
    // Setup logic
    const instance = new MyCustomType(page);
    await instance.setup();
    
    // Provide fixture to test
    await use(instance);
    
    // Teardown logic (optional)
    await instance.cleanup();
  },
});
```

---

## Helper Functions

Helper functions are reusable utilities located in `tests/helpers/test-helpers.ts`.

### Available Helpers

#### withStep()

Adds descriptive steps to test execution, improving readability in test reports.

```typescript
export async function withStep<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
  return await test.step(stepName, fn);
}
```

**Usage:**
```typescript
test('workflow with steps', async ({ page }) => {
  await withStep('Navigate to page', async () => {
    await page.goto('/');
  });

  await withStep('Verify content loaded', async () => {
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

#### randomString()

Generates random alphanumeric strings for unique test data.

```typescript
export function randomString(length: number = 10, prefix: string = ''): string {
  // Implementation
}
```

**Usage:**
```typescript
const uniqueId = randomString(8, 'test_');
// Result: "test_aB3dE5fG"
```

#### randomEmail()

Generates random email addresses for testing.

```typescript
export function randomEmail(domain: string = 'test.com'): string {
  return `user_${randomString(8)}@${domain}`;
}
```

**Usage:**
```typescript
const email = randomEmail('example.com');
// Result: "user_xY9zW2v3@example.com"
```

#### waitForResponseByUrlPart()

Waits for a network response matching a URL pattern.

```typescript
export async function waitForResponseByUrlPart(
  page: Page,
  urlPart: string,
  timeout: number = 30000
): Promise<Response> {
  // Implementation
}
```

**Usage:**
```typescript
test('wait for API call', async ({ page }) => {
  const navigationPromise = page.goto('/');
  const response = await waitForResponseByUrlPart(page, '/api/users');
  
  expect(response.status()).toBe(200);
  await navigationPromise;
});
```

#### retry()

Retries a function until it succeeds or reaches max attempts.

```typescript
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  // Implementation
}
```

**Usage:**
```typescript
await retry(async () => {
  const element = page.locator('.dynamic-content');
  await expect(element).toBeVisible();
}, 5, 2000);
```

#### isInViewport()

Checks if an element is visible in the current viewport.

```typescript
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  // Implementation
}
```

**Usage:**
```typescript
const visible = await isInViewport(page, '.footer');
expect(visible).toBe(true);
```

---

## Test Data Management

Test data is centralized in `tests/data/test-data.ts` for easy maintenance and reuse.

### Environment-Based Configuration

```typescript
export const ENV = process.env.ENV || 'local';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const TIMEOUT = parseInt(process.env.TIMEOUT || '30000', 10);
```

### Feature Toggles

Control feature availability based on environment:

```typescript
export const FEATURE_TOGGLES = {
  enableAuth: process.env.ENABLE_AUTH === 'true',
  enableApiMocking: process.env.ENABLE_API_MOCKING === 'true',
  skipSlowTests: process.env.SKIP_SLOW_TESTS === 'true',
  debugMode: process.env.DEBUG === 'true',
} as const;
```

**Usage:**
```typescript
test.skip(!FEATURE_TOGGLES.enableAuth, 'authentication test', async ({ page }) => {
  // Test authentication flow
});
```

### Test Users

Predefined test user credentials:

```typescript
export const TEST_USERS = {
  admin: {
    username: process.env.TEST_ADMIN_USER || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
  },
  standard: {
    username: process.env.TEST_USER || 'user@test.com',
    password: process.env.TEST_PASSWORD || 'User123!',
    role: 'user',
  },
} as const;
```

### Sample Test Data

```typescript
export const TEST_DATA = {
  registration: {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'SecurePass123!',
  },
  products: [
    { id: 'prod-001', name: 'Sample Product 1', price: 99.99 },
    { id: 'prod-002', name: 'Sample Product 2', price: 149.99 },
  ],
} as const;
```

### Common Selectors

```typescript
export const COMMON_SELECTORS = {
  submitButton: 'button[type="submit"]',
  cancelButton: 'button[type="button"]',
  navBar: 'nav, [role="navigation"]',
  errorMessage: '.error, .error-message, [role="alert"]',
} as const;
```

**Usage:**
```typescript
await page.click(COMMON_SELECTORS.submitButton);
```

---

## Page Object Model

Page Objects encapsulate page-specific logic and selectors, making tests more maintainable.

### BasePage

Base class providing common functionality for all page objects.

**Key Methods:**

```typescript
class BasePage {
  async goto(path: string): Promise<void>
  async expectTitle(expectedTitle: string | RegExp): Promise<void>
  async waitForUrlContains(urlPart: string, timeout?: number): Promise<void>
  getLocator(selector: string): Locator
  getByRole(role, options?): Locator
  getByText(text: string | RegExp): Locator
  getByTestId(testId: string): Locator
  async waitForPageLoad(state?): Promise<void>
  async screenshot(name: string): Promise<void>
  getUrl(): string
}
```

### Creating Page Objects

**Example: LoginPage**

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameInput: '[name="username"]',
    passwordInput: '[name="password"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '.error-message',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/login');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.getLocator(this.selectors.usernameInput).fill(username);
    await this.getLocator(this.selectors.passwordInput).fill(password);
    await this.getLocator(this.selectors.submitButton).click();
  }

  async getErrorMessage(): Promise<string | null> {
    return await this.getLocator(this.selectors.errorMessage).textContent();
  }
}
```

**Usage:**

```typescript
test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user@test.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Debugging Tests

### Debug Mode

Run tests with Playwright Inspector for step-by-step debugging:

```bash
npm run test:debug
```

This opens the Playwright Inspector where you can:
- Step through test execution
- Pause at any point
- Inspect page state
- View console logs
- Execute Playwright commands interactively

### Headed Mode

Run tests with visible browser:

```bash
npm run test:headed
```

Useful for:
- Visual verification
- Understanding test flow
- Debugging UI interactions

### Browser-Specific Debugging

```bash
npm run test:debug:chromium
npm run test:debug:firefox
npm run test:debug:webkit
```

### Using Console Logs

Add strategic logging in tests:

```typescript
test('debug example', async ({ page }) => {
  console.log('Navigating to page...');
  await page.goto('/');
  
  console.log('Current URL:', page.url());
  
  const title = await page.title();
  console.log('Page title:', title);
});
```

### Screenshots and Videos

Automatically captured on failure (configured in `playwright.config.ts`):

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**Manual screenshots:**

```typescript
test('capture screenshot', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
});
```

### Traces

Enable tracing for detailed debugging:

```typescript
test('with trace', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  
  await page.goto('/');
  await page.click('button');
  
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

View traces:
```bash
npx playwright show-trace trace.zip
```

### Test Attachments

Attach data to test reports:

```typescript
test('attach data', async ({ page }) => {
  const apiCalls = [{ url: '/api/users', status: 200 }];
  
  await test.info().attach('api-calls', {
    body: JSON.stringify(apiCalls, null, 2),
    contentType: 'application/json'
  });
});
```

---

## Environment Configuration

### Environment Variables

Configure test behavior using environment variables.

#### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `ENV` | Environment name | `local` |
| `TIMEOUT` | Default timeout (ms) | `30000` |
| `CI` | CI mode flag | `false` |
| `TEST_ADMIN_USER` | Admin username | `admin@test.com` |
| `TEST_ADMIN_PASSWORD` | Admin password | `Admin123!` |
| `TEST_USER` | Standard user username | `user@test.com` |
| `TEST_PASSWORD` | Standard user password | `User123!` |
| `ENABLE_AUTH` | Enable auth tests | `false` |
| `ENABLE_API_MOCKING` | Enable API mocking | `false` |
| `SKIP_SLOW_TESTS` | Skip slow tests | `false` |
| `DEBUG` | Debug mode | `false` |

### Using .env Files

Create a `.env` file in the project root:

```bash
# .env
BASE_URL=http://localhost:3000
ENV=development
TIMEOUT=30000

# Test User Credentials
TEST_USER=user@test.com
TEST_PASSWORD=TestPass123!
TEST_ADMIN_USER=admin@test.com
TEST_ADMIN_PASSWORD=AdminPass123!

# Feature Toggles
ENABLE_AUTH=true
ENABLE_API_MOCKING=false
SKIP_SLOW_TESTS=false
DEBUG=false
```

**Note:** The `.env` file is gitignored. Use `.env.example` as a template.

### Setting Environment Variables

**Command line:**
```bash
BASE_URL=https://staging.example.com npm run test
```

**In npm scripts:**
```json
{
  "scripts": {
    "test:staging": "BASE_URL=https://staging.example.com playwright test"
  }
}
```

**In CI/CD:**
Set as secrets/environment variables in your CI platform.

---

## NPM Scripts Reference

### Core Test Commands

| Script | Description |
|--------|-------------|
| `npm run test` | Run all tests in headless mode |
| `npm run test:ui` | Open Playwright UI mode |

### Suite-Specific Tests

| Script | Description |
|--------|-------------|
| `npm run test:smoke` | Run smoke tests only |
| `npm run test:e2e` | Run E2E tests only |
| `npm run test:api` | Run API tests only |
| `npm run test:smoke:folder` | Run all tests in smoke folder |
| `npm run test:e2e:folder` | Run all tests in e2e folder |
| `npm run test:api:folder` | Run all tests in api folder |

### Browser-Specific Tests

| Script | Description |
|--------|-------------|
| `npm run test:chromium` | Run on Chromium only |
| `npm run test:firefox` | Run on Firefox only |
| `npm run test:webkit` | Run on WebKit only |

### Headed Mode Tests

| Script | Description |
|--------|-------------|
| `npm run test:headed` | Run all tests with visible browser |
| `npm run test:headed:chromium` | Run on visible Chromium |
| `npm run test:headed:firefox` | Run on visible Firefox |
| `npm run test:headed:webkit` | Run on visible WebKit |

### Debug Mode Tests

| Script | Description |
|--------|-------------|
| `npm run test:debug` | Debug all tests with Inspector |
| `npm run test:debug:chromium` | Debug on Chromium |
| `npm run test:debug:firefox` | Debug on Firefox |
| `npm run test:debug:webkit` | Debug on WebKit |

### Combined Suite + Browser

| Script | Description |
|--------|-------------|
| `npm run test:smoke:chromium` | Smoke tests on Chromium |
| `npm run test:e2e:firefox` | E2E tests on Firefox |
| `npm run test:api:webkit` | API tests on WebKit |

### UI Mode Variants

| Script | Description |
|--------|-------------|
| `npm run ui` | Open UI mode for all tests |
| `npm run ui:chromium` | UI mode with Chromium only |
| `npm run ui:smoke` | UI mode filtered to smoke tests |
| `npm run ui:e2e` | UI mode filtered to E2E tests |
| `npm run ui:api` | UI mode filtered to API tests |

### Reports

| Script | Description |
|--------|-------------|
| `npm run report` | Open HTML test report |
| `npm run show-report` | Alternative: Open HTML report |
| `npm run report:open` | Alternative: Open HTML report |

### Browser Management

| Script | Description |
|--------|-------------|
| `npm run install:browsers` | Install all Playwright browsers |
| `npm run install:browsers:chromium` | Install Chromium only |
| `npm run install:browsers:firefox` | Install Firefox only |
| `npm run install:browsers:webkit` | Install WebKit only |
| `npm run install:browsers:deps` | Install browser system dependencies |

### Cleanup

| Script | Description |
|--------|-------------|
| `npm run clean` | Clean all reports and caches |
| `npm run clean:reports` | Clean test reports only |
| `npm run clean:cache` | Clean cache directories only |

### Utility

| Script | Description |
|--------|-------------|
| `npm run list:tests` | List all tests without running |
| `npm run list:tests:smoke` | List smoke tests only |
| `npm run list:tests:e2e` | List E2E tests only |
| `npm run list:tests:api` | List API tests only |

---

## Playwright UI Mode

Playwright UI Mode is an interactive interface for running, debugging, and exploring tests.

### Launching UI Mode

```bash
npm run ui
```

### Features

**1. Interactive Test Execution**
- Click to run individual tests or test suites
- View real-time test execution
- Step through tests at your own pace

**2. Time Travel Debugging**
- Hover over test steps to see DOM snapshots
- Click on actions to jump to that point in time
- View before/after states of each action

**3. Watch Mode**
- Automatically re-run tests when files change
- Great for TDD workflows

**4. Filtering and Search**
- Filter tests by name, file, or tag
- Search across all test files
- Quick access to specific tests

**5. Browser Selection**
- Toggle which browsers to run tests on
- Switch between browsers instantly
- Compare behavior across browsers

### UI Mode Workflows

**Development Workflow:**
```bash
# Open UI mode filtered to the feature you're working on
npm run ui:e2e

# Make changes to test files
# Tests automatically re-run
# Iterate quickly without restarting
```

**Debugging Workflow:**
```bash
# Open UI mode
npm run ui

# Click on failing test
# Use time travel to inspect failure point
# View DOM snapshots and console logs
# Fix issue and re-run
```

**Browser-Specific Testing:**
```bash
# Test only on specific browser
npm run ui:chromium
npm run ui:firefox
npm run ui:webkit
```

### UI Mode vs Debug Mode

| Feature | UI Mode | Debug Mode |
|---------|---------|------------|
| Interactive execution | ✅ | ✅ |
| Time travel | ✅ | ❌ |
| Watch mode | ✅ | ❌ |
| Step-by-step debugging | Limited | ✅ Full |
| Breakpoints | ❌ | ✅ |
| Best for | Development | Deep debugging |

---

## CI/CD Integration

### CI Configuration

The test suite is optimized for CI environments:

```typescript
// playwright.config.ts
export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
});
```

### Running Tests in CI

```bash
CI=true npm run test
```

This enables:
- Fail build on `test.only`
- 2 automatic retries for flaky tests
- Serial execution (1 worker)
- Comprehensive reporting

### CI Best Practices

**1. Install Dependencies:**
```bash
npm ci  # Use ci for clean installs
npm run install:browsers
```

**2. Run Smoke Tests First:**
```bash
CI=true npm run test:smoke
if [ $? -ne 0 ]; then
  echo "Smoke tests failed, skipping full suite"
  exit 1
fi
```

**3. Generate and Archive Reports:**
```bash
CI=true npm run test
# Archive playwright-report/ directory
# Archive test-results/ directory
```

**4. Set Environment Variables:**
```bash
export BASE_URL=https://staging.example.com
export CI=true
export TIMEOUT=60000
npm run test
```

### Artifacts to Preserve

- `playwright-report/` - HTML report
- `test-results/` - Screenshots, videos, traces
- `reports/junit/results.xml` - JUnit XML for CI integration
- `reports/json/results.json` - JSON report for custom parsing

---

## GitHub Actions Configuration

The suite includes a comprehensive GitHub Actions workflow at `.github/workflows/playwright.yml`.

### Workflow Overview

The workflow runs on:
- Push to `main` branch
- Pull requests to `main` branch
- Manual trigger via `workflow_dispatch`

### Workflow Structure

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
```

### Key Features

**1. Test Sharding**

Tests are distributed across 4 parallel jobs for faster execution:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
```

Run specific shard:
```bash
npx playwright test --shard=${{ matrix.shard }}/${{ strategy.job-total }}
```

**2. Caching**

Node modules and Playwright browsers are cached:

```yaml
- uses: actions/cache@v4
  with:
    path: |
      node_modules
      ~/.cache/ms-playwright
```

**3. Multiple Test Suites**

Separate jobs for different test types:
- Smoke tests (always runs first)
- Full test suite
- Browser-specific tests

**4. Artifact Preservation**

Test reports and results are uploaded:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report-${{ matrix.shard }}
    path: playwright-report/
```

**5. HTML Report Publication**

Results are published to GitHub Pages:

```yaml
- name: Publish HTML Report
  if: always()
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./playwright-report
```

### Customizing the Workflow

**Add Environment Variables:**

```yaml
- name: Run Tests
  env:
    BASE_URL: https://staging.example.com
    TEST_USER: ${{ secrets.TEST_USER }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  run: npm run test
```

**Add Notifications:**

```yaml
- name: Slack Notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Matrix Testing Multiple Environments:**

```yaml
strategy:
  matrix:
    environment: [staging, production]
    browser: [chromium, firefox, webkit]
env:
  BASE_URL: ${{ matrix.environment == 'staging' && 'https://staging.example.com' || 'https://example.com' }}
run: npm run test:${{ matrix.browser }}
```

### GitHub Actions Secrets

Configure these secrets in your repository:

- `TEST_USER` - Test user credentials
- `TEST_PASSWORD` - Test user password
- `TEST_ADMIN_USER` - Admin credentials
- `TEST_ADMIN_PASSWORD` - Admin password
- `SLACK_WEBHOOK` - For notifications (optional)

---

## Best Practices

### 1. Test Independence

Each test should be completely independent:

```typescript
// Good
test('independent test', async ({ page }) => {
  await page.goto('/');
  // Test logic with no external dependencies
});

// Avoid
let sharedData;
test('test 1', async ({ page }) => {
  sharedData = await page.locator('.data').textContent();
});
test('test 2', async ({ page }) => {
  expect(sharedData).toBe('expected'); // Depends on test 1
});
```

### 2. Use Appropriate Waits

**Good waits:**
```typescript
// Wait for specific condition
await page.waitForSelector('.loaded');
await page.waitForLoadState('networkidle');
await expect(page.locator('.content')).toBeVisible();
```

**Avoid arbitrary waits:**
```typescript
// Avoid
await page.waitForTimeout(5000); // Flaky and slow
```

### 3. Meaningful Assertions

```typescript
// Good - Clear intent
await expect(page.locator('.username')).toHaveText('John Doe');
await expect(page.locator('.status')).toHaveClass(/active/);

// Avoid - Vague
const text = await page.locator('.username').textContent();
expect(text).toBeTruthy(); // What does this verify?
```

### 4. DRY Principle

Extract common logic:

```typescript
// helpers/auth-helpers.ts
export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

// Use in tests
test('access protected page', async ({ page }) => {
  await login(page, TEST_USERS.standard.username, TEST_USERS.standard.password);
  await page.goto('/profile');
});
```

### 5. Proper Tagging

Use tags for easy test filtering:

```typescript
test.describe('Critical Features @smoke @high-priority', () => {
  test('feature A works', async ({ page }) => {});
  test('feature B works', async ({ page }) => {});
});
```

Run by tags:
```bash
npm run test -- --grep @high-priority
```

### 6. Readable Locators

```typescript
// Good - Descriptive and maintainable
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
page.getByTestId('user-profile')

// Avoid - Fragile
page.locator('div > div > button:nth-child(3)')
```

### 7. Error Messages

Provide context in assertions:

```typescript
// Good
await expect(page.locator('.price'), 'Product price should be displayed').toBeVisible();

// Less helpful
await expect(page.locator('.price')).toBeVisible();
```

### 8. Test Data Cleanup

Clean up test data when necessary:

```typescript
test('create and delete item', async ({ page, request }) => {
  // Create
  const response = await request.post('/api/items', { data: { name: 'Test Item' } });
  const itemId = (await response.json()).id;
  
  try {
    // Test logic
    await page.goto(`/items/${itemId}`);
    await expect(page.locator('h1')).toHaveText('Test Item');
  } finally {
    // Cleanup
    await request.delete(`/api/items/${itemId}`);
  }
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Tests fail with timeout errors

**Possible causes:**
- Application not responding
- Selector not found
- Network delays

**Solutions:**
```typescript
// Increase timeout for specific operation
await page.waitForSelector('.slow-element', { timeout: 60000 });

// Or configure global timeout
// playwright.config.ts
export default defineConfig({
  timeout: 60000,
});
```

#### Issue: Flaky tests (sometimes pass, sometimes fail)

**Possible causes:**
- Race conditions
- Animations/transitions
- Network timing

**Solutions:**
```typescript
// Wait for stable state
await page.waitForLoadState('networkidle');

// Wait for animations to complete
await page.waitForTimeout(300); // Only when absolutely necessary

// Use auto-waiting assertions
await expect(page.locator('.element')).toBeVisible();
```

#### Issue: Element not found

**Debug steps:**
```typescript
// 1. Check if element exists
const count = await page.locator('.element').count();
console.log('Element count:', count);

// 2. Check page state
console.log('Current URL:', page.url());
await page.screenshot({ path: 'debug.png' });

// 3. Wait for page load
await page.waitForLoadState('domcontentloaded');

// 4. Use more specific selector
page.getByRole('button', { name: 'Submit' })
```

#### Issue: CI tests pass locally but fail in CI

**Possible causes:**
- Different environment
- Timing differences
- Missing dependencies

**Solutions:**
```bash
# Run tests in CI mode locally
CI=true npm run test

# Check browser installation
npm run install:browsers

# Verify environment variables
echo $BASE_URL
```

#### Issue: Slow test execution

**Solutions:**
```typescript
// 1. Run tests in parallel (default)
// playwright.config.ts
workers: process.env.CI ? 1 : undefined

// 2. Run specific test suites
npm run test:smoke  // Fast critical tests only

// 3. Use test sharding
npx playwright test --shard=1/4
```

#### Issue: Authentication tests fail

**Solutions:**
```typescript
// 1. Verify credentials
console.log('Username:', process.env.TEST_USER);

// 2. Save storage state for reuse
await page.context().storageState({ path: 'auth.json' });

// 3. Use in subsequent tests
const context = await browser.newContext({ storageState: 'auth.json' });
```

#### Issue: Screenshots/videos not captured

**Check configuration:**
```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',  // or 'on'
  video: 'retain-on-failure',     // or 'on'
}
```

### Getting Help

**1. Enable Playwright Debug Logs:**
```bash
DEBUG=pw:api npm run test
```

**2. Run with Trace:**
```typescript
test('with trace', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  // Test logic
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

**3. Check Playwright Documentation:**
- https://playwright.dev/docs/intro
- https://playwright.dev/docs/api/class-test

**4. Community Support:**
- GitHub Issues: https://github.com/microsoft/playwright/issues
- Discord: https://discord.com/invite/playwright-807756831384403968

---

## Additional Resources

### Documentation
- [Playwright Official Docs](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Tools
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Inspector](https://playwright.dev/docs/debug)

### Examples
- [Playwright Examples](https://github.com/microsoft/playwright/tree/main/examples)
- [Test Patterns](https://playwright.dev/docs/test-patterns)

---

**Last Updated:** December 2025  
**Version:** 1.0.0
