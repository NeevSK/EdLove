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
  scenario: {
    selector: '#form-scenario',
    padding: '16px',
    backgroundColor: 'rgb(31, 41, 55)',
  },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#runtime-fixture').waitFor({ state: 'attached' });

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

const input = page.getByPlaceholder('Your name');
const saveButton = page.getByRole('button', { name: 'Save profile' });
if ((await input.count()) !== 1 || (await saveButton.count()) !== 1) {
  throw new Error('Missing Button/Input/FormField scenario controls');
}

if ((await input.getAttribute('aria-describedby')) !== 'display-name-helper') {
  throw new Error('Input does not describe its helper text');
}

await saveButton.click();
await page.getByText('Name is required.').waitFor();
if ((await input.getAttribute('aria-describedby')) !== 'display-name-error') {
  throw new Error('Invalid input does not describe its error text');
}

await input.fill('Naveen');
await page.getByRole('button', { name: 'Save profile' }).click();
await page.getByText('Saving profile…').waitFor();
await page.getByText('Could not save your profile. Try again.').waitFor();
await page.getByRole('button', { name: 'Try again' }).click();
await page.getByText('Profile saved.').waitFor();

const buttonHeight = await page
  .getByRole('button', { name: 'Saved' })
  .evaluate((node) => getComputedStyle(node).height);
if (buttonHeight !== '48px')
  throw new Error(`Button height: expected 48px, received ${buttonHeight}`);

const dialogTrigger = page.getByRole('button', { name: 'Open profile actions' });
await dialogTrigger.click();
const dialog = page.getByRole('dialog', { name: 'Profile actions' });
await dialog.waitFor();
const secondaryDialogAction = page.getByRole('button', { name: 'Secondary profile action' });
const dialogClose = page.getByRole('button', { name: 'Close profile actions' });
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Secondary profile action',
);
await page.keyboard.press('Tab');
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Close profile actions',
);
await page.keyboard.press('Tab');
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Secondary profile action',
);
await page.keyboard.press('Shift+Tab');
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Close profile actions',
);
await dialogTrigger.focus();
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Secondary profile action',
);
await page.keyboard.press('Escape');
await dialog.waitFor({ state: 'detached' });
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Open profile actions',
);

await dialogTrigger.click();
await dialogClose.click();
await dialog.waitFor({ state: 'detached' });
await page.waitForFunction(
  () => document.activeElement?.getAttribute('aria-label') === 'Open profile actions',
);

console.log(JSON.stringify({ url, actual, pageErrors: errors }, null, 2));
await browser.close();
