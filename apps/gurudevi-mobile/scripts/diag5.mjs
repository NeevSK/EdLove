import { chromium } from 'playwright';
import fs from 'node:fs';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
try { await page.evaluate(() => { const b=[...document.querySelectorAll('button,[role=button],a')].find((x)=>/agree|accept|consent|i understand|i agree/i.test(x.textContent||'')); if(b)b.click(); }); await page.waitForTimeout(1200);}catch(e){}

async function testScroll(tag) {
  return await page.evaluate((tag) => {
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        const r = el.getBoundingClientRect();
        if (tag==='before' || el._tested) { /* skip */ }
        return { tag, cls:(el.className||'').toString().slice(0,40), top: el.scrollTop, clientH: el.clientHeight, scrollH: el.scrollHeight, x: Math.round(r.x+r.width/2), y: Math.round(Math.min(r.height-20, 300)) };
      }
    }
    return { tag, none: true };
  }, tag);
}

await page.evaluate(() => {
  window.__sc = null;
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) { window.__sc = el; break; }
  }
});
const scBefore = await page.evaluate(() => (window.__sc ? window.__sc.scrollTop : -1));
// find scroll center
const scInfo = await page.evaluate(() => {
  const el = window.__sc; if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.top + Math.min(r.height-30, 300)) };
});
if (scInfo) { await page.mouse.move(scInfo.x, scInfo.y); await page.mouse.wheel(0, 1500); }
await page.waitForTimeout(400);
const scAfter = await page.evaluate(() => (window.__sc ? window.__sc.scrollTop : -1));
console.log('=== WHEEL BEFORE FIX ===', scBefore, '->', scAfter);

// Now neutralize the full-viewport pointerEvents:auto overlay
const overlayCount = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.position === 'absolute' && cs.pointerEvents === 'auto' && r.width >= window.innerWidth-2 && r.height >= window.innerHeight-2) {
      el.style.pointerEvents = 'none'; n++;
    }
  }
  return n;
});
console.log('=== overlays neutralized ===', overlayCount);

// retest scroll
await page.evaluate(() => {
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) { window.__sc = el; break; }
  }
});
const scInfo2 = await page.evaluate(() => {
  const el = window.__sc; if (!el) return null; const r = el.getBoundingClientRect();
  return { x: Math.round(r.x+r.width/2), y: Math.round(r.top+ Math.min(r.height-30,300)) };
});
if (scInfo2) { await page.mouse.move(scInfo2.x, scInfo2.y); await page.mouse.wheel(0, 1500); }
await page.waitForTimeout(400);
const scAfter2 = await page.evaluate(() => (window.__sc ? window.__sc.scrollTop : -1));
console.log('=== WHEEL AFTER FIX ===', scBefore, '->', scAfter2);

await browser.close();
