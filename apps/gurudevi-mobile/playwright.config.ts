import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for testing the Web version of the Gurudevi Mobile app.
 * This tests the app as it runs via Metro/React Native Web.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    /* Metro defaults to 8081 for the web server in recent Expo versions */
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* We primarily care about mobile viewports for this app */
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    /* Desktop view to ensure responsive behavior */
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 
   * This command starts the Expo Web server.
   * Note: The server can take a while to bundle the JS on first run.
   */
  webServer: {
    command: 'pnpm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for bundling
  },
});
