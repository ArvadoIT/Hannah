import { test as base, Page } from '@playwright/test';

/**
 * Mock API Fixture
 * Provides API mocking capabilities to prevent tests from hitting real APIs
 */

export interface MockedAppointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  service: string;
  stylist?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// Sample mock data
const mockAppointments: MockedAppointment[] = [
  {
    _id: 'mock-1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '555-0101',
    service: 'Manicure',
    stylist: 'Hannah',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending',
    notes: 'First time client',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'mock-2',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    clientPhone: '555-0102',
    service: 'Pedicure',
    stylist: 'Hannah',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    status: 'confirmed',
    notes: 'Regular client',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: 'mock-3',
    clientName: 'Bob Johnson',
    clientEmail: 'bob@example.com',
    service: 'Gel Nails',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 82800000).toISOString(),
    status: 'completed',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    _id: 'mock-4',
    clientName: 'Alice Williams',
    clientEmail: 'alice@example.com',
    clientPhone: '555-0104',
    service: 'Full Set',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 5400000).toISOString(),
    status: 'pending',
    notes: 'Prefers natural colors',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    _id: 'mock-5',
    clientName: 'Charlie Brown',
    clientEmail: 'charlie@example.com',
    service: 'Nail Art',
    stylist: 'Hannah',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    endTime: new Date(Date.now() + 176400000).toISOString(),
    status: 'confirmed',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
];

type ApiMockFixtures = {
  mockAppointmentsApi: (options?: { appointments?: MockedAppointment[] }) => Promise<void>;
  getMockedAppointments: () => MockedAppointment[];
  withMockedApis: Page;
};

export const test = base.extend<ApiMockFixtures>({
  /**
   * Provides the current list of mocked appointments
   */
  getMockedAppointments: async ({}, use) => {
    const appointments = [...mockAppointments];
    await use(() => appointments);
  },

  /**
   * Mock the appointments API endpoints
   */
  mockAppointmentsApi: async ({ page }, use) => {
    let appointments = [...mockAppointments];

    const mockApi = async (options?: { appointments?: MockedAppointment[] }) => {
      if (options?.appointments) {
        appointments = [...options.appointments];
      }

      // Mock GET /api/appointments
      await page.route('**/api/appointments*', async (route) => {
        const request = route.request();
        const method = request.method();

        if (method === 'GET') {
          // Return all appointments
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
              success: true,
              appointments,
              count: appointments.length
            }),
          });
        } else if (method === 'PATCH') {
          // Update appointment status
          const postData = request.postDataJSON();
          const { id, status } = postData;

          const appointment = appointments.find(apt => apt._id === id);
          if (appointment) {
            appointment.status = status;
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true, appointment }),
            });
          } else {
            await route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Appointment not found' }),
            });
          }
        } else if (method === 'DELETE') {
          // Delete appointment
          const url = new URL(request.url());
          const id = url.searchParams.get('id');

          const index = appointments.findIndex(apt => apt._id === id);
          if (index !== -1) {
            appointments.splice(index, 1);
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true }),
            });
          } else {
            await route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Appointment not found' }),
            });
          }
        } else {
          // Other methods
          await route.fulfill({
            status: 405,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Method not allowed' }),
          });
        }
      });
    };

    await use(mockApi);
  },

  /**
   * Page with all APIs automatically mocked
   */
  withMockedApis: async ({ page, mockAppointmentsApi }, use) => {
    // Automatically mock appointments API
    await mockAppointmentsApi();

    // Mock contact API to prevent emails
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent (mocked)' }),
      });
    });

    // Mock SMS API to prevent SMS sending
    await page.route('**/api/sms/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'SMS sent (mocked)' }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper to create mock appointments with custom data
 */
export function createMockAppointment(
  overrides: Partial<MockedAppointment> = {}
): MockedAppointment {
  return {
    _id: `mock-${Date.now()}`,
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '555-0100',
    service: 'Test Service',
    stylist: 'Test Stylist',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending',
    notes: 'Test notes',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper to create multiple mock appointments
 */
export function createMockAppointments(count: number): MockedAppointment[] {
  return Array.from({ length: count }, (_, i) =>
    createMockAppointment({
      _id: `mock-generated-${i}`,
      clientName: `Client ${i + 1}`,
      clientEmail: `client${i + 1}@example.com`,
    })
  );
}

