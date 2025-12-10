import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Base class for all Page Objects
 * Wraps common Playwright operations and provides reusable methods
 * 
 * PUBLIC_INTERFACE
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   * PUBLIC_INTERFACE
   * @param path - Relative path to navigate to (uses baseURL from config)
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Verify page title matches expected value
   * PUBLIC_INTERFACE
   * @param expectedTitle - Expected title or regex pattern
   */
  async expectTitle(expectedTitle: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for URL to contain specific text
   * PUBLIC_INTERFACE
   * @param urlPart - Text that should be present in URL
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForUrlContains(urlPart: string, timeout?: number): Promise<void> {
    await this.page.waitForURL(new RegExp(urlPart), { timeout });
  }

  /**
   * Get a locator helper method
   * PUBLIC_INTERFACE
   * @param selector - CSS selector, text, or role-based selector
   * @returns Playwright Locator
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get locator by role
   * PUBLIC_INTERFACE
   * @param role - ARIA role
   * @param options - Additional options like name
   */
  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get locator by text
   * PUBLIC_INTERFACE
   * @param text - Text content to search for
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get locator by test ID
   * PUBLIC_INTERFACE
   * @param testId - Test ID attribute value
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for page to be fully loaded
   * PUBLIC_INTERFACE
   * @param state - Load state to wait for (default: 'networkidle')
   */
  async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Take a screenshot
   * PUBLIC_INTERFACE
   * @param name - Screenshot filename
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Get current URL
   * PUBLIC_INTERFACE
   * @returns Current page URL
   */
  getUrl(): string {
    return this.page.url();
  }
}
