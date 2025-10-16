const { test, expect } = require('@playwright/test');

test.describe('Splash Screen Navigation Issues', () => {
  
  test('should not show splash screen when navigating back to home from other pages', async ({ page }) => {
    // Navigate to the home page first
    await page.goto('/');
    
    // Wait for splash screen to complete (if it shows)
    await page.waitForTimeout(4000); // Wait for splash screen duration
    
    // Verify we can see the main content
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
    
    // Navigate to services page
    await page.click('nav a[href="services.html"]');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on services page
    await expect(page.locator('h1')).toContainText('Our Services');
    
    // Navigate back to home page
    await page.click('nav a[href="index.html"]');
    await page.waitForLoadState('networkidle');
    
    // Check that splash screen is NOT visible
    const splashScreen = page.locator('#splash-screen');
    await expect(splashScreen).not.toBeVisible();
    
    // Check that main content is immediately visible (no blank page)
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
    
    // Verify the hero section content is fully loaded
    await expect(page.locator('.hero-text')).toBeVisible();
    await expect(page.locator('.hero-text p')).toBeVisible();
    await expect(page.locator('.cta-button').first()).toBeVisible();
  });

  test('should not show splash screen when navigating from portfolio to home', async ({ page }) => {
    // Navigate to the home page first
    await page.goto('/');
    
    // Wait for splash screen to complete
    await page.waitForTimeout(4000);
    
    // Navigate to portfolio page
    await page.click('nav a[href="portfolio.html"]');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on portfolio page
    await expect(page.locator('h1')).toContainText('Our Portfolio');
    
    // Navigate back to home page
    await page.click('nav a[href="index.html"]');
    await page.waitForLoadState('networkidle');
    
    // Check that splash screen is NOT visible
    const splashScreen = page.locator('#splash-screen');
    await expect(splashScreen).not.toBeVisible();
    
    // Check that main content is immediately visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
  });

  test('should show splash screen only on initial page load', async ({ page }) => {
    // Navigate to the home page for the first time
    await page.goto('/');
    
    // Check that splash screen is visible initially
    const splashScreen = page.locator('#splash-screen');
    await expect(splashScreen).toBeVisible();
    
    // Wait for splash screen to complete
    await page.waitForTimeout(4000);
    
    // Check that splash screen is hidden after animation
    await expect(splashScreen).not.toBeVisible();
    
    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
  });

  test('should not have blank homepage content when navigating back', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForTimeout(4000);
    
    // Navigate to services
    await page.click('nav a[href="services.html"]');
    await page.waitForLoadState('networkidle');
    
    // Navigate back to home
    await page.click('a[href="index.html"]');
    await page.waitForLoadState('networkidle');
    
    // Check that all main content sections are visible
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.hero-text')).toBeVisible();
    await expect(page.locator('.hero-text h1')).toBeVisible();
    await expect(page.locator('.hero-text p')).toBeVisible();
    await expect(page.locator('.hero-text .cta-button')).toBeVisible();
    
    // Check that introduction section is visible
    await expect(page.locator('.introduction')).toBeVisible();
    await expect(page.locator('.intro-content')).toBeVisible();
    
    // Check that about section is visible
    await expect(page.locator('.about')).toBeVisible();
    await expect(page.locator('.about-text')).toBeVisible();
    
    // Check that reviews section is visible
    await expect(page.locator('.reviews-section')).toBeVisible();
    await expect(page.locator('.testimonials-grid')).toBeVisible();
  });

  test('should maintain session state to skip splash on subsequent visits', async ({ page }) => {
    // First visit - should show splash
    await page.goto('/');
    
    // Check splash is visible
    const splashScreen = page.locator('#splash-screen');
    await expect(splashScreen).toBeVisible();
    
    // Wait for splash to complete
    await page.waitForTimeout(4000);
    
    // Navigate away and back
    await page.click('nav a[href="services.html"]');
    await page.waitForLoadState('networkidle');
    
    await page.click('nav a[href="index.html"]');
    await page.waitForLoadState('networkidle');
    
    // Splash should not appear again
    await expect(splashScreen).not.toBeVisible();
    
    // Content should be immediately visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
  });

  test('should handle direct navigation to home page with referrer', async ({ page }) => {
    // Simulate coming from another page by setting referrer
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');
    
    // Now navigate to home - should skip splash
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that splash screen is not visible
    const splashScreen = page.locator('#splash-screen');
    await expect(splashScreen).not.toBeVisible();
    
    // Check that content is immediately visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1:has-text("Elevate Your Beauty")')).toBeVisible();
  });
});
