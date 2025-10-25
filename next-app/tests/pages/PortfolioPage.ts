import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Portfolio Page (/portfolio)
 */
export class PortfolioPage extends BasePage {
  readonly filterButtons: Locator;
  readonly portfolioItems: Locator;
  readonly images: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    this.filterButtons = page.locator('button[class*="filter"], .filter-button');
    this.portfolioItems = page.locator('[class*="portfolio-item"], .portfolio-card, article img');
    this.images = page.locator('img[src*="/images"]');
    this.pageTitle = page.locator('h1, h2').first();
  }

  /**
   * Navigate to portfolio page
   */
  async goto(): Promise<void> {
    await super.goto('/portfolio');
  }

  /**
   * Get count of portfolio items displayed
   */
  async getItemCount(): Promise<number> {
    return await this.portfolioItems.count();
  }

  /**
   * Click a filter button by text
   */
  async applyFilter(filterText: string): Promise<void> {
    await this.filterButtons.filter({ hasText: filterText }).first().click();
    await this.page.waitForTimeout(300); // Wait for filter animation
  }

  /**
   * Check if all images are loaded
   */
  async areAllImagesLoaded(): Promise<boolean> {
    const images = await this.images.all();
    
    for (const img of images) {
      const isLoaded = await img.evaluate((element: HTMLImageElement) => {
        return element.complete && element.naturalHeight > 0;
      });
      
      if (!isLoaded) return false;
    }
    
    return true;
  }

  /**
   * Get all filter button texts
   */
  async getFilterOptions(): Promise<string[]> {
    return await this.filterButtons.allTextContents();
  }
}

