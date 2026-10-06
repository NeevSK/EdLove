import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 0 });

test.describe('Return Navigation & Deep Links', () => {
  test('browser back button restores previous page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /enter sanctuary/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('browser forward button restores next page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /enter sanctuary/i }).click();
    await page.waitForURL(/\/sign-in/);
    await page.goBack();
    await page.waitForURL(/\/$/);
    await page.goForward();
    await page.waitForURL(/\/sign-in/);
  });

  test('deep link to sanctuary shows sign-in prompt when signed out', async ({ page }) => {
    await page.goto('/self');
    // Server-side auth check should show sign-in prompt for unsigned users
    // This test documents expected behavior; may need test user in Supabase for full validation
    await expect(page).toHaveURL(/\/self/);
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
  });

  test('deep link to sign-in with returnTo preserves destination @requires-auth', async ({ page }) => {
    await page.goto('/sign-in?returnTo=%2Fworkspace');
    await expect(page).toHaveURL(/returnTo=%2Fworkspace/);

    await page.getByText(/use a password instead/i).click();
    await page.fill('#email', process.env.E2E_TEST_EMAIL ?? 'test@example.com');
    await page.fill('#password', process.env.E2E_TEST_PASSWORD ?? 'testpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/workspace/, { timeout: 30000 });
  });

  test('returnTo sanitization blocks external URLs @requires-auth', async ({ page }) => {
    await page.goto('/sign-in?returnTo=https%3A%2F%2Fevil.com');
    await page.getByText(/use a password instead/i).click();
    await page.fill('#email', process.env.E2E_TEST_EMAIL ?? 'test@example.com');
    await page.fill('#password', process.env.E2E_TEST_PASSWORD ?? 'testpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/self/, { timeout: 30000 });
  });

  test('returnTo sanitization blocks non-sanctuary paths @requires-auth', async ({ page }) => {
    await page.goto('/sign-in?returnTo=%2Fadmin');
    await page.getByText(/use a password instead/i).click();
    await page.fill('#email', process.env.E2E_TEST_EMAIL ?? 'test@example.com');
    await page.fill('#password', process.env.E2E_TEST_PASSWORD ?? 'testpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/self/, { timeout: 30000 });
  });
});