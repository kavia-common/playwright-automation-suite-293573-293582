import { test, Page, Response } from '@playwright/test';

/**
 * Test Helper Utilities
 * Provides reusable utility functions for Playwright tests
 */

/**
 * Wrapper for test.step to add descriptive steps to test execution
 * PUBLIC_INTERFACE
 * @param stepName - Name of the test step
 * @param fn - Function to execute within the step
 * @returns Result of the function execution
 */
export async function withStep<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
  return await test.step(stepName, fn);
}

/**
 * Generate a random string for unique test data
 * PUBLIC_INTERFACE
 * @param length - Length of the random string (default: 10)
 * @param prefix - Optional prefix for the string
 * @returns Random alphanumeric string
 */
export function randomString(length: number = 10, prefix: string = ''): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a random email address
 * PUBLIC_INTERFACE
 * @param domain - Email domain (default: 'test.com')
 * @returns Random email address
 */
export function randomEmail(domain: string = 'test.com'): string {
  return `user_${randomString(8)}@${domain}`;
}

/**
 * Wait for a network response that matches a URL pattern
 * PUBLIC_INTERFACE
 * @param page - Playwright Page instance
 * @param urlPart - Part of the URL to match
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Response object when matched
 */
export async function waitForResponseByUrlPart(
  page: Page,
  urlPart: string,
  timeout: number = 30000
): Promise<Response> {
  return await page.waitForResponse(
    (response) => response.url().includes(urlPart) && response.status() === 200,
    { timeout }
  );
}

/**
 * Wait for multiple responses matching URL patterns
 * PUBLIC_INTERFACE
 * @param page - Playwright Page instance
 * @param urlParts - Array of URL parts to match
 * @param timeout - Timeout in milliseconds
 * @returns Array of Response objects
 */
export async function waitForMultipleResponses(
  page: Page,
  urlParts: string[],
  timeout: number = 30000
): Promise<Response[]> {
  const promises = urlParts.map((urlPart) => waitForResponseByUrlPart(page, urlPart, timeout));
  return await Promise.all(promises);
}

/**
 * Retry a function until it succeeds or max attempts reached
 * PUBLIC_INTERFACE
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param delayMs - Delay between attempts in milliseconds (default: 1000)
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Format timestamp for test data
 * PUBLIC_INTERFACE
 * @returns Formatted timestamp string
 */
export function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Sleep for a specified duration
 * PUBLIC_INTERFACE
 * @param ms - Milliseconds to sleep
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if element is in viewport
 * PUBLIC_INTERFACE
 * @param page - Playwright Page instance
 * @param selector - Element selector
 * @returns True if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}
