import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

test('serves the exported web shell and PowerSync runtime assets', async ({ page, request }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle('Gurudevi');

  const metadata = await request.get('/metadata.json');
  expect(metadata.ok()).toBeTruthy();

  const wasmFile = readdirSync(resolve(process.cwd(), 'dist/@powersync/assets')).find((file) => file.endsWith('.wasm'));
  expect(wasmFile).toBeTruthy();
  const wasm = await request.get(`/@powersync/assets/${wasmFile}`);
  expect(wasm.ok()).toBeTruthy();
  expect(wasm.headers()['content-type']).toContain('application/wasm');

  expect(pageErrors).not.toContainEqual(expect.stringContaining('Unable to resolve'));
});
