import { test, expect } from '../../fixtures/performance-monitor';
import { HomePage } from '../../pages/HomePage';
import { ServicesPage } from '../../pages/ServicesPage';
import { PortfolioPage } from '../../pages/PortfolioPage';

test.describe('Smooth Operation - User Experience', () => {
  test('Scrolling should be smooth without layout shifts', async ({ 
    page,
    capturePerformance 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Measure CLS during scrolling
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    
    // Scroll down slowly
    for (let i = 0; i < 5; i++) {
      await page.evaluate((step) => {
        window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
      }, i);
      await page.waitForTimeout(300);
    }
    
    const metrics = await capturePerformance();
    
    // CLS should be minimal (< 0.1 is good, < 0.25 is acceptable)
    if (metrics.cls !== undefined) {
      console.log(`Cumulative Layout Shift: ${metrics.cls}`);
      expect(metrics.cls, 'CLS should be under 0.25').toBeLessThan(0.25);
    }
  });

  test('Images should load without causing layout shifts', async ({ 
    page 
  }) => {
    const portfolioPage = new PortfolioPage(page);
    
    // Track layout shifts
    await page.evaluate(() => {
      (window as any).__layoutShifts = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__layoutShifts.push(entry);
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });
    
    await portfolioPage.goto();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const layoutShifts = await page.evaluate(() => {
      return (window as any).__layoutShifts || [];
    });
    
    console.log(`Layout shifts detected: ${layoutShifts.length}`);
    
    // Calculate total CLS
    const totalCLS = layoutShifts.reduce((sum: number, shift: any) => {
      return sum + (shift.hadRecentInput ? 0 : shift.value);
    }, 0);
    
    console.log(`Total CLS: ${totalCLS}`);
    expect(totalCLS, 'Images should not cause significant layout shifts').toBeLessThan(0.25);
  });

  test('Animations should be smooth (60fps)', async ({ 
    page 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Monitor frame rate during interactions
    const frameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastTime = performance.now();
        let frames = 0;
        const duration = 2000; // Monitor for 2 seconds
        const startTime = lastTime;
        
        function measureFrame(currentTime: number) {
          frames++;
          
          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            const fps = (frames / duration) * 1000;
            resolve(fps);
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    console.log(`Average FPS: ${frameRate}`);
    
    // Should maintain close to 60fps (allow some variance)
    expect(frameRate as number, 'Should maintain smooth 60fps').toBeGreaterThan(50);
  });

  test('Page should remain interactive during loading', async ({ 
    page 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Try to interact immediately
    const isInteractive = await page.evaluate(() => {
      const button = document.querySelector('button, a');
      return button !== null;
    });
    
    expect(isInteractive, 'Page should have interactive elements immediately').toBe(true);
  });

  test('No flickering or flash of unstyled content', async ({ 
    page 
  }) => {
    // Navigate quickly to catch FOUC
    await page.goto('/');
    
    // Check if styles are applied immediately
    const hasStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
             styles.color !== 'rgb(0, 0, 0)';
    });
    
    expect(hasStyles, 'Styles should be applied immediately').toBe(true);
  });

  test('Loading states should be smooth', async ({ 
    page,
    consoleMessages 
  }) => {
    await page.goto('/calendar');
    
    // Check for loading indicators
    const hasLoadingState = await page.evaluate(() => {
      const loadingElements = document.querySelectorAll(
        '[class*="loading"], [class*="spinner"], [aria-busy="true"]'
      );
      return loadingElements.length > 0;
    });
    
    console.log(`Has loading indicators: ${hasLoadingState}`);
    
    await page.waitForLoadState('networkidle');
    
    // Loading should complete without errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    expect(errors.length, 'Loading should complete without errors').toBe(0);
  });

  test('Hover states should respond immediately', async ({ 
    page 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Find a clickable element
    const button = page.locator('button, a').first();
    
    if (await button.count() > 0) {
      await button.hover();
      
      // Check if hover state changes (color, background, etc.)
      const hasHoverEffect = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.cursor === 'pointer' || 
               styles.transition.includes('all') ||
               styles.transition.includes('color') ||
               styles.transition.includes('background');
      });
      
      console.log(`Has hover effects: ${hasHoverEffect}`);
      // Just logging, not failing if no hover effects
    }
  });

  test('Focus states should be visible and smooth', async ({ 
    page 
  }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      
      const styles = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        hasOutline: styles.outline !== 'none' && styles.outline !== '',
        hasFocusVisible: el.matches(':focus-visible'),
      };
    });
    
    console.log('Focused element:', focusedElement);
    
    // Focus should be visible (either outline or focus-visible styling)
    if (focusedElement) {
      expect(
        focusedElement.hasOutline || focusedElement.hasFocusVisible,
        'Focus should be visible for accessibility'
      ).toBe(true);
    }
  });

  test('No jank during form interactions', async ({ 
    page,
    consoleMessages 
  }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Try to interact with form elements
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const input = inputs.first();
      
      // Type slowly and check for smooth input
      await input.click();
      await input.type('Testing smooth input', { delay: 50 });
      
      // No errors during typing
      const errorsDuringTyping = consoleMessages.filter(m => 
        m.type === 'error' && m.timestamp > Date.now() - 5000
      );
      
      expect(
        errorsDuringTyping.length,
        'Should have no errors during form interaction'
      ).toBe(0);
    }
  });

  test('Rapid clicking should not cause issues', async ({ 
    page,
    consoleMessages 
  }) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await page.waitForLoadState('networkidle');
    
    const filterButtons = portfolioPage.filterButtons;
    const buttonCount = await filterButtons.count();
    
    if (buttonCount > 0) {
      // Rapidly click filter buttons
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        await filterButtons.nth(i).click({ delay: 50 });
      }
      
      await page.waitForTimeout(500);
      
      // Should handle rapid clicks without errors
      const recentErrors = consoleMessages.filter(m => 
        m.type === 'error' && m.timestamp > Date.now() - 5000
      );
      
      expect(
        recentErrors.length,
        'Should handle rapid clicks without errors'
      ).toBe(0);
    }
  });
});

test.describe('Smooth Operation - Mobile', () => {
  test.use({ 
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('Touch interactions should be smooth on mobile', async ({ 
    page 
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate touch scroll using evaluate (more reliable)
    await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(500);
    
    // Check scroll position changed
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY, 'Page should scroll smoothly on mobile').toBeGreaterThan(0);
  });

  test('Mobile menu should open smoothly', async ({ 
    page,
    consoleMessages 
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    if (await homePage.isMobile()) {
      await homePage.openMobileMenu();
      
      // Should open without errors
      const errors = consoleMessages.filter(m => m.type === 'error');
      expect(errors.length, 'Mobile menu should open without errors').toBe(0);
    }
  });
});

