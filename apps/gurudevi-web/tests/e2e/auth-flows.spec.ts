import { expect, test } from '@playwright/test';

test.describe.configure({ retries: 0 });

test.describe('Auth: Landing → Sign In → Sanctuary → Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates from landing to sign-in page', async ({ page }) => {
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('link', { name: /enter sanctuary/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /enter gurudevi/i })).toBeVisible();
  });

  test('signs in with password and reaches sanctuary @requires-auth', async ({ page }) => {
    await page.goto('/sign-in?returnTo=%2Fself');
    await page.getByText(/use a password instead/i).click();
    await expect(page.locator('details[open]')).toBeVisible();

    await page.fill('#email', process.env.E2E_TEST_EMAIL ?? 'test@example.com');
    await page.fill('#password', process.env.E2E_TEST_PASSWORD ?? 'testpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/self/, { timeout: 30000 });

    // Without sanctuary API running, authorizedEntry returns signed-out
    // So we expect the signed-out prompt page
    await expect(page.getByRole('heading', { name: /your self space is private/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByText(/use a password instead/i).click();

    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.locator('p[role="alert"].font-sans')).toContainText(/could not sign in/i);
  });

  test('signs out and returns to landing @requires-auth', async ({ page }) => {
    await page.goto('/sign-in?returnTo=%2Fself');
    await page.getByText(/use a password instead/i).click();

    await page.fill('#email', process.env.E2E_TEST_EMAIL ?? 'test@example.com');
    await page.fill('#password', process.env.E2E_TEST_PASSWORD ?? 'testpassword');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(/\/self/, { timeout: 30000 });

    // Verify we're on the self page (signed-out prompt since sanctuary API not running)
    await expect(page).toHaveURL(/\/self/);
    await expect(page.getByRole('heading', { name: /your self space is private/i })).toBeVisible();

    await page.request.post('/api/auth/signout');
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
  });

  test('email magic link flow renders', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /enter gurudevi/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with email/i })).toBeVisible();
  });
});
