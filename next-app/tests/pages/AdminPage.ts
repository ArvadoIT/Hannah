import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Admin Page (/admin)
 */
export class AdminPage extends BasePage {
  // Dashboard elements
  readonly adminHeader: Locator;
  readonly refreshButton: Locator;
  readonly statsGrid: Locator;
  readonly statCards: Locator;
  readonly totalAppointmentsStat: Locator;
  readonly todayStat: Locator;
  readonly pendingStat: Locator;
  readonly confirmedStat: Locator;
  readonly completedStat: Locator;

  // Filters
  readonly statusFilter: Locator;
  readonly dateFilter: Locator;
  readonly clearDateFilterButton: Locator;

  // Appointments list
  readonly appointmentsList: Locator;
  readonly appointmentCards: Locator;
  readonly noAppointmentsMessage: Locator;
  readonly loadingMessage: Locator;
  readonly errorMessage: Locator;

  // Modal
  readonly modal: Locator;
  readonly modalOverlay: Locator;
  readonly modalHeader: Locator;
  readonly modalCloseButton: Locator;
  readonly modalBody: Locator;
  readonly modalActions: Locator;
  readonly markPendingButton: Locator;
  readonly confirmButton: Locator;
  readonly markCompleteButton: Locator;
  readonly cancelAppointmentButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Dashboard elements
    this.adminHeader = page.locator('.admin-header');
    this.refreshButton = page.locator('.refresh-btn');
    this.statsGrid = page.locator('.stats-grid');
    this.statCards = page.locator('.stat-card');
    this.totalAppointmentsStat = page.locator('.stat-card').nth(0);
    this.todayStat = page.locator('.stat-card').nth(1);
    this.pendingStat = page.locator('.stat-card').nth(2);
    this.confirmedStat = page.locator('.stat-card').nth(3);
    this.completedStat = page.locator('.stat-card').nth(4);

    // Filters
    this.statusFilter = page.locator('#status-filter');
    this.dateFilter = page.locator('#date-filter');
    this.clearDateFilterButton = page.locator('.clear-filter');

    // Appointments list
    this.appointmentsList = page.locator('.appointments-list');
    this.appointmentCards = page.locator('.appointment-card');
    this.noAppointmentsMessage = page.locator('.no-appointments');
    this.loadingMessage = page.locator('.loading');
    this.errorMessage = page.locator('.error-message');

    // Modal
    this.modal = page.locator('.modal-content');
    this.modalOverlay = page.locator('.modal-overlay');
    this.modalHeader = page.locator('.modal-header');
    this.modalCloseButton = page.locator('.close-btn');
    this.modalBody = page.locator('.modal-body');
    this.modalActions = page.locator('.modal-actions');
    this.markPendingButton = page.locator('.action-btn.pending');
    this.confirmButton = page.locator('.action-btn.confirmed');
    this.markCompleteButton = page.locator('.action-btn.completed');
    this.cancelAppointmentButton = page.locator('.action-btn.cancelled');
  }

  /**
   * Navigate to admin page
   */
  async goto(): Promise<void> {
    await super.goto('/admin');
  }

  /**
   * Wait for appointments to load
   */
  async waitForAppointmentsToLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await this.loadingMessage.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  /**
   * Get stat value
   */
  async getStatValue(statCard: Locator): Promise<number> {
    const text = await statCard.locator('.stat-value').textContent();
    return parseInt(text || '0', 10);
  }

  /**
   * Get all stat values
   */
  async getAllStats(): Promise<{
    total: number;
    today: number;
    pending: number;
    confirmed: number;
    completed: number;
  }> {
    return {
      total: await this.getStatValue(this.totalAppointmentsStat),
      today: await this.getStatValue(this.todayStat),
      pending: await this.getStatValue(this.pendingStat),
      confirmed: await this.getStatValue(this.confirmedStat),
      completed: await this.getStatValue(this.completedStat),
    };
  }

  /**
   * Refresh appointments
   */
  async refreshAppointments(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForAppointmentsToLoad();
  }

  /**
   * Filter by status
   */
  async filterByStatus(status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(300); // Wait for filter to apply
  }

  /**
   * Filter by date
   */
  async filterByDate(date: string): Promise<void> {
    await this.dateFilter.fill(date);
    await this.page.waitForTimeout(300); // Wait for filter to apply
  }

  /**
   * Clear date filter
   */
  async clearDateFilter(): Promise<void> {
    await this.clearDateFilterButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get number of visible appointments
   */
  async getAppointmentsCount(): Promise<number> {
    const isListVisible = await this.appointmentsList.isVisible();
    if (!isListVisible) return 0;
    return await this.appointmentCards.count();
  }

  /**
   * Click on an appointment by index
   */
  async clickAppointment(index: number): Promise<void> {
    await this.appointmentCards.nth(index).click();
    await this.modal.waitFor({ state: 'visible' });
  }

  /**
   * Get appointment client name by index
   */
  async getAppointmentClientName(index: number): Promise<string> {
    return await this.appointmentCards.nth(index).locator('h3').textContent() || '';
  }

  /**
   * Get appointment status by index
   */
  async getAppointmentStatus(index: number): Promise<string> {
    return await this.appointmentCards.nth(index).locator('.status-badge').textContent() || '';
  }

  /**
   * Check if modal is open
   */
  async isModalOpen(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  /**
   * Close modal using close button
   */
  async closeModal(): Promise<void> {
    await this.modalCloseButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  /**
   * Close modal using overlay
   */
  async closeModalViaOverlay(): Promise<void> {
    // Use force: true to click through any overlapping elements
    await this.modalOverlay.click({ position: { x: 10, y: 10 }, force: true });
    await this.modal.waitFor({ state: 'hidden' });
  }

  /**
   * Get modal detail value
   */
  async getModalDetailValue(label: string): Promise<string> {
    const detailRow = this.modalBody.locator('.detail-row', { hasText: label });
    return await detailRow.locator('span').textContent() || '';
  }

  /**
   * Update appointment status via modal
   */
  async updateAppointmentStatus(status: 'pending' | 'confirmed' | 'completed'): Promise<void> {
    let button: Locator;
    switch (status) {
      case 'pending':
        button = this.markPendingButton;
        break;
      case 'confirmed':
        button = this.confirmButton;
        break;
      case 'completed':
        button = this.markCompleteButton;
        break;
    }
    
    await button.click();
    await this.waitForAppointmentsToLoad();
  }

  /**
   * Cancel appointment via modal
   */
  async cancelAppointment(): Promise<void> {
    // Handle the confirm dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.cancelAppointmentButton.click();
    await this.waitForAppointmentsToLoad();
  }

  /**
   * Get available status action buttons
   */
  async getAvailableActions(): Promise<string[]> {
    const actions: string[] = [];
    
    if (await this.markPendingButton.isVisible()) actions.push('pending');
    if (await this.confirmButton.isVisible()) actions.push('confirmed');
    if (await this.markCompleteButton.isVisible()) actions.push('completed');
    if (await this.cancelAppointmentButton.isVisible()) actions.push('cancel');
    
    return actions;
  }

  /**
   * Check if no appointments message is shown
   */
  async isNoAppointmentsMessageVisible(): Promise<boolean> {
    return await this.noAppointmentsMessage.isVisible();
  }

  /**
   * Check if loading message is shown
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if error message is shown
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

