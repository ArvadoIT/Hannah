import { Page, Locator } from '@playwright/test';

/**
 * Calendar Page Object
 */
export class CalendarPage {
  readonly page: Page;
  readonly calendarContainer: Locator;
  readonly calendarHeader: Locator;
  readonly monthYearDisplay: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly calendarGrid: Locator;
  readonly calendarDays: Locator;
  readonly todayCell: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.calendarContainer = page.locator('.calendar-container');
    this.calendarHeader = page.locator('.calendar-controls');
    this.monthYearDisplay = page.locator('#current-month-year, .calendar-month-year');
    this.prevMonthButton = page.locator('#prev-month');
    this.nextMonthButton = page.locator('#next-month');
    this.calendarGrid = page.locator('#calendar-grid');
    this.calendarDays = page.locator('.calendar-day:not(.calendar-day-header)');
    this.todayCell = page.locator('.calendar-day.today');
  }

  /**
   * Navigate to calendar page
   */
  async goto(): Promise<void> {
    // Set admin authentication in localStorage to bypass login
    await this.page.evaluate(() => {
      localStorage.setItem('adminUser', JSON.stringify({
        name: 'Test Admin',
        role: 'admin',
        username: 'testadmin'
      }));
    });
    
    await this.page.goto('/calendar.html');
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for admin dashboard to be visible
    await this.page.locator('#admin-dashboard').waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for calendar to be initialized
    await this.calendarGrid.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get current month and year displayed
   */
  async getCurrentMonthYear(): Promise<string> {
    return await this.monthYearDisplay.textContent() || '';
  }

  /**
   * Navigate to previous month
   */
  async goToPreviousMonth(): Promise<void> {
    const currentMonth = await this.getCurrentMonthYear();
    await this.prevMonthButton.click();
    
    // Wait for month to change
    await this.page.waitForFunction(
      (oldMonth) => {
        const display = document.querySelector('#current-month-year');
        return display?.textContent !== oldMonth;
      },
      currentMonth,
      { timeout: 3000 }
    );
  }

  /**
   * Navigate to next month
   */
  async goToNextMonth(): Promise<void> {
    const currentMonth = await this.getCurrentMonthYear();
    await this.nextMonthButton.click();
    
    // Wait for month to change
    await this.page.waitForFunction(
      (oldMonth) => {
        const display = document.querySelector('#current-month-year');
        return display?.textContent !== oldMonth;
      },
      currentMonth,
      { timeout: 3000 }
    );
  }

  /**
   * Check if today is highlighted
   */
  async isTodayHighlighted(): Promise<boolean> {
    return await this.todayCell.count() > 0 && await this.todayCell.isVisible();
  }

  /**
   * Select a date by day number
   */
  async selectDate(dayNumber: number): Promise<void> {
    const dayCell = this.page.locator(
      `.calendar-day:not(.other-month):not(.calendar-day-header):has-text("${dayNumber}")`
    ).first();
    
    await dayCell.click();
  }

  /**
   * Get all available dates (not disabled)
   */
  async getAvailableDates(): Promise<number[]> {
    const dates: number[] = [];
    const count = await this.calendarDays.count();
    
    for (let i = 0; i < count; i++) {
      const day = this.calendarDays.nth(i);
      const isDisabled = await day.evaluate((el) => el.classList.contains('disabled'));
      
      if (!isDisabled) {
        const text = await day.textContent();
        const dayNum = parseInt(text?.trim() || '0', 10);
        if (dayNum > 0) dates.push(dayNum);
      }
    }
    
    return dates;
  }

  /**
   * Get selected date
   */
  async getSelectedDate(): Promise<string | null> {
    const selected = this.page.locator('.calendar-day.selected');
    
    if (await selected.count() > 0) {
      return await selected.textContent();
    }
    
    return null;
  }

  /**
   * Check if calendar grid is visible
   */
  async isCalendarVisible(): Promise<boolean> {
    return await this.calendarGrid.isVisible();
  }

  /**
   * Get number of days displayed in calendar
   */
  async getDayCount(): Promise<number> {
    return await this.calendarDays.count();
  }
}

