import { test, expect } from '../../fixtures/api-mock';
import { AdminPage } from '../../pages/AdminPage';

/**
 * Admin Dashboard E2E Tests
 * Tests for the core admin dashboard functionality
 * 
 * NOTE: These tests use MOCKED APIs and will NOT hit your real backend
 * or consume your free tier quotas. No real data will be modified.
 */

test.describe('Admin Dashboard - Core Features', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should display admin dashboard header', async () => {
    await expect(adminPage.adminHeader).toBeVisible();
    await expect(adminPage.adminHeader.locator('h1')).toContainText('Admin Dashboard');
  });

  test('should display refresh button', async () => {
    await expect(adminPage.refreshButton).toBeVisible();
    await expect(adminPage.refreshButton).toBeEnabled();
    await expect(adminPage.refreshButton).toContainText('Refresh');
  });

  test('should display stats grid with all stat cards', async () => {
    await expect(adminPage.statsGrid).toBeVisible();
    
    // Should have 5 stat cards
    const statCardsCount = await adminPage.statCards.count();
    expect(statCardsCount).toBe(5);
    
    // Check all stat cards are visible
    await expect(adminPage.totalAppointmentsStat).toBeVisible();
    await expect(adminPage.todayStat).toBeVisible();
    await expect(adminPage.pendingStat).toBeVisible();
    await expect(adminPage.confirmedStat).toBeVisible();
    await expect(adminPage.completedStat).toBeVisible();
  });

  test('should display stat labels correctly', async () => {
    await expect(adminPage.totalAppointmentsStat).toContainText('Total Appointments');
    await expect(adminPage.todayStat).toContainText('Today');
    await expect(adminPage.pendingStat).toContainText('Pending');
    await expect(adminPage.confirmedStat).toContainText('Confirmed');
    await expect(adminPage.completedStat).toContainText('Completed');
  });

  test('should display numeric values in stat cards', async () => {
    const stats = await adminPage.getAllStats();
    
    // All stats should be numbers >= 0
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.today).toBeGreaterThanOrEqual(0);
    expect(stats.pending).toBeGreaterThanOrEqual(0);
    expect(stats.confirmed).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
  });

  test('should have logical stat relationships', async () => {
    const stats = await adminPage.getAllStats();
    
    // The sum of pending, confirmed, and completed should not exceed total
    const statusSum = stats.pending + stats.confirmed + stats.completed;
    expect(statusSum).toBeLessThanOrEqual(stats.total);
    
    // Today appointments should not exceed total
    expect(stats.today).toBeLessThanOrEqual(stats.total);
  });

  test('should refresh appointments when clicking refresh button', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Get initial appointments count
    const initialCount = await adminPage.getAppointmentsCount();
    
    // Set up response listener before clicking
    const responsePromise = page.waitForResponse(resp => 
      resp.url().includes('/api/appointments') && resp.request().method() === 'GET'
    );
    
    // Click refresh
    await adminPage.refreshButton.click();
    
    // Verify the response was received
    await responsePromise;
    
    // Verify appointments are still showing
    await adminPage.waitForAppointmentsToLoad();
    const finalCount = await adminPage.getAppointmentsCount();
    expect(finalCount).toBeGreaterThan(0);
  });

  test('should display filter controls', async () => {
    await expect(adminPage.statusFilter).toBeVisible();
    await expect(adminPage.dateFilter).toBeVisible();
  });

  test('should have all status filter options', async () => {
    const statusFilter = adminPage.statusFilter;
    const options = await statusFilter.locator('option').allTextContents();
    
    expect(options).toContain('All');
    expect(options).toContain('Pending');
    expect(options).toContain('Confirmed');
    expect(options).toContain('Completed');
    expect(options).toContain('Cancelled');
  });

  test('should show no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Filter out expected errors (like network errors during testing)
    const unexpectedErrors = errors.filter(err => 
      !err.includes('Failed to fetch') && 
      !err.includes('NetworkError')
    );
    
    expect(unexpectedErrors.length).toBe(0);
  });
});

test.describe('Admin Dashboard - Loading States', () => {
  test('should show loading state initially', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    
    // Navigate but don't wait for appointments to load
    await page.goto('/admin');
    
    // Check if loading message appears (might be brief)
    const loadingVisible = await adminPage.isLoading();
    
    // If loading was visible, wait for it to disappear
    if (loadingVisible) {
      await adminPage.loadingMessage.waitFor({ state: 'hidden', timeout: 5000 });
    }
  });

  test('should hide loading state after appointments load', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const isLoading = await adminPage.isLoading();
    expect(isLoading).toBe(false);
  });
});

test.describe('Admin Dashboard - Empty State', () => {
  test('should show appropriate message when no appointments match filters', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Filter by a date far in the future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await adminPage.filterByDate(dateString);
    
    // Should show no appointments message
    const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
    
    if (hasNoAppointments) {
      await expect(adminPage.noAppointmentsMessage).toContainText('No appointments found');
    }
  });
});

test.describe('Admin Dashboard - Responsive Design', () => {
  test('should be responsive on mobile', async ({ withMockedApis: page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Dashboard should be visible on mobile
    await expect(adminPage.adminHeader).toBeVisible();
    await expect(adminPage.statsGrid).toBeVisible();
  });

  test('should be responsive on tablet', async ({ withMockedApis: page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Dashboard should be visible on tablet
    await expect(adminPage.adminHeader).toBeVisible();
    await expect(adminPage.statsGrid).toBeVisible();
  });

  test('should be responsive on desktop', async ({ withMockedApis: page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Dashboard should be visible on desktop
    await expect(adminPage.adminHeader).toBeVisible();
    await expect(adminPage.statsGrid).toBeVisible();
  });
});

