import { test, expect } from '../../fixtures/api-mock';
import { AdminPage } from '../../pages/AdminPage';

/**
 * Admin Dashboard Filters E2E Tests
 * Tests for filtering functionality
 * 
 * NOTE: These tests use MOCKED APIs and will NOT hit your real backend
 * or consume your free tier quotas. No real data will be modified.
 */

test.describe('Admin Dashboard - Status Filtering', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should filter appointments by pending status', async () => {
    // Get pending count from stats
    const stats = await adminPage.getAllStats();
    const expectedPendingCount = stats.pending;
    
    // Apply pending filter
    await adminPage.filterByStatus('pending');
    
    // Get visible appointments
    const visibleCount = await adminPage.getAppointmentsCount();
    
    // Verify count matches (if there are any appointments)
    if (expectedPendingCount > 0) {
      expect(visibleCount).toBe(expectedPendingCount);
      
      // Verify all visible appointments have pending status
      for (let i = 0; i < visibleCount; i++) {
        const status = await adminPage.getAppointmentStatus(i);
        expect(status.toLowerCase()).toContain('pending');
      }
    } else {
      // Should show no appointments message
      const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
      expect(hasNoAppointments).toBe(true);
    }
  });

  test('should filter appointments by confirmed status', async () => {
    const stats = await adminPage.getAllStats();
    const expectedConfirmedCount = stats.confirmed;
    
    await adminPage.filterByStatus('confirmed');
    
    const visibleCount = await adminPage.getAppointmentsCount();
    
    if (expectedConfirmedCount > 0) {
      expect(visibleCount).toBe(expectedConfirmedCount);
      
      // Verify all visible appointments have confirmed status
      for (let i = 0; i < visibleCount; i++) {
        const status = await adminPage.getAppointmentStatus(i);
        expect(status.toLowerCase()).toContain('confirmed');
      }
    }
  });

  test('should filter appointments by completed status', async () => {
    const stats = await adminPage.getAllStats();
    const expectedCompletedCount = stats.completed;
    
    await adminPage.filterByStatus('completed');
    
    const visibleCount = await adminPage.getAppointmentsCount();
    
    if (expectedCompletedCount > 0) {
      expect(visibleCount).toBe(expectedCompletedCount);
      
      // Verify all visible appointments have completed status
      for (let i = 0; i < visibleCount; i++) {
        const status = await adminPage.getAppointmentStatus(i);
        expect(status.toLowerCase()).toContain('completed');
      }
    }
  });

  test('should show all appointments when "all" filter is selected', async () => {
    // First apply a filter
    await adminPage.filterByStatus('pending');
    
    // Then select "all"
    await adminPage.filterByStatus('all');
    
    const stats = await adminPage.getAllStats();
    const visibleCount = await adminPage.getAppointmentsCount();
    
    // Visible count should match total (or show no appointments message)
    if (stats.total > 0) {
      expect(visibleCount).toBeGreaterThan(0);
    }
  });

  test('should filter appointments by cancelled status', async () => {
    await adminPage.filterByStatus('cancelled');
    
    // Either there are cancelled appointments or no appointments message
    const hasAppointments = await adminPage.getAppointmentsCount() > 0;
    const hasNoAppointmentsMsg = await adminPage.isNoAppointmentsMessageVisible();
    
    expect(hasAppointments || hasNoAppointmentsMsg).toBe(true);
  });
});

test.describe('Admin Dashboard - Date Filtering', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should filter appointments by today\'s date', async () => {
    const today = new Date().toISOString().split('T')[0];
    
    await adminPage.filterByDate(today);
    
    const stats = await adminPage.getAllStats();
    const visibleCount = await adminPage.getAppointmentsCount();
    
    // Visible count should match today count
    if (stats.today > 0) {
      expect(visibleCount).toBe(stats.today);
    } else {
      const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
      expect(hasNoAppointments).toBe(true);
    }
  });

  test('should show clear button when date filter is applied', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await adminPage.filterByDate(dateString);
    
    // Clear button should appear
    await expect(adminPage.clearDateFilterButton).toBeVisible();
  });

  test('should clear date filter when clicking clear button', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Apply date filter
    await adminPage.filterByDate(dateString);
    await expect(adminPage.clearDateFilterButton).toBeVisible();
    
    // Get count with filter
    const filteredCount = await adminPage.getAppointmentsCount();
    
    // Clear filter
    await adminPage.clearDateFilter();
    
    // Clear button should disappear
    const clearButtonVisible = await adminPage.clearDateFilterButton.isVisible();
    expect(clearButtonVisible).toBe(false);
    
    // Should show all appointments again
    const unfilteredCount = await adminPage.getAppointmentsCount();
    
    // Unfiltered should have same or more appointments
    expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should filter by date far in future (should show no appointments)', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await adminPage.filterByDate(dateString);
    
    // Should show no appointments message
    const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
    expect(hasNoAppointments).toBe(true);
    
    // Should suggest adjusting filters
    await expect(adminPage.noAppointmentsMessage).toContainText('No appointments found');
  });
});

test.describe('Admin Dashboard - Combined Filters', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should apply both status and date filters together', async () => {
    // Apply status filter
    await adminPage.filterByStatus('pending');
    
    // Then apply date filter
    const today = new Date().toISOString().split('T')[0];
    await adminPage.filterByDate(today);
    
    const visibleCount = await adminPage.getAppointmentsCount();
    
    // All visible appointments should be pending and today
    for (let i = 0; i < visibleCount; i++) {
      const status = await adminPage.getAppointmentStatus(i);
      expect(status.toLowerCase()).toContain('pending');
    }
  });

  test('should maintain status filter when changing date filter', async () => {
    await adminPage.filterByStatus('confirmed');
    
    const today = new Date().toISOString().split('T')[0];
    await adminPage.filterByDate(today);
    
    // Status filter should still be "confirmed"
    const selectedStatus = await adminPage.statusFilter.inputValue();
    expect(selectedStatus).toBe('confirmed');
  });

  test('should maintain date filter when changing status filter', async () => {
    const today = new Date().toISOString().split('T')[0];
    await adminPage.filterByDate(today);
    
    await adminPage.filterByStatus('pending');
    
    // Date filter should still be set
    const selectedDate = await adminPage.dateFilter.inputValue();
    expect(selectedDate).toBe(today);
  });

  test('should reset to all appointments when clearing all filters', async () => {
    // Apply both filters
    await adminPage.filterByStatus('pending');
    const today = new Date().toISOString().split('T')[0];
    await adminPage.filterByDate(today);
    
    // Clear filters
    await adminPage.filterByStatus('all');
    await adminPage.clearDateFilter();
    
    // Should show all appointments
    const stats = await adminPage.getAllStats();
    const visibleCount = await adminPage.getAppointmentsCount();
    
    if (stats.total > 0) {
      expect(visibleCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Dashboard - Filter Persistence', () => {
  test('should maintain filter state after refresh', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Apply filters
    await adminPage.filterByStatus('pending');
    
    const countBeforeRefresh = await adminPage.getAppointmentsCount();
    
    // Refresh appointments
    await adminPage.refreshAppointments();
    
    // Filter should still be applied
    const selectedStatus = await adminPage.statusFilter.inputValue();
    expect(selectedStatus).toBe('pending');
    
    const countAfterRefresh = await adminPage.getAppointmentsCount();
    expect(countAfterRefresh).toBe(countBeforeRefresh);
  });
});

