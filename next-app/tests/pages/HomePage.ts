import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Home Page (/)
 */
export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly servicesLink: Locator;
  readonly portfolioLink: Locator;
  readonly bookingButton: Locator;
  readonly heroImage: Locator;

  constructor(page: Page) {
    super(page);
    
    this.heroSection = page.locator('section').first();
    this.servicesLink = page.locator('a[href*="/services"]');
    this.portfolioLink = page.locator('a[href*="/portfolio"]');
    this.bookingButton = page.locator('button:has-text("Book"), a:has-text("Book")');
    this.heroImage = page.locator('img').first();
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * Navigate to services page
   */
  async navigateToServices(): Promise<void> {
    await this.servicesLink.first().click();
    await this.waitForNextTransition();
  }

  /**
   * Navigate to portfolio page
   */
  async navigateToPortfolio(): Promise<void> {
    await this.portfolioLink.first().click();
    await this.waitForNextTransition();
  }

  /**
   * Check if hero section is loaded
   */
  async isHeroLoaded(): Promise<boolean> {
    return await this.heroSection.isVisible();
  }

  /**
   * Check if hero image is loaded
   */
  async isHeroImageLoaded(): Promise<boolean> {
    const isVisible = await this.heroImage.isVisible();
    if (!isVisible) return false;
    
    // Check if image is actually loaded
    return await this.heroImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalHeight > 0;
    });
  }
}

