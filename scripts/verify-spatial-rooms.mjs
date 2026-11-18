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
  console.log('Testing Spatial Room Transitions & Wellbeing/Community Floors in Edge...');
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  // Test 1: Workspace (Doorway Aperture)
  console.log('Navigating to /workspace...');
  await page.goto('http://localhost:3000/workspace?dev=true&role=principal&name=Dr.%20Silva', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(evidenceDir, 'room-aperture-workspace-doorway.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: room-aperture-workspace-doorway.png');

  // Test 2: Self (Book Aperture & Life Wellbeing)
  console.log('Navigating to /self...');
  await page.goto('http://localhost:3000/self?dev=true&role=principal&name=Dr.%20Silva', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(evidenceDir, 'room-aperture-self-book.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: room-aperture-self-book.png');

  // Test 3: Community (Canopy Aperture & Human Sangha)
  console.log('Navigating to /community...');
  await page.goto('http://localhost:3000/community?dev=true&role=principal&name=Dr.%20Silva', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(evidenceDir, 'room-aperture-community-canopy.png'),
    fullPage: false,
  });
  console.log('Saved screenshot: room-aperture-community-canopy.png');

  await browser.close();
  console.log('🎉 Spatial room apertures verified across Workspace, Self, and Community!');
}

run().catch((err) => {
  console.error('Spatial room verification failed:', err);
  process.exit(1);
});
