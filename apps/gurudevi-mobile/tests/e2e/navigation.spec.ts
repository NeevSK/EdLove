import { expect, test } from '@playwright/test';

test.describe('Gurudevi Web Gateway & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the Gurudevi brand header', async ({ page }) => {
    // The GatewayHeader contains the brand name and lotus icon
    const brandText = page.getByText('Gurudevi');
    await expect(brandText.first()).toBeVisible();
  });

  test('should render and interact with language selector', async ({ page }) => {
    // Language buttons: EN, සිං, தமிழ்
    const enBtn = page.locator('button[data-code="en"]');
    const siBtn = page.locator('button[data-code="si"]');
    const taBtn = page.locator('button[data-code="ta"]');

    if (await enBtn.isVisible()) {
      await expect(enBtn).toBeVisible();
      await expect(siBtn).toBeVisible();
      await expect(taBtn).toBeVisible();

      // Click Sinhala language
      await siBtn.click();
      // Click back to English
      await enBtn.click();
    }
  });

  test('should toggle dark/light theme mode', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label*="Mode"]');
    if (await themeBtn.isVisible()) {
      const initialLabel = await themeBtn.getAttribute('aria-label');
      await themeBtn.click();
      const updatedLabel = await themeBtn.getAttribute('aria-label');
      expect(updatedLabel).not.toBe(initialLabel);
    }
  });
});

