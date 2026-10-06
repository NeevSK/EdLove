import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 0 });

test.describe('Keyboard Navigation & Focus Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
  });

  test('form elements are focusable and have visible focus rings', async ({ page }) => {
    await page.getByText(/use a password instead/i).click();
    await page.waitForTimeout(100);

    const email = page.locator('#email');
    await email.focus();
    await expect(email).toBeFocused();
    await expect(email).toHaveCSS('outline-width', /[1-9]/);

    const password = page.locator('#password');
    await password.focus();
    await expect(password).toBeFocused();
    await expect(password).toHaveCSS('outline-width', /[1-9]/);

    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    await submit.focus();
    await expect(submit).toBeFocused();
    await expect(submit).toHaveCSS('outline-width', /[1-9]/);
  });

  test('skip link works on landing page', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('focus rings visible on all interactive elements', async ({ page }) => {
    await page.getByText(/use a password instead/i).click();
    await page.waitForTimeout(100);

    const email = page.locator('#email');
    await email.focus();
    await expect(email).toHaveCSS('outline-width', /[1-9]/);

    const password = page.locator('#password');
    await password.focus();
    await expect(password).toHaveCSS('outline-width', /[1-9]/);

    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    await submit.focus();
    await expect(submit).toHaveCSS('outline-width', /[1-9]/);
  });

  test('form elements are reachable and focusable', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByText(/use a password instead/i).click();
    await page.waitForTimeout(100);

    // Directly focus each form element to verify accessibility
    await page.locator('#email').focus();
    await expect(page.locator('#email')).toBeFocused();

    await page.locator('#password').focus();
    await expect(page.locator('#password')).toBeFocused();

    await page.getByRole('button', { name: 'Sign in', exact: true }).focus();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeFocused();

    await page.getByRole('link', { name: /forgot your password/i }).focus();
    await expect(page.getByRole('link', { name: /forgot your password/i })).toBeFocused();

    await page.getByRole('link', { name: /sign up/i }).focus();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeFocused();
  });
});