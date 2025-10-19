import { Page, Locator } from '@playwright/test';

/**
 * Wait for an element to be visible and stable (no animations)
 */
export async function waitForElementStable(locator: Locator, timeout = 5000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  
  // Wait for animations to complete
  await locator.evaluate((el) => {
    return Promise.all(
      el.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Wait for a CSS class to be added to an element
 */
export async function waitForClass(
  locator: Locator, 
  className: string, 
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: 'attached', timeout });
  
  await locator.evaluate((el, { cls, timeoutMs }) => {
    return new Promise<void>((resolve) => {
      if (el.classList.contains(cls)) {
        resolve();
        return;
      }
      
      const observer = new MutationObserver(() => {
        if (el.classList.contains(cls)) {
          observer.disconnect();
          resolve();
        }
      });
      
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
      
      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, timeoutMs);
    });
  }, { cls: className, timeoutMs: timeout });
}

/**
 * Wait for a CSS class to be removed from an element
 */
export async function waitForClassRemoved(
  locator: Locator, 
  className: string, 
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: 'attached', timeout });
  
  await locator.evaluate((el, { cls, timeoutMs }) => {
    return new Promise<void>((resolve) => {
      if (!el.classList.contains(cls)) {
        resolve();
        return;
      }
      
      const observer = new MutationObserver(() => {
        if (!el.classList.contains(cls)) {
          observer.disconnect();
          resolve();
        }
      });
      
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
      
      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, timeoutMs);
    });
  }, { cls: className, timeoutMs: timeout });
}

/**
 * Wait for page to be interactive (no splash screen, body ready)
 */
export async function waitForPageInteractive(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for splash screen to complete (if present)
  const splashScreen = page.locator('#splash-screen');
  const hasSplash = await splashScreen.count() > 0;
  
  if (hasSplash) {
    await waitForClassRemoved(page.locator('body'), 'splash-active', timeout);
  }
  
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for element count to change (useful for filtered lists)
 */
export async function waitForCountChange(
  locator: Locator,
  initialCount: number,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const currentCount = await locator.count();
    if (currentCount !== initialCount) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Element count did not change from ${initialCount} within ${timeout}ms`);
}

/**
 * Wait for image to be fully loaded
 */
export async function waitForImageLoaded(locator: Locator, timeout = 5000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  
  const isLoaded = await locator.evaluate((img: HTMLImageElement, timeoutMs: number) => {
    return new Promise<boolean>((resolve) => {
      if (img.complete && img.naturalHeight > 0) {
        resolve(true);
        return;
      }
      
      img.addEventListener('load', () => resolve(true));
      img.addEventListener('error', () => resolve(false));
      
      setTimeout(() => resolve(false), timeoutMs);
    });
  }, timeout);
  
  if (!isLoaded) {
    throw new Error('Image failed to load');
  }
}

/**
 * Wait for background image to be loaded
 */
export async function waitForBackgroundImageLoaded(
  locator: Locator, 
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  
  const isLoaded = await locator.evaluate((el, timeoutMs: number) => {
    return new Promise<boolean>((resolve) => {
      const bgImage = window.getComputedStyle(el).backgroundImage;
      
      if (!bgImage || bgImage === 'none') {
        resolve(true);
        return;
      }
      
      const url = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
      if (!url) {
        resolve(true);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      setTimeout(() => resolve(false), timeoutMs);
    });
  }, timeout);
  
  if (!isLoaded) {
    throw new Error('Background image failed to load');
  }
}

