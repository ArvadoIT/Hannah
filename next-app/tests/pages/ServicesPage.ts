import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Services Page (/services)
 */
export class ServicesPage extends BasePage {
  readonly serviceCards: Locator;
  readonly bookingButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    this.serviceCards = page.locator('[class*="service"], .service-card, article');
    this.bookingButton = page.locator('button:has-text("Book"), a:has-text("Book")');
    this.pageTitle = page.locator('h1, h2').first();
  }

  /**
   * Navigate to services page
   */
  async goto(): Promise<void> {
    await super.goto('/services');
  }

  /**
   * Get count of service cards displayed
   */
  async getServiceCount(): Promise<number> {
    return await this.serviceCards.count();
  }

  /**
   * Check if services are loaded
   */
  async areServicesLoaded(): Promise<boolean> {
    const count = await this.getServiceCount();
    return count > 0;
  }

  /**
   * Click on a specific service by index
   */
  async selectService(index: number): Promise<void> {
    await this.serviceCards.nth(index).click();
  }
}

