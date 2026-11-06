import pkg from '../node_modules/.pnpm/@playwright+test@1.64.1/node_modules/@playwright/test/index.js';
const { chromium } = pkg;

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('--- Navigating to http://localhost:3000/welcome ---');
  await page.goto('http://localhost:3000/welcome');
  await page.waitForLoadState('networkidle');

  const themeBtnWelcome = await page.$('.gd-theme-switcher-btn, [class*="themeToggleBtn"]');
  if (themeBtnWelcome) {
    const html = await themeBtnWelcome.evaluate(el => el.outerHTML);
    const box = await themeBtnWelcome.boundingBox();
    console.log('Welcome page theme button HTML:', html);
    console.log('Welcome page theme button box:', box);
  } else {
    console.log('Theme button NOT FOUND on /welcome');
  }

  console.log('\n--- Navigating to http://localhost:3000/self?mode=explore ---');
  await page.goto('http://localhost:3000/self?mode=explore');
  await page.waitForLoadState('networkidle');

  const themeBtnSelf = await page.$('.gd-theme-switcher-btn, [class*="themeToggleBtn"]');
  if (themeBtnSelf) {
    const html = await themeBtnSelf.evaluate(el => el.outerHTML);
    const text = await themeBtnSelf.innerText();
    const box = await themeBtnSelf.boundingBox();
    console.log('Explore /self theme button HTML:', html);
    console.log('Explore /self theme button innerText:', text);
    console.log('Explore /self theme button box:', box);

    // Click it to see popover
    await themeBtnSelf.click();
    await page.waitForTimeout(300);

    const popover = await page.$('.gd-theme-switcher-popover, [class*="themePopover"]');
    if (popover) {
      const popoverHtml = await popover.evaluate(el => el.outerHTML);
      const popoverBox = await popover.boundingBox();
      const popoverZ = await popover.evaluate(el => window.getComputedStyle(el).zIndex);
      console.log('\nPopover found! zIndex:', popoverZ);
      console.log('Popover box:', popoverBox);
    } else {
      console.log('\nPopover NOT FOUND after click');
    }
  } else {
    console.log('Theme button NOT FOUND on /self?mode=explore');
  }

  await page.screenshot({ path: 'reports/browser-inspect-explore.png' });
  console.log('\nSaved screenshot to reports/browser-inspect-explore.png');

  await browser.close();
}

inspect().catch(console.error);
