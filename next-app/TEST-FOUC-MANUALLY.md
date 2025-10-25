# Manual FOUC Testing Guide

## 🧪 How to Test the FOUC Fix Yourself

### Quick Test (30 seconds):

1. **Open the site in your browser:**
   ```
   http://localhost:3000
   ```

2. **Hard refresh multiple times:**
   - **Chrome/Edge:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - **Firefox:** `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
   - **Safari:** `Cmd + Option + R` (Mac)

3. **What to look for:**
   - ✅ **GOOD:** Background color appears immediately (warm beige `#faf8f5`)
   - ✅ **GOOD:** Text is readable with system fonts immediately
   - ✅ **GOOD:** No white flash
   - ❌ **BAD:** White screen that quickly turns to styled page (this should NOT happen now)

### Throttle Test (Simulates Slow Connection):

1. **Open Chrome DevTools:**
   - Press `F12` or right-click → Inspect

2. **Open Network Tab:**
   - Click "Network" tab
   - Find the throttling dropdown (usually says "No throttling")
   - Select "Slow 3G"

3. **Refresh the page multiple times:**
   - Notice the page is styled even during slow CSS loading
   - Background color and fonts appear immediately

4. **Compare (if you want to see the difference):**
   - Temporarily remove the inline CSS from `layout.tsx`
   - Refresh → You'll see the white flash
   - Put it back → Smooth loading

### Visual Comparison:

**Before Fix (FOUC):**
```
White Screen → Flash → Styled Page
     ↑                    ↑
  Bad UX              Finally OK
```

**After Fix (No FOUC):**
```
Styled Page → Enhanced Page
     ↑              ↑
  Immediate    Fonts swap in
```

### Mobile Test:

1. **Open DevTools:**
   - Press `F12`

2. **Toggle Device Toolbar:**
   - Click phone/tablet icon or press `Ctrl + Shift + M`

3. **Select a mobile device:**
   - iPhone 12 Pro
   - Samsung Galaxy S20
   - iPad Pro

4. **Refresh multiple times:**
   - Should see styled page immediately
   - No white flash even on mobile

### Different Browser Test:

Try in multiple browsers to ensure consistency:
- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

Each should show styled content immediately without flash.

---

## 🔍 Technical Verification

### Check Critical CSS is Present:

1. **Open page source:**
   - Right-click → "View Page Source" or `Ctrl + U`

2. **Search for:** `Critical CSS`
   - You should find a `<style>` tag in the `<head>` with our inline CSS

3. **Verify content includes:**
   ```css
   html, body {
     background-color: #faf8f5 !important;
   ```

### Check Browser Console:

1. **Open Console:**
   - Press `F12` → Console tab

2. **Refresh page**

3. **Look for:**
   - ✅ No errors related to CSS loading
   - ✅ No FOUC warnings

---

## 📊 Automated Test

To run the automated FOUC detection tests:

```bash
cd next-app
npx playwright test tests/specs/visual/fouc-detection.spec.ts
```

**Expected Results:**
- ✅ 26-27 tests should pass
- ✅ `hasInlineStyles: true` in output
- ✅ No FOUC warnings

---

## ✨ What You Should See

### On Initial Load:
1. Background color appears instantly (warm beige)
2. Text content appears with system font
3. Navigation bar styled immediately
4. Custom fonts swap in smoothly (no layout shift)

### On Refresh:
1. No white flash
2. Styled page appears immediately
3. Smooth transition as external CSS loads

### On Slow Connection:
1. Basic styling appears immediately
2. Enhanced styles load progressively
3. User can read/interact with page while loading

---

## 🐛 If You Still See FOUC:

1. **Clear browser cache:**
   - Hard refresh with `Ctrl + Shift + R`
   - Or clear cache in browser settings

2. **Verify dev server is running:**
   ```bash
   npm run dev
   ```

3. **Check the fix was applied:**
   - Open `src/app/layout.tsx`
   - Confirm `<head>` section with inline CSS exists

4. **Check browser console for errors:**
   - Any CSS loading errors?
   - Any JavaScript errors?

---

## 💡 Pro Tip: Side-by-Side Comparison

If you want to see the dramatic difference:

1. **Make a backup of layout.tsx**
2. **Test WITH the fix** (current version)
3. **Remove the inline CSS block temporarily**
4. **Test WITHOUT the fix** (see the FOUC)
5. **Restore the fix** (see smooth loading again)

This makes the improvement very obvious!

