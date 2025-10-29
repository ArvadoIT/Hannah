# Testing Guide - Next.js App

This guide covers the comprehensive testing suite for the Lacque & Latte Nail Studio Next.js application, with a focus on performance monitoring, console log tracking, and ensuring smooth operation.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Performance Testing](#performance-testing)
- [Console Monitoring](#console-monitoring)
- [Writing New Tests](#writing-new-tests)
- [CI/CD Integration](#cicd-integration)

## Overview

Our testing suite focuses on three key areas:

1. **Performance Monitoring** - Ensures the app loads quickly and runs efficiently
2. **Console Log Tracking** - Catches errors, warnings, and unnecessary logs
3. **Smooth Operation** - Validates user experience is seamless and responsive

All tests are built using **Playwright** for reliable, cross-browser testing.

## Test Types

### Performance Tests (`tests/specs/performance/`)
- Page load times (DOM Content Loaded, Load Complete)
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Resource optimization (bundle sizes, request counts)
- Memory usage and leak detection
- API response times
- Page transition speeds

### Console Monitoring Tests (`tests/specs/console/`)
- Console errors detection
- Console warnings tracking
- React/Next.js specific errors (hydration, warnings)
- Error recovery and graceful handling
- Production-ready console cleanliness

### Smooth Operation Tests (`tests/specs/console/smooth-operation.spec.ts`)
- Layout shift prevention
- Smooth scrolling and animations
- Interactive responsiveness
- Loading states
- Hover and focus states
- Form interactions
- Mobile touch interactions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Next.js app dependencies installed
- Playwright installed

### Installation

```bash
cd /path/to/project

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium firefox webkit
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run only performance tests
npm run test:performance

# Run only console monitoring tests
npm run test:console

# View last test report
npm run test:report
```

### Advanced Options

```bash
# Run specific test file
npx playwright test tests/specs/performance/page-performance.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium-desktop

# Run tests on mobile
npx playwright test --project=chromium-mobile

# Run with verbose output
npx playwright test --reporter=line

# Run tests in parallel
npx playwright test --workers=4
```

## Test Structure

```

├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── fixtures/
│   │   └── performance-monitor.ts    # Performance & console capture fixtures
│   ├── utils/
│   │   └── performance-assertions.ts  # Custom assertion helpers
│   ├── pages/
│   │   ├── BasePage.ts              # Base page object
│   │   ├── HomePage.ts              # Home page object
│   │   ├── ServicesPage.ts          # Services page object
│   │   ├── PortfolioPage.ts         # Portfolio page object
│   │   ├── CalendarPage.ts          # Calendar page object
│   │   └── AdminPage.ts             # Admin page object
│   └── specs/
│       ├── performance/
│       │   └── page-performance.spec.ts
│       └── console/
│           ├── console-monitoring.spec.ts
│           └── smooth-operation.spec.ts
```

## Performance Testing

### What We Measure

#### Navigation Timing
- **DOM Content Loaded** - When HTML is parsed (threshold: < 2000ms)
- **Load Complete** - When all resources loaded (threshold: < 3000ms)
- **TTFB** - Time to First Byte (threshold: < 800ms)

#### Core Web Vitals
- **LCP** (Largest Contentful Paint) - Main content visible (Good: < 2.5s)
- **FID** (First Input Delay) - Time to interactive (Good: < 100ms)
- **CLS** (Cumulative Layout Shift) - Visual stability (Good: < 0.1)
- **FCP** (First Contentful Paint) - First paint (Good: < 1.8s)

#### Resource Metrics
- Total number of requests (threshold: < 50)
- Failed requests (threshold: 0)
- Total resource size (threshold: < 3MB)
- Image optimization
- Script and CSS bundle sizes

#### Memory
- JS Heap Size (threshold: < 50MB)
- Memory leak detection across navigations

### Example Performance Test

```typescript
test('Home page should load quickly', async ({ 
  page, 
  capturePerformance 
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const metrics = await capturePerformance();
  
  // Assert performance meets thresholds
  await expectGoodPerformance(metrics);
  
  console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
  console.log(`Load Complete: ${metrics.loadComplete}ms`);
});
```

### Performance Thresholds

You can customize thresholds in your tests:

```typescript
await expectGoodPerformance(metrics, {
  domContentLoaded: 3000,  // Custom threshold
  loadComplete: 5000,
  maxImageSize: 2 * 1024 * 1024, // 2MB
});
```

## Console Monitoring

### What We Track

1. **Console Errors** - Any `console.error()` or JavaScript errors
2. **Console Warnings** - Any `console.warn()` calls
3. **Page Errors** - Unhandled exceptions
4. **Network Errors** - Failed requests
5. **React Warnings** - Key props, hooks, hydration issues
6. **Next.js Errors** - Hydration mismatches, build warnings

### Console Tests

```typescript
test('Should have no console errors', async ({ 
  page, 
  consoleMessages 
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check for errors (with allowed patterns)
  await expectNoConsoleErrors(consoleMessages, [
    /favicon\.ico/,
    /GA_MEASUREMENT_ID/,
  ]);
});
```

### Allowed Patterns

Some console messages are benign and can be ignored:

```typescript
const allowedPatterns = [
  /favicon\.ico/,           // Favicon 404s are common
  /GA_MEASUREMENT_ID/,      // Google Analytics placeholder
  /google-analytics/,       // Analytics loading
  /Fast Refresh/,           // Next.js dev mode
  /Download the React DevTools/, // React dev suggestion
];
```

## Smooth Operation Testing

### Layout Stability

Tests ensure no unexpected layout shifts (CLS):

```typescript
test('Scrolling should be smooth without layout shifts', async ({ 
  page,
  capturePerformance 
}) => {
  await page.goto('/');
  
  // Scroll through page
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      window.scrollBy({ top: window.innerHeight / 2 });
    });
    await page.waitForTimeout(300);
  }
  
  const metrics = await capturePerformance();
  
  // CLS should be minimal
  expect(metrics.cls).toBeLessThan(0.25);
});
```

### Animation Performance

Tests verify smooth 60fps animations:

```typescript
test('Animations should be smooth (60fps)', async ({ page }) => {
  await page.goto('/');
  
  const frameRate = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0;
      const duration = 2000;
      const startTime = performance.now();
      
      function measureFrame(currentTime) {
        frames++;
        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          resolve((frames / duration) * 1000);
        }
      }
      
      requestAnimationFrame(measureFrame);
    });
  });
  
  expect(frameRate).toBeGreaterThan(50); // Close to 60fps
});
```

### Interaction Testing

Tests ensure UI remains responsive:

- Click responsiveness
- Hover states
- Focus visibility
- Form input smoothness
- Rapid interaction handling

## Writing New Tests

### Using Performance Fixtures

```typescript
import { test, expect } from '../../fixtures/performance-monitor';
import { expectGoodPerformance } from '../../utils/performance-assertions';

test('Your test name', async ({ 
  page,
  consoleMessages,      // Array of all console messages
  networkRequests,      // Array of all network requests
  capturePerformance,   // Function to capture metrics
  getWebVitals         // Function to get Core Web Vitals
}) => {
  // Your test code
});
```

### Creating Page Objects

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class YourPage extends BasePage {
  readonly yourElement: Locator;

  constructor(page: Page) {
    super(page);
    this.yourElement = page.locator('.your-selector');
  }

  async goto(): Promise<void> {
    await super.goto('/your-path');
  }
}
```

### Best Practices

1. **Use Page Objects** - Keep tests maintainable
2. **Wait for networkidle** - Ensure page is fully loaded
3. **Add meaningful assertions** - Test actual user impact
4. **Use custom thresholds** - Adjust for page complexity
5. **Log performance data** - Help debugging and monitoring
6. **Handle mobile** - Test responsive behavior
7. **Test error recovery** - Ensure graceful handling

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd /path/to/project
          npm ci
      
      - name: Install Playwright
        run: |
          cd /path/to/project
          npx playwright install --with-deps chromium
      
      - name: Run tests
        run: |
          cd /path/to/project
          npm run test:e2e
        env:
          CI: true
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment Variables

```bash
# Set base URL for tests
export E2E_BASE_URL=https://staging.yourdomain.com

# Run tests
npm run test:e2e
```

## Performance Metrics Reference

### Good Performance Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **TTFB** | < 800ms | 800ms - 1800ms | > 1800ms |
| **FCP** | < 1.8s | 1.8s - 3.0s | > 3.0s |

### Resource Budgets

- **Total Page Size**: < 3MB
- **Images**: < 1MB total
- **JavaScript**: < 1MB total
- **CSS**: < 200KB
- **Total Requests**: < 50
- **Failed Requests**: 0

## Troubleshooting

### Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000, // 60 seconds
```

### Browser Not Found

```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Performance Tests Failing

1. Check if dev server is running
2. Verify network connection
3. Check system resources
4. Adjust thresholds if needed for CI environment

### Console Errors in Dev Mode

Some errors are expected in development:
- Next.js Fast Refresh messages
- React DevTools suggestions
- Source map warnings

Use `allowedPatterns` to filter these out.

## Monitoring in Production

### Continuous Monitoring

Consider running these tests:
- After each deployment
- On a schedule (daily/weekly)
- Against production (read-only tests)

### Performance Budgets

Set up alerts when:
- Page load times exceed thresholds
- Bundle sizes increase significantly
- Console errors appear
- Core Web Vitals degrade

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

## Support

For questions or issues:
1. Check test output and reports
2. Review Playwright traces
3. Check console logs
4. Verify test assertions and thresholds

---

**Last Updated**: October 2025  
**Test Framework**: Playwright 1.40+  
**Next.js Version**: 14.2+

