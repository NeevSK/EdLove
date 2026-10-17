import { expect, test } from '@playwright/test';

test.describe.configure({ retries: 0 });

test.describe('Self Journal G3 E2E — Real Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in?returnTo=%2Fself');
    await page.getByText(/use a password instead/i).click();
    await page.fill('#email', 'e2e-test@gurudevi.app');
    await page.fill('#password', 'TestPassword123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/self/, { timeout: 30000 });
  });

  test('opens Fire Journal from overview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /self · overview/i })).toBeVisible();
    await page
      .getByRole('button', { name: /open fire journal/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /self · fire journal/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /a private reflection/i })).toBeVisible();
  });

  test('burns a journal entry and shows in history', async ({ page }) => {
    await page
      .getByRole('button', { name: /open fire journal/i })
      .first()
      .click();
    await page
      .getByRole('textbox', { name: /a private reflection/i })
      .fill('G3 E2E test reflection - ' + Date.now());
    await page.getByRole('button', { name: /release to fire journal/i }).click();
    await expect(page.getByText(/released\. only this short preview remains/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/g3 e2e test reflection/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows error when burn fails (network simulation)', async ({ page }) => {
    await page.route('**/api/self/burnJournal', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Service unavailable' }) });
    });
    await page
      .getByRole('button', { name: /open fire journal/i })
      .first()
      .click();
    await page.getByRole('textbox', { name: /a private reflection/i }).fill('This will fail');
    await page.getByRole('button', { name: /release to fire journal/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('opens Mood Lotus modal from catalog', async ({ page }) => {
    await page
      .getByRole('button', { name: /open practice/i })
      .first()
      .click();
    await expect(page.getByRole('dialog', { name: /mood lotus/i })).toBeVisible();
    await expect(page.getByText('How are you arriving?')).toBeVisible();
  });

  test('logs a mood check-in', async ({ page }) => {
    await page
      .getByRole('button', { name: /open practice/i })
      .first()
      .click();
    await page.getByRole('button', { name: /calm/i }).click();
    await page.getByRole('textbox', { name: /a few words/i }).fill('G3 E2E mood check-in');
    await page.getByRole('button', { name: /save calm/i }).click();
    await expect(page.getByText(/g3 e2e mood check-in/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows error when mood logging fails', async ({ page }) => {
    await page.route('**/api/self/logMood', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Service unavailable' }) });
    });
    await page
      .getByRole('button', { name: /open practice/i })
      .first()
      .click();
    await page.getByRole('button', { name: /calm/i }).click();
    await page.getByRole('button', { name: /save calm/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('navigates back to overview from Fire Journal', async ({ page }) => {
    await page
      .getByRole('button', { name: /open fire journal/i })
      .first()
      .click();
    await page.getByRole('button', { name: /overview/i }).click();
    await expect(page.getByRole('heading', { name: /self · overview/i })).toBeVisible();
  });

  test('navigates back to overview from Mood Lotus', async ({ page }) => {
    await page
      .getByRole('button', { name: /open practice/i })
      .first()
      .click();
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('heading', { name: /self · overview/i })).toBeVisible();
  });
});
