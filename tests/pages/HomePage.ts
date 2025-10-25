import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object
 */
export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly ctaButton: Locator;
  readonly introSection: Locator;
  readonly aboutSection: Locator;
  readonly aboutImage: Locator;
  readonly reviewsSection: Locator;
  readonly reviewCards: Locator;
  readonly googleRating: Locator;

  constructor(page: Page) {
    super(page);
    
    // Hero section
    this.heroSection = page.locator('#home.hero');
    this.heroTitle = page.locator('#hero-title');
    this.ctaButton = page.locator('.hero-content .cta-button');
    
    // Introduction section
    this.introSection = page.locator('.introduction');
    
    // About section
    this.aboutSection = page.locator('#about.about');
    this.aboutImage = page.locator('.about-image img.about-display');
    
    // Reviews section
    this.reviewsSection = page.locator('#reviews.reviews-section');
    this.reviewCards = page.locator('.review-card');
    this.googleRating = page.locator('.google-rating');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * Check if page is interactive (content visible)
   */
  async isPageInteractive(): Promise<boolean> {
    const heroVisible = await this.heroSection.isVisible();
    
    return heroVisible;
  }

  /**
   * Get all review cards
   */
  async getReviewCards(): Promise<Locator> {
    return this.reviewCards;
  }

  /**
   * Check if about image is loaded
   */
  async isAboutImageLoaded(): Promise<boolean> {
    const isComplete = await this.aboutImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalHeight > 0;
    });
    
    return isComplete;
  }

  /**
   * Get hero section background image
   */
  async getHeroBackgroundImage(): Promise<string> {
    const bgImage = await this.heroSection.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    
    return bgImage;
  }


  /**
   * Click CTA button in hero section
   */
  async clickHeroCTA(): Promise<void> {
    await this.ctaButton.click();
    await this.page.waitForURL(/services\.html/);
  }

  /**
   * Navigate to services from intro section
   */
  async clickExploreServices(): Promise<void> {
    await this.page.locator('.intro-actions a[href="services.html"]').first().click();
    await this.page.waitForURL(/services\.html/);
  }

  /**
   * Check page background color (no white flash)
   */
  async getPageBackgroundColor(): Promise<string> {
    const bgColor = await this.page.locator('body').evaluate((body) => {
      return window.getComputedStyle(body).backgroundColor;
    });
    
    return bgColor;
  }
}

