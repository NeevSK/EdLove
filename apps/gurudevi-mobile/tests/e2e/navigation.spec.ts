import { expect, type Page, test } from '@playwright/test';

const consentDialog = (page: Page) => page.getByRole('dialog', { name: 'Privacy & Consent' });

async function openPublicRoute(page: Page, path = '/welcome') {
  await page.goto(path);
  await expect(consentDialog(page)).toBeVisible();
  await consentDialog(page).getByRole('button', { name: 'Decline' }).click();
  await expect(consentDialog(page)).toBeHidden();
}

test.describe('Gurudevi public web journey', () => {
  test('records a consent decision before exposing the welcome controls', async ({ page }) => {
    await page.goto('/welcome');

    await expect(consentDialog(page)).toBeVisible();
    await consentDialog(page).getByRole('button', { name: 'Decline' }).click();
    await expect(consentDialog(page)).toBeHidden();
    await expect(page.getByRole('button', { name: 'I have an account' })).toBeVisible();
  });

  test('persists the selected language through a reload', async ({ page }) => {
    await openPublicRoute(page);

    const sinhala = page.getByRole('button', { name: 'Switch language to සිං' });
    await sinhala.click();
    await expect(sinhala).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Switch language to සිං' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('changes theme with the keyboard and persists it through a reload', async ({ page }) => {
    await openPublicRoute(page);

    const themeToggle = page.locator('button[aria-label^="Switch to "]');
    await expect(themeToggle).toBeVisible();
    const wasDark = await themeToggle.getAttribute('aria-pressed');

    await themeToggle.focus();
    await page.keyboard.press('Enter');
    await expect(themeToggle).toHaveAttribute(
      'aria-pressed',
      wasDark === 'true' ? 'false' : 'true',
    );

    await page.reload();
    await expect(page.locator('button[aria-label^="Switch to "]')).toHaveAttribute(
      'aria-pressed',
      wasDark === 'true' ? 'false' : 'true',
    );
  });

  test('navigates from Welcome to Auth by pointer, then returns by keyboard', async ({ page }) => {
    await openPublicRoute(page);

    await page.getByRole('button', { name: 'I have an account' }).click();
    await expect(page).toHaveURL(/\/auth$/);

    const backToWelcome = page.getByRole('button', { name: 'Back to Welcome' });
    await backToWelcome.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/welcome$/);
  });

  test('shows local email validation without invoking an external identity provider', async ({
    page,
  }) => {
    await openPublicRoute(page, '/auth');

    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByLabel('Email Address').fill('not-an-email');
    await page.getByLabel('Password').fill('short');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page.getByText(/password.*(?:6|character)/i)).toBeVisible();
  });
});
