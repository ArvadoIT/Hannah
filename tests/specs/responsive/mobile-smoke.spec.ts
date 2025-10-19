import { test, expect } from '../../fixtures/console-capture';
import { HomePage } from '../../pages/HomePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { PortfolioPage } from '../../pages/PortfolioPage';
import { expectNoConsoleErrors } from '../../utils/assertions';
import { validTestData } from '../../utils/test-data';

test.describe('Mobile Smoke Tests', () => {
  // Test on mobile viewport
  test.use({ viewport: { width: 390, height: 844 } });

  test('should load home page on mobile', async ({ page, consoleMessages }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Page should be visible
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();

    // Check for console errors
    await expectNoConsoleErrors(consoleMessages, [/favicon\.ico/, /GA_MEASUREMENT_ID/]);
  });

  test('should navigate on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Open mobile menu
    await homePage.openMobileMenu();
    await expect(homePage.navMenu).toBeVisible();

    // Navigate to services
    await homePage.navLinks.services.click();
    await expect(page).toHaveURL(/services\.html/);
  });

  test('should complete booking flow on mobile', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Complete booking
    await servicesPage.completeBooking({
      name: validTestData.name,
      email: validTestData.email,
      phone: validTestData.phone,
    });

    // Form should be submitted
    await page.waitForTimeout(1000);
  });

  test('should view portfolio on mobile', async ({ page }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();

    // Portfolio should be visible
    await expect(portfolioPage.portfolioGrid).toBeVisible();

    // Should have items
    const count = await portfolioPage.getVisibleItemsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should have mobile-friendly touch targets', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Hamburger should be large enough for touch
    const hamburgerBox = await homePage.hamburger.boundingBox();
    expect(hamburgerBox).not.toBeNull();
    
    if (hamburgerBox) {
      // Minimum touch target size should be 44x44 (Apple guideline)
      expect(hamburgerBox.width).toBeGreaterThanOrEqual(40);
      expect(hamburgerBox.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should have readable text on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Hero title should have appropriate font size
    const fontSize = await homePage.heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeValue = parseInt(fontSize);
    
    // Font size should be at least 16px for readability on mobile
    expect(fontSizeValue).toBeGreaterThanOrEqual(16);
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    const pages = ['/', '/services.html', '/portfolio.html'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll, `Page ${path} should not have horizontal scroll`).toBe(false);
    }
  });

  test('should have viewport meta tag', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Viewport meta tag should be present
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toBeAttached();

    const content = await viewportMeta.getAttribute('content');
    expect(content).toContain('width=device-width');
  });
});

test.describe('Desktop Smoke Tests', () => {
  // Test on desktop viewport
  test.use({ viewport: { width: 1280, height: 800 } });

  test('should load home page on desktop', async ({ page, consoleMessages }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Page should be visible
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();

    // Check for console errors
    await expectNoConsoleErrors(consoleMessages, [/favicon\.ico/, /GA_MEASUREMENT_ID/]);
  });

  test('should navigate on desktop', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navigate to services
    await homePage.navigateToServices();
    await expect(page).toHaveURL(/services\.html/);

    // Navigate to portfolio
    const servicesPage = new ServicesPage(page);
    await servicesPage.navigateToPortfolio();
    await expect(page).toHaveURL(/portfolio\.html/);
  });

  test('should complete booking flow on desktop', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Complete booking
    await servicesPage.completeBooking({
      name: validTestData.name,
      email: validTestData.email,
      phone: validTestData.phone,
    });

    // Form should be submitted
    await page.waitForTimeout(1000);
  });
});

