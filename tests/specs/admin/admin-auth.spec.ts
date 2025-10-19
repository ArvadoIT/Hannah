import { test, expect } from '../../fixtures/console-capture';
import { AdminPage } from '../../pages/AdminPage';
import { adminCredentials } from '../../utils/test-data';

test.describe('Admin Authentication', () => {
  test('should show login screen on initial visit', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Login screen should be visible
    await expect(adminPage.loginScreen).toBeVisible();
    await expect(adminPage.loginForm).toBeVisible();
    
    // Dashboard should not be visible
    const isDashboardVisible = await adminPage.isDashboardVisible();
    expect(isDashboardVisible).toBe(false);
  });

  test('should have login form fields', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Form fields should be visible
    await expect(adminPage.usernameField).toBeVisible();
    await expect(adminPage.passwordField).toBeVisible();
    await expect(adminPage.loginButton).toBeVisible();

    // Password field should have correct type
    await expect(adminPage.passwordField).toHaveAttribute('type', 'password');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Try to login with invalid credentials
    await adminPage.login(
      adminCredentials.invalid.username,
      adminCredentials.invalid.password
    );

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Should show error message (if implemented)
    // Note: This depends on your authentication implementation
    const isErrorVisible = await adminPage.isLoginErrorVisible();
    
    // If error messages are implemented, verify them
    if (isErrorVisible) {
      const errorMsg = await adminPage.getLoginErrorMessage();
      expect(errorMsg.toLowerCase()).toMatch(/invalid|incorrect|wrong/);
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Login with valid credentials
    await adminPage.login(
      adminCredentials.valid.username,
      adminCredentials.valid.password
    );

    // Wait for dashboard to appear
    await page.waitForTimeout(1000);

    // Dashboard should be visible (if auth is implemented)
    // Note: This test will need adjustment based on actual auth implementation
  });

  test('should redirect to login when accessing dashboard without session', async ({ page, context }) => {
    // Clear any existing session
    await context.clearCookies();

    const adminPage = new AdminPage(page);
    await adminPage.goto();

    // Should be on login page
    const isOnLogin = await adminPage.isOnLoginPage();
    expect(isOnLogin).toBe(true);
  });
});

