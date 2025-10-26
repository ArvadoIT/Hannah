import { test, expect } from '../../fixtures/console-capture';
import { HomePage } from '../../pages/HomePage';
import { expectImageLoaded, expectBackgroundImage } from '../../utils/assertions';

test.describe('Home Page Images and Content', () => {
  test('should load hero section background image', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Wait for hero section to be visible
    await expect(homePage.heroSection).toBeVisible();

    // Check if hero has background image
    const bgImage = await homePage.getHeroBackgroundImage();
    expect(bgImage).not.toBe('none');
    expect(bgImage).toContain('url');
  });

  test('should load about section image', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to about section
    await homePage.scrollToElement(homePage.aboutSection);

    // Wait for image to be visible
    await expect(homePage.aboutImage).toBeVisible();

    // Check if image is loaded
    await expectImageLoaded(page, '.about-image img.about-display');
  });

  test('should display all review cards', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to reviews section
    await homePage.scrollToElement(homePage.reviewsSection);

    // Should have at least 3 review cards
    const reviewCards = await homePage.getReviewCards();
    const count = await reviewCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // All review cards should be visible
    for (let i = 0; i < count; i++) {
      await expect(reviewCards.nth(i)).toBeVisible();
    }
  });

  test('should display Google rating', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to reviews section
    await homePage.scrollToElement(homePage.reviewsSection);

    // Google rating should be visible
    await expect(homePage.googleRating).toBeVisible();

    // Should have star ratings
    const stars = page.locator('.rating-stars .star.filled');
    const starCount = await stars.count();
    expect(starCount).toBe(5);

    // Should have rating number
    const ratingNumber = page.locator('.rating-number');
    await expect(ratingNumber).toBeVisible();
    await expect(ratingNumber).toContainText('5.0');
  });

  test('should have correct page background color', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const bgColor = await homePage.getPageBackgroundColor();
    
    // Should be cream color (#faf8f5 = rgb(250, 248, 245))
    expect(bgColor).toMatch(/rgb\(250,\s*248,\s*245\)|rgba\(250,\s*248,\s*245/i);
  });

  test('should display all main content sections', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Hero section
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.heroTitle).toContainText('Elevate Your Beauty');

    // Introduction section
    await expect(homePage.introSection).toBeVisible();

    // About section
    await homePage.scrollToElement(homePage.aboutSection);
    await expect(homePage.aboutSection).toBeVisible();

    // Reviews section
    await homePage.scrollToElement(homePage.reviewsSection);
    await expect(homePage.reviewsSection).toBeVisible();
  });

  test('should have working CTA buttons', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Hero CTA button
    await expect(homePage.ctaButton).toBeVisible();
    await expect(homePage.ctaButton).toBeEnabled();
    await expect(homePage.ctaButton).toHaveAttribute('href', 'services.html');

    // Introduction section CTAs
    const exploreServicesBtn = page.locator('.intro-actions a[href="services.html"]');
    await expect(exploreServicesBtn).toBeVisible();

    await expect(viewPortfolioBtn).toBeVisible();
  });

  test('should navigate to services when clicking CTA', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.clickHeroCTA();
    await expect(page).toHaveURL(/services\.html/);
  });
});

