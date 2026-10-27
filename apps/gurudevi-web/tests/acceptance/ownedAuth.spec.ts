import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { appendFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { IdentityBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';

const project = 'qzoawolfkuwiuyaoiybz';
const origin = `https://${project}.supabase.co`;
const email = `owned-web-${randomUUID()}@example.invalid`;
const password = randomBytes(24).toString('base64url');
let secret = '';
let subject: string | null = null;
let canonical: string | null = null;
let accepted = false;

function readDevelopmentSecret(): string {
  try {
    const cli = fileURLToPath(
      new URL('../../../../node_modules/supabase/dist/supabase.js', import.meta.url),
    );
    const data: unknown = JSON.parse(
      execFileSync(
        process.execPath,
        [
          cli,
          'projects',
          'api-keys',
          '--project-ref',
          project,
          '--reveal',
          '--output-format',
          'json',
        ],
        {
          encoding: 'utf8',
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      ),
    );
    if (typeof data !== 'object' || data === null || !('keys' in data) || !Array.isArray(data.keys))
      throw new Error('Invalid key inventory');
    for (const row of data.keys) {
      if (
        typeof row === 'object' &&
        row !== null &&
        'type' in row &&
        row.type === 'secret' &&
        'api_key' in row &&
        typeof row.api_key === 'string' &&
        row.api_key.startsWith('sb_secret_')
      )
        return row.api_key;
    }
  } catch {
    throw new Error('Unable to read Development acceptance credentials through the connected CLI.');
  }
  throw new Error('No modern Development secret key is available.');
}

function admin(path: string, method: 'POST' | 'PUT', body: Record<string, unknown>) {
  return fetch(`${origin}/auth/v1/admin/${path}`, {
    method,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
}

test.beforeAll(async ({ browser }) => {
  if (!browser.isConnected()) throw new Error('Acceptance browser is unavailable.');
  if (
    process.env.AUTH_ACCEPTANCE_TARGET !== 'development' ||
    process.env.EXPO_PUBLIC_SUPABASE_URL !== origin ||
    process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:3001'
  )
    throw new Error(
      'Owned auth acceptance requires the explicitly authorized Development project and local API.',
    );
  secret = readDevelopmentSecret();
  const response = await admin('users', 'POST', {
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Owned Web Acceptance' },
  });
  if (!response.ok)
    throw new Error(`Development fixture creation failed with HTTP ${response.status}.`);
  const body: unknown = await response.json();
  if (typeof body !== 'object' || body === null || !('id' in body) || typeof body.id !== 'string')
    throw new Error('Development fixture returned no subject.');
  subject = body.id;
});

test.afterAll(async () => {
  let banned = false;
  if (subject) {
    const response = await admin(`users/${subject}`, 'PUT', { ban_duration: '876000h' });
    banned = response.ok;
  }
  const report = {
    target: 'development',
    project,
    subject,
    canonical,
    accepted,
    fixtureBanned: banned,
    evidence:
      'G4 browser with real local Next/Hono and hosted Development Supabase; admin-confirmed fixture, no email delivery proof',
  };
  await appendFile(
    fileURLToPath(
      new URL('../../../../reports/auth-web-owned-api-acceptance-attempts.jsonl', import.meta.url),
    ),
    `${JSON.stringify(report)}\n`,
  );
  await writeFile(
    fileURLToPath(
      new URL('../../../../reports/auth-web-owned-api-acceptance.json', import.meta.url),
    ),
    JSON.stringify(report, null, 2),
  );
  secret = '';
  if (subject && !banned)
    throw new Error('Development fixture ban failed; inspect the acceptance report.');
});

test('G4 real password login resolves canonical UUIDv8 through Sanctuary, then signs out', async ({
  page,
}) => {
  await page.goto('/sign-in?returnTo=%2Fself');
  await page.getByText('Use a password instead', { exact: true }).click();
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  const identity = page.waitForResponse(
    (response) => response.url() === 'http://localhost:3001/api/openapi/identity/resolveIdentity',
  );
  await page.getByRole('button', { name: 'Sign in with password', exact: true }).click();
  const resolved = await identity;
  expect(resolved.status()).toBe(200);
  const payload: unknown = await resolved.json();
  const parsed = IdentityBootstrapSchema.safeParse(payload);
  if (!parsed.success)
    throw new Error(
      `Identity response contract mismatch: ${JSON.stringify(parsed.error.issues.map(({ code, path }) => ({ code, path })))}`,
    );
  if (typeof payload !== 'object' || payload === null || !('id' in payload))
    throw new Error('Identity bootstrap omitted its account.');
  canonical = CanonicalAccountIdSchema.parse(payload.id);
  expect(canonical).not.toBe(subject);
  await page.waitForURL(/\/self$/);
  await expect(
    page.getByRole('heading', { name: 'Complete your enrollment first', exact: true }),
  ).toBeVisible();
  const records: unknown = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('gurudevi_device_accounts') ?? '[]'),
  );
  expect(records).toEqual([expect.objectContaining({ accountId: canonical, authUserId: subject })]);
  await page.getByRole('link', { name: 'Continue enrollment', exact: true }).click();
  await page.getByRole('button', { name: /Let’s begin/ }).click();
  await page.getByPlaceholder('e.g. Ananda Silva').fill('Owned Web Acceptance');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('radio', { name: /Teacher/ }).check();
  await page.getByRole('button', { name: 'Enter my Sanctuary', exact: true }).click();
  await page.waitForURL(/\/self$/);
  await expect(page.getByTitle('Profile: Owned Web Acceptance', { exact: true })).toBeVisible();
  await page.screenshot({
    path: fileURLToPath(
      new URL('../../../../reports/auth-web-owned-api-entry.png', import.meta.url),
    ),
  });
  const signedOut = await page.request.post('/auth/signout', {
    headers: { Origin: 'http://localhost:3000' },
  });
  expect(signedOut.status()).toBeLessThan(400);
  await page.goto('/self');
  await expect(page.getByTitle('Profile: Owned Web Acceptance', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Complete your enrollment first', exact: true }),
  ).toHaveCount(0);
  accepted = true;
});
