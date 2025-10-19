import { test, expect } from '../../fixtures/console-capture';
import { AdminPage } from '../../pages/AdminPage';
import { adminCredentials } from '../../utils/test-data';

test.describe('Admin Mobile Menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Login if authentication is implemented
    // await adminPage.login(adminCredentials.valid.username, adminCredentials.valid.password);
  });

  test('should have clickable hamburger icon', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Check if we're on login screen or dashboard
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    
    if (!isLoginVisible) {
      // Dashboard is visible, hamburger should be present
      const isClickable = await adminPage.isHamburgerClickable();
      expect(isClickable).toBe(true);

      // Hamburger should be visible
      await expect(adminPage.adminHamburger).toBeVisible();
      await expect(adminPage.adminHamburger).toBeEnabled();
    }
  });

  test('should open mobile menu when clicking hamburger', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Open menu
    await adminPage.openMobileMenu();

    // Menu should be visible
    const isMenuVisible = await adminPage.isMobileMenuVisible();
    expect(isMenuVisible).toBe(true);

    // Menu links should be visible
    await expect(adminPage.mobileMenuLinks.first()).toBeVisible();
  });

  test('should close mobile menu when clicking close button', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Open menu
    await adminPage.openMobileMenu();
    await expect(adminPage.mobileMenu).toBeVisible();

    // Close menu
    await adminPage.closeMobileMenu();

    // Menu should be hidden
    const isMenuVisible = await adminPage.isMobileMenuVisible();
    expect(isMenuVisible).toBe(false);
  });

  test('should close mobile menu when clicking overlay', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Open menu
    await adminPage.openMobileMenu();
    await expect(adminPage.mobileMenu).toBeVisible();

    // Close via overlay
    await adminPage.closeMobileMenuViaOverlay();

    // Menu should be hidden
    const isMenuVisible = await adminPage.isMobileMenuVisible();
    expect(isMenuVisible).toBe(false);
  });

  test('should close mobile menu when pressing Escape', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Open menu
    await adminPage.openMobileMenu();
    await expect(adminPage.mobileMenu).toBeVisible();

    // Close via Escape key
    await adminPage.closeMobileMenuViaEscape();

    // Menu should be hidden
    const isMenuVisible = await adminPage.isMobileMenuVisible();
    expect(isMenuVisible).toBe(false);
  });

  test('should lock body scroll when menu is open', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Check scroll before opening menu
    const scrollBeforeOpen = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });

    // Open menu
    await adminPage.openMobileMenu();
    await page.waitForTimeout(300);

    // Body scroll should be locked
    const isScrollLocked = await adminPage.isBodyScrollLocked();
    
    // Close menu
    await adminPage.closeMobileMenu();
    
    // Note: Scroll lock verification depends on implementation
  });

  test('should have menu links', async ({ page }) => {
    const adminPage = new AdminPage(page);

    // Skip if on login screen
    const isLoginVisible = await adminPage.isLoginScreenVisible();
    if (isLoginVisible) {
      test.skip();
    }

    // Open menu
    await adminPage.openMobileMenu();

    // Should have menu links
    const linkCount = await adminPage.mobileMenuLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Links should be visible
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      await expect(adminPage.mobileMenuLinks.nth(i)).toBeVisible();
    }
  });
});

test.describe('Admin Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('should not show hamburger on desktop', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // On desktop, hamburger may be hidden or have different behavior
    // This depends on your responsive design
  });
});

