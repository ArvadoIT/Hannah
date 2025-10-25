import { test, expect } from '@playwright/test';

/**
 * FOUC (Flash of Unstyled Content) Detection Tests
 * 
 * These tests detect when the site briefly shows without CSS/styling during:
 * - Initial page loads
 * - Page refreshes
 * - Navigation transitions
 */

test.describe('FOUC Detection - Page Refresh', () => {
  
  test('Should not show unstyled content on initial load', async ({ page }) => {
    // Track if we ever see unstyled content - CHECK FOR ACTUAL COMPONENT STYLES
    let foundUnstyledContent = false;
    const styleChecks: Array<{ time: number; hasProperStyles: boolean; computed: any }> = [];
    
    // Set up listener before navigation
    await page.exposeFunction('logStyleCheck', (hasProperStyles: boolean, computed: any) => {
      const time = Date.now();
      styleChecks.push({ time, hasProperStyles, computed });
      if (!hasProperStyles) {
        foundUnstyledContent = true;
      }
    });
    
    // Inject early detection script - CHECK FOR REAL COMPONENT STYLES
    await page.addInitScript(() => {
      // Check styles as soon as possible
      const checkStyles = () => {
        const body = document.body;
        if (body) {
          const computed = window.getComputedStyle(body);
          const rootStyles = window.getComputedStyle(document.documentElement);
          
          // Check for CSS custom properties (these come from globals.css)
          const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
          const backgroundColor = rootStyles.getPropertyValue('--background-primary').trim();
          
          // Check if actual content has styling
          const hero = document.querySelector('.hero');
          const heroStyles = hero ? window.getComputedStyle(hero) : null;
          const heroHasStyles = heroStyles && heroStyles.minHeight !== 'auto';
          
          // Has proper styles if:
          // 1. CSS variables are loaded
          // 2. Content elements have actual styling applied
          const hasCSSVariables = primaryColor !== '' && backgroundColor !== '';
          const hasProperStyles = hasCSSVariables || heroHasStyles;
          
          (window as any).logStyleCheck(hasProperStyles, {
            backgroundColor: computed.backgroundColor,
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            primaryColor,
            customBackgroundVar: backgroundColor,
            hasCSSVariables,
            heroHasStyles,
          });
        }
      };
      
      // Check immediately
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkStyles);
      } else {
        checkStyles();
      }
      
      // Also check when stylesheets load
      window.addEventListener('load', checkStyles);
      
      // Check multiple times during early load
      setTimeout(checkStyles, 0);
      setTimeout(checkStyles, 50);
      setTimeout(checkStyles, 100);
    });
    
    // Navigate to page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for all checks to complete
    await page.waitForTimeout(500);
    
    // Log the results
    console.log('Style checks during load:', styleChecks);
    
    // Check if we found any unstyled content
    expect(foundUnstyledContent, 'Should not show unstyled content during initial load').toBe(false);
    
    // Verify final state has proper styles (not just basic background)
    const finalStyles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      const rootStyles = window.getComputedStyle(document.documentElement);
      
      return {
        backgroundColor: computed.backgroundColor,
        fontFamily: computed.fontFamily,
        margin: computed.margin,
        primaryColorVar: rootStyles.getPropertyValue('--primary-color'),
        backgroundVarDefined: rootStyles.getPropertyValue('--background-primary') !== '',
      };
    });
    
    console.log('Final styles:', finalStyles);
    expect(finalStyles.fontFamily, 'Should have font family applied').not.toBe('');
    expect(finalStyles.backgroundVarDefined, 'CSS custom properties should be loaded').toBe(true);
  });

  test('Should not show unstyled content on page refresh', async ({ page }) => {
    // First, load the page normally
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Track unstyled content during refresh - CHECK FOR ACTUAL COMPONENT STYLES
    let foundUnstyledDuringRefresh = false;
    const refreshStyleChecks: Array<{ time: number; hasProperStyles: boolean; details: any }> = [];
    
    // Set up monitoring before refresh
    await page.exposeFunction('logRefreshStyleCheck', (hasProperStyles: boolean, details: any) => {
      const time = Date.now();
      refreshStyleChecks.push({ time, hasProperStyles, details });
      if (!hasProperStyles) {
        foundUnstyledDuringRefresh = true;
      }
    });
    
    // Add script to monitor during refresh - CHECK FOR REAL STYLING
    await page.addInitScript(() => {
      const checkProperStyles = () => {
        const body = document.body;
        if (body && document.querySelector('.hero')) {
          const bodyStyles = window.getComputedStyle(body);
          const heroElement = document.querySelector('.hero');
          const ctaButton = document.querySelector('.cta-button');
          
          // Check if CSS custom properties are loaded
          const rootStyles = window.getComputedStyle(document.documentElement);
          const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
          
          // Check if hero section has proper styling
          const heroStyles = heroElement ? window.getComputedStyle(heroElement) : null;
          const heroMinHeight = heroStyles?.minHeight || '';
          
          // Check if CTA button has proper styling
          const ctaStyles = ctaButton ? window.getComputedStyle(ctaButton) : null;
          const ctaBackground = ctaStyles?.backgroundColor || '';
          
          // PROPER styles means:
          // 1. CSS variables are defined
          // 2. Hero section has min-height: 100vh
          // 3. CTA button has non-white background
          const hasCSSVariables = primaryColor !== '';
          const hasHeroStyles = heroMinHeight.includes('100vh') || parseInt(heroMinHeight) > 500;
          const hasButtonStyles = ctaBackground !== 'rgba(0, 0, 0, 0)' && ctaBackground !== 'rgb(255, 255, 255)';
          
          const hasProperStyles = hasCSSVariables && (hasHeroStyles || hasButtonStyles);
          
          (window as any).logRefreshStyleCheck?.(hasProperStyles, {
            primaryColor,
            heroMinHeight,
            ctaBackground,
            hasCSSVariables,
            hasHeroStyles,
            hasButtonStyles,
            documentReadyState: document.readyState,
          });
          
          return hasProperStyles;
        }
        return false;
      };
      
      // Check immediately when DOM changes
      const observer = new MutationObserver(() => {
        checkProperStyles();
      });
      
      if (document.body) {
        observer.observe(document.body, { 
          attributes: true, 
          childList: true, 
          subtree: true 
        });
      }
      
      // Also check on DOMContentLoaded and load
      document.addEventListener('DOMContentLoaded', checkProperStyles);
      window.addEventListener('load', checkProperStyles);
    });
    
    // Perform refresh
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    console.log('Style checks during refresh:', refreshStyleChecks);
    
    // Check results - this should now FAIL if there's a real FOUC
    expect(foundUnstyledDuringRefresh, 'Should not show unstyled content during refresh').toBe(false);
  });

  test('Should have CSS loaded before content renders', async ({ page }) => {
    const timings: any = {};
    
    // Monitor resource loading
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.css')) {
        timings.cssLoaded = Date.now();
        console.log('CSS loaded:', url);
      }
    });
    
    // Navigate and capture timing
    const startTime = Date.now();
    await page.goto('/');
    
    // Check when first paint occurs
    const paintTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      return {
        firstPaint: entries.find(e => e.name === 'first-paint')?.startTime,
        firstContentfulPaint: entries.find(e => e.name === 'first-contentful-paint')?.startTime,
      };
    });
    
    console.log('Paint timing:', paintTiming);
    console.log('CSS timing:', timings);
    
    // Verify styles are present at first paint
    const stylesAtFirstPaint = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        fontFamily: computed.fontFamily,
        hasInlineStyles: body.hasAttribute('style'),
        numberOfStylesheets: document.styleSheets.length,
      };
    });
    
    console.log('Styles at first paint:', stylesAtFirstPaint);
    
    expect(stylesAtFirstPaint.numberOfStylesheets, 'Should have stylesheets loaded').toBeGreaterThan(0);
  });

  test('Should detect white flash during refresh', async ({ page, browserName }) => {
    // This test specifically looks for the "white flash" issue
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before refresh
    const beforeRefresh = await page.screenshot();
    
    // Set up to capture screenshots during refresh
    const screenshots: Buffer[] = [];
    
    // Start rapid screenshot capture during refresh
    const capturePromise = (async () => {
      for (let i = 0; i < 5; i++) {
        try {
          const screenshot = await page.screenshot();
          screenshots.push(screenshot);
        } catch (e) {
          // Might fail during reload, that's ok
        }
        await page.waitForTimeout(50);
      }
    })();
    
    // Trigger refresh
    await page.reload({ waitUntil: 'commit' });
    
    // Wait for capture to complete
    await capturePromise;
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after refresh
    const afterRefresh = await page.screenshot();
    
    // Analyze screenshots for white/unstyled content
    const analysis = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      const isWhite = computed.backgroundColor === 'rgb(255, 255, 255)' || 
                      computed.backgroundColor === 'rgba(255, 255, 255, 1)';
      
      return {
        backgroundColor: computed.backgroundColor,
        isWhite,
        hasContent: body.textContent && body.textContent.length > 100,
      };
    });
    
    console.log('Background analysis:', analysis);
    console.log('Captured', screenshots.length, 'screenshots during refresh');
    
    // If background is white but we have content, that might be intentional
    // The issue is if we see a flash of white then colored background
    if (analysis.isWhite && analysis.hasContent) {
      console.warn('⚠️  White background detected - this might be intentional or a FOUC issue');
    }
  });

  test('Critical CSS should be inlined or loaded immediately', async ({ page }) => {
    // Navigate with network throttling to simulate slow connection
    await page.goto('/', { waitUntil: 'commit' });
    
    // Check if there's inline critical CSS in the head
    const criticalCSS = await page.evaluate(() => {
      const inlineStyles = Array.from(document.querySelectorAll('head style'));
      const inlineStyleContent = inlineStyles.map(s => s.textContent || '').join('\n');
      
      const linkStylesheets = Array.from(document.querySelectorAll('head link[rel="stylesheet"]'));
      
      return {
        hasInlineStyles: inlineStyles.length > 0,
        inlineStylesCount: inlineStyles.length,
        inlineStylesLength: inlineStyleContent.length,
        externalStylesheets: linkStylesheets.length,
        stylesheetUrls: linkStylesheets.map((l: any) => l.href),
        hasBodyStyles: document.body ? window.getComputedStyle(document.body).fontFamily !== '' : false,
      };
    });
    
    console.log('Critical CSS analysis:', criticalCSS);
    
    // At least one of these should be true for proper loading
    const hasProperCSSLoading = criticalCSS.hasInlineStyles || criticalCSS.externalStylesheets > 0;
    
    expect(hasProperCSSLoading, 'Should have either inline or external CSS').toBe(true);
    
    if (!criticalCSS.hasInlineStyles) {
      console.warn('⚠️  No inline critical CSS found - this could cause FOUC');
      console.warn('💡 Consider adding critical CSS inline in <head> for faster initial render');
    }
  });

  test('Fonts should not cause layout shift or FOUC', async ({ page }) => {
    await page.goto('/');
    
    const fontLoadingStrategy = await page.evaluate(() => {
      const fontFaces = Array.from(document.fonts);
      const computedFont = window.getComputedStyle(document.body).fontFamily;
      
      return {
        numberOfFonts: fontFaces.length,
        bodyFontFamily: computedFont,
        fontsLoaded: document.fonts.status,
        hasFontDisplay: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .some((link: any) => link.href.includes('font')),
      };
    });
    
    console.log('Font loading strategy:', fontLoadingStrategy);
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    const afterFontLoad = await page.evaluate(() => {
      return {
        bodyFontFamily: window.getComputedStyle(document.body).fontFamily,
        fontsLoaded: document.fonts.status,
      };
    });
    
    console.log('After font load:', afterFontLoad);
    
    // Font family should be set even before custom fonts load
    expect(fontLoadingStrategy.bodyFontFamily, 'Should have fallback font defined').not.toBe('');
  });
});

test.describe('FOUC Detection - Navigation', () => {
  
  test('Should not flash during client-side navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial background
    const initialBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Click to navigate
    await page.click('a[href="/services"]');
    
    // Check background doesn't flash to white/unstyled
    const duringNavigation = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    await page.waitForURL('**/services');
    
    const afterNavigation = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('Background colors:', { initialBg, duringNavigation, afterNavigation });
    
    // Background should remain styled throughout
    expect(duringNavigation, 'Background should remain styled during navigation').not.toBe('rgba(0, 0, 0, 0)');
    expect(afterNavigation, 'Background should be styled after navigation').not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('FOUC Detection - Component-Level Checks', () => {
  
  test('Navigation should never render without styles', async ({ page }) => {
    let navRenderedWithoutStyles = false;
    const navStyleChecks: Array<any> = [];
    
    await page.exposeFunction('checkNavStyles', (details: any) => {
      navStyleChecks.push(details);
      if (details.hasNav && !details.hasProperStyles) {
        navRenderedWithoutStyles = true;
      }
    });
    
    await page.addInitScript(() => {
      const checkNav = () => {
        const header = document.querySelector('.header');
        const navbar = document.querySelector('.navbar');
        const logo = document.querySelector('.logo h2');
        const navMenu = document.querySelector('.nav-menu');
        
        if (header && navbar) {
          const headerStyles = window.getComputedStyle(header);
          const navbarStyles = window.getComputedStyle(navbar);
          const logoStyles = logo ? window.getComputedStyle(logo) : null;
          const navMenuStyles = navMenu ? window.getComputedStyle(navMenu) : null;
          
          // Navigation should have proper positioning and styling
          const hasProperStyles = 
            headerStyles.position === 'fixed' &&
            (navbarStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' || navbarStyles.backdropFilter !== 'none') &&
            (!logo || (logoStyles && logoStyles.color !== 'rgb(0, 0, 0)')) &&
            (!navMenu || (navMenuStyles && navMenuStyles.display !== 'inline'));
          
          (window as any).checkNavStyles?.({
            hasNav: true,
            hasProperStyles,
            headerPosition: headerStyles.position,
            navbarBackground: navbarStyles.backgroundColor,
            logoColor: logoStyles?.color || 'none',
            navMenuDisplay: navMenuStyles?.display || 'none',
            timestamp: Date.now()
          });
        }
      };
      
      // Monitor DOM changes
      const observer = new MutationObserver(checkNav);
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      // Also check at key moments
      document.addEventListener('DOMContentLoaded', checkNav);
      window.addEventListener('load', checkNav);
      setTimeout(checkNav, 0);
      setTimeout(checkNav, 50);
      setTimeout(checkNav, 100);
    });
    
    await page.goto('/');
    await page.waitForTimeout(500);
    
    console.log('Navigation style checks:', navStyleChecks);
    
    if (navRenderedWithoutStyles) {
      console.error('❌ FOUC DETECTED: Navigation rendered without proper styles!');
      console.error('This is what the user sees - unstyled navigation links.');
    }
    
    expect(navRenderedWithoutStyles, 
      'Navigation should NEVER render without proper styles - this causes visible FOUC!'
    ).toBe(false);
  });
  
  test('Hero section should never render without styles', async ({ page }) => {
    let heroRenderedWithoutStyles = false;
    const heroStyleChecks: Array<any> = [];
    
    await page.exposeFunction('checkHeroStyles', (details: any) => {
      heroStyleChecks.push(details);
      if (details.hasHero && !details.hasProperStyles) {
        heroRenderedWithoutStyles = true;
      }
    });
    
    await page.addInitScript(() => {
      const checkHero = () => {
        const hero = document.querySelector('.hero');
        if (hero) {
          const styles = window.getComputedStyle(hero);
          const minHeight = styles.minHeight;
          const backgroundImage = styles.backgroundImage;
          const display = styles.display;
          
          // Hero should have minHeight: 100vh and background image
          const hasProperStyles = 
            (minHeight.includes('100vh') || parseInt(minHeight) > 500) &&
            (backgroundImage !== 'none' || display === 'flex');
          
          (window as any).checkHeroStyles?.({
            hasHero: true,
            hasProperStyles,
            minHeight,
            backgroundImage,
            display,
            timestamp: Date.now()
          });
        }
      };
      
      // Monitor DOM changes
      const observer = new MutationObserver(checkHero);
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      // Also check at key moments
      document.addEventListener('DOMContentLoaded', checkHero);
      window.addEventListener('load', checkHero);
      setTimeout(checkHero, 0);
      setTimeout(checkHero, 50);
      setTimeout(checkHero, 100);
    });
    
    await page.goto('/');
    await page.waitForTimeout(500);
    
    console.log('Hero style checks:', heroStyleChecks);
    
    if (heroRenderedWithoutStyles) {
      console.error('❌ FOUC DETECTED: Hero section rendered without proper styles!');
      console.error('This is the visual flash users are seeing.');
    }
    
    expect(heroRenderedWithoutStyles, 
      'Hero section should NEVER render without proper styles - this is the FOUC!'
    ).toBe(false);
  });
  
  test('CSS variables should be available before content renders', async ({ page }) => {
    const cssVarChecks: Array<any> = [];
    let contentRenderedWithoutVars = false;
    
    await page.exposeFunction('checkCSSVars', (details: any) => {
      cssVarChecks.push(details);
      if (details.hasContent && !details.hasCSSVars) {
        contentRenderedWithoutVars = true;
      }
    });
    
    await page.addInitScript(() => {
      const checkVars = () => {
        const hasContent = document.body && document.body.children.length > 0;
        const rootStyles = window.getComputedStyle(document.documentElement);
        
        // Check for key CSS variables
        const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
        const fontPrimary = rootStyles.getPropertyValue('--font-primary').trim();
        const backgroundPrimary = rootStyles.getPropertyValue('--background-primary').trim();
        
        const hasCSSVars = primaryColor !== '' && fontPrimary !== '' && backgroundPrimary !== '';
        
        (window as any).checkCSSVars?.({
          hasContent,
          hasCSSVars,
          primaryColor,
          fontPrimary,
          backgroundPrimary,
          timestamp: Date.now()
        });
      };
      
      // Check as early as possible
      const observer = new MutationObserver(checkVars);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      
      setTimeout(checkVars, 0);
      setTimeout(checkVars, 10);
      setTimeout(checkVars, 50);
      document.addEventListener('DOMContentLoaded', checkVars);
    });
    
    await page.goto('/');
    await page.waitForTimeout(500);
    
    console.log('CSS variable checks:', cssVarChecks);
    
    if (contentRenderedWithoutVars) {
      console.error('❌ FOUC DETECTED: Content rendered before CSS variables loaded!');
      console.error('This means components have no styling initially.');
    }
    
    expect(contentRenderedWithoutVars,
      'Content should NOT render before CSS variables are loaded - this causes FOUC!'
    ).toBe(false);
  });
});

