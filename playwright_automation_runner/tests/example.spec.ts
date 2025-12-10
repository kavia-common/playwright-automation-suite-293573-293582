import { test, expect } from '@playwright/test';

test('basic navigation and assertion', async ({ page }) => {
  // Navigate to the base URL (http://localhost:3000 as configured in playwright.config.ts)
  await page.goto('/');

  // Verify that the page has loaded by checking the URL
  // This is a basic assertion to confirm navigation succeeded
  await expect(page).toHaveURL(/.*localhost:3000/);
});
