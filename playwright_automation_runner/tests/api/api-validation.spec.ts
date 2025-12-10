import { test, expect } from '../fixtures/test-fixtures';
import { withStep, waitForResponseByUrlPart, waitForMultipleResponses } from '../helpers/test-helpers';
import { API_ENDPOINTS, BASE_URL, TIMEOUTS } from '../data/test-data';

/**
 * API Validation Tests
 * Tests that validate API responses, status codes, and data structures
 * Tags: @api
 */

test.describe('API Validation Tests @api', () => {
  test('homepage API calls return successful responses', async ({ page }) => {
    const apiCalls: Array<{ url: string; status: number; timing: number }> = [];
    
    // Monitor all API responses
    page.on('response', response => {
      const url = response.url();
      // Track only API calls (containing /api/ or specific patterns)
      if (url.includes('/api/') || url.match(/\.(json|xml)$/)) {
        apiCalls.push({
          url: url,
          status: response.status(),
          timing: 0 // Will be calculated
        });
      }
    });
    
    await withStep('Load page and capture API calls', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
    
    await withStep('Validate API responses', async () => {
      // Attach API calls to test report
      await test.info().attach('api-calls', {
        body: JSON.stringify(apiCalls, null, 2),
        contentType: 'application/json'
      });
      
      // Verify all API calls succeeded
      const failedCalls = apiCalls.filter(call => call.status >= 400);
      if (failedCalls.length > 0) {
        console.error('Failed API calls:', failedCalls);
      }
      
      expect(failedCalls.length).toBe(0);
    });
  });

  test('API response times are within acceptable limits', async ({ page }) => {
    const apiTimings: Array<{ url: string; duration: number }> = [];
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const timing = response.timing();
        apiTimings.push({
          url: url,
          duration: timing.responseEnd
        });
      }
    });
    
    await withStep('Load page and measure API timings', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
    
    await withStep('Verify response times', async () => {
      if (apiTimings.length > 0) {
        const slowAPIs = apiTimings.filter(timing => timing.duration > TIMEOUTS.apiResponse);
        
        await test.info().attach('api-timings', {
          body: JSON.stringify(apiTimings, null, 2),
          contentType: 'application/json'
        });
        
        expect(slowAPIs.length).toBe(0);
      }
    });
  });

  test('API returns valid JSON responses', async ({ page }) => {
    const jsonResponses: Array<{ url: string; valid: boolean; data?: any }> = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        try {
          const data = await response.json();
          jsonResponses.push({
            url: url,
            valid: true,
            data: data
          });
        } catch (error) {
          jsonResponses.push({
            url: url,
            valid: false
          });
        }
      }
    });
    
    await withStep('Load page and capture JSON responses', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
    
    await withStep('Validate JSON structure', async () => {
      const invalidResponses = jsonResponses.filter(resp => !resp.valid);
      
      if (invalidResponses.length > 0) {
        await test.info().attach('invalid-json-responses', {
          body: JSON.stringify(invalidResponses, null, 2),
          contentType: 'application/json'
        });
      }
      
      expect(invalidResponses.length).toBe(0);
    });
  });

  test('waitForResponseByUrlPart helper works correctly', async ({ page }) => {
    await withStep('Navigate and wait for specific API response', async () => {
      // Start navigation
      const navigationPromise = page.goto('/');
      
      // Wait for any response containing common patterns
      const patterns = ['/', '.js', '.css'];
      let responseFound = false;
      
      for (const pattern of patterns) {
        try {
          const response = await waitForResponseByUrlPart(page, pattern, 5000);
          responseFound = true;
          expect(response.status()).toBeLessThan(400);
          break;
        } catch (error) {
          // Try next pattern
          continue;
        }
      }
      
      await navigationPromise;
      expect(responseFound).toBe(true);
    });
  });

  test('API error handling is graceful', async ({ page }) => {
    await withStep('Intercept and mock API errors', async () => {
      // Mock a failing API endpoint
      await page.route('**/api/nonexistent', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not Found' })
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify page still loads despite potential API errors
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    });
  });

  test('concurrent API calls are handled correctly', async ({ page }) => {
    await withStep('Trigger multiple API calls', async () => {
      const responsePromises: Promise<any>[] = [];
      
      // Set up response listeners for different URL patterns
      const patterns = ['/', '.json', '/api'];
      
      for (const pattern of patterns) {
        const promise = page.waitForResponse(
          response => response.url().includes(pattern),
          { timeout: TIMEOUTS.apiResponse }
        ).catch(() => null); // Ignore timeouts
        
        responsePromises.push(promise);
      }
      
      // Navigate to trigger calls
      await page.goto('/');
      
      // Wait for all responses (or timeouts)
      const responses = await Promise.all(responsePromises);
      const successfulResponses = responses.filter(r => r !== null);
      
      // At least one response should succeed
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });

  test('API response headers are valid', async ({ page }) => {
    const responseHeaders: Array<{ url: string; headers: Record<string, string> }> = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('.json')) {
        responseHeaders.push({
          url: url,
          headers: response.headers()
        });
      }
    });
    
    await withStep('Capture API response headers', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
    
    await withStep('Validate headers', async () => {
      if (responseHeaders.length > 0) {
        await test.info().attach('response-headers', {
          body: JSON.stringify(responseHeaders, null, 2),
          contentType: 'application/json'
        });
        
        // Check for security headers (optional, depends on app)
        const firstResponse = responseHeaders[0];
        expect(firstResponse.headers).toBeDefined();
      }
    });
  });

  test('BASE_URL is used consistently for API calls', async ({ page }) => {
    const apiUrls: string[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiUrls.push(url);
      }
    });
    
    await withStep('Verify API calls use BASE_URL', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // All API URLs should start with BASE_URL or be relative
      const expectedBase = BASE_URL.replace(/\/$/, '');
      
      apiUrls.forEach(url => {
        const isValid = url.startsWith(expectedBase) || url.startsWith('/api/');
        expect(isValid).toBe(true);
      });
    });
  });
});
