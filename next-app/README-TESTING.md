# Quick Start - Testing the Next.js App

This is a quick reference guide for running tests on the Lacque & Latte Next.js application.

## 🚀 Quick Start

### Run All Tests
```bash
cd next-app
npm run test:e2e
```

### Run Performance Tests Only
```bash
npm run test:performance
```

### Run Console Monitoring Tests Only
```bash
npm run test:console
```

### Interactive Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

## 📊 What Gets Tested

### ⚡ Performance
- ✅ Page load times (DOM Content Loaded, Full Load)
- ✅ Core Web Vitals (LCP, FID, CLS, TTFB)
- ✅ Resource optimization (images, scripts, CSS)
- ✅ Memory usage and leak detection
- ✅ API response times
- ✅ Page transition speeds

### 🔍 Console Monitoring
- ✅ Zero console errors
- ✅ Zero console warnings (in production)
- ✅ React/Next.js specific checks
- ✅ Network error detection
- ✅ Hydration error detection

### 🎨 Smooth Operation
- ✅ No layout shifts (CLS < 0.1)
- ✅ Smooth animations (60fps)
- ✅ Interactive responsiveness
- ✅ Smooth scrolling
- ✅ Form interactions
- ✅ Mobile touch interactions

## 📈 Performance Thresholds

| Metric | Target | Status |
|--------|--------|--------|
| DOM Content Loaded | < 2s | 🎯 |
| Full Page Load | < 3s | 🎯 |
| LCP (Largest Contentful Paint) | < 2.5s | 🎯 |
| FID (First Input Delay) | < 100ms | 🎯 |
| CLS (Cumulative Layout Shift) | < 0.1 | 🎯 |
| Total Requests | < 50 | 🎯 |
| Total Page Size | < 3MB | 🎯 |

## 🎯 Test Commands Reference

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (best for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# Run performance tests only
npm run test:performance

# Run console monitoring tests only
npm run test:console

# View last test report
npm run test:report

# Run all tests (unit + E2E)
npm run test:all
```

## 🔧 Before Running Tests

1. **Start the dev server** (tests will auto-start it if not running):
```bash
npm run dev
```

2. **Make sure dependencies are installed**:
```bash
npm install
```

3. **Install Playwright browsers** (first time only):
```bash
npx playwright install chromium
```

## 📝 Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

Reports include:
- Test pass/fail status
- Performance metrics
- Screenshots on failure
- Video recordings on failure
- Network activity
- Console logs

## 🐛 Debugging Failed Tests

### Step 1: Run in UI Mode
```bash
npm run test:e2e:ui
```
This gives you a visual interface to:
- See tests running
- Pause execution
- Inspect elements
- View console logs

### Step 2: Run in Debug Mode
```bash
npm run test:e2e:debug
```
This opens the Playwright Inspector for step-by-step debugging.

### Step 3: Check the Report
```bash
npm run test:report
```
Review:
- Screenshots of failures
- Video recordings
- Console messages
- Network requests

## 🎨 Test Structure

```
next-app/tests/
├── fixtures/
│   └── performance-monitor.ts     # Performance & console fixtures
├── utils/
│   └── performance-assertions.ts   # Test helpers
├── pages/
│   └── *.ts                       # Page objects
└── specs/
    ├── performance/               # Performance tests
    └── console/                   # Console & smoothness tests
```

## 🚨 Common Issues

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Check network connection

### Performance tests fail in CI
- CI environments are slower
- Adjust thresholds for CI
- Use `process.env.CI` to detect CI environment

### Console errors in dev mode
- Some dev warnings are expected
- Tests filter common dev messages
- Check `allowedPatterns` in test files

## 📚 Full Documentation

For complete documentation, see [TESTING.md](./TESTING.md)

## 🎓 Example Test Run

```bash
$ npm run test:performance

Running 8 tests using 4 workers
  8 passed (12.5s)

Performance Report:
  Home page: 1.2s (LCP: 1.8s, CLS: 0.05)
  Services page: 0.9s (LCP: 1.5s, CLS: 0.02)
  Portfolio page: 1.5s (LCP: 2.1s, CLS: 0.08)
  Calendar page: 1.1s (LCP: 1.7s, CLS: 0.03)

All tests passed! ✅
```

## 💡 Pro Tips

1. **Use UI mode during development** - It's much faster to iterate
2. **Run performance tests before commits** - Catch regressions early
3. **Check the HTML report** - It has tons of useful debugging info
4. **Watch the videos** - Failures are recorded so you can see what happened
5. **Use headed mode** - To see exactly what the test is doing

## 🔄 Continuous Integration

Tests run automatically on:
- Every push to main branch
- Every pull request
- Daily scheduled runs

See `.github/workflows/` for CI configuration.

---

Need help? Check [TESTING.md](./TESTING.md) for detailed documentation.

