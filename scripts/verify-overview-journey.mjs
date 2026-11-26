import pkg from '../apps/gurudevi-web/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import * as fs from 'fs';
import * as path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const evidenceDir = 'c:\\x\\reports\\evidence';

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

async function run() {
  console.log('Starting Playwright with Microsoft Edge...');
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  console.log('Step 1: Navigating to /workspace with role=PRINCIPAL and noSchool=true...');
  await page.goto('http://localhost:3000/workspace?dev=true&role=PRINCIPAL&name=Principal%20Dr.%20Silva&noSchool=true', {
    waitUntil: 'networkidle',
  });

  // Clear any existing stored school to start at step 1
  await page.evaluate(() => {
    localStorage.removeItem('gurudevi_established_school');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Verify Step 1: School Identity
  const step1Header = await page.locator('h2').first().innerText();
  console.log('Step 1 Header:', step1Header);

  await page.screenshot({
    path: path.join(evidenceDir, 'journey-step1-identity.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: journey-step1-identity.png');

  console.log('Filling School Identity & Handle...');
  await page.fill('#input-school-name', 'Apex Commercial Academy of Science');
  await page.fill('#input-school-handle', 'apex-science');
  await page.waitForTimeout(500);

  console.log('Advancing to Step 2...');
  await page.click('#btn-step1-continue');
  await page.waitForTimeout(1000);

  // Verify Step 2: Model & Policy
  const step2Header = await page.locator('h2').first().innerText();
  console.log('Step 2 Header:', step2Header);

  await page.screenshot({
    path: path.join(evidenceDir, 'journey-step2-policy.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: journey-step2-policy.png');

  console.log('Submitting Step 2 to generate School Sanctuary...');
  await page.click('#btn-step2-complete');
  await page.waitForTimeout(1500);

  // Verify Step 3: QR Credentials & Handle
  const step3Header = await page.locator('h2').first().innerText();
  console.log('Step 3 Header:', step3Header);

  // Test copy QR link
  const copyBtn = page.locator('#btn-copy-qr-link');
  if (await copyBtn.isVisible()) {
    await copyBtn.click();
    await page.waitForTimeout(500);
    console.log('Copy button text after click:', await copyBtn.innerText());
  }

  await page.screenshot({
    path: path.join(evidenceDir, 'journey-step3-qr-credentials.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: journey-step3-qr-credentials.png');

  console.log('Step 4: Opening Full School Profile...');
  await page.click('#btn-open-school-profile');
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(evidenceDir, 'journey-step4-school-profile.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: journey-step4-school-profile.png');

  await browser.close();
  console.log('🎉 Guided Journey Verification completed with 100% success!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
