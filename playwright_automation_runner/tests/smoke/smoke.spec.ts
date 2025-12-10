import { test, expect } from '../fixtures/test-fixtures';
import { withStep, waitForResponseByUrlPart } from '../helpers/test-helpers';
import { BASE_URL, COMMON_SELECTORS, TIMEOUTS } from '../data/test-data';

/**
 * Smoke Tests
 * Fast, critical checks to verify the application is operational
 * Tags: @smoke
 */

test.describe('Smoke Tests @smoke', () => {
  test('homepage loads successfully', async ({ page }) => {
    await withStep('Navigate to homepage', async () => {
      await page.goto('/');
      await expect(page).toHaveURL(/.*\//);
    });

    await withStep('Verify page is accessible', async () => {
      // Check that page responded with success
      const response = await page.goto('/');
      expect(response?.status()).toBeLessThan(400);
    });

    await withStep('Verify basic UI elements are present', async () => {
      // Generic check for navigation or main content
      const hasNav = await page.locator(COMMON_SELECTORS.navBar).count();
      const hasMain = await page.locator('main, [role="main"]').count();
      
      // At least one major structural element should be present
      expect(hasNav + hasMain).toBeGreaterThan(0);
    });
  });

  test('application responds within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await withStep('Load homepage and measure response time', async () => {
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Verify page loads within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test('static assets load correctly', async ({ page }) => {
    await withStep('Navigate to homepage', async () => {
      await page.goto('/');
    });

    await withStep('Check for failed requests', async () => {
      const failedRequests: string[] = [];
      
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });
      
      // Reload to catch any asset loading issues
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Allow for some expected failures (e.g., optional analytics, favicon)
      // but fail if critical assets fail
      const criticalFailures = failedRequests.filter(url => 
        url.includes('.js') || url.includes('.css')
      );
      
      expect(criticalFailures.length).toBe(0);
    });
  });

  test('navigation elements are interactive', async ({ homePage }) => {
    await withStep('Verify navigation is visible', async () => {
      const navVisible = await homePage.isNavigationVisible();
      // If nav exists, it should be visible
      if (await homePage.getLocator('nav, [role="navigation"]').count() > 0) {
        expect(navVisible).toBe(true);
      }
    });
  });

  test('page has valid document structure', async ({ page }) => {
    await page.goto('/');
    
    await withStep('Verify HTML structure', async () => {
      // Check for essential HTML elements
      const hasDoctype = await page.evaluate(() => {
        return document.doctype !== null;
      });
      expect(hasDoctype).toBe(true);
      
      const hasBody = await page.locator('body').count();
      expect(hasBody).toBe(1);
    });
  });

  test('console has no critical errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await withStep('Load page and check console', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known/expected errors (e.g., third-party scripts)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && !error.includes('analytics')
      );
      
      // Attach errors to test report if any exist
      if (criticalErrors.length > 0) {
        await test.info().attach('console-errors', {
          body: JSON.stringify(criticalErrors, null, 2),
          contentType: 'application/json'
        });
      }
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test('BASE_URL environment variable is configured', async () => {
    await withStep('Verify BASE_URL is set', async () => {
      expect(BASE_URL).toBeDefined();
      expect(BASE_URL.length).toBeGreaterThan(0);
      expect(BASE_URL).toMatch(/^https?:\/\//);
    });
  });
});
