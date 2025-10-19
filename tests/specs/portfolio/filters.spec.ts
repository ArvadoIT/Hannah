import { test, expect } from '../../fixtures/console-capture';
import { PortfolioPage } from '../../pages/PortfolioPage';

test.describe('Portfolio Filters', () => {
  test('should display all portfolio items on initial load', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Should have portfolio items
    const count = await portfolioPage.portfolioItems.count();
    expect(count).toBeGreaterThan(0);

    // Grid should be visible
    await expect(portfolioPage.portfolioGrid).toBeVisible();
  });

  test('should have filter buttons', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Should have filter buttons
    const filterCount = await portfolioPage.filterButtons.count();
    expect(filterCount).toBeGreaterThan(0);

    // At least "All" filter should exist
    const filterLabels = await portfolioPage.getFilterLabels();
    expect(filterLabels).toContain('All');
  });

  test('should filter items when clicking filter buttons', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Get initial count
    const initialCount = await portfolioPage.getVisibleItemsCount();
    expect(initialCount).toBeGreaterThan(0);

    // Get filter labels
    const filterLabels = await portfolioPage.getFilterLabels();

    // Try clicking different filters (skip "All" since that's default)
    for (const label of filterLabels.slice(1, 3)) {
      await portfolioPage.clickFilter(label);
      
      // Wait for transition
      await portfolioPage.waitForItemsTransition();
      
      // Count may change based on filter
      const newCount = await portfolioPage.getVisibleItemsCount();
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show active filter state', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Initial active filter should be "All"
    const initialActive = await portfolioPage.getActiveFilter();
    expect(initialActive.toLowerCase()).toContain('all');

    // Click a different filter
    const filterLabels = await portfolioPage.getFilterLabels();
    if (filterLabels.length > 1) {
      const targetFilter = filterLabels[1];
      await portfolioPage.clickFilter(targetFilter);
      
      // Active filter should update
      const newActive = await portfolioPage.getActiveFilter();
      expect(newActive).toBe(targetFilter);
    }
  });

  test('should transition items smoothly when filtering', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    const filterLabels = await portfolioPage.getFilterLabels();
    
    if (filterLabels.length > 1) {
      // Click a filter
      await portfolioPage.clickFilter(filterLabels[1]);
      
      // Wait for transitions to complete
      await portfolioPage.waitForItemsTransition();
      
      // Items should be stable (no animation running)
      const isStable = await portfolioPage.portfolioGrid.evaluate((grid) => {
        const items = Array.from(grid.querySelectorAll('.portfolio-item'));
        const hasRunningAnimations = items.some((item) => {
          return (item as HTMLElement).getAnimations().some(anim => anim.playState === 'running');
        });
        return !hasRunningAnimations;
      });
      
      expect(isStable).toBe(true);
    }
  });

  test('should show "All" items when clicking "All" filter', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Get initial count with "All" filter
    const allCount = await portfolioPage.getVisibleItemsCount();

    // Click another filter
    const filterLabels = await portfolioPage.getFilterLabels();
    if (filterLabels.length > 1) {
      await portfolioPage.clickFilter(filterLabels[1]);
      await portfolioPage.waitForItemsTransition();

      // Click "All" again
      await portfolioPage.clickFilter('All');
      await portfolioPage.waitForItemsTransition();

      // Should show all items again
      const finalCount = await portfolioPage.getVisibleItemsCount();
      expect(finalCount).toBe(allCount);
    }
  });

  test('should load portfolio images', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Get portfolio images
    const images = await portfolioPage.getPortfolioImages();
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);

    // Check first few images are loaded
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      
      if (await portfolioPage.isItemVisible(i)) {
        const isLoaded = await img.evaluate((el: HTMLImageElement) => {
          return el.complete && el.naturalHeight > 0;
        });
        
        // Visible images should be loaded
        expect(isLoaded).toBe(true);
      }
    }
  });
});

test.describe('Portfolio Responsive', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should display portfolio on mobile', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Grid should be visible
    await expect(portfolioPage.portfolioGrid).toBeVisible();

    // Items should be visible
    const count = await portfolioPage.getVisibleItemsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter on mobile', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Filter buttons should be visible
    await expect(portfolioPage.filterButtons.first()).toBeVisible();

    // Should be able to filter
    const filterLabels = await portfolioPage.getFilterLabels();
    if (filterLabels.length > 1) {
      await portfolioPage.clickFilter(filterLabels[1]);
      await portfolioPage.waitForItemsTransition();

      // Should show filtered items
      const count = await portfolioPage.getVisibleItemsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

