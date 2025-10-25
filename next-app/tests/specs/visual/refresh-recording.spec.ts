import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Page Refresh Visual Recording Tests
 * 
 * These tests capture video and screenshots during page refresh
 * to visually document any FOUC (Flash of Unstyled Content) issues
 */

test.describe('Page Refresh - Visual Recording', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure we start from a clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Record full page refresh with video - Home page', async ({ page, browserName }) => {
    // Take screenshot before refresh
    const beforeRefresh = await page.screenshot({ 
      fullPage: true,
      path: `test-results/refresh-screenshots/${browserName}-home-before-refresh.png`
    });
    
    console.log('📸 Screenshot taken BEFORE refresh');
    
    // Get current background color before refresh
    const colorBefore = await page.evaluate(() => {
      return {
        body: window.getComputedStyle(document.body).backgroundColor,
        html: window.getComputedStyle(document.documentElement).backgroundColor,
        timestamp: Date.now(),
      };
    });
    console.log('🎨 Colors BEFORE refresh:', colorBefore);
    
    // Perform HARD refresh (this is key - simulates user pressing Ctrl+Shift+R)
    console.log('🔄 Starting HARD REFRESH...');
    await page.reload({ waitUntil: 'commit' }); // Don't wait for full load
    
    // Take rapid screenshots during reload
    const duringScreenshots = [];
    for (let i = 0; i < 10; i++) {
      try {
        const screenshot = await page.screenshot({
          path: `test-results/refresh-screenshots/${browserName}-home-during-${i}.png`
        });
        duringScreenshots.push(screenshot);
        
        // Check color during refresh
        const colorDuring = await page.evaluate(() => {
          return {
            body: window.getComputedStyle(document.body).backgroundColor,
            html: window.getComputedStyle(document.documentElement).backgroundColor,
            timestamp: Date.now(),
          };
        }).catch(() => null);
        
        if (colorDuring) {
          console.log(`🎨 Colors DURING refresh (${i}):`, colorDuring);
          
          // Check for white flash
          if (colorDuring.body === 'rgba(0, 0, 0, 0)' || 
              colorDuring.body === 'rgb(255, 255, 255)' ||
              colorDuring.html === 'rgb(255, 255, 255)') {
            console.error(`⚠️  WHITE FLASH DETECTED at screenshot ${i}!`);
          }
        }
      } catch (e) {
        // Page might be reloading
      }
      await page.waitForTimeout(20); // 20ms between screenshots
    }
    
    console.log(`📸 Captured ${duringScreenshots.length} screenshots during refresh`);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after refresh
    const afterRefresh = await page.screenshot({ 
      fullPage: true,
      path: `test-results/refresh-screenshots/${browserName}-home-after-refresh.png`
    });
    
    console.log('📸 Screenshot taken AFTER refresh');
    
    // Get final background color
    const colorAfter = await page.evaluate(() => {
      return {
        body: window.getComputedStyle(document.body).backgroundColor,
        html: window.getComputedStyle(document.documentElement).backgroundColor,
        hasInlineStyles: document.querySelectorAll('head style').length > 0,
        timestamp: Date.now(),
      };
    });
    console.log('🎨 Colors AFTER refresh:', colorAfter);
    
    // Analyze for FOUC
    const analysis = {
      beforeRefresh: colorBefore,
      afterRefresh: colorAfter,
      screenshotsCaptured: duringScreenshots.length,
    };
    
    console.log('📊 FOUC Analysis:', JSON.stringify(analysis, null, 2));
    
    // The color should be consistent throughout
    expect(colorAfter.body, 'Final body background should be styled').not.toBe('rgba(0, 0, 0, 0)');
    expect(colorAfter.body, 'Final body background should not be white').not.toBe('rgb(255, 255, 255)');
    expect(colorAfter.hasInlineStyles, 'Should have inline styles in head').toBe(true);
  });

  test('Record refresh with timeline markers', async ({ page, browserName }) => {
    const timeline: Array<{ time: number; event: string; colors: any }> = [];
    
    // Mark initial state
    const initialColors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor,
    }));
    timeline.push({ time: Date.now(), event: 'initial-state', colors: initialColors });
    console.log('⏱️  Timeline: initial-state', initialColors);
    
    // Start refresh
    timeline.push({ time: Date.now(), event: 'refresh-started', colors: null });
    console.log('⏱️  Timeline: refresh-started');
    
    const refreshPromise = page.reload({ waitUntil: 'commit' });
    
    // Monitor colors during refresh
    const monitoringInterval = setInterval(async () => {
      try {
        const colors = await page.evaluate(() => ({
          body: window.getComputedStyle(document.body).backgroundColor,
          html: window.getComputedStyle(document.documentElement).backgroundColor,
          documentReady: document.readyState,
        }));
        timeline.push({ time: Date.now(), event: 'color-check', colors });
        
        // Check for problematic colors
        if (colors.body === 'rgb(255, 255, 255)' || colors.body === 'rgba(0, 0, 0, 0)') {
          console.error('🚨 FOUC DETECTED:', colors);
        }
      } catch (e) {
        // Page reloading
      }
    }, 10); // Check every 10ms
    
    await refreshPromise;
    clearInterval(monitoringInterval);
    
    // Wait for full load
    await page.waitForLoadState('networkidle');
    
    // Final state
    const finalColors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor,
      hasInlineCSS: document.querySelector('head style') !== null,
      stylesheetCount: document.styleSheets.length,
    }));
    timeline.push({ time: Date.now(), event: 'refresh-complete', colors: finalColors });
    console.log('⏱️  Timeline: refresh-complete', finalColors);
    
    // Print full timeline
    console.log('\n📊 COMPLETE TIMELINE:');
    const startTime = timeline[0].time;
    timeline.forEach(entry => {
      const elapsed = entry.time - startTime;
      console.log(`  [+${elapsed}ms] ${entry.event}`, entry.colors);
    });
    
    // Save timeline to file
    const timelineFile = `test-results/refresh-timeline-${browserName}.json`;
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(timelineFile, JSON.stringify(timeline, null, 2));
    console.log(`\n💾 Timeline saved to: ${timelineFile}`);
  });

  test('Record multiple rapid refreshes', async ({ page, browserName }) => {
    const refreshResults = [];
    
    for (let i = 0; i < 5; i++) {
      console.log(`\n🔄 Refresh ${i + 1}/5`);
      
      // Capture state before
      const before = await page.evaluate(() => ({
        body: window.getComputedStyle(document.body).backgroundColor,
        time: Date.now(),
      }));
      
      // Perform refresh
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // Capture state immediately after DOM loads
      const afterDOM = await page.evaluate(() => ({
        body: window.getComputedStyle(document.body).backgroundColor,
        hasInlineStyles: document.querySelector('head style') !== null,
        readyState: document.readyState,
        time: Date.now(),
      }));
      
      // Wait for network idle
      await page.waitForLoadState('networkidle');
      
      // Capture final state
      const afterComplete = await page.evaluate(() => ({
        body: window.getComputedStyle(document.body).backgroundColor,
        time: Date.now(),
      }));
      
      const result = {
        refresh: i + 1,
        before,
        afterDOM,
        afterComplete,
        domLoadTime: afterDOM.time - before.time,
        totalTime: afterComplete.time - before.time,
      };
      
      refreshResults.push(result);
      console.log(`  Before: ${before.body}`);
      console.log(`  After DOM: ${afterDOM.body} (hasInlineStyles: ${afterDOM.hasInlineStyles})`);
      console.log(`  After Complete: ${afterComplete.body}`);
      console.log(`  DOM Load Time: ${result.domLoadTime}ms`);
      
      // Check for FOUC
      if (afterDOM.body === 'rgba(0, 0, 0, 0)' || afterDOM.body === 'rgb(255, 255, 255)') {
        console.error(`  ⚠️  FOUC DETECTED on refresh ${i + 1}!`);
      }
      
      await page.waitForTimeout(500); // Brief pause between refreshes
    }
    
    // Summary
    console.log('\n📊 REFRESH SUMMARY:');
    refreshResults.forEach(r => {
      console.log(`  Refresh ${r.refresh}: DOM=${r.domLoadTime}ms, Total=${r.totalTime}ms, Color=${r.afterDOM.body}`);
    });
    
    // Save results
    const resultsFile = `test-results/refresh-results-${browserName}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(refreshResults, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
  });

  test('Capture CSS loading order during refresh', async ({ page, browserName }) => {
    const cssLoadEvents: Array<{ time: number; event: string; details: any }> = [];
    const startTime = Date.now();
    
    // Listen for all requests
    page.on('request', request => {
      if (request.url().includes('.css')) {
        cssLoadEvents.push({
          time: Date.now() - startTime,
          event: 'css-requested',
          details: { url: request.url() },
        });
        console.log(`📥 CSS Requested: ${request.url()}`);
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('.css')) {
        cssLoadEvents.push({
          time: Date.now() - startTime,
          event: 'css-loaded',
          details: { url: response.url(), status: response.status() },
        });
        console.log(`✅ CSS Loaded: ${response.url()} (${response.status()})`);
      }
    });
    
    // Monitor when styles are actually applied
    await page.exposeFunction('logStyleApplied', (details: any) => {
      cssLoadEvents.push({
        time: Date.now() - startTime,
        event: 'style-applied',
        details,
      });
      console.log(`🎨 Style Applied:`, details);
    });
    
    await page.addInitScript(() => {
      // Watch for style changes
      const observer = new MutationObserver(() => {
        const computed = window.getComputedStyle(document.body);
        (window as any).logStyleApplied?.({
          backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily,
          stylesheetCount: document.styleSheets.length,
        });
      });
      
      if (document.body) {
        observer.observe(document.head, { childList: true, subtree: true });
        observer.observe(document.body, { attributes: true });
      }
    });
    
    console.log('\n🔄 Starting refresh with CSS monitoring...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait a bit for all events to be logged
    await page.waitForTimeout(1000);
    
    // Print CSS loading timeline
    console.log('\n📊 CSS LOADING TIMELINE:');
    cssLoadEvents.forEach(event => {
      console.log(`  [+${event.time}ms] ${event.event}:`, event.details);
    });
    
    // Check if inline CSS was present
    const hasInlineCSS = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('head style'));
      return {
        hasInlineStyles: styles.length > 0,
        inlineStylesContent: styles.map(s => s.textContent?.substring(0, 100)).join('\n'),
      };
    });
    
    console.log('\n💡 Inline CSS Check:', hasInlineCSS);
    
    // Save events
    const eventsFile = `test-results/css-load-events-${browserName}.json`;
    fs.writeFileSync(eventsFile, JSON.stringify({ cssLoadEvents, hasInlineCSS }, null, 2));
    console.log(`\n💾 Events saved to: ${eventsFile}`);
    
    // The inline CSS should be present
    expect(hasInlineCSS.hasInlineStyles, 'Should have inline CSS in head').toBe(true);
  });

  test('Screenshot comparison - detect visual changes', async ({ page, browserName }) => {
    console.log('\n📸 Taking initial screenshot...');
    const screenshot1 = await page.screenshot({ fullPage: true });
    
    await page.waitForTimeout(1000);
    
    console.log('🔄 Refreshing page...');
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log('📸 Taking post-refresh screenshot...');
    const screenshot2 = await page.screenshot({ fullPage: true });
    
    // Save both screenshots
    fs.mkdirSync('test-results/comparison', { recursive: true });
    fs.writeFileSync(`test-results/comparison/${browserName}-before.png`, screenshot1);
    fs.writeFileSync(`test-results/comparison/${browserName}-after.png`, screenshot2);
    
    console.log(`\n💾 Screenshots saved to test-results/comparison/`);
    console.log(`   - ${browserName}-before.png`);
    console.log(`   - ${browserName}-after.png`);
    console.log(`\n💡 Compare these images to see if there are visual differences`);
    
    // Get detailed style info for comparison
    const stylesBefore = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
      };
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    
    const stylesAfter = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
      };
    });
    
    console.log('\n🎨 Style Comparison:');
    console.log('  Before:', stylesBefore);
    console.log('  After:', stylesAfter);
    
    // Styles should be identical
    expect(stylesAfter.backgroundColor).toBe(stylesBefore.backgroundColor);
    expect(stylesAfter.fontFamily).toBe(stylesBefore.fontFamily);
  });
});

test.describe('Refresh - Throttled Network', () => {
  
  test('Record refresh with slow 3G - most likely to show FOUC', async ({ page, browserName, context }) => {
    // Emulate slow 3G
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    console.log('\n🐌 Testing with simulated slow network...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking before screenshot...');
    await page.screenshot({ 
      path: `test-results/slow-network/${browserName}-slow-before.png`,
      fullPage: true 
    });
    
    console.log('🔄 Refreshing with slow network...');
    const colorChecks: any[] = [];
    
    // Start refresh
    const refreshPromise = page.reload({ waitUntil: 'commit' });
    
    // Check colors every 50ms during slow load
    for (let i = 0; i < 20; i++) {
      try {
        const colors = await page.evaluate(() => ({
          body: window.getComputedStyle(document.body).backgroundColor,
          html: window.getComputedStyle(document.documentElement).backgroundColor,
          time: Date.now(),
        }));
        colorChecks.push({ check: i, colors });
        console.log(`  Check ${i}: body=${colors.body}`);
        
        if (colors.body === 'rgb(255, 255, 255)' || colors.body === 'rgba(0, 0, 0, 0)') {
          console.error(`  🚨 FOUC DETECTED at check ${i}!`);
        }
      } catch (e) {
        // Page reloading
      }
      await page.waitForTimeout(50);
    }
    
    await refreshPromise;
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking after screenshot...');
    await page.screenshot({ 
      path: `test-results/slow-network/${browserName}-slow-after.png`,
      fullPage: true 
    });
    
    // Save color checks
    fs.mkdirSync('test-results/slow-network', { recursive: true });
    fs.writeFileSync(
      `test-results/slow-network/${browserName}-color-checks.json`,
      JSON.stringify(colorChecks, null, 2)
    );
    
    console.log(`\n💾 Slow network results saved to test-results/slow-network/`);
  });
});

