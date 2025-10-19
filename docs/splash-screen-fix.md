# Splash Screen White Flash Fix

## Problem Identified (Updated)

A brief **white/cream flash** was occurring between the splash screen and the landing page on first load. This was caused by:

1. **Header Background Painting During Transition**: The navigation bar has a cream background (rgba(250, 248, 245, 0.95)) and while the splash fades out, this background was visible before the main content fully appeared
2. **Timing-Based Transitions**: Previous fixes used overlapping `setTimeout()` calls which could cause gaps depending on browser performance
3. **Z-Index Layering**: The nav needed to be visible during the splash but its background shouldn't paint

## Solutions Implemented (Permanent Fix - Invariant Based)

### 1. Header Background Suppression During Splash
**CRITICAL INVARIANT**: During `splash-active`, the nav remains visible and interactive, but the header BACKGROUND must not paint.

```css
/* CRITICAL: Suppress header background during splash to prevent cream flash */
body.splash-active .navbar {
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
}
```

This ensures:
- ✅ Nav is visible and accessible during splash
- ✅ No cream background paints during transition
- ✅ Background restores to rgba(250, 248, 245, 0.95) after `splash-active` is removed
- ✅ Works with `prefers-reduced-motion`

### 2. Event-Driven Transition (No Timing Gaps)
Replaced timing-based transitions with **event listeners**:

```javascript
startTransitionSequence() {
    // Listen for splash logo animation end
    const logo = this.splashScreen.querySelector('.splash-logo h1');
    logo.addEventListener('animationend', () => {
        this.startFadeOut();
    }, { once: true });
}

startFadeOut() {
    this.splashScreen.classList.add('fade-out');
    
    // Listen for opacity transition to complete
    const handleTransitionEnd = (e) => {
        if (e.propertyName === 'opacity' && e.target === this.splashScreen) {
            // Remove splash-active so header background is restored
            document.body.classList.remove('splash-active');
            // Reveal main content
            this.revealMainContent();
            this.cleanup();
        }
    };
    
    this.splashScreen.addEventListener('transitionend', handleTransitionEnd);
}
```

Benefits:
- ✅ No overlapping timeouts
- ✅ Precise handoff when splash opacity completes
- ✅ Fallback timeout for safety
- ✅ Header background restores exactly when needed

### 3. Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Skip animations but still prevent flash */
  body.splash-active .navbar {
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }
}
```

## Visual Flow

**Before Fix:**
```
Load → Splash Screen → Cream Flash (header bg visible) → Landing Page
```

**After Fix:**
```
Load → Splash Screen (nav visible, transparent bg) → [transitionend] → Landing Page + Header (cream bg restored)
```

## What You Should See Now

1. **On page load**: Splash screen appears with nav visible but with **transparent background**
2. **During splash**: The "Lacque&latte" text animates and fades (nav has no background)
3. **Logo animation ends**: `animationend` event triggers fade-out
4. **Splash fades**: Opacity transitions to 0
5. **Transition completes**: `transitionend` fires → `splash-active` removed → header background restores to cream
6. **Main content reveals**: Content fades in simultaneously
7. **No flash**: At no point is the cream header background visible over empty space

## Testing

### Manual Testing
1. **Hard refresh**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. **Clear session storage**: DevTools → Application → Session Storage → Clear `splashShown`
3. **Slow 3G simulation**: DevTools → Network → Slow 3G to test on throttled network
4. **CPU throttling**: DevTools → Performance → 6x slowdown
5. **Reduced motion**: System preferences → Reduce motion enabled
6. **Mobile testing**: Different screen sizes and devices

### Automated Testing
Run Playwright tests:
```bash
npx playwright test tests/splash-header-handoff.spec.js
```

## Key Changes Made

### Files Modified:
1. **styles.css**:
   - Added `body.splash-active .navbar` rule (lines 407-411) to suppress background
   - Added reduced-motion support (lines 850-854) for background suppression
   
2. **script.js**:
   - Replaced `startTransitionSequence()` with event-driven logic (lines 352-365)
   - Updated `startFadeOut()` with `transitionend` listener (lines 367-401)
   - Updated `cleanup()` to remove duplicate splash-active removal (line 457)

3. **docs/splash-screen-fix.md**:
   - Updated with invariant-based approach documentation
   - Added event-driven transition details
   - Updated testing instructions

## Browser Compatibility

These changes use standard CSS and JavaScript and are compatible with:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## CRITICAL INVARIANTS (DO NOT VIOLATE)

### Invariant 1: Background Suppression During Splash
> During `splash-active`, the nav MUST remain visible and interactive, but the header background MUST NOT paint (transparent).

**Why**: The header has a cream background that creates a flash if visible during transition.

**Enforcement**: 
- CSS rule at lines 407-411 in `styles.css`
- Reduced-motion support at lines 850-854

### Invariant 2: Event-Driven Handoff
> The reveal of main content and restoration of header background MUST be driven by the splash's `transitionend` event on the `opacity` property, NOT by fixed timeouts.

**Why**: Timing-based transitions create gaps on slow devices/networks.

**Enforcement**:
- `transitionend` listener in `startFadeOut()` (lines 367-401 in `script.js`)
- Fallback timeout for safety but primary path is event-driven

### Invariant 3: State Synchronization
> The removal of `splash-active` class MUST happen exactly when the splash opacity transition completes, to synchronize header background restoration with content reveal.

**Why**: Removes splash-active too early → cream flash; too late → delayed header appearance.

**Enforcement**:
- Single point of removal in `handleTransitionEnd()` callback
- No duplicate removals in cleanup

## Regression Prevention

### Linting Rules (Optional)
Add to ESLint config:
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.name='classList'][property.name='remove'][parent.arguments.0.value='splash-active']",
        "message": "Only remove splash-active in transitionend handler"
      }
    ]
  }
}
```

### Code Review Checklist
- [ ] Header background is transparent during `splash-active`
- [ ] Transition logic uses `transitionend`, not just timeouts
- [ ] `splash-active` removed in one place (transitionend handler)
- [ ] Reduced-motion still prevents flash

---

**Status**: ✅ Fixed with invariant-based approach
**Date**: October 18, 2025
**Impact**: Eliminates cream flash permanently, works on slow networks/CPUs

