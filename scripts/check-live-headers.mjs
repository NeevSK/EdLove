#!/usr/bin/env node
/**
 * Checks a deployed Gurudevi site answers as its build said it would: the security headers on
 * every host; for the app hosts, Explore allowed to connect nowhere but itself, a deep link opening
 * the app and the app-link files served as JSON; for the public site, a per-page content policy.
 *
 *   node scripts/check-live-headers.mjs https://explore.gurudevi.app explore
 *   node scripts/check-live-headers.mjs https://<preview>.pages.dev sanctuary
 *   node scripts/check-live-headers.mjs https://gurudevi.app public
 */
const [base, surface] = process.argv.slice(2);
if (!base || !['explore', 'sanctuary', 'public'].includes(surface ?? '')) {
  console.error('usage: check-live-headers.mjs <url> explore|sanctuary|public');
  process.exit(2);
}
const failures = [];
const expect = (ok, message) => ok || failures.push(message);

async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  await response.body?.cancel();
  return response;
}

if (surface === 'public') {
  const response = await fetch(new URL('/', base));
  const html = await response.text();
  expect(response.status === 200, `/ answered ${response.status}`);
  expect(
    (response.headers.get('content-security-policy') ?? '').includes("frame-ancestors 'none'"),
    'framing is not forbidden',
  );
  expect(response.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is not DENY');
  expect(Boolean(response.headers.get('strict-transport-security')), 'HSTS missing');
  const policy = html.match(/http-equiv="content-security-policy" content="([^"]*)"/i)?.[1] ?? '';
  expect(/script-src 'self' 'sha256-/.test(policy), 'the page has no hashed script policy');
  expect(!policy.includes("'unsafe-inline'"), 'the page policy allows inline code');
  report();
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

report();

function report() {
  if (failures.length) {
    for (const failure of failures) console.error(`[FAIL] ${failure}`);
    process.exit(1);
  }
  console.log(`[PASS] ${surface} at ${base}`);
  process.exit(0);
}
