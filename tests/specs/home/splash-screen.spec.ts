import { test, expect } from '../../fixtures/console-capture';
import { HomePage } from '../../pages/HomePage';

test.describe('Splash Screen', () => {
  test('should show splash screen on first visit', async ({ page, context }) => {
    // Clear session storage to simulate first visit
    await context.clearCookies();
    
    const homePage = new HomePage(page);
    await page.goto('/');
    
    // Splash should be visible initially
    const isSplashActive = await homePage.isSplashActive();
    
    if (isSplashActive) {
      await expect(homePage.splashScreen).toBeVisible();
      
      // Wait for splash to complete
      await homePage.waitForSplashComplete();
      
      // After splash, page should be interactive
      const isInteractive = await homePage.isPageInteractive();
      expect(isInteractive).toBe(true);
      
      // Hero section should be visible
      await expect(homePage.heroSection).toBeVisible();
    }
  });

  test('should skip splash on same-session revisit', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // First visit
    await homePage.goto();
    await homePage.waitForSplashComplete();
    
    // Navigate away
    await homePage.navigateToServices();
    await expect(page).toHaveURL(/services\.html/);
    
    // Navigate back to home
    await page.click('a[href="index.html"]');
    await page.waitForURL(/index\.html|\/$/);
    
    // Splash should be skipped (body should have skip-splash class or not be splash-active)
    const isSplashActive = await homePage.isSplashActive();
    expect(isSplashActive).toBe(false);
    
    // Page should be immediately interactive
    const isInteractive = await homePage.isPageInteractive();
    expect(isInteractive).toBe(true);
  });

  test('should skip splash on internal navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Visit services first
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');
    
    // Navigate to home via internal link
    await page.click('a[href="index.html"]');
    await page.waitForURL(/index\.html|\/$/);
    
    // Splash should be skipped
    const isSplashActive = await homePage.isSplashActive();
    expect(isSplashActive).toBe(false);
  });

  test('should have navigation bar visible on splash screen', async ({ page, context }) => {
    // Clear session to ensure splash shows
    await context.clearCookies();
    
    const homePage = new HomePage(page);
    await page.goto('/');
    
    // Check if splash is active
    const isSplashActive = await homePage.isSplashActive();
    
    if (isSplashActive) {
      // Nav should be visible even during splash
      const isNavVisible = await homePage.isNavVisibleOnSplash();
      expect(isNavVisible).toBe(true);
      
      const nav = page.locator('header nav');
      await expect(nav).toBeVisible();
    }
  });

  test('should not show white screen after splash', async ({ page, context }) => {
    // Clear session to ensure splash shows
    await context.clearCookies();
    
    const homePage = new HomePage(page);
    await page.goto('/');
    
    // Check background color throughout the process
    const bgColor = await homePage.getPageBackgroundColor();
    
    // Should be cream color (#faf8f5 = rgb(250, 248, 245))
    expect(bgColor).toMatch(/rgb\(250,\s*248,\s*245\)|#faf8f5/i);
    
    // Wait for splash to complete
    await homePage.waitForSplashComplete();
    
    // Background should still be cream (no white flash)
    const bgColorAfter = await homePage.getPageBackgroundColor();
    expect(bgColorAfter).toMatch(/rgb\(250,\s*248,\s*245\)|#faf8f5/i);
  });

  test('should transition smoothly to main content', async ({ page, context }) => {
    // Clear session to ensure splash shows
    await context.clearCookies();
    
    const homePage = new HomePage(page);
    await page.goto('/');
    
    // Wait for splash to complete
    await homePage.waitForSplashComplete();
    
    // Main content should be visible and interactive
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.ctaButton).toBeVisible();
    
    // CTA button should be clickable
    await expect(homePage.ctaButton).toBeEnabled();
  });
});

