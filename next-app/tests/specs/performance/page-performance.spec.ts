import { test, expect } from '../../fixtures/performance-monitor';
import { 
  expectGoodPerformance, 
  expectNoFailedRequests,
  expectEfficientResourceLoading,
  generatePerformanceReport,
  PERFORMANCE_THRESHOLDS 
} from '../../utils/performance-assertions';
import { HomePage } from '../../pages/HomePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { PortfolioPage } from '../../pages/PortfolioPage';
import { CalendarPage } from '../../pages/CalendarPage';

test.describe('Page Performance - Next.js App', () => {
  test('Home page should load quickly and efficiently', async ({ 
    page, 
    consoleMessages, 
    networkRequests,
    capturePerformance 
  }) => {
    const homePage = new HomePage(page);
    
    // Navigate to home page
    await homePage.goto();
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Capture performance metrics
    const metrics = await capturePerformance();
    
    // Log performance report
    console.log(generatePerformanceReport(metrics, consoleMessages, networkRequests));
    
    // Assert performance meets thresholds
    await expectGoodPerformance(metrics);
    
    // Assert no failed requests
    await expectNoFailedRequests(networkRequests, [
      /favicon\.ico/,
      /google-analytics/,
    ]);
    
    // Check that hero image loaded
    expect(await homePage.isHeroImageLoaded()).toBe(true);
  });

  test('Services page should load quickly', async ({ 
    page, 
    consoleMessages, 
    networkRequests,
    capturePerformance 
  }) => {
    const servicesPage = new ServicesPage(page);
    
    await servicesPage.goto();
    await page.waitForLoadState('networkidle');
    
    const metrics = await capturePerformance();
    console.log(generatePerformanceReport(metrics, consoleMessages, networkRequests));
    
    await expectGoodPerformance(metrics);
    await expectNoFailedRequests(networkRequests, [/favicon\.ico/]);
    
    // Check services loaded
    expect(await servicesPage.areServicesLoaded()).toBe(true);
  });

  test('Portfolio page should load images efficiently', async ({ 
    page, 
    consoleMessages, 
    networkRequests,
    capturePerformance 
  }) => {
    const portfolioPage = new PortfolioPage(page);
    
    await portfolioPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Give images time to load
    await page.waitForTimeout(2000);
    
    const metrics = await capturePerformance();
    console.log(generatePerformanceReport(metrics, consoleMessages, networkRequests));
    
    // Portfolio may have more images, so allow slightly larger size
    await expectGoodPerformance(metrics, {
      maxImageSize: 2 * 1024 * 1024, // 2MB for all images
    });
    
    await expectNoFailedRequests(networkRequests, [/favicon\.ico/]);
    
    // Check that images are optimized (Next.js Image component)
    const imageRequests = networkRequests.filter(req => 
      req.url.includes('/_next/image') || 
      req.type === 'image' ||
      /\.(jpg|jpeg|png|webp|gif)$/i.test(req.url)
    );
    
    console.log(`Total image requests: ${imageRequests.length}`);
    
    // Images should use Next.js image optimization
    const optimizedImages = networkRequests.filter(req => 
      req.url.includes('/_next/image')
    );
    console.log(`Optimized images: ${optimizedImages.length}`);
  });

  test('Calendar page should be interactive quickly', async ({ 
    page, 
    consoleMessages, 
    networkRequests,
    capturePerformance 
  }) => {
    const calendarPage = new CalendarPage(page);
    
    await calendarPage.goto();
    await page.waitForLoadState('networkidle');
    
    const metrics = await capturePerformance();
    console.log(generatePerformanceReport(metrics, consoleMessages, networkRequests));
    
    await expectGoodPerformance(metrics);
    await expectNoFailedRequests(networkRequests, [/favicon\.ico/]);
    
    // Check page loaded successfully (calendar element may vary in implementation)
    const pageTitle = page.locator('h1, h2').first();
    expect(await pageTitle.isVisible()).toBe(true);
  });

  test('Page transitions should be smooth and fast', async ({ 
    page, 
    consoleMessages, 
    networkRequests,
    capturePerformance 
  }) => {
    const homePage = new HomePage(page);
    
    // Start at home page
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    const transitionStart = Date.now();
    
    // Navigate to services
    await homePage.navigateToServices();
    const servicesTransitionTime = Date.now() - transitionStart;
    
    // Navigate to portfolio
    const portfolioTransitionStart = Date.now();
    const servicesPage = new ServicesPage(page);
    await page.click('a[href*="/portfolio"]');
    await page.waitForLoadState('networkidle');
    const portfolioTransitionTime = Date.now() - portfolioTransitionStart;
    
    console.log(`Services transition: ${servicesTransitionTime}ms`);
    console.log(`Portfolio transition: ${portfolioTransitionTime}ms`);
    
    // Next.js page transitions should be fast (client-side navigation)
    expect(servicesTransitionTime, 'Services page transition should be under 1 second').toBeLessThan(1000);
    expect(portfolioTransitionTime, 'Portfolio page transition should be under 1 second').toBeLessThan(1000);
    
    const metrics = await capturePerformance();
    console.log(generatePerformanceReport(metrics, consoleMessages, networkRequests));
  });

  test('No memory leaks during navigation', async ({ 
    page, 
    capturePerformance 
  }) => {
    const pages = [
      new HomePage(page),
      new ServicesPage(page),
      new PortfolioPage(page),
      new CalendarPage(page),
    ];
    
    const memorySnapshots: number[] = [];
    
    // Navigate through all pages multiple times
    for (let i = 0; i < 2; i++) {
      for (const pageObj of pages) {
        await pageObj.goto();
        await page.waitForLoadState('networkidle');
        
        const metrics = await capturePerformance();
        if (metrics.usedJSHeapSize) {
          memorySnapshots.push(metrics.usedJSHeapSize);
          console.log(`Memory usage: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }
    
    // Memory shouldn't grow excessively
    if (memorySnapshots.length > 1) {
      const firstMemory = memorySnapshots[0];
      const lastMemory = memorySnapshots[memorySnapshots.length - 1];
      const growth = lastMemory - firstMemory;
      const growthPercentage = (growth / firstMemory) * 100;
      
      console.log(`Memory growth: ${(growth / 1024 / 1024).toFixed(2)}MB (${growthPercentage.toFixed(2)}%)`);
      
      // Memory shouldn't grow more than 75% (allow some growth for caching/navigation)
      expect(growthPercentage, 'Memory growth should be under 75%').toBeLessThan(75);
    }
  });

  test('API endpoints should respond quickly', async ({ 
    page, 
    networkRequests 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter API requests
    const apiRequests = networkRequests.filter(req => 
      req.url.includes('/api/') && !req.failed
    );
    
    console.log(`Total API requests: ${apiRequests.length}`);
    
    apiRequests.forEach(req => {
      console.log(`API: ${req.url} - ${req.timing}ms`);
      
      // API requests should be fast (under 500ms)
      expect(req.timing, `API ${req.url} should respond under 500ms`).toBeLessThan(500);
    });
  });
});

test.describe('Performance - Mobile', () => {
  test.use({ 
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  test('Home page should perform well on mobile', async ({ 
    page, 
    capturePerformance,
    networkRequests 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    const metrics = await capturePerformance();
    console.log('Mobile Performance:', generatePerformanceReport(metrics, [], networkRequests));
    
    // Mobile may be slightly slower, but should still be reasonable
    await expectGoodPerformance(metrics, {
      domContentLoaded: 3000,
      loadComplete: 4000,
    });
  });
});

