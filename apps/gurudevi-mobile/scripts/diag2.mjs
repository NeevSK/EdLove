import { chromium } from 'playwright';
import fs from 'node:fs';

const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);

const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text().slice(0,200)}`));

await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
// dismiss PDPA
try {
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, [role=button], a')];
    const hit = btns.find((b) => /agree|accept|consent|i (understand|agree)/i.test(b.textContent || ''));
    if (hit) hit.click();
  });
  await page.waitForTimeout(1500);
} catch(e){ console.log('modal skip'); }

// Find the scrollable div and test wheel
const info = await page.evaluate(() => {
  const sc = (() => {
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        return el;
      }
    }
    return null;
  })();
  if (!sc) return { found: false };
  const r = sc.getBoundingClientRect();
  return {
    found: true,
    tag: sc.tagName, cls: sc.className,
    clientH: sc.clientHeight, scrollH: sc.scrollHeight,
    top: sc.getBoundingClientRect().top,
    left: sc.getBoundingClientRect().left,
    width: sc.getBoundingClientRect().width,
  };
});
console.log('=== SCROLLER ===', JSON.stringify(info));

if (info.found) {
  // wheel over the scroller's middle
  const x = info.left + Math.min(300, info.width/2);
  const y = info.top + 300;
  await page.mouse.move(x, y);
  const st0 = await page.evaluate(() => { for (const el of document.querySelectorAll('*')) { const cs=getComputedStyle(el); if(/auto|scroll/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1) return el.scrollTop; } return -1; });
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(400);
  const st1 = await page.evaluate(() => { for (const el of document.querySelectorAll('*')) { const cs=getComputedStyle(el); if(/auto|scroll/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1) return el.scrollTop; } return -1; });
  console.log('=== WHEEL scrollTop', st0, '->', st1);
}

// Click test: find a button visible and click, report if something changes
const clickTest = await page.evaluate(() => {
  const texts = ['Explore', 'Guest', 'Get Started', 'Login', 'Sign in', 'Explore as Guest'];
  let target = null, btnInfo = null;
  for (const t of texts) {
    const candidates = [...document.querySelectorAll('button, [role=button], a, [class*=btn]')];
    const el = candidates.find((b) => { const s = (b.textContent || ' ').trim(); return s.includes(t) || s === t; });
    if (el) { target = el; break; }
  }
  if (!target) return { found: false };
  const r = target.getBoundingClientRect();
  const atPoint = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
  btnInfo = { text: (target.textContent||'').trim().slice(0,40), rect: {x:r.x,y:r.y,w:r.width,h:r.height}, topEl: atPoint ? atPoint.tagName + '.' + (atPoint.className||'').toString().slice(0,40) : null, sameAsTarget: atPoint === target };
  return { found: true, btnInfo };
});
console.log('=== CLICK TEST ===', JSON.stringify(clickTest));

// Capture console around click
await page.screenshot({ path: 'C:/x/reports/playwright/screenshots/welcome_diag2.png' });
console.log('=== last logs ==='); console.log(logs.slice(-10).join('\n'));
await browser.close();
