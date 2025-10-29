# Performance Optimization Opportunities

## ✅ Completed
1. **CSS Loading Optimization** - Moved all styles to `globals.css` for synchronous loading, eliminated FOUC

## 🚀 High Priority Optimizations

### 1. **Image Optimization with Next.js Image Component** ⭐️ HIGHEST IMPACT

**Current State:**
```tsx
// ❌ Current: Regular img tags
<img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop" 
     alt="Nail art sample" 
     loading="lazy" />
```

**Optimized:**
```tsx
// ✅ Optimized: Next.js Image component
import Image from 'next/image';

<Image 
  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop"
  alt="Nail art sample"
  width={400}
  height={400}
  loading="lazy"
/>
```

**Benefits:**
- ✅ Automatic format optimization (WebP, AVIF)
- ✅ Responsive images for different screen sizes
- ✅ Automatic lazy loading with proper blur placeholders
- ✅ Reduced bandwidth usage
- ✅ Better Core Web Vitals scores (LCP, CLS)
- ✅ **Estimated 40-60% reduction in image size**

**Files to update:**
- `src/app/page.tsx` (4 images in gallery)
- `src/app/portfolio/page.tsx` (multiple images)
- Any other pages with images

**Configuration needed:**
Update `next.config.js` to allow external image domains:
```javascript
images: {
  domains: ['lacqueandlatte.ca', 'images.unsplash.com'],
  formats: ['image/avif', 'image/webp'],
},
```

---

### 2. **Remove Unused Dependency: Tailwind CSS**

**Current State:**
- Tailwind CSS is installed in `package.json`
- PostCSS and Autoprefixer are configured for Tailwind
- **But Tailwind is NOT being used anywhere in the codebase**

**Action:**
Remove unused dependencies:
```bash
npm uninstall tailwindcss autoprefixer postcss
```

Delete unused config files:
- `tailwind.config.js` (if exists)
- `postcss.config.js` (if exists)

**Benefits:**
- ✅ Smaller `node_modules` (saves ~50MB)
- ✅ Faster `npm install`
- ✅ Cleaner dependency tree
- ✅ No unused code in production

---

### 3. **Move Remaining `<style jsx>` Blocks to globals.css**

**Current State:**
- `portfolio/page.tsx` still has a large `<style jsx>` block
- Services page likely has similar issues

**Action:**
Move all component styles from `<style jsx>` blocks to `globals.css`, same as we did for Navigation and Home page.

**Benefits:**
- ✅ Consistent styling approach
- ✅ No duplication
- ✅ Faster page loads (styles load once, not per component)
- ✅ Easier maintenance

---

### 4. **Font Loading Optimization** (Already Good, but can improve)

**Current State:**
Using `next/font/google` which is good, but fonts are set to `display: 'swap'`

**Consider:**
```tsx
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'optional', // Better for performance
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});
```

**Benefits:**
- ✅ `display: 'optional'` prevents layout shift completely
- ✅ Uses fallback if font doesn't load within 100ms
- ✅ Better CLS (Cumulative Layout Shift) score

---

## 🔧 Medium Priority Optimizations

### 5. **Dynamic Imports for Heavy Components**

If you have any heavy components (like complex booking forms, calendars), lazy load them:

```tsx
import dynamic from 'next/dynamic';

const BookingFlow = dynamic(() => import('@/components/BookingFlow'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // If it doesn't need SSR
});
```

**Benefits:**
- ✅ Smaller initial bundle
- ✅ Faster Time to Interactive (TTI)
- ✅ Code splitting

---

### 6. **Preconnect to External Domains**

Add to `layout.tsx` `<head>`:
```tsx
<link rel="preconnect" href="https://images.unsplash.com" />
<link rel="dns-prefetch" href="https://images.unsplash.com" />
```

**Benefits:**
- ✅ Faster image loading from external sources
- ✅ Reduced connection time

---

### 7. **Bundle Size Analysis**

Run a bundle analyzer to see what's taking up space:

```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Then run:
```bash
ANALYZE=true npm run build
```

**Benefits:**
- ✅ Visualize what's in your bundle
- ✅ Find opportunities to reduce size
- ✅ Identify duplicate dependencies

---

## 📊 Low Priority (Nice to Have)

### 8. **Metadata Optimization for SEO**

Add to each page:
```tsx
export const metadata: Metadata = {
  title: 'Portfolio | Lacque & Latte',
  description: 'View our stunning nail art portfolio...',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};
```

### 9. **Add robots.txt and sitemap.xml**

Should add to Next.js app:
- `app/robots.ts` (dynamic robots.txt generation)
- `app/sitemap.ts` (for dynamic sitemap generation)

### 10. **Compression**

Next.js automatically compresses assets, but ensure your hosting supports:
- Brotli compression
- Gzip fallback

---

## 🎯 Implementation Priority

**Week 1: Highest Impact**
1. ✅ CSS optimization (DONE)
2. 🔥 Switch to Next.js Image component
3. 🗑️ Remove Tailwind CSS dependency

**Week 2: Medium Impact**
4. Move portfolio styles to globals.css
5. Consider font display strategy
6. Add preconnect for external domains

**Week 3: Analysis & Fine-tuning**
7. Run bundle analyzer
8. Implement dynamic imports if needed
9. SEO metadata improvements

---

## 📈 Expected Performance Gains

After implementing all high-priority optimizations:

**Current estimates:**
- **Image sizes:** 40-60% reduction
- **Initial load time:** 20-30% faster
- **Bundle size:** ~50MB smaller
- **Lighthouse score:** +10-15 points
- **Core Web Vitals:** Significant improvement in LCP and CLS

**Metrics to track:**
- Lighthouse Performance score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Time to Interactive (TTI)

---

## 🔍 How to Verify Improvements

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Check bundle size
npm run build
# Look at the output for page sizes

# Run performance tests
npm run test:performance

# Monitor in production
# Use tools like Vercel Analytics, Google PageSpeed Insights
```

---

**Next Steps:**
Would you like me to implement any of these optimizations? I recommend starting with #2 (Image component) as it will have the biggest immediate impact on performance.

