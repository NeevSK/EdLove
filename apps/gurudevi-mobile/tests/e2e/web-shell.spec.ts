import { expect, test } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

test('serves the web shell and renders title & core UI', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/Gurudevi/i);

  expect(pageErrors).not.toContainEqual(expect.stringContaining('Unable to resolve'));
});

test('static dist contains PowerSync runtime assets if built', async ({ request }) => {
  const assetsDir = resolve(process.cwd(), 'dist/@powersync/assets');
  if (!existsSync(assetsDir)) {
    test.skip(true, 'Skipping static asset check when running against dev server');
    return;
  }

  const metadata = await request.get('/metadata.json');
  expect(metadata.ok()).toBeTruthy();

  const wasmFile = readdirSync(assetsDir).find((file) => file.endsWith('.wasm'));
  expect(wasmFile).toBeTruthy();
  const wasm = await request.get(`/@powersync/assets/${wasmFile}`);
  expect(wasm.ok()).toBeTruthy();
  expect(wasm.headers()['content-type']).toContain('application/wasm');
});

