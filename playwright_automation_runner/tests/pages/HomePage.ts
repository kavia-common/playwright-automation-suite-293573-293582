import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage - Page Object for the application home page
 * Extends BasePage with home-specific selectors and methods
 * 
 * PUBLIC_INTERFACE
 */
export class HomePage extends BasePage {
  // Selectors for home page elements
  private readonly selectors = {
    header: 'h1, header h1, [data-testid="page-header"]',
    navigation: 'nav, [role="navigation"]',
    mainContent: 'main, [role="main"], .main-content',
    logo: '[data-testid="logo"], .logo, header img',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the home page
   * PUBLIC_INTERFACE
   */
  async navigate(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Get the header text content
   * PUBLIC_INTERFACE
   * @returns Header text or null if not found
   */
  async getHeaderText(): Promise<string | null> {
    try {
      const headerLocator = this.getLocator(this.selectors.header);
      await headerLocator.waitFor({ timeout: 5000 });
      return await headerLocator.textContent();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if navigation is visible
   * PUBLIC_INTERFACE
   * @returns True if navigation is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    try {
      const navLocator = this.getLocator(this.selectors.navigation);
      return await navLocator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if main content is loaded
   * PUBLIC_INTERFACE
   * @returns True if main content is present
   */
  async isMainContentLoaded(): Promise<boolean> {
    try {
      const contentLocator = this.getLocator(this.selectors.mainContent);
      await contentLocator.waitFor({ timeout: 5000 });
      return await contentLocator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for home page to be fully loaded
   * PUBLIC_INTERFACE
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.waitForPageLoad('networkidle');
    // Additional wait for any dynamic content
    await this.page.waitForTimeout(500);
  }

  /**
   * Get logo element
   * PUBLIC_INTERFACE
   * @returns Logo locator
   */
  getLogoLocator() {
    return this.getLocator(this.selectors.logo);
  }
}
