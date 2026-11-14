import { afterEach, describe, expect, it, vi } from 'vitest';

const syncGrant = vi.hoisted(() => vi.fn());
vi.mock('@/lib/v1Client', () => ({ v1Client: { identity: { syncGrant } } }));
vi.mock('@repo/core/lib/failureFeedback.adapter', () => ({ presentFailure: vi.fn() }));

import { createAccountSyncConnection } from '@/lib/syncConnection';

const account = '01234567-89ab-8101-8000-010203040506';

describe('mobile sync connection / G1, substituted v1 client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('stays local-only when the build has no PowerSync instance', () => {
    vi.stubEnv('EXPO_PUBLIC_POWERSYNC_URL', '');
    expect(createAccountSyncConnection(account, () => true)).toBeNull();
  });

  it('asks the v1 API for the grant and signs in with its token', async () => {
    vi.stubEnv('EXPO_PUBLIC_POWERSYNC_URL', 'https://sync.example.com');
    syncGrant.mockResolvedValue({
      accountId: account,
      endpoint: 'https://sync.example.com',
      token: 'signed',
      expiresAt: Math.floor(Date.now() / 1000) + 120,
    });
    const connection = createAccountSyncConnection(account, () => true);
    expect(connection?.powerSyncEndpoint).toBe('https://sync.example.com');
    await expect(connection?.authenticator.resolveCredentials({})).resolves.toBe('signed');
    expect(syncGrant).toHaveBeenCalledWith(undefined, { signal: undefined });
  });
});
