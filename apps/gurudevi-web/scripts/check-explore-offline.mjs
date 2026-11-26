#!/usr/bin/env node
/**
 * Opens Explore's places in a real browser and fails on any request that leaves Explore's own
 * origin (fonts aside, until they are self-hosted). The content policy already blocks such a
 * request; this proves no screen even tries, which the bundle check cannot see.
 *
 *   node apps/gurudevi-web/scripts/check-explore-offline.mjs https://explore.gurudevi.app
 */
import { chromium } from '@playwright/test';

const base = process.argv[2];
if (!base) {
  console.error('usage: check-explore-offline.mjs <explore url>');
  process.exit(2);
}
const origin = new URL(base).origin;
const ALLOWED = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);
const PLACES = [
  '/welcome',
  '/self',
  '/workspace',
  '/workspace/attendance',
  '/community',
  '/library',
  '/profile',
  '/notifications',
  '/settings',
  '/support',
  '/sign-in',
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const leaks = new Set();
const errors = new Set();
try {
  for (const place of PLACES) {
    const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
    page.on('request', (request) => {
      const target = new URL(request.url());
      if (!['http:', 'https:', 'ws:', 'wss:'].includes(target.protocol)) return;
      if (target.origin === origin || ALLOWED.has(target.origin)) return;
      // Once an account address has forwarded the tab to sanctuary, it is no longer Explore.
      if (new URL(request.frame().url() || base).origin !== origin) return;
      if (request.isNavigationRequest() && place === '/sign-in') return;
      leaks.add(`${place} → ${request.method()} ${target.origin}${target.pathname}`);
    });
    page.on('pageerror', (error) => errors.add(`${place}: ${error.message.slice(0, 160)}`));
    await page.goto(new URL(place, base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    if (place === '/sign-in' && new URL(page.url()).origin === origin)
      errors.add('/sign-in stayed on Explore instead of opening on sanctuary');
    await page.close();
  }
} finally {
  await browser.close();
}

for (const error of errors) console.error(`[ERROR] ${error}`);
for (const leak of leaks) console.error(`[LEAK] ${leak}`);
if (leaks.size || errors.size) process.exit(1);
console.log(`[PASS] Explore at ${base} stayed on its own origin across ${PLACES.length} places`);
