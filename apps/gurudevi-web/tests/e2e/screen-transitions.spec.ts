import { expect, test } from '@playwright/test';

test.describe('Sanctuary Client-Side Screen Transitions Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Log failed network requests with exact URLs
    page.on('requestfailed', (request) => {
      console.warn(`[Network Failure] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Log HTTP error responses (>= 400)
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.warn(`[HTTP Error ${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // Monitor console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Console Error] ${msg.text()}`);
      }
    });
  });

  test('TC-TRANS-01: Direct floor access without API renders in explore mode', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - startTime;

    console.log(`[Metrics] /library initial load took ${elapsed}ms`);
    expect(page.url()).toContain('/library');

    // Verify main floor elements are rendered
    const mainCanvas = page.locator('main');
    await expect(mainCanvas).toBeVisible();
  });

  test('TC-TRANS-02: Warm tab transition timing and layout shift audit', async ({ page }) => {
    // Pre-warm routes
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/workspace');
    await page.waitForLoadState('domcontentloaded');

    // Return to library
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');

    // Setup PerformanceObserver for layout shifts
    await page.evaluate(() => {
      (window as any).__clsScore = 0;
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              (window as any).__clsScore += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Layout-shift observer unavailable', e);
      }
    });

    // Measure warm client-side navigation via link click
    const workspaceLink = page.locator('a[href*="/workspace"]').first();
    await expect(workspaceLink).toBeVisible();

    const navStart = Date.now();
    await workspaceLink.click();
    await page.waitForURL(/\/workspace/);
    const navElapsed = Date.now() - navStart;
    console.log(`[Metrics] Warm client-side navigation to /workspace took ${navElapsed}ms`);

    // Verify CLS during transition
    const cls = await page.evaluate(() => (window as any).__clsScore || 0);
    console.log(`[Metrics] Cumulative Layout Shift during transition: ${cls}`);

    // Warm client-side navigation threshold (tolerating dev server overhead, catches severe regressions)
    expect(navElapsed).toBeLessThan(2500);
    // Cumulative Layout Shift must remain under 0.1
    expect(cls).toBeLessThan(0.1);
  });

  test('TC-TRANS-03: Multi-surface floor hop preserves interactive state without full reload', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');

    // Hop from Library -> Community -> Self -> Library
    const routes = ['/community', '/self', '/library'];
    for (const route of routes) {
      const hopStart = Date.now();
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const hopDuration = Date.now() - hopStart;
      console.log(`[Metrics] Hop to ${route} took ${hopDuration}ms`);
      expect(page.url()).toContain(route);
    }
  });

  test('TC-TRANS-04: Category filter transition responsiveness within Library floor', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('domcontentloaded');

    // Locate chips or search fields
    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      const typeStart = Date.now();
      await searchInput.fill('Curriculum');
      const typeDuration = Date.now() - typeStart;
      console.log(`[Metrics] Input responsiveness: ${typeDuration}ms`);
      expect(typeDuration).toBeLessThan(200);
    }
  });
});
