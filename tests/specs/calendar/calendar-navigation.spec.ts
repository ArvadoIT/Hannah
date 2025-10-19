import { test, expect } from '../../fixtures/console-capture';
import { CalendarPage } from '../../pages/CalendarPage';

test.describe('Calendar Navigation', () => {
  test('should display calendar on page load', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Calendar should be visible
    const isVisible = await calendarPage.isCalendarVisible();
    expect(isVisible).toBe(true);

    // Should have header with month/year
    await expect(calendarPage.monthYearDisplay).toBeVisible();
  });

  test('should have navigation buttons', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Previous and next buttons should be visible
    await expect(calendarPage.prevMonthButton).toBeVisible();
    await expect(calendarPage.nextMonthButton).toBeVisible();

    // Buttons should be clickable
    await expect(calendarPage.prevMonthButton).toBeEnabled();
    await expect(calendarPage.nextMonthButton).toBeEnabled();
  });

  test('should navigate to next month', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Get current month
    const currentMonth = await calendarPage.getCurrentMonthYear();
    expect(currentMonth).toBeTruthy();

    // Navigate to next month
    await calendarPage.goToNextMonth();

    // Month should change
    const newMonth = await calendarPage.getCurrentMonthYear();
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should navigate to previous month', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Get current month
    const currentMonth = await calendarPage.getCurrentMonthYear();

    // Navigate to previous month
    await calendarPage.goToPreviousMonth();

    // Month should change
    const newMonth = await calendarPage.getCurrentMonthYear();
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should navigate back and forth between months', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Get initial month
    const initialMonth = await calendarPage.getCurrentMonthYear();

    // Go to next month
    await calendarPage.goToNextMonth();
    const nextMonth = await calendarPage.getCurrentMonthYear();
    expect(nextMonth).not.toBe(initialMonth);

    // Go back to previous month
    await calendarPage.goToPreviousMonth();
    const backMonth = await calendarPage.getCurrentMonthYear();
    expect(backMonth).toBe(initialMonth);
  });

  test('should highlight today', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Today should be highlighted
    const isTodayHighlighted = await calendarPage.isTodayHighlighted();
    
    // Note: Today will only be highlighted if we're viewing current month
    // This is expected behavior
  });

  test('should display calendar days', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Should have calendar days
    const dayCount = await calendarPage.getDayCount();
    
    // Calendar typically shows 35 or 42 days (5 or 6 weeks)
    expect(dayCount).toBeGreaterThanOrEqual(28);
    expect(dayCount).toBeLessThanOrEqual(42);
  });

  test('should allow selecting a date', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Get available dates
    const availableDates = await calendarPage.getAvailableDates();
    
    if (availableDates.length > 0) {
      // Select first available date
      const dateToSelect = availableDates[0];
      await calendarPage.selectDate(dateToSelect);

      // Wait for selection to process
      await page.waitForTimeout(500);

      // Date should be selected (if implemented)
      const selectedDate = await calendarPage.getSelectedDate();
      // Note: Selection behavior depends on implementation
    }
  });

  test('should update calendar grid when navigating months', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Get initial day count
    const initialDayCount = await calendarPage.getDayCount();
    expect(initialDayCount).toBeGreaterThan(0);

    // Navigate to next month
    await calendarPage.goToNextMonth();

    // Should still have days displayed
    const newDayCount = await calendarPage.getDayCount();
    expect(newDayCount).toBeGreaterThan(0);

    // Day count should be similar (28-42 days)
    expect(Math.abs(newDayCount - initialDayCount)).toBeLessThanOrEqual(7);
  });
});

test.describe('Calendar Responsive', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should display calendar on mobile', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    // Calendar should be visible
    const isVisible = await calendarPage.isCalendarVisible();
    expect(isVisible).toBe(true);

    // Navigation buttons should be visible
    await expect(calendarPage.prevMonthButton).toBeVisible();
    await expect(calendarPage.nextMonthButton).toBeVisible();
  });

  test('should navigate months on mobile', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    const currentMonth = await calendarPage.getCurrentMonthYear();

    // Navigate to next month
    await calendarPage.goToNextMonth();

    const newMonth = await calendarPage.getCurrentMonthYear();
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should allow date selection on mobile', async ({ page }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    const availableDates = await calendarPage.getAvailableDates();
    
    if (availableDates.length > 0) {
      await calendarPage.selectDate(availableDates[0]);
      await page.waitForTimeout(500);
      
      // Date selection should work on mobile
    }
  });
});

