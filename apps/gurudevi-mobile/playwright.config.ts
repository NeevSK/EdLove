import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Locate Brave or Chrome browser binary path across platforms.
 */
function resolveBrowserExecutable(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH && fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  if (process.env.BRAVE_BIN && fs.existsSync(process.env.BRAVE_BIN)) {
    return process.env.BRAVE_BIN;
  }
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }

  const localAppData = process.env.LOCALAPPDATA || '';
  const candidatePaths = [
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    localAppData ? path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') : '',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/brave-browser',
    '/usr/bin/brave',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    localAppData ? path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

const browserExecutablePath = resolveBrowserExecutable();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? (process.env.DEV ? 'http://127.0.0.1:8081' : 'http://127.0.0.1:4173');
const skipWebServer = !!process.env.PLAYWRIGHT_BASE_URL || !!process.env.DEV || !!process.env.NO_SERVER;

/**
 * Playwright configuration for testing the Web version of the Gurudevi Mobile app.
 * Supports inspecting active local dev server (e.g. localhost:8081) or exported web dist (localhost:4173).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: '../../reports/playwright', open: 'never' }]],
  use: {
    baseURL,
    executablePath: browserExecutablePath,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* We primarily care about mobile and desktop viewports for this app */
  projects: [
    {
      name: 'Mobile Chromium (Brave/Chrome)',
      use: {
        ...devices['Pixel 5'],
        ...(browserExecutablePath ? { executablePath: browserExecutablePath } : {}),
      },
    },
    {
      name: 'Desktop Chromium (Brave/Chrome)',
      use: {
        ...devices['Desktop Chrome'],
        ...(browserExecutablePath ? { executablePath: browserExecutablePath } : {}),
      },
    },
  ],

  /*
   * Export first, then serve the exact static artifact.
   * Skipped automatically if testing against an already running dev server or custom baseURL.
   */
  webServer: skipWebServer
    ? undefined
    : {
        command: 'doppler run --project gurudevi-mobile --config dev --no-fallback -- pnpm exec node scripts/playwright-web-server.mjs',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 10 * 60 * 1000,
      },
});

