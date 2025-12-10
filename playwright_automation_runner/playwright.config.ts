import { defineConfig, devices } from '@playwright/test';

/**
 * Read from environment variables with sensible defaults
 * BASE_URL: Base URL for the application under test
 * ENV: Environment name (e.g., 'dev', 'staging', 'production')
 * TIMEOUT: Default timeout for test operations in milliseconds
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ENV = process.env.ENV || 'local';
const TIMEOUT = parseInt(process.env.TIMEOUT || '30000', 10);

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run for */
  timeout: TIMEOUT,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Configure output directories */
  outputDir: 'test-results',
  
  /* Configure multiple reporters for comprehensive test reporting */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['json', { outputFile: 'reports/json/results.json' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Capture screenshot only on test failure */
    screenshot: 'only-on-failure',
    
    /* Record video only when test fails */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: true,
  },
});
