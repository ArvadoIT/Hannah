import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object for Next.js app with common elements and methods
 */
export class BasePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly footer: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Common navigation elements
    this.navigation = page.locator('nav');
    this.footer = page.locator('footer');
    this.mobileMenuButton = page.locator('button[aria-label*="menu"], .hamburger, [aria-expanded]');
  }

  /**
   * Navigate to a URL and wait for page to be interactive
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if mobile menu button is visible
   */
  async isMobile(): Promise<boolean> {
    return await this.mobileMenuButton.isVisible();
  }

  /**
   * Open mobile menu if on mobile
   */
  async openMobileMenu(): Promise<void> {
    if (await this.isMobile()) {
      await this.mobileMenuButton.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Check if element is in viewport
   */
  async isInViewport(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Wait for Next.js page transition
   */
  async waitForNextTransition(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for Next.js to be ready
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // Network idle might not happen, that's okay
    });
  }

  /**
   * Get all network requests made so far
   */
  async getNetworkRequests(): Promise<any[]> {
    return await this.page.evaluate(() => {
      return (window as any).__networkRequests || [];
    });
  }
}

