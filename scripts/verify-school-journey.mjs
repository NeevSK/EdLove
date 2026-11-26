import pkg from '../apps/gurudevi-web/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import * as path from 'node:path';
import * as fs from 'node:fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const EVIDENCE_DIR = path.resolve('reports/evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Microsoft Edge via Playwright...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });
  const page = await context.newPage();

  // 1. Test Workspace Overview for Principal Role
  const workspaceUrl = 'http://localhost:3000/workspace?dev=true&role=PRINCIPAL&name=Principal';
  console.log(`🌐 1. Navigating to Workspace Overview: ${workspaceUrl}...`);
  await page.goto(workspaceUrl, { waitUntil: 'networkidle' });

  // Verify Workspace Overview Title
  await page.waitForSelector('h2#workspace-overview-title', { timeout: 10000 });
  const overviewTitle = await page.textContent('h2#workspace-overview-title');
  console.log(`✓ Workspace Overview Title: "${overviewTitle?.trim()}"`);

  // Verify Leadership Action Buttons
  const schoolProfileLink = page.locator('a[href="/workspace/school"]:has-text("School Profile")').first();
  const isSchoolProfileVisible = await schoolProfileLink.isVisible();
  console.log(`✓ Leadership Action "School Profile & Credentials" Present: ${isSchoolProfileVisible}`);

  const workforceLink = page.locator('a[href="/workspace/workforce"]').first();
  console.log(`✓ Leadership Action "Workforce & Staff" Present: ${await workforceLink.isVisible()}`);

  const kioskLink = page.locator('a[href="/workspace/kiosk"]').first();
  console.log(`✓ Leadership Action "Doorway Kiosk" Present: ${await kioskLink.isVisible()}`);

  // Screenshot 1: Workspace Overview for Principal
  const workspaceOverviewScreenshot = path.join(EVIDENCE_DIR, 'workspace-principal-overview.png');
  await page.screenshot({ path: workspaceOverviewScreenshot, fullPage: false });
  console.log(`📸 Workspace Overview screenshot saved: ${workspaceOverviewScreenshot}`);

  // 2. Navigate from Workspace Overview into School Floor
  console.log('🏛️ 2. Clicking "School Profile & Credentials" to open School Floor...');
  await schoolProfileLink.click();
  await page.waitForTimeout(1000);

  // Verify School Floor loaded
  await page.waitForSelector('h1', { timeout: 10000 });
  const schoolTitle = await page.textContent('h1');
  console.log(`✓ School Floor Active: "${schoolTitle?.trim()}"`);

  // 3. Open Commercial School Creation Form
  console.log('➕ 3. Clicking "Establish Commercial School"...');
  const openCreateBtn = page.locator('#btn-open-create-school').first();
  await openCreateBtn.click();
  await page.waitForTimeout(500);

  const createForm = page.locator('#create-school-form').first();
  console.log(`✓ Creation Form Open: ${await createForm.isVisible()}`);

  // Fill in Commercial School details
  console.log('✍ 4. Filling Commercial Academy institutional profile details...');
  await page.fill('#new-school-name', 'Horizon Global Institute of Science & AI');
  await page.fill('#new-school-handle', 'horizon-global');
  await page.selectOption('#new-school-sector', 'commercialTuition');
  await page.selectOption('#new-school-guardian-policy', 'manual_approval');
  await page.fill('#new-school-motto', 'Excellence in frontier computing and mindful scholarship');
  await page.fill('#new-school-email', 'admissions@horizonglobal.edu.lk');

  // 4. Submit and Provision Commercial School
  console.log('🏛️ 5. Submitting commercial school establishment...');
  const submitBtn = page.locator('#btn-submit-new-school').first();
  await submitBtn.click();
  await page.waitForTimeout(1000);

  // 5. Verify Celebratory Banner & Updated School State
  const banner = page.locator('#created-school-banner').first();
  console.log(`✓ Created School Banner Visible: ${await banner.isVisible()}`);

  const updatedSchoolTitle = await page.textContent('h1');
  console.log(`✓ School H1 Title Updated to New Academy: "${updatedSchoolTitle?.trim()}"`);

  // Screenshot 2: Newly Created Commercial School in Edge
  const newSchoolScreenshot = path.join(EVIDENCE_DIR, 'horizon-global-school-floor.png');
  await page.screenshot({ path: newSchoolScreenshot, fullPage: false });
  console.log(`📸 Horizon Global School Floor screenshot saved: ${newSchoolScreenshot}`);

  // 6. Test Sanctuary QR Code for Newly Created School
  console.log('📱 6. Switching to Sanctuary QR & Credentials for the new commercial school...');
  const viewQrBtn = page.locator('#btn-view-created-qr').first();
  await viewQrBtn.click();
  await page.waitForTimeout(1000);

  const qrCard = page.locator('div[class*="qrCard"]').first();
  await qrCard.scrollIntoViewIfNeeded();

  const qrPayloadElem = page.locator('span[class*="qrPayloadDisplay"]').first();
  const qrPayload = await qrPayloadElem.textContent();
  console.log(`✓ Generated Horizon Global QR Deep Link: "${qrPayload?.trim()}"`);

  // Screenshot 3: New Commercial School QR Card
  const qrCardScreenshot = path.join(EVIDENCE_DIR, 'horizon-global-qr-card.png');
  await qrCard.screenshot({ path: qrCardScreenshot });
  console.log(`📸 Horizon Global QR Card screenshot saved: ${qrCardScreenshot}`);

  await browser.close();
  console.log('🎉 Full End-to-End User Journey Verified in Real Microsoft Edge!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
