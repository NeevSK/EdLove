import { chromium } from 'playwright';
import fs from 'node:fs';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
try { await page.evaluate(() => { const b=[...document.querySelectorAll('button,[role=button],a')].find((x)=>/agree|accept|consent|i understand|i agree/i.test(x.textContent||'')); if(b)b.click(); }); await page.waitForTimeout(1200);}catch(e){}

const out = await page.evaluate(() => {
  // locate the full-viewport absolute overlay
  let overlay = null;
  for (const el of document.querySelectorAll('div')) {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.position==='absolute' && cs.pointerEvents==='auto' && r.width>=window.innerWidth-2 && r.height>=window.innerHeight-2 && el.children.length===0) { overlay = el; break; }
  }
  if (!overlay) return { found:false };
  const names = [];
  let cur = overlay;
  const dereg = /^function |^class |^export/;
  for (let i=0;i<12 && cur;i++) {
    let f = null;
    try {
      const key = Object.keys(cur).find(k=>k.startsWith('__reactFiber$')||k.startsWith('__reactInternalInstance$'));
      if (key) {
        let fiber = cur[key];
        while (fiber) {
          if (fiber.elementType && typeof fiber.elementType === 'object' && fiber.elementType?.render) {
            f = fiber.elementType.render?.name || fiber.elementType?.name;
          } else if (typeof fiber.elementType === 'string') {
            f = '#'+fiber.elementType;
          } else if (typeof fiber.elementType === 'function') {
            f = (fiber.elementType.name) || 'fn';
          } else if (fiber.elementType?.displayName) {
            f = fiber.elementType.displayName;
          }
          if (f) { names.push(f); }
          fiber = fiber.return;
        }
      }
    } catch(e){}
    cur = cur.parentElement;
  }
  return { found:true, fiberChain: [...new Set(names.filter(Boolean))].slice(0, 25) };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
