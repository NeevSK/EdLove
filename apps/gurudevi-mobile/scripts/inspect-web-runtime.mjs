import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const events = [];

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    events.push(`${message.type()}: ${message.text()}`);
  }
});
page.on('pageerror', (error) => events.push(`pageerror: ${error.message}`));
page.on('requestfailed', (request) => {
  events.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`);
});

const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: 'web-runtime-smoke.png', fullPage: true });

console.log(`HTTP status: ${response?.status() ?? 'no response'}`);
console.log(`Document title: ${await page.title()}`);
console.log(`Body text length: ${(await page.locator('body').innerText()).length}`);
console.log(`Body background: ${await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor)}`);
console.log(`Browser diagnostics: ${events.length}`);
for (const event of events) console.log(`  ${event}`);

await browser.close();
