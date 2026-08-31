import { chromium } from 'playwright';
import fs from 'node:fs';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
try { await page.evaluate(() => { const b=[...document.querySelectorAll('button,[role=button],a')].find((x)=>/agree|accept|consent|i understand|i agree/i.test(x.textContent||'')); if(b)b.click(); }); await page.waitForTimeout(1200);}catch(e){}

const res = await page.evaluate(() => {
  // find the overlay
  let overlay = null;
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.position==='absolute' && cs.pointerEvents==='auto' && r.width>=window.innerWidth-2 && r.height>=window.innerHeight-2) { overlay = el; break; }
  }
  if (!overlay) return null;
  // walk up and capture the tree width including siblings
  const out = {};
  let cur = overlay;
  let depth = 0;
  while (cur && depth < 8) {
    const cs = getComputedStyle(cur);
    const r = cur.getBoundingClientRect();
    const kids = [...cur.childNodes].filter(n=>n.nodeType===1);
    out['d'+depth] = {
      tag: cur.tagName,
      cls: (cur.className||'').toString().slice(0,100),
      pos: cs.position, pe: cs.pointerEvents,
      kids: kids.map(k=>({t:k.tagName, c:(k.className||'').toString().slice(0,50), abs:(()=>{const s=getComputedStyle(k);return s.position==='absolute'})()})),
      siblingCount: cur.parentElement ? cur.parentElement.children.length : 0,
    };
    cur = cur.parentElement; depth++;
  }
  return out;
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
