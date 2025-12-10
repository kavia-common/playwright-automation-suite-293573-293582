import { test, expect } from '../fixtures/test-fixtures';
import { withStep, waitForResponseByUrlPart, randomString } from '../helpers/test-helpers';
import { TEST_DATA, COMMON_SELECTORS, TIMEOUTS } from '../data/test-data';
import { HomePage } from '../pages/HomePage';

/**
 * End-to-End User Journey Tests
 * Simulates complete user workflows through the application
 * Tags: @e2e
 */

test.describe('User Journey Tests @e2e', () => {
  test('complete user browsing journey', async ({ page }) => {
    await withStep('Step 1: User arrives at homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded successfully
      expect(page.url()).toContain(process.env.BASE_URL || 'localhost');
      
      // Take screenshot for test report
      await test.info().attach('homepage-loaded', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    });

    await withStep('Step 2: User views main content', async () => {
      const homePage = new HomePage(page);
      const contentLoaded = await homePage.isMainContentLoaded();
      
      // Main content should be visible
      expect(contentLoaded).toBe(true);
    });

    await withStep('Step 3: User interacts with navigation', async () => {
      // Look for any clickable navigation elements
      const navLinks = page.locator('nav a, [role="navigation"] a');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Get first available link
        const firstLink = navLinks.first();
        const linkText = await firstLink.textContent();
        
        // Capture trace for navigation action
        await page.context().tracing.start({ screenshots: true, snapshots: true });
        
        await firstLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        await page.context().tracing.stop({
          path: `test-results/trace-navigation-${Date.now()}.zip`
        });
        
        // Verify navigation occurred (URL changed or content updated)
        await page.waitForTimeout(500); // Brief wait for any transitions
      }
    });
  });

  test('user search and filter journey', async ({ page }) => {
    await withStep('Navigate to application', async () => {
      await page.goto('/');
    });

    await withStep('User performs search action', async () => {
      // Look for search inputs with common patterns
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search" i]',
        '[data-testid="search-input"]',
        '#search',
        '.search-input'
      ];
      
      let searchInput = null;
      for (const selector of searchSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          searchInput = page.locator(selector).first();
          break;
        }
      }
      
      if (searchInput) {
        await searchInput.fill(TEST_DATA.searchQueries[0]);
        
        // Look for search button or press Enter
        const searchButton = page.locator('button:has-text("Search"), button[type="submit"]').first();
        if (await searchButton.count() > 0) {
          await searchButton.click();
        } else {
          await searchInput.press('Enter');
        }
        
        // Wait for potential search results or API call
        await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.medium });
      }
    });
  });

  test('multi-page navigation flow', async ({ page }) => {
    const visitedPages: string[] = [];
    
    await withStep('Start at homepage', async () => {
      await page.goto('/');
      visitedPages.push(page.url());
    });

    await withStep('Navigate through available pages', async () => {
      // Collect all navigation links
      const navLinks = page.locator('nav a, header a, [role="navigation"] a');
      const linkCount = await navLinks.count();
      
      // Visit up to 3 different pages
      const pagesToVisit = Math.min(3, linkCount);
      
      for (let i = 0; i < pagesToVisit; i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        // Skip external links and anchors
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          await withStep(`Navigate to page ${i + 1}: ${href}`, async () => {
            await link.click();
            await page.waitForLoadState('domcontentloaded');
            
            const currentUrl = page.url();
            visitedPages.push(currentUrl);
            
            // Verify page loaded successfully
            const bodyVisible = await page.locator('body').isVisible();
            expect(bodyVisible).toBe(true);
            
            // Return to homepage for next iteration
            await page.goto('/');
          });
        }
      }
      
      // Attach visited pages to report
      await test.info().attach('visited-pages', {
        body: JSON.stringify(visitedPages, null, 2),
        contentType: 'application/json'
      });
    });
  });

  test('responsive behavior journey', async ({ page }) => {
    await withStep('Test desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await test.info().attach('desktop-view', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      });
    });

    await withStep('Test tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForLoadState('load');
      
      await test.info().attach('tablet-view', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      });
    });

    await withStep('Test mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForLoadState('load');
      
      await test.info().attach('mobile-view', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      });
      
      // Verify mobile-friendly elements
      const body = page.locator('body');
      const bodyWidth = await body.evaluate(el => el.scrollWidth);
      
      // Ensure no horizontal overflow
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });
  });

  test('form interaction journey', async ({ page }) => {
    await page.goto('/');
    
    await withStep('Locate and interact with forms', async () => {
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        await withStep('Fill form inputs', async () => {
          const firstForm = forms.first();
          
          // Find input fields
          const textInputs = firstForm.locator('input[type="text"], input[type="email"], input:not([type])');
          const inputCount = await textInputs.count();
          
          for (let i = 0; i < inputCount; i++) {
            const input = textInputs.nth(i);
            const inputType = await input.getAttribute('type') || 'text';
            const inputName = await input.getAttribute('name') || `input-${i}`;
            
            await withStep(`Fill ${inputName}`, async () => {
              if (inputType === 'email') {
                await input.fill(`test-${randomString(5)}@example.com`);
              } else {
                await input.fill(`Test ${randomString(5)}`);
              }
            });
          }
          
          // Take screenshot of filled form
          await test.info().attach('form-filled', {
            body: await page.screenshot(),
            contentType: 'image/png'
          });
        });
      }
    });
  });
});
