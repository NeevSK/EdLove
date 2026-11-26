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
  console.log('Starting Playwright with Microsoft Edge for Onboarding verification...');
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  console.log('Step 1: Navigating to /onboarding...');
  await page.goto('http://localhost:3000/onboarding', {
    waitUntil: 'networkidle',
  });

  // Clear any existing session/draft
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.removeItem('gurudevi_established_school');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Fill in preferred name or accept candidate
  const callMeBtn = page.locator('button:has-text("Call me")');
  const nameInput = page.locator('#onboarding-name');
  if (await callMeBtn.isVisible()) {
    console.log('Clicking Call me button...');
    await callMeBtn.click();
    await page.waitForTimeout(1000);
  } else if (await nameInput.isVisible()) {
    console.log('Entering name: Dr. Silva...');
    await nameInput.fill('Dr. Silva');
    await page.waitForTimeout(500);
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check role selection cards
  console.log('Step 2: Checking role selection cards...');
  const principalRole = page.locator('label:has-text("Principal & Leader")');
  const isPrincipalVisible = await principalRole.isVisible();
  console.log('Principal role card visible:', isPrincipalVisible);

  // Take screenshot of role selection
  await page.screenshot({
    path: path.join(evidenceDir, 'onboarding-roles-with-principal.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: onboarding-roles-with-principal.png');

  // Click Principal role
  console.log('Step 3: Selecting Principal & Leader...');
  await principalRole.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(evidenceDir, 'onboarding-principal-selected.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: onboarding-principal-selected.png');

  // Click Continue
  console.log('Step 4: Clicking Continue...');
  const continueBtn = page.locator('button:has-text("Continue")');
  await continueBtn.click();
  await page.waitForTimeout(1500);

  // Check Dev Sanctuary direct link
  const devLink = page.locator('a:has-text("Enter Dev Sanctuary as Principal & Leader")');
  console.log('Dev Sanctuary direct link visible:', await devLink.isVisible());

  await page.screenshot({
    path: path.join(evidenceDir, 'onboarding-nudge-principal.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: onboarding-nudge-principal.png');

  // Click to enter Sanctuary workspace
  if (await devLink.isVisible()) {
    console.log('Step 5: Clicking Enter Dev Sanctuary as Principal...');
    await devLink.click();
    await page.waitForTimeout(2500);

    console.log('Current URL after entering workspace:', page.url());

    await page.screenshot({
      path: path.join(evidenceDir, 'onboarding-to-workspace-principal.png'),
      fullPage: false,
    });
    console.log('Saved screenshot: onboarding-to-workspace-principal.png');
  }

  await browser.close();
  console.log('🎉 Onboarding Principal verification completed successfully!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
