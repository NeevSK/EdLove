import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = 'C:/Users/Naween/.gemini/antigravity/brain/0ae2afff-c046-40ed-bbbc-1e174fcaca8c/screenshots';

test.describe('Visual Inspection Suite', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('Capture visual state of /library floor', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');
    // Wait for canvas elements to settle
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'library-floor-desktop.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured library-floor-desktop.png');
  });

  test('Capture visual state of /workspace floor', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/workspace');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'workspace-floor-desktop.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured workspace-floor-desktop.png');
  });

  test('Capture visual state of /self floor', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/self');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'self-floor-desktop.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured self-floor-desktop.png');
  });

  test('Capture visual state of /community floor', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/community');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'community-floor-desktop.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured community-floor-desktop.png');
  });

  test('Capture visual state of /library/contribute desk', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/library/contribute');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'library-contribute-desktop.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured library-contribute-desktop.png');
  });

  test('Capture mobile viewport of /library (iPhone 13)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, 'library-mobile.png'),
      fullPage: false,
    });
    console.log('[Visual] Captured library-mobile.png');
  });
});
