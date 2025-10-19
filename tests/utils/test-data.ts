/**
 * Test data for E2E tests
 * Provides deterministic, valid, and invalid inputs for form testing
 */

export const validTestData = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567890',
  service: 'Luxury Manicure',
  message: 'Looking forward to my appointment!',
};

export const invalidTestData = {
  name: {
    tooShort: 'A',
    numbers: 'John123',
    special: 'John@Doe',
    empty: '',
  },
  email: {
    missing: 'invalidemail',
    missingTLD: 'user@domain',
    missingAt: 'userdomain.com',
    empty: '',
  },
  phone: {
    letters: 'abc123',
    tooShort: '123',
    invalid: '+++123',
    empty: '',
  },
};

export const adminCredentials = {
  valid: {
    username: 'admin',
    password: 'SecurePassword123',
  },
  invalid: {
    username: 'wronguser',
    password: 'wrongpass',
  },
};

export const navigationLinks = {
  main: [
    { label: 'Home', href: 'index.html' },
    { label: 'Services', href: 'services.html' },
    { label: 'Portfolio', href: 'portfolio.html' },
  ],
  admin: [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Calendar', href: 'calendar.html' },
    { label: 'Analytics', href: 'analytics.html' },
  ],
};

export const services = [
  'Russian Manicure',
  'Classic Manicure',
  'Gel Extensions',
  'Pedicure',
  'Nail Art',
];

export const portfolioFilters = [
  'All',
  'Manicure',
  'Extensions',
  'Nail Art',
  'Pedicure',
];

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
}

/**
 * Generate a unique phone number for testing
 */
export function generateUniquePhone(): string {
  const random = Math.floor(Math.random() * 1000000000);
  return `+1${random.toString().padStart(10, '0')}`;
}

