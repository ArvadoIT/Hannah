import { test as base } from '@playwright/test';

/**
 * Performance metrics captured during testing
 */
export type PerformanceMetrics = {
  // Navigation timing
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Resource metrics
  totalRequests: number;
  failedRequests: number;
  resourceSizes: {
    total: number;
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    other: number;
  };
  
  // Memory (if available)
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
};

export type ConsoleMessage = {
  type: 'log' | 'debug' | 'info' | 'error' | 'warning';
  text: string;
  location?: string;
  timestamp: number;
  args?: string[];
};

export type NetworkRequest = {
  url: string;
  method: string;
  status: number;
  timing: number;
  size: number;
  type: string;
  failed: boolean;
};

/**
 * Enhanced fixtures for performance and console monitoring
 */
type PerformanceFixtures = {
  consoleMessages: ConsoleMessage[];
  networkRequests: NetworkRequest[];
  capturePerformance: () => Promise<PerformanceMetrics>;
  getWebVitals: () => Promise<{ lcp: number; fid: number; cls: number }>;
};

export const test = base.extend<PerformanceFixtures>({
  /**
   * Capture all console messages during the test
   */
  consoleMessages: async ({ page }, use) => {
    const messages: ConsoleMessage[] = [];
    
    page.on('console', async (msg) => {
      try {
        const args = await Promise.all(
          msg.args().map(arg => arg.jsonValue().catch(() => 'Unable to serialize'))
        );
        
        messages.push({
          type: msg.type() as ConsoleMessage['type'],
          text: msg.text(),
          location: msg.location()?.url,
          timestamp: Date.now(),
          args: args.map(String),
        });
      } catch (error) {
        // Fallback if we can't get args
        messages.push({
          type: msg.type() as ConsoleMessage['type'],
          text: msg.text(),
          location: msg.location()?.url,
          timestamp: Date.now(),
        });
      }
    });

    page.on('pageerror', (error) => {
      messages.push({
        type: 'error',
        text: error.message,
        timestamp: Date.now(),
      });
    });

    await use(messages);
  },

  /**
   * Capture all network requests during the test
   */
  networkRequests: async ({ page }, use) => {
    const requests: NetworkRequest[] = [];
    
    page.on('requestfinished', async (request) => {
      try {
        const response = await request.response();
        const timing = await request.timing();
        
        requests.push({
          url: request.url(),
          method: request.method(),
          status: response?.status() || 0,
          timing: timing.responseEnd,
          size: (await response?.body())?.length || 0,
          type: request.resourceType(),
          failed: false,
        });
      } catch (error) {
        // Request failed or we couldn't get details
        requests.push({
          url: request.url(),
          method: request.method(),
          status: 0,
          timing: 0,
          size: 0,
          type: request.resourceType(),
          failed: true,
        });
      }
    });

    page.on('requestfailed', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        status: 0,
        timing: 0,
        size: 0,
        type: request.resourceType(),
        failed: true,
      });
    });

    await use(requests);
  },

  /**
   * Capture comprehensive performance metrics
   */
  capturePerformance: async ({ page }, use) => {
    await use(async (): Promise<PerformanceMetrics> => {
      // Get Navigation Timing API data
      const performanceData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        // Calculate resource sizes by type
        const resourceSizes = {
          total: 0,
          images: 0,
          scripts: 0,
          stylesheets: 0,
          fonts: 0,
          other: 0,
        };

        resources.forEach((resource) => {
          const size = resource.transferSize || resource.encodedBodySize || 0;
          resourceSizes.total += size;
          
          if (resource.initiatorType === 'img' || resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            resourceSizes.images += size;
          } else if (resource.initiatorType === 'script' || resource.name.match(/\.js$/i)) {
            resourceSizes.scripts += size;
          } else if (resource.initiatorType === 'css' || resource.name.match(/\.css$/i)) {
            resourceSizes.stylesheets += size;
          } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/i)) {
            resourceSizes.fonts += size;
          } else {
            resourceSizes.other += size;
          }
        });

        // Get memory info if available (Chromium only)
        const memory = (performance as any).memory;
        
        return {
          navigationStart: navigation.startTime,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          loadComplete: navigation.loadEventEnd - navigation.startTime,
          ttfb: navigation.responseStart - navigation.requestStart,
          totalRequests: resources.length,
          failedRequests: 0, // Will be calculated from network requests
          resourceSizes,
          usedJSHeapSize: memory?.usedJSHeapSize,
          totalJSHeapSize: memory?.totalJSHeapSize,
          jsHeapSizeLimit: memory?.jsHeapSizeLimit,
        };
      });

      return performanceData;
    });
  },

  /**
   * Get Core Web Vitals (LCP, FID, CLS)
   */
  getWebVitals: async ({ page }, use) => {
    await use(async () => {
      // Inject web-vitals tracking script
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = { lcp: 0, fid: 0, cls: 0 };
          
          // LCP - Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // FID - First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as any[];
            entries.forEach((entry) => {
              vitals.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

          // CLS - Cumulative Layout Shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as any[];
            entries.forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                vitals.cls = clsValue;
              }
            });
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // Wait a bit to collect metrics, then resolve
          setTimeout(() => {
            resolve(vitals);
          }, 2000);
        });
      });

      return page.evaluate(() => {
        const vitals = (window as any).__webVitals || { lcp: 0, fid: 0, cls: 0 };
        return vitals;
      });
    });
  },
});

export { expect } from '@playwright/test';

