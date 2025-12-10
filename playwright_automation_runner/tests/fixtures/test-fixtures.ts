import { test as base, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Custom test fixtures extending Playwright's base test
 * Provides pre-configured page objects and utilities
 */

// Define fixture types
type TestFixtures = {
  homePage: HomePage;
  authenticatedPage: Page;
};

/**
 * Extended test object with custom fixtures
 * PUBLIC_INTERFACE
 */
export const test = base.extend<TestFixtures>({
  /**
   * HomePage fixture - provides an initialized HomePage instance
   * Automatically navigates to home page before each test
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },

  /**
   * Authenticated page fixture - placeholder for authentication flow
   * Use this fixture when tests require authenticated state
   * 
   * TODO: Implement actual authentication logic based on app requirements
   * Example implementation:
   * 1. Navigate to login page
   * 2. Fill credentials (from env or test data)
   * 3. Submit and wait for auth token/cookie
   * 4. Return authenticated page instance
   */
  authenticatedPage: async ({ page }, use) => {
    // Placeholder authentication pattern
    // In real implementation, add login logic here:
    // await page.goto('/login');
    // await page.fill('[name="username"]', process.env.TEST_USER || 'testuser');
    // await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'testpass');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard'); // or whatever authenticated landing page
    
    // For now, just return the page
    await use(page);
  },
});

/**
 * Export expect from Playwright for convenience
 * PUBLIC_INTERFACE
 */
export { expect } from '@playwright/test';
