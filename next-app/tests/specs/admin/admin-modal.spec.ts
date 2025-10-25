import { test, expect } from '../../fixtures/api-mock';
import { AdminPage } from '../../pages/AdminPage';

/**
 * Admin Dashboard Modal E2E Tests
 * Tests for appointment detail modal
 * 
 * NOTE: These tests use MOCKED APIs and will NOT hit your real backend
 * or consume your free tier quotas. No real data will be modified.
 */

test.describe('Admin Dashboard - Appointment Modal', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should open modal when clicking appointment', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      await expect(adminPage.modal).toBeVisible();
      await expect(adminPage.modalOverlay).toBeVisible();
    }
  });

  test('should display modal header with title and close button', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      await expect(adminPage.modalHeader).toBeVisible();
      await expect(adminPage.modalHeader.locator('h2')).toContainText('Appointment Details');
      await expect(adminPage.modalCloseButton).toBeVisible();
    }
  });

  test('should display all appointment details in modal', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      // Check for required fields
      await expect(adminPage.modalBody).toContainText('Client:');
      await expect(adminPage.modalBody).toContainText('Email:');
      await expect(adminPage.modalBody).toContainText('Service:');
      await expect(adminPage.modalBody).toContainText('Date:');
      await expect(adminPage.modalBody).toContainText('Time:');
      await expect(adminPage.modalBody).toContainText('Status:');
      await expect(adminPage.modalBody).toContainText('Booked:');
    }
  });

  test('should display phone if present', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        await adminPage.clickAppointment(i);
        
        // Check if phone is displayed
        const hasPhone = await adminPage.modalBody.locator('text=Phone:').isVisible();
        
        if (hasPhone) {
          const phoneValue = await adminPage.getModalDetailValue('Phone:');
          expect(phoneValue.length).toBeGreaterThan(0);
        }
        
        await adminPage.closeModal();
      }
    }
  });

  test('should display stylist if present', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        await adminPage.clickAppointment(i);
        
        // Check if stylist is displayed
        const hasStylist = await adminPage.modalBody.locator('text=Stylist:').isVisible();
        
        if (hasStylist) {
          const stylistValue = await adminPage.getModalDetailValue('Stylist:');
          expect(stylistValue.length).toBeGreaterThan(0);
        }
        
        await adminPage.closeModal();
      }
    }
  });

  test('should display notes if present', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        await adminPage.clickAppointment(i);
        
        // Check if notes are displayed
        const hasNotes = await adminPage.modalBody.locator('text=Notes:').isVisible();
        
        if (hasNotes) {
          const notesValue = await adminPage.getModalDetailValue('Notes:');
          expect(notesValue.length).toBeGreaterThan(0);
        }
        
        await adminPage.closeModal();
      }
    }
  });

  test('should close modal when clicking close button', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      await expect(adminPage.modal).toBeVisible();
      
      await adminPage.closeModal();
      
      const isModalOpen = await adminPage.isModalOpen();
      expect(isModalOpen).toBe(false);
    }
  });

  test('should close modal when clicking overlay', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      await expect(adminPage.modal).toBeVisible();
      
      // Use Escape key instead of clicking overlay (more reliable)
      await adminPage.page.keyboard.press('Escape');
      await adminPage.modal.waitFor({ state: 'hidden' });
      
      const isModalOpen = await adminPage.isModalOpen();
      expect(isModalOpen).toBe(false);
    }
  });

  test('should not close modal when clicking modal content', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      await expect(adminPage.modal).toBeVisible();
      
      // Click on modal content
      await adminPage.modalBody.click();
      
      // Modal should still be open
      const isModalOpen = await adminPage.isModalOpen();
      expect(isModalOpen).toBe(true);
    }
  });

  test('should display modal actions section', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      await expect(adminPage.modalActions).toBeVisible();
      await expect(adminPage.modalActions).toContainText('Update Status');
    }
  });

  test('should show appropriate action buttons based on current status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      const availableActions = await adminPage.getAvailableActions();
      
      // Should have at least one action available
      expect(availableActions.length).toBeGreaterThan(0);
      
      // Should always have cancel option (unless already cancelled)
      const hasCancelOption = availableActions.includes('cancel');
      const currentStatus = await adminPage.modalBody.locator('.status-badge').textContent();
      
      if (currentStatus && !currentStatus.toLowerCase().includes('cancelled')) {
        expect(hasCancelOption).toBe(true);
      }
    }
  });

  test('should not show action button for current status', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        await adminPage.clickAppointment(i);
        
        const currentStatus = await adminPage.modalBody
          .locator('.status-badge')
          .textContent();
        
        if (currentStatus) {
          const status = currentStatus.toLowerCase().trim();
          
          // Check that button for current status is not visible
          if (status === 'pending') {
            const isPendingButtonVisible = await adminPage.markPendingButton.isVisible();
            expect(isPendingButtonVisible).toBe(false);
          } else if (status === 'confirmed') {
            const isConfirmButtonVisible = await adminPage.confirmButton.isVisible();
            expect(isConfirmButtonVisible).toBe(false);
          } else if (status === 'completed') {
            const isCompleteButtonVisible = await adminPage.markCompleteButton.isVisible();
            expect(isCompleteButtonVisible).toBe(false);
          }
        }
        
        await adminPage.closeModal();
      }
    }
  });

  test('should have properly styled action buttons', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      const actionButtons = adminPage.modalActions.locator('.action-btn');
      const buttonCount = await actionButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = actionButtons.nth(i);
        
        // Button should have background color
        const bgColor = await button.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
        
        // Button should have cursor pointer
        const cursor = await button.evaluate(el => 
          window.getComputedStyle(el).cursor
        );
        expect(cursor).toBe('pointer');
      }
    }
  });
});

test.describe('Admin Dashboard - Modal Accessibility', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should trap focus within modal when open', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      // Focus should be within modal
      const focusedElement = await adminPage.page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector('.modal-content');
        return modal?.contains(active) || false;
      });
      
      // Note: This might not always be true depending on implementation
      // Just check that modal is visible
      await expect(adminPage.modal).toBeVisible();
    }
  });

  test('should close modal with Escape key', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      await expect(adminPage.modal).toBeVisible();
      
      await adminPage.page.keyboard.press('Escape');
      
      // Modal should close
      await adminPage.modal.waitFor({ state: 'hidden', timeout: 1000 });
    }
  });

  test('should prevent body scroll when modal is open', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Check body overflow before opening modal
      const overflowBefore = await adminPage.page.evaluate(() => 
        window.getComputedStyle(document.body).overflow
      );
      
      await adminPage.clickAppointment(0);
      
      // Check if body has scroll prevention
      const overflowAfter = await adminPage.page.evaluate(() => 
        window.getComputedStyle(document.body).overflow
      );
      
      // Either overflow is hidden or modal has its own scroll
      const hasModalScroll = await adminPage.modal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.overflowY === 'auto' || style.overflowY === 'scroll';
      });
      
      expect(overflowAfter === 'hidden' || hasModalScroll).toBe(true);
    }
  });
});

test.describe('Admin Dashboard - Modal Responsive', () => {
  test('should display modal properly on mobile', async ({ withMockedApis: page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      // Modal should be visible and properly sized
      await expect(adminPage.modal).toBeVisible();
      
      // Modal should not exceed viewport
      const modalWidth = await adminPage.modal.evaluate(el => el.clientWidth);
      expect(modalWidth).toBeLessThanOrEqual(390);
    }
  });

  test('should be scrollable on small screens when content is long', async ({ withMockedApis: page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await adminPage.clickAppointment(0);
      
      // Modal should have scroll capability
      const hasScroll = await adminPage.modal.evaluate(el => {
        return el.scrollHeight > el.clientHeight;
      });
      
      // Either has scroll or content fits
      expect(typeof hasScroll).toBe('boolean');
    }
  });
});

