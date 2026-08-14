import { chromium } from '@playwright/test';

const url =
  process.argv.find(
    (argument) => argument.startsWith('http://') || argument.startsWith('https://'),
  ) ?? 'http://127.0.0.1:4173/';
const events = [];
let browser = null;
let context = null;

const withTimeout = async (promise, timeoutMs, label) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

try {
  console.log(`Inspector: launching Chromium for ${url}`);
  browser = await chromium.launch({
    timeout: 10000,
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
  });
  console.log('Inspector: Chromium launched');

  context = await withTimeout(
    browser.newContext({ serviceWorkers: 'block' }),
    10000,
    'context creation',
  );
  const page = await withTimeout(context.newPage({ viewport: { width: 1280, height: 720 } }), 10000, 'page creation');

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      events.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => events.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => {
    events.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`);
  });

  console.log('Inspector: navigating');
  const response = await page.goto(url, { waitUntil: 'commit', timeout: 10000 }).catch((error) => {
    events.push(`goto: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  });
  console.log('Inspector: navigation committed; waiting for hydration');
  await page.waitForTimeout(12000);
  try {
    await page.screenshot({ path: 'web-runtime-smoke.png', timeout: 3000 });
  } catch (error) {
    events.push(`screenshot: ${error instanceof Error ? error.message : String(error)}`);
  }

  const snapshot = await withTimeout(
    page.evaluate(() => ({
      title: document.title,
      bodyText: document.body?.innerText ?? '',
      bodyBackground: document.body ? getComputedStyle(document.body).backgroundColor : 'unknown',
      rootHtml: document.getElementById('root')?.innerHTML.slice(0, 4000) ?? '',
    })),
    5000,
    'DOM snapshot',
  );

  console.log(`HTTP status: ${response?.status() ?? 'no response'}`);
  console.log(`Document title: ${snapshot.title}`);
  console.log(`Body text length: ${snapshot.bodyText.length}`);
  console.log(`Body background: ${snapshot.bodyBackground}`);
  console.log(`Root HTML length: ${snapshot.rootHtml.length}`);
  console.log(`Browser diagnostics: ${events.length}`);
  for (const event of events) console.log(`  ${event}`);
} catch (error) {
  console.error(`Inspector failure: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  if (context) {
    await Promise.race([context.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1000))]);
  }
  if (browser) {
    await Promise.race([browser.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1000))]);
  }
}
