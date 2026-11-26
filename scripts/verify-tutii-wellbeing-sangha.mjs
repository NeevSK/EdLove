import pkg from '../apps/gurudevi-web/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const EVIDENCE_DIR = path.resolve('reports/evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function verifyTutiiHubs() {
  console.log('>>> Launching Edge to verify Tutii Life Wellbeing & Human Sangha Hubs...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
  });
  const page = await context.newPage();

  // 1. Verify /self (Life Wellbeing Concierge)
  console.log('Navigating to http://localhost:3000/self?dev=true&role=principal&name=Dr.%20Silva ...');
  await page.goto('http://localhost:3000/self?dev=true&role=principal&name=Dr.%20Silva', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const headings = await page.$$eval('h1, h2, h3', els => els.map(e => ({ tag: e.tagName, text: e.innerText, id: e.id })));
  console.log('Headings on /self:', headings);

  await page.screenshot({ path: path.join(EVIDENCE_DIR, 'tutii-self-initial-weather.png') });
  console.log('Captured tutii-self-initial-weather.png');

  // Verify elements on /self
  const selfTitle = await page.textContent('#concierge-title');
  console.log('Self Concierge Title:', selfTitle);

  // Click on "Clear & Energized"
  const clearOption = page.locator('button:has-text("Clear & Energized")');
  if (await clearOption.isVisible()) {
    await clearOption.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'tutii-self-clear-energized-selected.png') });
    console.log('Captured tutii-self-clear-energized-selected.png');
  }

  // 2. Verify /community (Human Sangha Concierge)
  console.log('Navigating to http://localhost:3000/community?dev=true&role=principal&name=Dr.%20Silva ...');
  await page.goto('http://localhost:3000/community?dev=true&role=principal&name=Dr.%20Silva', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(EVIDENCE_DIR, 'tutii-community-initial-sangha.png') });
  console.log('Captured tutii-community-initial-sangha.png');

  const communityTitle = await page.textContent('#concierge-title');
  console.log('Community Concierge Title:', communityTitle);

  // Click on "Community Living Forest"
  const forestOption = page.locator('button:has-text("Community Living Forest")');
  if (await forestOption.isVisible()) {
    await forestOption.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'tutii-community-forest-selected.png') });
    console.log('Captured tutii-community-forest-selected.png');
  }

  // Click escape hatch to verify minimization
  const escapeBtn = page.locator('button:has-text("Browse stream directly")');
  if (await escapeBtn.isVisible()) {
    await escapeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'tutii-community-minimized.png') });
    console.log('Captured tutii-community-minimized.png');
  }

  await browser.close();
  console.log('>>> Verification completed successfully!');
}

verifyTutiiHubs().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
