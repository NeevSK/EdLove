const { chromium } = require('playwright');
const out = process.argv[2];
const routes = (process.argv[3] || '/self,/welcome').split(',');
const host = process.argv[4] || 'http://explore.localhost:3000';
(async () => {
  const b = await chromium.launch();
  const sizes = [['phone', 390, 844], ['desktop', 1440, 900]];
  const report = [];
  for (const [name, w, h] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: name === 'phone', isMobile: name === 'phone' });
    const page = await ctx.newPage();
    for (const r of routes) {
      try {
        await page.goto(host + r, { waitUntil: 'networkidle', timeout: 120000 });
      } catch (e) { report.push({ r, name, err: String(e).slice(0, 120) }); }
      await page.waitForTimeout(2500);
      const facts = await page.evaluate(() => {
        // Elements that paint an opaque background covering >50% of viewport (excluding html/body)
        const vw = innerWidth, vh = innerHeight, area = vw * vh;
        const painters = [];
        const scrollers = [];
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el);
          const rc = el.getBoundingClientRect();
          const a = Math.max(0, Math.min(rc.right, vw) - Math.max(rc.left, 0)) * Math.max(0, Math.min(rc.bottom, vh) - Math.max(rc.top, 0));
          const bg = cs.backgroundColor;
          const opaque = bg && !/rgba\(.*,\s*0\)$/.test(bg) && bg !== 'transparent' && !/rgba\(.*,\s*0?\.\d+\)$/.test(bg);
          if (a > area * 0.5 && (opaque || (cs.backgroundImage !== 'none' && !el.closest('[data-world-backdrop]'))))
            painters.push((el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName) + ' ' + bg);
          const oy = cs.overflowY;
          if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2)
            scrollers.push({ c: (typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName), sbw: el.offsetWidth - el.clientWidth, sw: cs.scrollbarWidth });
        }
        const small = [...document.querySelectorAll('a,button,[role=button],input,select,[role=tab]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).length;
        const all = document.querySelectorAll('a,button,[role=button],input,select,[role=tab]').length;
        const docScrollbar = innerWidth - document.documentElement.clientWidth;
        return { title: document.title, url: location.pathname, painters: painters.slice(0, 6), scrollers: scrollers.slice(0, 8), docScrollbar, smallTargets: small, targets: all, hScroll: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      report.push({ r, name, ...facts });
      await page.screenshot({ path: `${out}/${name}${r.replace(/\//g, '_')}.png` });
    }
    await ctx.close();
  }
  await b.close();
  console.log(JSON.stringify(report, null, 1));
})();
