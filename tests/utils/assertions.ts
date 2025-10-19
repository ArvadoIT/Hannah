import { Page, expect } from '@playwright/test';

type ConsoleMessage = {
  type: string;
  text: string;
  location?: string;
};

/**
 * Assert that there are no console errors on the page
 * Filters out known benign warnings
 */
export async function expectNoConsoleErrors(
  consoleMessages: ConsoleMessage[],
  allowedPatterns: RegExp[] = []
): Promise<void> {
  const errors = consoleMessages.filter((msg) => {
    if (msg.type !== 'error') return false;
    
    // Filter out allowed patterns
    return !allowedPatterns.some((pattern) => pattern.test(msg.text));
  });

  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }

  expect(errors, 'Expected no console errors').toHaveLength(0);
}

/**
 * Assert that an image has loaded correctly
 */
export async function expectImageLoaded(
  page: Page,
  selector: string
): Promise<void> {
  const img = page.locator(selector);
  await img.waitFor({ state: 'visible' });
  
  const isLoaded = await img.evaluate((el: HTMLImageElement) => {
    return el.complete && el.naturalHeight > 0;
  });
  
  expect(isLoaded, `Image ${selector} should be loaded`).toBe(true);
}

/**
 * Assert that a background image is present and loaded
 */
export async function expectBackgroundImage(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  
  const bgImage = await element.evaluate((el) => {
    return window.getComputedStyle(el).backgroundImage;
  });
  
  expect(bgImage, `Element ${selector} should have a background image`).not.toBe('none');
  expect(bgImage, `Element ${selector} should have a background image`).toContain('url');
}

/**
 * Assert that the page background color matches the expected color
 */
export async function expectBackgroundColor(
  page: Page,
  selector: string,
  expectedColor: string
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  
  const bgColor = await element.evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });
  
  // Convert hex to rgb for comparison if needed
  const normalizedExpected = expectedColor.toLowerCase();
  const normalizedActual = bgColor.toLowerCase();
  
  expect(
    normalizedActual, 
    `Element ${selector} should have background color ${expectedColor}, got ${bgColor}`
  ).toContain(normalizedExpected.replace('#', ''));
}

/**
 * Assert element is clickable (visible and enabled)
 */
export async function expectClickable(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  
  const isEnabled = await element.isEnabled();
  expect(isEnabled, `Element ${selector} should be clickable`).toBe(true);
}

