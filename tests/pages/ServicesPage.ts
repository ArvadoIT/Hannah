import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Services Page Object - handles booking flow
 */
export class ServicesPage extends BasePage {
  readonly pageHero: Locator;
  readonly bookingContainer: Locator;
  readonly stepIndicator: Locator;
  
  // Step 1: Service selection
  readonly serviceCards: Locator;
  
  // Step 2: Date/Time (if implemented)
  readonly dateTimeSection: Locator;
  
  // Step 3: Contact form
  readonly contactForm: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly messageField: Locator;
  readonly submitButton: Locator;
  
  // Validation
  readonly errorMessages: Locator;
  
  // Success
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageHero = page.locator('.page-hero');
    this.bookingContainer = page.locator('.booking-flow-container');
    this.stepIndicator = page.locator('.booking-steps-indicator');
    
    // Service cards
    this.serviceCards = page.locator('.service-detail-card.selectable');
    
    // Date/Time
    this.dateTimeSection = page.locator('.datetime-selection');
    
    // Contact form
    this.contactForm = page.locator('#booking-form');
    this.nameField = page.locator('#name');
    this.emailField = page.locator('#email');
    this.phoneField = page.locator('#phone');
    this.messageField = page.locator('#message');
    this.submitButton = page.locator('button[type="submit"]');
    
    // Validation
    this.errorMessages = page.locator('.error-message');
    
    // Success
    this.successMessage = page.locator('.success-message, .booking-success');
  }

  /**
   * Navigate to services page
   */
  async goto(): Promise<void> {
    await super.goto('/services.html');
  }

  /**
   * Select a service by name
   */
  async selectService(serviceName: string): Promise<void> {
    const serviceCard = this.page.locator('.service-card', { hasText: serviceName });
    await serviceCard.click();
  }

  /**
   * Select the first available service
   */
  async selectFirstService(): Promise<void> {
    await this.serviceCards.first().click();
  }

  /**
   * Get current booking step
   */
  async getCurrentStep(): Promise<number> {
    const activeStep = this.page.locator('.step-item.active');
    const stepNumber = await activeStep.locator('.step-number').textContent();
    return parseInt(stepNumber || '1', 10);
  }

  /**
   * Fill contact form with data
   */
  async fillContactForm(data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }): Promise<void> {
    await this.nameField.fill(data.name);
    await this.emailField.fill(data.email);
    await this.phoneField.fill(data.phone);
    
    if (data.message) {
      await this.messageField.fill(data.message);
    }
  }

  /**
   * Submit booking form
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete full booking flow
   */
  async completeBooking(data: {
    service?: string;
    name: string;
    email: string;
    phone: string;
    message?: string;
  }): Promise<void> {
    // Select service if provided, otherwise select first
    if (data.service) {
      await this.selectService(data.service);
    } else {
      await this.selectFirstService();
    }
    
    // Wait for form to be visible
    await this.contactForm.waitFor({ state: 'visible' });
    
    // Fill form
    await this.fillContactForm({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });
    
    // Submit
    await this.submitForm();
  }

  /**
   * Check if form field has error
   */
  async hasFieldError(fieldName: 'name' | 'email' | 'phone'): Promise<boolean> {
    const field = this[`${fieldName}Field`];
    const hasErrorClass = await field.evaluate((el) => el.classList.contains('error'));
    
    return hasErrorClass;
  }

  /**
   * Get error message for a field
   */
  async getFieldErrorMessage(fieldName: 'name' | 'email' | 'phone'): Promise<string | null> {
    const field = this[`${fieldName}Field`];
    const parent = field.locator('..');
    const errorMsg = parent.locator('.error-message');
    
    if (await errorMsg.count() > 0) {
      return await errorMsg.textContent();
    }
    
    return null;
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return !(await this.submitButton.isEnabled());
  }

  /**
   * Wait for success message
   */
  async waitForSuccess(): Promise<void> {
    await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Check if booking was successful
   */
  async isBookingSuccessful(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }
}

