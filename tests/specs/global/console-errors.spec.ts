import { test } from '../../fixtures/console-capture';
import { expectNoConsoleErrors } from '../../utils/assertions';

test.describe('Console Errors', () => {
  const keyPages = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services.html' },
    { name: 'Admin', path: '/admin.html' },
  ];

  for (const { name, path } of keyPages) {
    test(`should have zero console errors on ${name} page`, async ({ page, consoleMessages }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Allow some time for any deferred scripts to run
      await page.waitForTimeout(1000);

      // Check for console errors, allowing some known benign patterns
      const allowedPatterns = [
        /favicon\.ico/, // Favicon errors are common and benign
        /GA_MEASUREMENT_ID/, // Google Analytics placeholder
      ];

      await expectNoConsoleErrors(consoleMessages, allowedPatterns);
    });
  }

  test('should have zero console errors after full navigation flow', async ({ page, consoleMessages }) => {
    // Navigate through all pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('a[href="services.html"]');
    await page.waitForLoadState('networkidle');

    await page.waitForLoadState('networkidle');

    await page.click('a[href="index.html"]');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const allowedPatterns = [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
    ];

    await expectNoConsoleErrors(consoleMessages, allowedPatterns);
  });
});

