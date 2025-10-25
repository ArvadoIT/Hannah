import { test, expect } from '../../fixtures/performance-monitor';
import { 
  expectNoConsoleErrors, 
  expectNoConsoleWarnings 
} from '../../utils/performance-assertions';
import { HomePage } from '../../pages/HomePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { PortfolioPage } from '../../pages/PortfolioPage';
import { CalendarPage } from '../../pages/CalendarPage';

test.describe('Console Log Monitoring - Next.js App', () => {
  test('Home page should have no console errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Allow some time for any deferred scripts
    await page.waitForTimeout(1000);
    
    // Log all console messages for debugging
    console.log(`Total console messages: ${consoleMessages.length}`);
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    // Check for errors
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
      /google-analytics/,
    ]);
  });

  test('Services page should have no console errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log(`Console messages on Services: ${consoleMessages.length}`);
    
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
    ]);
  });

  test('Portfolio page should have no console errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log(`Console messages on Portfolio: ${consoleMessages.length}`);
    
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
    ]);
  });

  test('Calendar page should have no console errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log(`Console messages on Calendar: ${consoleMessages.length}`);
    
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
    ]);
  });

  test('No console errors during full navigation flow', async ({ 
    page, 
    consoleMessages 
  }) => {
    // Navigate through all main pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(`Total console messages during navigation: ${consoleMessages.length}`);
    
    // Group messages by type
    const messagesByType = {
      error: consoleMessages.filter(m => m.type === 'error'),
      warning: consoleMessages.filter(m => m.type === 'warning'),
      log: consoleMessages.filter(m => m.type === 'log'),
      info: consoleMessages.filter(m => m.type === 'info'),
    };
    
    console.log('Messages by type:', {
      errors: messagesByType.error.length,
      warnings: messagesByType.warning.length,
      logs: messagesByType.log.length,
      info: messagesByType.info.length,
    });
    
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /GA_MEASUREMENT_ID/,
    ]);
  });

  test('No console warnings on critical pages', async ({ 
    page, 
    consoleMessages 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    await expectNoConsoleWarnings(consoleMessages, [
      /favicon\.ico/,
      /Compiled with warnings/, // Next.js dev warnings
      /Fast Refresh/, // Next.js Fast Refresh messages
      /Download the React DevTools/,
    ]);
  });

  test('Next.js should not log hydration errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for Next.js specific errors
    const hydrationErrors = consoleMessages.filter(msg => 
      msg.text.toLowerCase().includes('hydration') ||
      msg.text.toLowerCase().includes('hydrating') ||
      msg.text.toLowerCase().includes('mismatch')
    );
    
    expect(
      hydrationErrors.length,
      'Should have no hydration errors'
    ).toBe(0);
    
    if (hydrationErrors.length > 0) {
      console.log('Hydration errors found:');
      hydrationErrors.forEach(err => console.log(`  - ${err.text}`));
    }
  });

  test('Check for React warnings and errors', async ({ 
    page, 
    consoleMessages 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Navigate to a few pages to trigger React
    await homePage.navigateToServices();
    await page.waitForLoadState('networkidle');
    
    // Check for common React issues
    const reactIssues = consoleMessages.filter(msg => 
      msg.text.includes('React') ||
      msg.text.includes('component') ||
      msg.text.includes('key prop') ||
      msg.text.includes('useEffect')
    );
    
    console.log(`React-related messages: ${reactIssues.length}`);
    reactIssues.forEach(issue => {
      console.log(`[${issue.type}] ${issue.text}`);
    });
    
    // Filter out non-error React messages
    const reactErrors = reactIssues.filter(msg => msg.type === 'error');
    
    expect(
      reactErrors.length,
      'Should have no React errors'
    ).toBe(0);
  });

  test('Monitor console logs during user interactions', async ({ 
    page, 
    consoleMessages 
  }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await page.waitForLoadState('networkidle');
    
    const initialMessageCount = consoleMessages.length;
    
    // Interact with filters (if available)
    const filterButtons = await portfolioPage.filterButtons.count();
    if (filterButtons > 0) {
      await portfolioPage.filterButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Scroll the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const newMessages = consoleMessages.slice(initialMessageCount);
    console.log(`New messages after interaction: ${newMessages.length}`);
    
    const newErrors = newMessages.filter(m => m.type === 'error');
    expect(
      newErrors.length,
      'Should have no new errors after interactions'
    ).toBe(0);
  });

  test('Check for unnecessary console.log statements in production', async ({ 
    page, 
    consoleMessages 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Development logs are okay, but production shouldn't have debug logs
    const debugLogs = consoleMessages.filter(msg => 
      msg.type === 'log' && 
      !msg.text.includes('[HMR]') && // Next.js Hot Module Replacement
      !msg.text.includes('[Fast Refresh]') // Next.js Fast Refresh
    );
    
    console.log(`Debug logs found: ${debugLogs.length}`);
    debugLogs.forEach(log => {
      console.log(`  - ${log.text}`);
    });
    
    // In production, we should minimize console logs
    // For now, just report them (not failing the test)
    if (debugLogs.length > 10) {
      console.warn(`Warning: Found ${debugLogs.length} console.log statements. Consider removing them for production.`);
    }
  });
});

test.describe('Console Monitoring - Error Recovery', () => {
  test('Should handle navigation errors gracefully', async ({ 
    page, 
    consoleMessages 
  }) => {
    // Try to navigate to a non-existent page
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    
    // Check if 404 page loads without errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    
    // 404 page should still load cleanly
    console.log(`Errors on 404 page: ${errors.length}`);
    
    // We expect no JavaScript errors even on 404
    await expectNoConsoleErrors(consoleMessages, [
      /favicon\.ico/,
      /404/,
      /not found/i,
    ]);
  });

  test('Should not log errors when images fail to load', async ({ 
    page, 
    consoleMessages 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Images might fail but shouldn't cause JavaScript errors
    const imageErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && 
      (msg.text.includes('image') || msg.text.includes('img'))
    );
    
    console.log(`Image-related errors: ${imageErrors.length}`);
    
    // Image failures shouldn't break the app
    expect(
      imageErrors.length,
      'Should handle image failures gracefully'
    ).toBe(0);
  });
});

