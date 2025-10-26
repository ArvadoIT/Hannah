import { test, expect } from '../../fixtures/console-capture';
import { HomePage } from '../../pages/HomePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { PortfolioPage } from '../../pages/PortfolioPage';
import { expectNoConsoleErrors } from '../../utils/assertions';

test.describe('Global Navigation', () => {
  test.describe('Desktop Navigation', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('should navigate between all main pages', async ({ page, consoleMessages }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Navigate to Services
      await homePage.navigateToServices();
      await expect(page).toHaveURL(/services\.html/);
      
      // Navigate to Portfolio
      const servicesPage = new ServicesPage(page);
      await servicesPage.navigateToPortfolio();
      
      // Navigate back to Home
      await expect(page).toHaveURL(/index\.html|\/$/);

      // Check for console errors
      await expectNoConsoleErrors(consoleMessages);
    });

    test('should have working navigation links in header', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Verify all nav links are visible and clickable
      await expect(homePage.navLinks.home).toBeVisible();
      await expect(homePage.navLinks.services).toBeVisible();
    });

    test('should maintain navigation bar on all pages', async ({ page }) => {
      const pages = ['/', '/services.html'];

      for (const path of pages) {
        await page.goto(path);
        const nav = page.locator('header nav.navbar');
        await expect(nav).toBeVisible();
        
        // Verify logo is present
        const logo = page.locator('.logo h2');
        await expect(logo).toContainText('Lacque&latte');
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should open and close mobile menu', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Verify hamburger is visible
      await expect(homePage.hamburger).toBeVisible();

      // Open menu
      await homePage.openMobileMenu();
      await expect(homePage.navMenu).toBeVisible();
      
      // Verify aria-expanded
      const ariaExpanded = await homePage.hamburger.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('true');

      // Close menu
      await homePage.closeMobileMenu();
      await expect(homePage.navMenu).toBeHidden();
    });

    test('should close mobile menu when clicking a link', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Open menu
      await homePage.openMobileMenu();
      await expect(homePage.navMenu).toBeVisible();

      // Click services link
      await homePage.navLinks.services.click();
      
      // Menu should close
      await expect(homePage.navMenu).toBeHidden();
      
      // Should navigate to services
      await expect(page).toHaveURL(/services\.html/);
    });

    test('should close mobile menu when clicking outside', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Open menu
      await homePage.openMobileMenu();
      await expect(homePage.navMenu).toBeVisible();

      // Click outside (on main content)
      await page.locator('main').click({ position: { x: 10, y: 10 } });

      // Menu should close
      await expect(homePage.navMenu).toBeHidden();
    });
  });

  test.describe('Footer', () => {
    test('should display footer on all pages', async ({ page }) => {
      const pages = ['/', '/services.html'];

      for (const path of pages) {
        await page.goto(path);
        
        const footer = page.locator('footer.footer');
        await expect(footer).toBeVisible();
        
        // Verify copyright text
        await expect(footer).toContainText('Lacque&latte');
        await expect(footer).toContainText('All rights reserved');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have skip to main content link', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      await expect(homePage.skipLink).toBeAttached();
      await expect(homePage.skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper ARIA labels on navigation', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      const nav = page.locator('nav[role="navigation"]');
      await expect(nav).toHaveAttribute('aria-label', 'Main navigation');

      // Check hamburger has aria-label
      await expect(homePage.hamburger).toHaveAttribute('aria-label', 'Toggle mobile menu');
    });
  });
});

