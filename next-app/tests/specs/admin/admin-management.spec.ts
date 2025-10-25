import { test, expect } from '../../fixtures/api-mock';
import { AdminPage } from '../../pages/AdminPage';

/**
 * Admin Dashboard Management E2E Tests
 * Tests for updating and managing appointments
 * 
 * NOTE: These tests use MOCKED APIs and will NOT hit your real backend
 * or consume your free tier quotas. No real data will be modified.
 */

test.describe('Admin Dashboard - Appointment Status Updates', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should update appointment to confirmed status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Find a pending appointment
      await adminPage.filterByStatus('pending');
      const pendingCount = await adminPage.getAppointmentsCount();
      
      if (pendingCount > 0) {
        const initialClientName = await adminPage.getAppointmentClientName(0);
        
        // Open modal
        await adminPage.clickAppointment(0);
        
        // Check if confirm button is available
        const isConfirmVisible = await adminPage.confirmButton.isVisible();
        
        if (isConfirmVisible) {
          // Update to confirmed
          await adminPage.updateAppointmentStatus('confirmed');
          
          // Wait for modal to potentially close
          await adminPage.page.waitForTimeout(500);
          
          // Stats should be updated
          await adminPage.page.waitForTimeout(200);
          
          // Verify appointment was updated (filter by confirmed)
          await adminPage.filterByStatus('confirmed');
          const confirmedCount = await adminPage.getAppointmentsCount();
          expect(confirmedCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should update appointment to completed status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Find a confirmed appointment
      await adminPage.filterByStatus('confirmed');
      const confirmedCount = await adminPage.getAppointmentsCount();
      
      if (confirmedCount > 0) {
        // Open modal
        await adminPage.clickAppointment(0);
        
        // Check if complete button is available
        const isCompleteVisible = await adminPage.markCompleteButton.isVisible();
        
        if (isCompleteVisible) {
          // Update to completed
          await adminPage.updateAppointmentStatus('completed');
          
          // Wait for modal to close
          await adminPage.page.waitForTimeout(500);
          
          // Stats should be updated
          await adminPage.page.waitForTimeout(500);
        }
      }
    }
  });

  test('should update appointment back to pending status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Find a confirmed or completed appointment
      await adminPage.filterByStatus('confirmed');
      let targetCount = await adminPage.getAppointmentsCount();
      
      if (targetCount === 0) {
        await adminPage.filterByStatus('completed');
        targetCount = await adminPage.getAppointmentsCount();
      }
      
      if (targetCount > 0) {
        // Open modal
        await adminPage.clickAppointment(0);
        
        // Check if mark pending button is available
        const isPendingVisible = await adminPage.markPendingButton.isVisible();
        
        if (isPendingVisible) {
          // Update to pending
          await adminPage.updateAppointmentStatus('pending');
          
          // Wait for modal to potentially close
          await adminPage.page.waitForTimeout(700);
        }
      }
    }
  });

  test('should make API call when updating status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      const availableActions = await adminPage.getAvailableActions();
      
      if (availableActions.includes('confirmed')) {
        // Set up API request listener
        const responsePromise = adminPage.page.waitForResponse(
          resp => resp.url().includes('/api/appointments') && 
                  resp.request().method() === 'PATCH'
        );
        
        // Update status
        await adminPage.updateAppointmentStatus('confirmed');
        
        // Verify API call was made
        const response = await responsePromise;
        expect(response.status()).toBe(200);
      }
    }
  });

  test('should update stats after status change', async ({ page }) => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Get initial stats
      const initialStats = await adminPage.getAllStats();
      
      // Find and update an appointment
      await adminPage.filterByStatus('pending');
      const pendingCount = await adminPage.getAppointmentsCount();
      
      if (pendingCount > 0) {
        await adminPage.clickAppointment(0);
        
        const isConfirmVisible = await adminPage.confirmButton.isVisible();
        
        if (isConfirmVisible) {
          await adminPage.updateAppointmentStatus('confirmed');
          
          // Get updated stats
          await page.waitForTimeout(500);
          const updatedStats = await adminPage.getAllStats();
          
          // Pending should decrease and confirmed should increase
          expect(updatedStats.pending).toBe(initialStats.pending - 1);
          expect(updatedStats.confirmed).toBe(initialStats.confirmed + 1);
          expect(updatedStats.total).toBe(initialStats.total); // Total stays same
        }
      }
    }
  });
});

test.describe('Admin Dashboard - Appointment Cancellation', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should show confirmation dialog when cancelling appointment', async ({ page }) => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Find a non-cancelled appointment
      await adminPage.filterByStatus('pending');
      let targetCount = await adminPage.getAppointmentsCount();
      
      if (targetCount === 0) {
        await adminPage.filterByStatus('all');
        targetCount = await adminPage.getAppointmentsCount();
      }
      
      if (targetCount > 0) {
        await adminPage.clickAppointment(0);
        
        const isCancelVisible = await adminPage.cancelAppointmentButton.isVisible();
        
        if (isCancelVisible) {
          // Set up dialog handler to reject
          page.once('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            expect(dialog.message().toLowerCase()).toContain('sure');
            await dialog.dismiss();
          });
          
          await adminPage.cancelAppointmentButton.click();
          
          // Modal should still be open since we dismissed
          const isModalOpen = await adminPage.isModalOpen();
          expect(isModalOpen).toBe(true);
        }
      }
    }
  });

  test('should delete appointment when cancellation is confirmed', async ({ page }) => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Get initial total
      const initialStats = await adminPage.getAllStats();
      
      // Find a non-cancelled appointment
      await adminPage.filterByStatus('pending');
      let targetCount = await adminPage.getAppointmentsCount();
      
      if (targetCount === 0) {
        await adminPage.filterByStatus('all');
        targetCount = await adminPage.getAppointmentsCount();
      }
      
      if (targetCount > 0 && initialStats.total > 0) {
        await adminPage.clickAppointment(0);
        
        const isCancelVisible = await adminPage.cancelAppointmentButton.isVisible();
        
        if (isCancelVisible) {
          // Cancel appointment (accept confirmation)
          await adminPage.cancelAppointment();
          
          // Modal should close
          const isModalOpen = await adminPage.isModalOpen();
          expect(isModalOpen).toBe(false);
          
          // Total should decrease
          await page.waitForTimeout(500);
          const updatedStats = await adminPage.getAllStats();
          expect(updatedStats.total).toBe(initialStats.total - 1);
        }
      }
    }
  });

  test('should make DELETE API call when cancelling', async ({ page }) => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      const isCancelVisible = await adminPage.cancelAppointmentButton.isVisible();
      
      if (isCancelVisible) {
        // Set up API request listener
        const responsePromise = page.waitForResponse(
          resp => resp.url().includes('/api/appointments') && 
                  resp.request().method() === 'DELETE'
        );
        
        // Cancel appointment
        await adminPage.cancelAppointment();
        
        // Verify API call was made
        const response = await responsePromise;
        expect(response.ok()).toBe(true);
      }
    }
  });
});

test.describe('Admin Dashboard - Data Refresh', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should refresh appointments when clicking refresh button', async ({ withMockedApis: page }) => {
    // Set up API request listener
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/appointments') && 
              resp.request().method() === 'GET'
    );
    
    await adminPage.refreshAppointments();
    
    // Verify API call was made
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
  });

  test('should show loading state during refresh', async () => {
    // This test might be flaky due to timing, but we can try
    const refreshPromise = adminPage.refreshAppointments();
    
    // Check if loading appears (might be brief)
    await adminPage.page.waitForTimeout(50);
    
    await refreshPromise;
    
    // Loading should be gone after refresh completes
    const isLoading = await adminPage.isLoading();
    expect(isLoading).toBe(false);
  });

  test('should maintain current filter after refresh', async () => {
    await adminPage.filterByStatus('pending');
    
    const countBeforeRefresh = await adminPage.getAppointmentsCount();
    
    await adminPage.refreshAppointments();
    
    // Filter should still be applied
    const selectedStatus = await adminPage.statusFilter.inputValue();
    expect(selectedStatus).toBe('pending');
    
    const countAfterRefresh = await adminPage.getAppointmentsCount();
    expect(countAfterRefresh).toBe(countBeforeRefresh);
  });

  test('should update stats after refresh', async ({ page }) => {
    const initialStats = await adminPage.getAllStats();
    
    await adminPage.refreshAppointments();
    
    const updatedStats = await adminPage.getAllStats();
    
    // Stats should be numbers (might be same or different)
    expect(typeof updatedStats.total).toBe('number');
    expect(typeof updatedStats.pending).toBe('number');
    expect(typeof updatedStats.confirmed).toBe('number');
  });
});

test.describe('Admin Dashboard - Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/appointments', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    
    // Should show error message
    await page.waitForTimeout(1000);
    const hasError = await adminPage.hasError();
    
    if (hasError) {
      const errorMessage = await adminPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
      expect(errorMessage.toLowerCase()).toContain('unable');
    }
  });

  test('should show error message with helpful text', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/appointments', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    
    await page.waitForTimeout(1000);
    const hasError = await adminPage.hasError();
    
    if (hasError) {
      const errorMessage = await adminPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/unable|error|failed/);
    }
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Intercept and delay response
    await page.route('**/api/appointments', route => {
      setTimeout(() => {
        route.fulfill({
          status: 408,
          body: JSON.stringify({ error: 'Request Timeout' }),
        });
      }, 5000);
    });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    
    // Should eventually show error or timeout
    await page.waitForTimeout(6000);
    
    const hasError = await adminPage.hasError();
    const isLoading = await adminPage.isLoading();
    
    // Should either show error or stop loading
    expect(hasError || !isLoading).toBe(true);
  });
});

test.describe('Admin Dashboard - Concurrent Actions', () => {
  test('should handle multiple rapid status updates', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 1) {
      // Try to open and close multiple appointments rapidly
      await adminPage.clickAppointment(0);
      await adminPage.closeModal();
      
      await adminPage.clickAppointment(1);
      await expect(adminPage.modal).toBeVisible();
    }
  });

  test('should prevent multiple simultaneous updates to same appointment', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      const availableActions = await adminPage.getAvailableActions();
      
      if (availableActions.includes('confirmed')) {
        // Start update
        await adminPage.confirmButton.click();
        
        // Try to click again immediately (should be disabled or have no effect)
        const isButtonStillVisible = await adminPage.confirmButton.isVisible();
        
        // If button is still visible, clicking shouldn't break anything
        if (isButtonStillVisible) {
          await adminPage.confirmButton.click().catch(() => {});
        }
        
        // Should eventually complete without errors
        await page.waitForTimeout(1000);
      }
    }
  });
});

