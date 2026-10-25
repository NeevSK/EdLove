import { SovereignError } from '@repo/core/types/Errors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySupabaseSessionDetails } from '../core/adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';
import { createAuthCredentialRoutes } from '../core/routes/authCredentials';

vi.mock('../core/adapters/verifySupabaseSession', () => ({
  verifySupabaseSessionDetails: vi.fn(),
}));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: vi.fn() }));

const account = '123e4567-e89b-8101-8100-426614174000';
const subject = 'f0500000-0000-4000-8000-000000000001';
const identityId = 'f0500000-0000-4000-8000-000000000002';
const app = createAuthCredentialRoutes();
const get = (authorization = 'Bearer synthetic-token') =>
  app.request('/credentials', {
    headers: { Authorization: authorization },
  });
beforeEach(() => {
  vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
    claims: { sub: subject },
    user: {
      id: subject,
      is_anonymous: false,
      identities: [{ identity_id: identityId, user_id: subject, provider: 'google' }],
    },
  });
  vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: account });
});
afterEach(() => vi.resetAllMocks());

describe('G1 credential inventory authenticated account boundary', () => {
  it('uses request runtime bindings for both issuer verification and account resolution', async () => {
    const environment = {
      SUPABASE_URL: 'https://runtime.example.invalid',
      DATABASE_URL: 'synthetic-db-binding',
    };
    const response = await app.request(
      '/credentials',
      {
        headers: { Authorization: 'Bearer synthetic-token' },
      },
      environment,
    );
    expect(response.status).toBe(200);
    expect(verifySupabaseSessionDetails).toHaveBeenCalledWith('synthetic-token', environment);
    expect(resolveAuthenticatedAccount).toHaveBeenCalledWith(subject, 'synthetic-db-binding');
  });
  it('returns a strict projection with the canonical account, not the credential subject', async () => {
    const response = await get();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('Vary')).toBe('Authorization');
    expect(await response.json()).toEqual({
      accountId: account,
      provider: 'supabase',
      anonymous: false,
      identities: [{ id: identityId, provider: 'google' }],
    });
    expect(resolveAuthenticatedAccount).toHaveBeenCalledWith(subject, undefined);
  });
  it.each(['', 'Basic password', 'Bearer '])(
    'denies missing/malformed bearer %s',
    async (header) => {
      expect((await get(header)).status).toBe(401);
      expect(verifySupabaseSessionDetails).not.toHaveBeenCalled();
    },
  );
  it('denies revoked sessions before resolving an account', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(null);
    expect((await get()).status).toBe(401);
    expect(resolveAuthenticatedAccount).not.toHaveBeenCalled();
  });
  it('denies a missing or deleted account binding', async () => {
    vi.mocked(resolveAuthenticatedAccount).mockRejectedValue(
      SovereignError.authenticationRequired(),
    );
    expect((await get()).status).toBe(401);
  });
  it('does not report missing provider inventory as no credentials', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims: { sub: subject },
      user: { id: subject },
    });
    expect((await get()).status).toBe(503);
  });
  it('returns a known empty anonymous inventory without guessing a durable credential', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims: { sub: subject },
      user: { id: subject, is_anonymous: true, identities: [] },
    });
    expect(await (await get()).json()).toMatchObject({
      accountId: account,
      anonymous: true,
      identities: [],
    });
  });
  it('sanitizes provider outages and does not return provider payloads', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockRejectedValue(new Error('private-token-detail'));
    const response = await get();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private-token-detail');
    expect(resolveAuthenticatedAccount).not.toHaveBeenCalled();
  });
  it('rejects a corrupt noncanonical account projection', async () => {
    vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: subject });
    expect((await get()).status).toBe(503);
  });
});
