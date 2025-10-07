const { test, expect } = require('@playwright/test');

test.describe('Navigation Diagnostic Tests', () => {
  test('Diagnose header visibility issues', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Take screenshot immediately
    await page.screenshot({ path: 'test-results/diagnostic-initial.png' });
    
    // Check DOM elements
    const header = page.locator('header');
    const navbar = page.locator('.navbar');
    const splashScreen = page.locator('#splash-screen');
    
    console.log('=== DIAGNOSTIC REPORT ===');
    
    // Check if elements exist in DOM
    const headerExists = await header.count() > 0;
    const navbarExists = await navbar.count() > 0;
    const splashExists = await splashScreen.count() > 0;
    
    console.log('Header exists in DOM:', headerExists);
    console.log('Navbar exists in DOM:', navbarExists);
    console.log('Splash screen exists in DOM:', splashExists);
    
    if (headerExists) {
      // Check header visibility
      const headerVisible = await header.isVisible();
      const headerDisplay = await header.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          top: styles.top
        };
      });
      
      console.log('Header visibility:', headerVisible);
      console.log('Header styles:', headerDisplay);
    }
    
    if (navbarExists) {
      // Check navbar visibility
      const navbarVisible = await navbar.isVisible();
      const navbarDisplay = await navbar.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          top: styles.top,
          pointerEvents: styles.pointerEvents
        };
      });
      
      console.log('Navbar visibility:', navbarVisible);
      console.log('Navbar styles:', navbarDisplay);
    }
    
    if (splashExists) {
      // Check splash screen
      const splashVisible = await splashScreen.isVisible();
      const splashDisplay = await splashScreen.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position
        };
      });
      
      console.log('Splash screen visibility:', splashVisible);
      console.log('Splash screen styles:', splashDisplay);
    }
    
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('JavaScript errors:', errors);
    }
    
    // Check if header is actually clickable
    if (headerExists) {
      try {
        await header.click();
        console.log('Header is clickable');
      } catch (error) {
        console.log('Header click failed:', error.message);
      }
    }
    
    // Take another screenshot after 3 seconds
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/diagnostic-after-3s.png' });
    
    // Check if header is visible after splash screen
    const headerVisibleAfter = await header.isVisible();
    console.log('Header visible after 3 seconds:', headerVisibleAfter);
    
    // Header should be visible by default - no need to force it
    if (!headerVisibleAfter) {
      console.log('Header not visible - this may indicate an issue');
      // Only force visibility if there's actually a problem
      await page.evaluate(() => {
        const header = document.querySelector('header');
        const navbar = document.querySelector('.navbar');
        
        if (header) {
          header.style.setProperty('z-index', '99999', 'important');
          header.style.setProperty('opacity', '1', 'important');
          header.style.setProperty('visibility', 'visible', 'important');
          header.style.setProperty('display', 'block', 'important');
          header.style.setProperty('position', 'fixed', 'important');
        }
        
        if (navbar) {
          navbar.style.setProperty('z-index', '99999', 'important');
          navbar.style.setProperty('opacity', '1', 'important');
          navbar.style.setProperty('visibility', 'visible', 'important');
          navbar.style.setProperty('display', 'block', 'important');
          navbar.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
      
      // Take final screenshot
      await page.screenshot({ path: 'test-results/diagnostic-after-fix.png' });
    }
    
    // Check final state
    const finalHeaderVisible = await header.isVisible();
    console.log('Header visible after check:', finalHeaderVisible);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      headerExists,
      navbarExists,
      splashExists,
      headerVisibleInitially: headerExists ? await header.isVisible() : false,
      headerVisibleAfter3s: headerExists ? await header.isVisible() : false,
      headerVisibleAfterFix: finalHeaderVisible,
      errors: errors.length,
      userAgent: await page.evaluate(() => navigator.userAgent)
    };
    
    console.log('=== FINAL REPORT ===');
    console.log(JSON.stringify(report, null, 2));
  });

  test('Test different loading scenarios', async ({ page }) => {
    // Test 1: Disable JavaScript
    await page.goto('/');
    await page.evaluate(() => {
      // Disable all JavaScript
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => script.remove());
    });
    
    await page.screenshot({ path: 'test-results/no-js.png' });
    
    const headerNoJS = page.locator('header');
    const headerVisibleNoJS = await headerNoJS.isVisible();
    console.log('Header visible without JavaScript:', headerVisibleNoJS);
    
    // Test 2: Slow network
    await page.goto('/');
    await page.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.screenshot({ path: 'test-results/slow-network.png' });
    
    // Test 3: Different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const header = page.locator('header');
      const visible = await header.isVisible();
      
      console.log(`Header visible on ${viewport.name}:`, visible);
      await page.screenshot({ path: `test-results/${viewport.name}.png` });
    }
  });
});
