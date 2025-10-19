import { test, expect } from '../../fixtures/console-capture';
import { ServicesPage } from '../../pages/ServicesPage';
import { validTestData } from '../../utils/test-data';

test.describe('Booking Flow - Happy Path', () => {
  test('should complete full booking flow successfully', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Complete booking with valid data
    await servicesPage.completeBooking({
      name: validTestData.name,
      email: validTestData.email,
      phone: validTestData.phone,
      message: validTestData.message,
    });

    // Wait for success message or confirmation
    // Note: Adjust based on actual implementation
    await page.waitForTimeout(1000);
    
    // Verify form was submitted (could check for success message, redirect, etc.)
    // This will depend on the actual booking implementation
  });

  test('should select service and show contact form', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Select first service
    await servicesPage.selectFirstService();

    // Contact form should be visible
    await expect(servicesPage.contactForm).toBeVisible();
    await expect(servicesPage.nameField).toBeVisible();
    await expect(servicesPage.emailField).toBeVisible();
    await expect(servicesPage.phoneField).toBeVisible();
  });

  test('should show service cards', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Should have service cards
    const count = await servicesPage.serviceCards.count();
    expect(count).toBeGreaterThan(0);

    // All service cards should be visible
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(servicesPage.serviceCards.nth(i)).toBeVisible();
    }
  });

  test('should have step indicator', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Step indicator should be visible
    await expect(servicesPage.stepIndicator).toBeVisible();

    // Should show at least step 1
    const step1 = page.locator('.step-item[data-step="1"]');
    await expect(step1).toBeVisible();
  });

  test('should fill and submit contact form', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Select a service first
    await servicesPage.selectFirstService();
    await expect(servicesPage.contactForm).toBeVisible();

    // Fill form
    await servicesPage.fillContactForm({
      name: validTestData.name,
      email: validTestData.email,
      phone: validTestData.phone,
      message: validTestData.message,
    });

    // Verify fields are filled
    await expect(servicesPage.nameField).toHaveValue(validTestData.name);
    await expect(servicesPage.emailField).toHaveValue(validTestData.email);
    await expect(servicesPage.phoneField).toHaveValue(validTestData.phone);

    // Submit button should be enabled
    const isDisabled = await servicesPage.isSubmitDisabled();
    expect(isDisabled).toBe(false);
  });
});

test.describe('Booking Flow - Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should complete booking on mobile', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Verify page is responsive
    await expect(servicesPage.pageHero).toBeVisible();
    await expect(servicesPage.bookingContainer).toBeVisible();

    // Complete booking
    await servicesPage.completeBooking({
      name: validTestData.name,
      email: validTestData.email,
      phone: validTestData.phone,
    });

    // Form should be submitted
    await page.waitForTimeout(1000);
  });

  test('should have mobile-friendly form inputs', async ({ page }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    // Select service
    await servicesPage.selectFirstService();
    await expect(servicesPage.contactForm).toBeVisible();

    // Check input types for mobile keyboards
    await expect(servicesPage.emailField).toHaveAttribute('type', 'email');
    await expect(servicesPage.phoneField).toHaveAttribute('type', /tel|phone|text/);
  });
});

