#!/usr/bin/env node
/**
 * Checks a deployed Gurudevi web app answers as the build said it would: the security headers,
 * Explore allowed to connect nowhere but itself, a deep link opening the app, and the app-link
 * files served as JSON.
 *
 *   node scripts/check-live-headers.mjs https://explore.gurudevi.app explore
 *   node scripts/check-live-headers.mjs https://<preview>.pages.dev sanctuary
 */
const [base, surface] = process.argv.slice(2);
if (!base || !['explore', 'sanctuary'].includes(surface ?? '')) {
  console.error('usage: check-live-headers.mjs <url> explore|sanctuary');
  process.exit(2);
}
const failures = [];
const expect = (ok, message) => ok || failures.push(message);

async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  await response.body?.cancel();
  return response;
}

const home = await get('/');
expect(home.status === 200, `/ answered ${home.status}`);
const csp = home.headers.get('content-security-policy') ?? '';
expect(csp.includes("frame-ancestors 'none'"), 'CSP missing or without frame-ancestors');
expect(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), 'script-src allows inline or eval');
const connect = csp.match(/connect-src ([^;]*)/)?.[1]?.trim();
if (surface === 'explore') expect(connect === "'self'", `Explore connect-src is "${connect}"`);
expect(home.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is not DENY');
expect(home.headers.get('x-content-type-options') === 'nosniff', 'nosniff missing');
expect(Boolean(home.headers.get('strict-transport-security')), 'HSTS missing');

const deep = await get('/workspace/attendance');
expect(deep.status === 200, `a deep link answered ${deep.status}, not the app`);

for (const file of ['/.well-known/assetlinks.json', '/.well-known/apple-app-site-association']) {
  const response = await get(file);
  expect(response.status === 200, `${file} answered ${response.status}`);
  expect(
    (response.headers.get('content-type') ?? '').includes('application/json'),
    `${file} is not served as JSON`,
  );
}

if (failures.length) {
  for (const failure of failures) console.error(`[FAIL] ${failure}`);
  process.exit(1);
}
console.log(`[PASS] ${surface} at ${base}`);
