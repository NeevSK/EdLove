import { chromium } from 'playwright';
import fs from 'node:fs';
const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
try { await page.evaluate(() => { const b=[...document.querySelectorAll('button,[role=button],a')].find((x)=>/agree|accept|consent|i understand|i agree/i.test(x.textContent||'')); if(b)b.click(); }); await page.waitForTimeout(1200);}catch(e){}

const res = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button,[role=button],a,div')].find((b)=>(b.textContent||'').trim()==='Explore as Guest') || null;
  if(!btn) return {found:false};
  const r = btn.getBoundingClientRect();
  const at = document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
  // climb to find outermost absolute overlay ancestor that covers full viewport
  const chain = [];
  let el = at;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    chain.push({ tag: el.tagName, cls: (el.className||'').toString(), pos: cs.position, pe: cs.pointerEvents, z: cs.zIndex, r: {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)} });
    el = el.parentElement;
  }
  const ab = at.getBoundingClientRect();
  return { found:true, topRect: {x:Math.round(ab.x),y:Math.round(ab.y),w:Math.round(ab.width),h:Math.round(ab.height)}, chain };
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
