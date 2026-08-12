import process from 'node:process';
import { chromium } from 'playwright';

const url = process.env.STYLE_ENGINE_FIXTURE_URL || 'http://127.0.0.1:4176/';
const expected = {
  runtime: { selector: '#runtime-fixture', padding: '16px', backgroundColor: 'rgb(11, 18, 32)' },
  box: { selector: '#box-fixture', padding: '16px', backgroundColor: 'rgb(31, 41, 55)' },
  text: { selector: '#text-fixture', color: 'rgb(248, 250, 252)', fontSize: '20px' },
  pressable: {
    selector: '#pressable-fixture',
    padding: '12px',
    marginTop: '16px',
    backgroundColor: 'rgb(14, 165, 233)',
  },
  icon: { selector: 'svg#icon-fixture', color: 'rgb(248, 250, 252)', marginTop: '16px' },
  list: {
    selector: '#list-fixture',
    padding: '8px',
    marginTop: '16px',
    backgroundColor: 'rgb(31, 41, 55)',
  },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto(url, { waitUntil: 'networkidle' });

const actual = {};
for (const [name, assertion] of Object.entries(expected)) {
  const element = page.locator(assertion.selector).first();
  if ((await element.count()) === 0) throw new Error(`Missing fixture element: ${name}`);
  actual[name] = await element.evaluate((node) => {
    const styles = getComputedStyle(node);
    return {
      padding: styles.padding,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      marginTop: styles.marginTop,
    };
  });
  for (const [property, value] of Object.entries(assertion)) {
    if (property !== 'selector' && actual[name][property] !== value) {
      throw new Error(`${name}.${property}: expected ${value}, received ${actual[name][property]}`);
    }
  }
}

if (errors.length > 0) throw new Error(`Fixture page errors: ${errors.join('; ')}`);
console.log(JSON.stringify({ url, actual, pageErrors: errors }, null, 2));
await browser.close();
