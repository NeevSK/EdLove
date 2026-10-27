import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createBrowserSupabaseClient } from '../supabase/browser';
import { resolveCanonicalDeviceAccount } from './canonicalDeviceAccount';

const mock = vi.hoisted(() => ({ session: vi.fn() }));
vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession: mock.session } }),
}));
const subject = 'f0560000-0000-4000-8000-000000000001';
const account = '123e4567-e89b-8101-8100-426614174001';
const expected = { accessToken: 'fixture-access', subject };
const current = {
  data: { session: { access_token: expected.accessToken, user: { id: subject } } },
  error: null,
};
function identity() {
  return {
    id: account,
    email: 'member@example.invalid',
    display_name: 'Member',
    availableBonds: [],
    activeBond: null,
    scopeBootstrap: {
      version: 1,
      userId: account,
      name: 'Member',
      primaryCapacity: 'principal',
      selection: 'needs_selection',
      activeScope: null,
    },
  };
}
function resolve() {
  const client = createBrowserSupabaseClient();
  if (!client) throw new Error('Missing browser fixture client');
  return resolveCanonicalDeviceAccount(client, expected);
}
beforeEach(() => {
  mock.session.mockReset().mockResolvedValue(current);
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(identity())));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('G1 / returns distinct canonical/provider IDs and validated capacity through session-bound no-store transport', async () => {
  await expect(resolve()).resolves.toMatchObject({
    accountId: account,
    authUserId: subject,
    displayName: 'Member',
    capacity: 'principal',
  });
  const call = vi.mocked(fetch).mock.calls[0];
  expect(call?.[0]).toBe('https://api.example.invalid/api/openapi/identity/resolveIdentity');
  expect(call?.[1]).toMatchObject({ cache: 'no-store', redirect: 'error' });
  expect(new Headers(call?.[1]?.headers).get('X-Expected-Auth-Subject')).toBe(subject);
  expect(new Headers(call?.[1]?.headers).get('Authorization')).toBe('Bearer fixture-access');
});
it.each(['before', 'after'])('G1 / rejects session replacement %s dispatch', async (when) => {
  const changed = {
    data: { session: { ...current.data.session, access_token: 'other-access' } },
    error: null,
  };
  if (when === 'before') mock.session.mockResolvedValue(changed);
  else mock.session.mockResolvedValueOnce(current).mockResolvedValueOnce(changed);
  await expect(resolve()).rejects.toThrow('browser session changed');
  expect(fetch).toHaveBeenCalledTimes(when === 'before' ? 0 : 1);
});
it.each(['provider-id', 'wrong-scope', 'unsupported-capacity'])(
  'G1 / rejects malformed identity %s',
  async (variant) => {
    const payload = identity();
    if (variant === 'provider-id') payload.id = subject;
    if (variant === 'wrong-scope') payload.scopeBootstrap.userId = subject;
    if (variant === 'unsupported-capacity')
      payload.scopeBootstrap.primaryCapacity = 'invented-role';
    vi.mocked(fetch).mockResolvedValue(Response.json(payload));
    await expect(resolve()).rejects.toThrow();
  },
);
it('G1 / denies API outage without inventing a provider-based account', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
  await expect(resolve()).rejects.toThrow('verification is unavailable');
});
it('G1 / fails unconfigured identity before dispatch', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', '');
  await expect(resolve()).rejects.toThrow('not configured');
  expect(fetch).not.toHaveBeenCalled();
});
