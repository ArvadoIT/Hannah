import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { waitForCountChange } from '../utils/wait-helpers';

/**
 * Portfolio Page Object
 */
export class PortfolioPage extends BasePage {
  readonly pageHero: Locator;
  readonly filterButtons: Locator;
  readonly portfolioGrid: Locator;
  readonly portfolioItems: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageHero = page.locator('.page-hero');
    this.filterButtons = page.locator('.filter-btn');
    this.portfolioGrid = page.locator('.portfolio-gallery');
    this.portfolioItems = page.locator('.portfolio-item');
  }

  /**
   * Navigate to portfolio page
   */
  async goto(): Promise<void> {
    await super.goto('/portfolio.html');
  }

  /**
   * Get all filter button labels
   */
  async getFilterLabels(): Promise<string[]> {
    const labels: string[] = [];
    const count = await this.filterButtons.count();
    
    for (let i = 0; i < count; i++) {
      const text = await this.filterButtons.nth(i).textContent();
      if (text) labels.push(text.trim());
    }
    
    return labels;
  }

  /**
   * Click a filter by name
   */
  async clickFilter(filterName: string): Promise<void> {
    const initialCount = await this.getVisibleItemsCount();
    
    const button = this.page.locator('.filter-btn', { hasText: filterName });
    await button.click();
    
    // Wait for filter to apply (count should change unless it's the same filter)
    try {
      await waitForCountChange(this.getVisibleItems(), initialCount, 3000);
    } catch {
      // Count may not change if clicking the same filter or if all items match
    }
  }

  /**
   * Get active filter name
   */
  async getActiveFilter(): Promise<string> {
    const activeButton = this.page.locator('.filter-btn.active');
    const text = await activeButton.textContent();
    return text?.trim() || '';
  }

  /**
   * Get locator for visible portfolio items
   */
  getVisibleItems(): Locator {
    return this.page.locator('.portfolio-item:visible, .portfolio-item.visible');
  }

  /**
   * Get count of visible portfolio items
   */
  async getVisibleItemsCount(): Promise<number> {
    // Check for items that are visible or have 'visible' class
    const visibleItems = await this.portfolioItems.evaluateAll((items) => {
      return items.filter((item) => {
        const style = window.getComputedStyle(item);
        const hasVisibleClass = item.classList.contains('visible');
        const isDisplayed = style.display !== 'none';
        const hasOpacity = parseFloat(style.opacity) > 0;
        
        return (hasVisibleClass || (isDisplayed && hasOpacity));
      }).length;
    });
    
    return visibleItems;
  }

  /**
   * Wait for items to transition
   */
  async waitForItemsTransition(): Promise<void> {
    // Wait for any animations to complete
    await this.page.waitForTimeout(500); // Allow for CSS transitions
    
    // Wait for items to be stable
    await this.portfolioGrid.evaluate((grid) => {
      const items = Array.from(grid.querySelectorAll('.portfolio-item'));
      return Promise.all(
        items.map((item) => {
          return Promise.all(
            (item as HTMLElement).getAnimations().map((anim) => anim.finished)
          );
        })
      );
    });
  }

  /**
   * Get all portfolio item images
   */
  async getPortfolioImages(): Promise<Locator> {
    return this.portfolioItems.locator('img');
  }

  /**
   * Check if a portfolio item is visible
   */
  async isItemVisible(index: number): Promise<boolean> {
    const item = this.portfolioItems.nth(index);
    
    return await item.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && parseFloat(style.opacity) > 0;
    });
  }
}

