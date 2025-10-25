import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Calendar/Booking Page (/calendar)
 */
export class CalendarPage extends BasePage {
  readonly calendar: Locator;
  readonly timeSlots: Locator;
  readonly dateButtons: Locator;
  readonly bookingForm: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    
    this.calendar = page.locator('[class*="calendar"], .calendar-container, [role="grid"]');
    this.timeSlots = page.locator('[class*="time-slot"], .time-slot, button[data-time]');
    this.dateButtons = page.locator('[class*="date"], .date-button, button[data-date]');
    this.bookingForm = page.locator('form');
    this.submitButton = page.locator('button[type="submit"]');
  }

  /**
   * Navigate to calendar page
   */
  async goto(): Promise<void> {
    await super.goto('/calendar');
  }

  /**
   * Check if calendar is loaded
   */
  async isCalendarLoaded(): Promise<boolean> {
    return await this.calendar.isVisible();
  }

  /**
   * Select a date by index
   */
  async selectDate(index: number): Promise<void> {
    await this.dateButtons.nth(index).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Select a time slot by index
   */
  async selectTimeSlot(index: number): Promise<void> {
    await this.timeSlots.nth(index).click();
  }

  /**
   * Get available time slots count
   */
  async getAvailableTimeSlotsCount(): Promise<number> {
    return await this.timeSlots.count();
  }

  /**
   * Fill booking form
   */
  async fillBookingForm(data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    if (data.name) {
      await this.bookingForm.locator('input[name="name"], input[id*="name"]').fill(data.name);
    }
    if (data.email) {
      await this.bookingForm.locator('input[name="email"], input[type="email"]').fill(data.email);
    }
    if (data.phone) {
      await this.bookingForm.locator('input[name="phone"], input[tel="tel"]').fill(data.phone);
    }
  }

  /**
   * Submit booking
   */
  async submitBooking(): Promise<void> {
    await this.submitButton.click();
  }
}

