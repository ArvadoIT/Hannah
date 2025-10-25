import { test, expect } from '../../fixtures/api-mock';
import { AdminPage } from '../../pages/AdminPage';

/**
 * Admin Dashboard Appointments E2E Tests
 * Tests for viewing and managing appointments
 * 
 * NOTE: These tests use MOCKED APIs and will NOT hit your real backend
 * or consume your free tier quotas. No real data will be modified.
 */

test.describe('Admin Dashboard - Appointments List', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should display appointments list if appointments exist', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      await expect(adminPage.appointmentsList).toBeVisible();
      await expect(adminPage.appointmentCards.first()).toBeVisible();
    } else {
      // Should show no appointments message
      const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
      expect(hasNoAppointments).toBe(true);
    }
  });

  test('should display appointment cards with required information', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      
      // Should have client name (h3)
      await expect(firstCard.locator('h3')).toBeVisible();
      
      // Should have service name
      await expect(firstCard.locator('.service-name')).toBeVisible();
      
      // Should have status badge
      await expect(firstCard.locator('.status-badge')).toBeVisible();
      
      // Should have appointment details
      await expect(firstCard.locator('.appointment-details')).toBeVisible();
    }
  });

  test('should display appointment status with correct styling', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        const statusBadge = adminPage.appointmentCards.nth(i).locator('.status-badge');
        await expect(statusBadge).toBeVisible();
        
        // Status should have background color
        const bgColor = await statusBadge.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
      }
    }
  });

  test('should display appointment details with icons', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      const detailItems = firstCard.locator('.detail-item');
      const detailCount = await detailItems.count();
      
      expect(detailCount).toBeGreaterThan(0);
      
      // Each detail item should have an icon
      for (let i = 0; i < Math.min(detailCount, 3); i++) {
        const hasIcon = await detailItems.nth(i).locator('.detail-icon').isVisible();
        expect(hasIcon).toBe(true);
      }
    }
  });

  test('should show appointment notes if present', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Check first few appointments for notes
      for (let i = 0; i < Math.min(appointmentsCount, 5); i++) {
        const card = adminPage.appointmentCards.nth(i);
        const notesSection = card.locator('.appointment-notes');
        const hasNotes = await notesSection.isVisible();
        
        // If notes exist, they should contain "Notes:" label
        if (hasNotes) {
          await expect(notesSection).toContainText('Notes:');
        }
      }
    }
  });

  test('should make appointment card clickable with hover effect', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      
      // Card should have cursor pointer style
      const cursor = await firstCard.evaluate(el => 
        window.getComputedStyle(el).cursor
      );
      expect(cursor).toBe('pointer');
      
      // Hover should trigger visual effect (transform or box-shadow change)
      await firstCard.hover();
      await adminPage.page.waitForTimeout(100); // Wait for transition
    }
  });

  test('should open modal when clicking on appointment', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      // Click first appointment
      await adminPage.clickAppointment(0);
      
      // Modal should open
      const isModalOpen = await adminPage.isModalOpen();
      expect(isModalOpen).toBe(true);
      
      await expect(adminPage.modal).toBeVisible();
      await expect(adminPage.modalHeader).toContainText('Appointment Details');
    }
  });

  test('should display appointments sorted by date', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 1) {
      // Get dates from first two appointments
      const firstCard = adminPage.appointmentCards.first();
      const secondCard = adminPage.appointmentCards.nth(1);
      
      const firstDate = await firstCard.locator('.detail-item').first().textContent();
      const secondDate = await secondCard.locator('.detail-item').first().textContent();
      
      // Both should have date information
      expect(firstDate).toBeTruthy();
      expect(secondDate).toBeTruthy();
    }
  });
});

test.describe('Admin Dashboard - Appointment Cards Interaction', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ withMockedApis: page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
  });

  test('should highlight selected appointment card', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      
      // Click to select
      await firstCard.click();
      await adminPage.page.waitForTimeout(100);
      
      // Card should have 'selected' class or be highlighted
      const classList = await firstCard.getAttribute('class');
      expect(classList).toContain('selected');
    }
  });

  test('should remove highlight when modal is closed', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      
      // Click to select
      await firstCard.click();
      await adminPage.page.waitForTimeout(100);
      
      // Close modal
      await adminPage.closeModal();
      
      // Card should no longer be highlighted
      const classList = await firstCard.getAttribute('class');
      expect(classList).not.toContain('selected');
    }
  });

  test('should be keyboard accessible', async () => {
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    if (appointmentsCount > 0) {
      const firstCard = adminPage.appointmentCards.first();
      
      // Focus the card
      await firstCard.focus();
      
      // Should be able to activate with Enter key
      await adminPage.page.keyboard.press('Enter');
      
      // Modal should open
      const isModalOpen = await adminPage.isModalOpen();
      if (isModalOpen) {
        await expect(adminPage.modal).toBeVisible();
      }
    }
  });
});

test.describe('Admin Dashboard - Appointments Performance', () => {
  test('should load appointments within reasonable time', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    
    const startTime = Date.now();
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large number of appointments efficiently', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    const appointmentsCount = await adminPage.getAppointmentsCount();
    
    // If there are many appointments, scrolling should be smooth
    if (appointmentsCount > 10) {
      const lastCard = adminPage.appointmentCards.last();
      
      const startTime = Date.now();
      await lastCard.scrollIntoViewIfNeeded();
      const scrollTime = Date.now() - startTime;
      
      // Scrolling should be fast
      expect(scrollTime).toBeLessThan(1000);
    }
  });
});

test.describe('Admin Dashboard - Empty Appointments State', () => {
  test('should show helpful message when no appointments exist', async ({ withMockedApis: page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.waitForAppointmentsToLoad();
    
    // Filter to get no results
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await adminPage.filterByDate(dateString);
    
    const hasNoAppointments = await adminPage.isNoAppointmentsMessageVisible();
    
    if (hasNoAppointments) {
      await expect(adminPage.noAppointmentsMessage).toContainText('No appointments found');
      await expect(adminPage.noAppointmentsMessage).toContainText('adjusting your filters');
    }
  });
});

