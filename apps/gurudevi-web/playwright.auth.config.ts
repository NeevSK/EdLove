import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests/acceptance',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { ...base.use, trace: 'off', video: 'off', screenshot: 'only-on-failure' },
  projects: [{ name: 'owned-auth-chromium', use: { ...devices['Desktop Chrome'] } }],
});
