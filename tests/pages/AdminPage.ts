import { Page, Locator } from '@playwright/test';

/**
 * Admin Page Object
 */
export class AdminPage {
  readonly page: Page;
  
  // Login screen
  readonly loginScreen: Locator;
  readonly loginForm: Locator;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;
  
  // Dashboard
  readonly dashboard: Locator;
  readonly adminHeader: Locator;
  readonly adminHamburger: Locator;
  readonly logoutButton: Locator;
  
  // Mobile menu
  readonly mobileMenu: Locator;
  readonly mobileMenuOverlay: Locator;
  readonly mobileMenuClose: Locator;
  readonly mobileMenuLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Login elements
    this.loginScreen = page.locator('#admin-login');
    this.loginForm = page.locator('#admin-login-form');
    this.usernameField = page.locator('#admin-username');
    this.passwordField = page.locator('#admin-password');
    this.loginButton = page.locator('.admin-login-btn');
    this.loginError = page.locator('#login-error');
    
    // Dashboard elements
    this.dashboard = page.locator('#admin-dashboard');
    this.adminHeader = page.locator('.admin-header');
    this.adminHamburger = page.locator('.admin-hamburger');
    this.logoutButton = page.locator('#admin-logout');
    
    // Mobile menu
    this.mobileMenu = page.locator('#admin-mobile-menu');
    this.mobileMenuOverlay = page.locator('#mobile-menu-overlay');
    this.mobileMenuClose = page.locator('#mobile-menu-close');
    this.mobileMenuLinks = page.locator('.mobile-menu-link');
  }

  /**
   * Navigate to admin page
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin.html');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  /**
   * Check if login screen is visible
   */
  async isLoginScreenVisible(): Promise<boolean> {
    return await this.loginScreen.isVisible();
  }

  /**
   * Check if dashboard is visible
   */
  async isDashboardVisible(): Promise<boolean> {
    return await this.dashboard.isVisible();
  }

  /**
   * Check if login error is shown
   */
  async isLoginErrorVisible(): Promise<boolean> {
    return await this.loginError.isVisible();
  }

  /**
   * Get login error message
   */
  async getLoginErrorMessage(): Promise<string> {
    return await this.loginError.textContent() || '';
  }

  /**
   * Logout from dashboard
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.loginScreen.waitFor({ state: 'visible' });
  }

  /**
   * Open mobile menu
   */
  async openMobileMenu(): Promise<void> {
    await this.adminHamburger.click();
    await this.mobileMenu.waitFor({ state: 'visible' });
  }

  /**
   * Close mobile menu
   */
  async closeMobileMenu(): Promise<void> {
    await this.mobileMenuClose.click();
    await this.mobileMenu.waitFor({ state: 'hidden' });
  }

  /**
   * Close mobile menu via overlay
   */
  async closeMobileMenuViaOverlay(): Promise<void> {
    await this.mobileMenuOverlay.click();
    await this.mobileMenu.waitFor({ state: 'hidden' });
  }

  /**
   * Close mobile menu via Escape key
   */
  async closeMobileMenuViaEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.mobileMenu.waitFor({ state: 'hidden' });
  }

  /**
   * Check if mobile menu is visible
   */
  async isMobileMenuVisible(): Promise<boolean> {
    return await this.mobileMenu.isVisible();
  }

  /**
   * Check if hamburger icon is clickable
   */
  async isHamburgerClickable(): Promise<boolean> {
    const isVisible = await this.adminHamburger.isVisible();
    const isEnabled = await this.adminHamburger.isEnabled();
    
    return isVisible && isEnabled;
  }

  /**
   * Check if body scroll is locked when menu is open
   */
  async isBodyScrollLocked(): Promise<boolean> {
    const overflow = await this.page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });
    
    return overflow === 'hidden';
  }

  /**
   * Get focused element
   */
  async getFocusedElement(): Promise<string> {
    return await this.page.evaluate(() => {
      const focused = document.activeElement;
      return focused?.getAttribute('class') || focused?.tagName || '';
    });
  }

  /**
   * Wait for dashboard to load
   */
  async waitForDashboard(): Promise<void> {
    await this.dashboard.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if redirected to login (used for auth tests)
   */
  async isOnLoginPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('admin.html') && await this.isLoginScreenVisible();
  }
}

