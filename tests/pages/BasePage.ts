import { Page, Locator } from '@playwright/test';
import { waitForPageInteractive } from '../utils/wait-helpers';

/**
 * Base Page Object with common elements and methods
 */
export class BasePage {
  readonly page: Page;
  readonly hamburger: Locator;
  readonly navMenu: Locator;
  readonly navLinks: {
    home: Locator;
    services: Locator;
  };
  readonly footer: Locator;
  readonly skipLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.hamburger = page.locator('.hamburger');
    this.navMenu = page.locator('.nav-menu');
    this.navLinks = {
      home: page.locator('.nav-menu a[href="index.html"]'),
      services: page.locator('.nav-menu a[href="services.html"]'),
    };
    
    // Footer
    this.footer = page.locator('footer.footer');
    
    // Accessibility
    this.skipLink = page.locator('.skip-link');
  }

  /**
   * Navigate to a URL and wait for page to be interactive
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await waitForPageInteractive(this.page);
  }

  /**
   * Check if mobile menu is visible
   */
  async isMobileMenuVisible(): Promise<boolean> {
    return await this.navMenu.isVisible();
  }

  /**
   * Open mobile menu
   */
  async openMobileMenu(): Promise<void> {
    if (!(await this.isMobileMenuVisible())) {
      await this.hamburger.click();
      await this.navMenu.waitFor({ state: 'visible' });
    }
  }

  /**
   * Close mobile menu
   */
  async closeMobileMenu(): Promise<void> {
    if (await this.navMenu.isVisible() && await this.hamburger.isVisible()) {
      await this.hamburger.click();
      await this.navMenu.waitFor({ state: 'hidden' });
    }
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    // Find any visible link to home page (handles both desktop and mobile)
    const homeLink = this.page.locator('a[href="index.html"]').first();
    await homeLink.scrollIntoViewIfNeeded();
    await homeLink.click();
    await this.page.waitForURL(/index\.html/);
  }

  /**
   * Navigate to services page
   */
  async navigateToServices(): Promise<void> {
    // Find any visible link to services page (handles both desktop and mobile)
    const servicesLink = this.page.locator('a[href="services.html"]').first();
    await servicesLink.scrollIntoViewIfNeeded();
    await servicesLink.click();
    await this.page.waitForURL(/services\.html/);
  }


  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if element is visible in viewport
   */
  async isInViewport(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }
}

