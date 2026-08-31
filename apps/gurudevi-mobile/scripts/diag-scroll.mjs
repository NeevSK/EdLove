import { chromium } from 'playwright';
import fs from 'node:fs';

const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync) || bravePath;

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[PAGEERROR] ${e.message}`));

await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);

// Dismiss PDPA modal if present (click "I agree" / accept). Find its button.
try {
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, [role=button], a')];
    const hit = btns.find((b) => /agree|accept|consent|i understand|i agree/i.test(b.textContent || ''));
    if (hit) hit.click();
  });
  await page.waitForTimeout(1500);
} catch (e) { console.log('modal dismiss skip', e.message); }

const diag = await page.evaluate(() => {
  const root = document.getElementById('root');
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
      overflowY: cs.overflowY,
      overflowX: cs.overflowX,
      height: Math.round(el.clientHeight),
      scrollH: el.scrollHeight,
      scrollT: Math.round(el.scrollTop),
    };
  };
  // find every element that could scroll (overflowY auto/scroll) from root down
  const candidates = [];
  const walk = (el) => {
    if (!el || el.nodeType !== 1) return;
    const cs = getComputedStyle(el);
    if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      candidates.push(pick(el));
    }
    el.childNodes.forEach((c) => walk(c));
  };
  walk(root);
  return {
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyScrollH: document.body.scrollHeight,
    bodyClientH: document.body.clientHeight,
    winScrollY: window.scrollY,
    root: pick(root),
    scrollableCandidates: candidates.slice(0, 20),
    elementCount: root ? root.getElementsByTagName('*').length : 0,
  };
});

console.log('=== DOM SCROLL DIAGNOSTIC ===');
console.log(JSON.stringify(diag, null, 2));

// Try wheel scrolling over middle of page
const before = await page.evaluate(() => window.scrollY);
await page.mouse.move(640, 500);
await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
const after = await page.evaluate(() => ({ win: window.scrollY, body: document.body.scrollTop }));
console.log('=== WHEEL TEST ===', JSON.stringify({ before, after }, null, 2));

console.log('=== CONSOLE (last 15) ===');
console.log(logs.slice(-15).join('\n'));

await page.screenshot({ path: 'C:/x/reports/playwright/screenshots/welcome_diag.png', fullPage: false });
await browser.close();
