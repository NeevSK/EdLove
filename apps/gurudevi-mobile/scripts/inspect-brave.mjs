import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const bravePaths = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.BRAVE_BIN,
  process.env.CHROME_BIN,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') : '',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/brave-browser',
  '/usr/bin/brave',
].filter(Boolean);

const executablePath = bravePaths.find((p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
});

console.log('🚀 Browser executable:', executablePath || 'Playwright Bundled Chromium');

const targetUrl = process.env.TARGET_URL || 'http://localhost:8081';
const screenshotDir = path.resolve(process.cwd(), '../../reports/playwright/screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: executablePath || undefined,
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();

const logs = [];
page.on('console', (msg) => logs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`));
page.on('pageerror', (err) => logs.push(`[PAGE ERROR] ${err.message}`));

try {
  console.log(`🌐 Navigating to ${targetUrl}...`);
  const res = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('📡 HTTP Status:', res?.status());
  console.log('📄 Document Title:', await page.title());

  // Allow dynamic assets / hydration
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('✨ Rendered Title:', title);

  const screenshotPath = path.join(screenshotDir, 'localhost_inspection.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot captured at: ${screenshotPath}`);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('📝 Visible text sample:\n', bodyText.slice(0, 300));
} catch (e) {
  console.error('❌ Inspection error:', e.message);
} finally {
  if (logs.length > 0) {
    console.log('\n--- Captured Console Logs ---');
    logs.slice(0, 10).forEach((l) => console.log(l));
  }
  await browser.close();
  console.log('🏁 Inspection complete.');
}

