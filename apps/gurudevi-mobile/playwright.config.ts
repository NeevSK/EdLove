import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for testing the Web version of the Gurudevi Mobile app.
 * The suite exercises the exported web app through a small local static server.
 * This keeps E2E tests independent from Metro's dev-only transform pipeline and
 * matches the artifact that gets deployed to the web.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: '../../reports/playwright', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* We primarily care about mobile viewports for this app */
  projects: [
    {
      name: 'Mobile Chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /*
   * Export first, then serve the exact static artifact. The export can take a
   * while on a cold cache, so the timeout is intentionally generous.
   */
  webServer: {
    command: 'doppler run --project gurudevi-mobile --config dev --no-fallback -- pnpm exec node scripts/playwright-web-server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 60 * 1000,
  },
});
