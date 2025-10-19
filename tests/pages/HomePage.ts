import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { waitForClassRemoved } from '../utils/wait-helpers';

/**
 * Home Page Object
 */
export class HomePage extends BasePage {
  readonly splashScreen: Locator;
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
    
    // Splash screen
    this.splashScreen = page.locator('#splash-screen');
    
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
   * Check if splash screen is active
   */
  async isSplashActive(): Promise<boolean> {
    const bodyClasses = await this.page.locator('body').getAttribute('class');
    return bodyClasses?.includes('splash-active') || false;
  }

  /**
   * Wait for splash screen to complete
   */
  async waitForSplashComplete(): Promise<void> {
    const hasSplashClass = await this.isSplashActive();
    
    if (hasSplashClass) {
      await waitForClassRemoved(this.page.locator('body'), 'splash-active', 10000);
    }
    
    // Wait for splash screen to be hidden
    await this.splashScreen.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Check if page is interactive (no splash, content visible)
   */
  async isPageInteractive(): Promise<boolean> {
    const splashActive = await this.isSplashActive();
    const heroVisible = await this.heroSection.isVisible();
    
    return !splashActive && heroVisible;
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
   * Check if navigation bar is visible on splash screen
   */
  async isNavVisibleOnSplash(): Promise<boolean> {
    const splashActive = await this.isSplashActive();
    if (!splashActive) return false;
    
    const nav = this.page.locator('header nav');
    return await nav.isVisible();
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

