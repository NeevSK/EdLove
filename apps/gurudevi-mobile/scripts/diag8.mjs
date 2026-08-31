import { chromium } from 'playwright';
import fs from 'node:fs';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
// Navigate DIRECTLY to /welcome, bypassing the index splash
await page.goto('http://localhost:8081/welcome', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4500);
try { await page.evaluate(() => { const b=[...document.querySelectorAll('button,[role=button],a')].find((x)=>/agree|accept|consent|i understand|i agree/i.test(x.textContent||'')); if(b)b.click(); }); await page.waitForTimeout(1200);}catch(e){}

const info = await page.evaluate(() => {
  const overlays = [];
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.position==='absolute' && cs.pointerEvents==='auto' && r.width>=window.innerWidth-2 && r.height>=window.innerHeight-2) {
      overlays.push({ empty: el.children.length===0, cls:(el.className||'').toString().slice(0,60)});
    }
  }
  return { href: location.href, overlayCount: overlays.length, overlays };
});

// test scroll on this direct load
await page.evaluate(() => {
  for (const el of document.querySelectorAll('*')) { const cs=getComputedStyle(el); if(/auto|scroll/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1){ window.__sc=el; break; } }
});
const scBefore = await page.evaluate(() => (window.__sc?window.__sc.scrollTop:-1));
const pt = await page.evaluate(() => { const el=window.__sc; if(!el)return null; const r=el.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.top+Math.min(r.height-30,300))}; });
if(pt){ await page.mouse.move(pt.x,pt.y); await page.mouse.wheel(0,1500); }
await page.waitForTimeout(400);
const scAfter = await page.evaluate(() => (window.__sc?window.__sc.scrollTop:-1));
console.log(JSON.stringify({ info, scroll: [scBefore, scAfter] }, null, 2));
await browser.close();
