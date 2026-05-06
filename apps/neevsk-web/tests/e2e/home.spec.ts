import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/NeevSK/);
});

test('hero section is visible', async ({ page }) => {
  await page.goto('/');

  // Check for some content from HeroHome or sections
  const hero = page.locator('section').first();
  await expect(hero).toBeVisible();
});

test('theme is set to home', async ({ page }) => {
  await page.goto('/');
  
  // BaseLayout sets data-theme on html
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'home');
});
