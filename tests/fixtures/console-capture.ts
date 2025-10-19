import { test as base, Page } from '@playwright/test';

type ConsoleMessage = {
  type: string;
  text: string;
  location?: string;
};

type ConsoleFixture = {
  consoleMessages: ConsoleMessage[];
  captureConsole: () => void;
};

/**
 * Fixture to capture console messages from the browser
 */
export const test = base.extend<ConsoleFixture>({
  consoleMessages: async ({ page }, use) => {
    const messages: ConsoleMessage[] = [];
    
    page.on('console', (msg) => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url,
      });
    });

    page.on('pageerror', (error) => {
      messages.push({
        type: 'error',
        text: error.message,
      });
    });

    await use(messages);
  },

  captureConsole: async ({ page }, use) => {
    await use(() => {
      // This is just a placeholder function
      // The actual capture happens via the consoleMessages fixture
    });
  },
});

export { expect } from '@playwright/test';

