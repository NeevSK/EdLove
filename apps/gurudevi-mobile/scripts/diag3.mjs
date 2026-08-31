import { chromium } from 'playwright';
import fs from 'node:fs';

const exe = ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe','C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(4000);
try {
  await page.evaluate(() => {
    const hit = [...document.querySelectorAll('button, [role=button], a')].find((b) => /agree|accept|consent|i (understand|agree)/i.test(b.textContent || ''));
    if (hit) hit.click();
  });
  await page.waitForTimeout(1200);
} catch(e){}

const res = await page.evaluate(() => {
  // locate the "Explore as Guest" button
  const btn = [...document.querySelectorAll('button, [role=button], a, div')].find((b) => {
    const t = (b.textContent || '').trim();
    return t === 'Explore as Guest' && b.children.length <= 3;
  }) || null;
  if (!btn) return { btn: null };
  const r = btn.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  const atPoint = document.elementFromPoint(cx, cy);

  const describe = (el, depth) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      depth,
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 160),
      position: cs.position,
      zIndex: cs.zIndex,
      pointerEvents: cs.pointerEvents,
      rect: (() => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; })(),
      parent: el.parentElement ? describe(el.parentElement, depth + 1) : null,
    };
  };

  return { btnFound: true, btnRect: {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, top: describe(atPoint, 0) };
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
