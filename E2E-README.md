# E2E Test Suite - Lacque & Latte

Comprehensive end-to-end test suite for the Lacque & Latte website, built with Playwright and TypeScript.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Environment Variables](#environment-variables)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Debugging](#debugging)
- [Reports and Artifacts](#reports-and-artifacts)

## Overview

This test suite provides baseline E2E coverage for the Lacque & Latte website to ensure refactors and changes don't break existing functionality or visuals.

### Key Features

- **Modular Page Objects**: Reusable page object models for all major pages
- **Stable Tests**: No arbitrary timeouts; uses proper waits for element state and visibility
- **Cross-Browser**: Configured for Chromium desktop and mobile (with optional Firefox/WebKit)
- **Console Error Detection**: Asserts zero console errors on key pages
- **Comprehensive Coverage**: Tests for navigation, forms, images, responsive design, and more

### Test Coverage

- **Global**: Navigation, footer, console errors
- **Home**: Splash screen, images, background colors, no white flash
- **Booking**: Happy path, form validation, mobile support
- **Portfolio**: Filters, transitions, image loading
- **Admin**: Authentication, hamburger menu, accessibility
- **Calendar**: Month navigation, date selection
- **Responsive**: Mobile and desktop smoke tests

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Python 3**: For running the local dev server

## Installation

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

3. Install Chromium only (for faster CI):

```bash
npx playwright install chromium
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode (see browser)

```bash
npm run test:headed
```

### Run Tests in UI Mode (interactive)

```bash
npm run test:ui
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Specific Test File

```bash
npx playwright test tests/specs/home/splash-screen.spec.ts
```

### Run Specific Test Suite

```bash
npx playwright test tests/specs/home/
```

### Run Tests for Specific Browser

```bash
npx playwright test --project=chromium-desktop
npx playwright test --project=chromium-mobile
```

### Run Tests in Parallel

```bash
npx playwright test --workers=4
```

### Run Tests with Specific Tag

```bash
npx playwright test --grep @smoke
```

## Test Structure

```
tests/
├── fixtures/
│   └── console-capture.ts      # Fixture for capturing console messages
├── pages/
│   ├── BasePage.ts             # Base page object with common elements
│   ├── HomePage.ts             # Home page object
│   ├── ServicesPage.ts         # Services/booking page object
│   ├── PortfolioPage.ts        # Portfolio page object
│   ├── AdminPage.ts            # Admin page object
│   └── CalendarPage.ts         # Calendar page object
├── specs/
│   ├── global/
│   │   ├── navigation.spec.ts  # Global navigation tests
│   │   └── console-errors.spec.ts  # Console error tests
│   ├── home/
│   │   ├── splash-screen.spec.ts   # Splash screen tests
│   │   └── images-and-content.spec.ts  # Home page content tests
│   ├── booking/
│   │   ├── booking-happy-path.spec.ts  # Booking flow tests
│   │   └── form-validation.spec.ts     # Form validation tests
│   ├── portfolio/
│   │   └── filters.spec.ts     # Portfolio filter tests
│   ├── admin/
│   │   ├── admin-auth.spec.ts  # Admin authentication tests
│   │   └── admin-menu.spec.ts  # Admin menu tests
│   ├── calendar/
│   │   └── calendar-navigation.spec.ts  # Calendar tests
│   └── responsive/
│       └── mobile-smoke.spec.ts  # Responsive smoke tests
└── utils/
    ├── assertions.ts           # Custom assertion helpers
    ├── test-data.ts            # Test data and fixtures
    └── wait-helpers.ts         # Wait utility functions
```

## Environment Variables

### `E2E_BASE_URL`

Base URL for the application under test.

**Default**: `http://localhost:8000`

**Usage**:

```bash
E2E_BASE_URL=https://staging.example.com npm test
```

### `CI`

Set to `true` when running in CI environment.

**Effects**:
- Enables retries (2 retries in CI, 0 locally)
- Disables parallel execution in CI
- Prevents `test.only` from being accidentally committed

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
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run E2E tests
        run: npm test
        env:
          CI: true
          E2E_BASE_URL: http://localhost:8000
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          
      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
```

## Writing New Tests

### 1. Create Page Object (if needed)

```typescript
// tests/pages/NewPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
  readonly someElement: Locator;

  constructor(page: Page) {
    super(page);
    this.someElement = page.locator('.some-class');
  }

  async goto(): Promise<void> {
    await super.goto('/new-page.html');
  }

  async doSomething(): Promise<void> {
    await this.someElement.click();
  }
}
```

### 2. Create Test Spec

```typescript
// tests/specs/feature/new-feature.spec.ts
import { test, expect } from '../../fixtures/console-capture';
import { NewPage } from '../../pages/NewPage';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    const newPage = new NewPage(page);
    await newPage.goto();

    await newPage.doSomething();
    await expect(newPage.someElement).toBeVisible();
  });
});
```

### Best Practices

1. **Use Page Objects**: Encapsulate page-specific logic in page objects
2. **Avoid Arbitrary Timeouts**: Use `waitFor` with state/visibility checks
3. **Use Semantic Locators**: Prefer `getByRole`, `getByText`, `getByLabel` over CSS selectors
4. **Check Console Errors**: Use the `consoleMessages` fixture to detect errors
5. **Test User Flows**: Test complete user journeys, not just individual actions
6. **Mobile First**: Test on both desktop and mobile viewports

## Debugging

### Run Tests in Debug Mode

```bash
npm run test:debug
```

This will:
- Open Playwright Inspector
- Pause execution at each action
- Allow you to step through tests

### Run Specific Test in Debug Mode

```bash
npx playwright test tests/specs/home/splash-screen.spec.ts --debug
```

### Use `page.pause()`

Add `await page.pause()` in your test to pause execution:

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Execution pauses here
  await page.click('button');
});
```

### View Trace

When a test fails in CI, download the trace and view it:

```bash
npx playwright show-trace trace.zip
```

## Reports and Artifacts

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:
- Test results with pass/fail status
- Screenshots on failure
- Videos on failure
- Execution times

### JUnit Report

JUnit XML report is generated at `test-results/junit.xml` for CI integration.

### Artifacts

- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Captured on first retry
- **Console Logs**: Available in HTML report

### Viewing Artifacts

```
test-results/
├── [test-name]/
│   ├── test-failed-1.png
│   ├── video.webm
│   └── trace.zip
playwright-report/
└── index.html
```

## Troubleshooting

### Tests are flaky

- Check for race conditions
- Add proper waits for element state
- Avoid using `waitForTimeout`
- Use `waitForLoadState` appropriately

### Tests fail in CI but pass locally

- Check environment differences
- Verify base URL is correct
- Ensure CI has proper dependencies installed
- Check for timing issues (use retries)

### Elements not found

- Check if element is in viewport
- Verify selector is correct
- Wait for element to be attached/visible
- Check if element is in shadow DOM or iframe

### Slow tests

- Run tests in parallel
- Reduce unnecessary waits
- Use `page.goto` with `waitUntil: 'domcontentloaded'` when appropriate
- Skip heavy animations in tests

## Maintenance

### Updating Playwright

```bash
npm install @playwright/test@latest
npx playwright install
```

### Updating Test Data

Edit `tests/utils/test-data.ts` to update test fixtures.

### Adding New Page Objects

1. Create new file in `tests/pages/`
2. Extend `BasePage` if it's a main page
3. Export the class
4. Use in test specs

## License

This test suite is part of the Lacque & Latte project. All rights reserved.

---

**Questions or Issues?**

If you encounter issues or have questions, please contact the development team or create an issue in the repository.

