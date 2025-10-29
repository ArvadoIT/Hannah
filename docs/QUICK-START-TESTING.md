# Quick Start Guide - E2E Testing

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
npx playwright install
```

### 2. Run Tests

```bash
# Interactive UI mode (RECOMMENDED for first time)
npm run test:ui

# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Debug mode
npm run test:debug
```

### 3. View Results

```bash
# View HTML report (after tests run)
npm run test:report
```

---

## 📁 Test Structure

```
tests/
├── fixtures/          # Console capture fixture
├── pages/             # Page Objects (HomePage, ServicesPage, etc.)
├── specs/
│   ├── global/        # Navigation, console errors
│   ├── home/          # Splash screen, images
│   ├── booking/       # Booking flow, form validation
│   ├── portfolio/     # Filters, transitions
│   ├── admin/         # Auth, hamburger menu
│   ├── calendar/      # Calendar navigation
│   └── responsive/    # Mobile & desktop smoke tests
└── utils/             # Helpers and test data
```

---

## ✅ What's Tested

### Home Page
- ✅ Splash screen shows on first visit
- ✅ Splash skips on revisit
- ✅ No white screen after splash
- ✅ Navigation bar visible during splash
- ✅ Images and background images load
- ✅ Correct background color (#faf8f5)

### Booking Flow
- ✅ Service selection
- ✅ Form validation (name, email, phone)
- ✅ Happy path end-to-end
- ✅ Mobile booking

### Portfolio
- ✅ Filter functionality
- ✅ Smooth transitions
- ✅ Image loading

### Admin
- ✅ Authentication
- ✅ Hamburger menu clickable
- ✅ Menu open/close
- ✅ Accessibility features

### Global
- ✅ Navigation works
- ✅ Zero console errors
- ✅ Footer present
- ✅ Mobile menu works

---

## 🎯 Common Commands

```bash
# Run specific test file
npx playwright test tests/specs/home/splash-screen.spec.ts

# Run tests for specific page
npx playwright test tests/specs/home/

# Run only desktop tests
npm run test:chromium

# Run only mobile tests
npm run test:mobile

# Run with specific tag
npx playwright test --grep @smoke

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots
```

---

## 🐛 Debugging

```bash
# Debug mode (step through tests)
npm run test:debug

# Run specific test in debug mode
npx playwright test tests/specs/home/splash-screen.spec.ts --debug

# View trace file
npx playwright show-trace trace.zip
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Change base URL
E2E_BASE_URL=https://staging.example.com npm test

# Enable CI mode
CI=true npm test
```

### Test Projects

- `chromium-desktop` - Desktop Chrome (1280x800)
- `chromium-mobile` - Mobile Chrome (390x844)

---

## 📊 Reports

After running tests:

1. **HTML Report**: `npm run test:report`
   - Shows all test results
   - Includes screenshots/videos on failure
   - Interactive trace viewer

2. **JUnit XML**: `test-results/junit.xml`
   - For CI integration

3. **Artifacts**: `test-results/`
   - Screenshots
   - Videos
   - Traces

---

## 💡 Tips

1. **Use UI Mode**: Best for development - `npm run test:ui`
2. **Focus Tests**: Use `.only()` to run specific tests during development
3. **Skip Tests**: Use `.skip()` to temporarily skip tests
4. **Watch Mode**: UI mode has built-in watch functionality
5. **Parallel**: Tests run in parallel by default for speed

---

## 🆘 Troubleshooting

### Tests fail locally
- Clear browser cache: `npx playwright install --force`
- Check base URL is correct
- Ensure dev server is running

### Flaky tests
- Check console for timing issues
- Review test for proper waits
- Use UI mode to debug

### Slow tests
- Run specific suite instead of all tests
- Check network conditions
- Review for unnecessary waits

---

## 📚 Full Documentation

See **[E2E-README.md](./E2E-README.md)** for complete documentation.

---

## 🎉 You're Ready!

Run `npm run test:ui` to start testing!

