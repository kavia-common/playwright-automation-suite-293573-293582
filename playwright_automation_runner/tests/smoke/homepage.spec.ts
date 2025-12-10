import { test, expect } from '@playwright/test';

/**
 * Smoke tests: quick checks that the application is up and the core homepage renders.
 *
 * Test structure:
 * - Place fast, high-value tests for critical paths in this `tests/smoke` folder.
 * - Use the configured `baseURL` (see `playwright.config.ts`) so tests can call `page.goto('/')`
 *   instead of hardcoding the full URL.
 *
 * Adding new smoke tests:
 * - Create additional `*.spec.ts` files in this folder (e.g., `login.spec.ts`).
 * - Group related scenarios into `test()` blocks with clear names.
 */

test('homepage basic navigation and smoke check', async ({ page }) => {
  // Navigate to the base URL. `baseURL` is set to `http://localhost:3000` in `playwright.config.ts`,
  // so `page.goto('/')` will resolve to that URL.
  await page.goto('/');

  // Verify that the page has loaded by checking the final URL.
  // This assertion helps ensure the application server is running and responding correctly.
  await expect(page).toHaveURL(/.*localhost:3000/);
});
