import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { disposeAccountBoundaryQueries } from '../lib/clientStateFoundation';
import {
  deviceSecurityQueryKeys,
  invalidateDeviceSecuritySummary,
  resolveDeviceSecurityQueryScope,
} from './useScopedDeviceSecurity';
import { completeDeviceSecurityCommand } from './useDeviceSecurity';

describe('scoped device-security query admission', () => {
  it('admits only a committed matching principal and does not invent workspace scope', () => {
    expect(resolveDeviceSecurityQueryScope(null, { principalId: null })).toBeNull();
    expect(resolveDeviceSecurityQueryScope('account-a', null)).toBeNull();
    expect(resolveDeviceSecurityQueryScope('account-a', { principalId: 'account-b' })).toBeNull();
    expect(resolveDeviceSecurityQueryScope(' account-a ', { principalId: 'account-a' })).toEqual({
      principalId: 'account-a',
    });
  });

  it('uses a principal-only key that stays stable across workspace changes', () => {
    expect(deviceSecurityQueryKeys.summary({ principalId: 'account-a' })).toEqual([
      'scope',
      'account-a',
      null,
      null,
      null,
      'device-security',
      'summary',
    ]);
  });

  it('invalidates only the confirmed principal summary', async () => {
    const client = new QueryClient();
    const accountA = { principalId: 'account-a' };
    const accountB = { principalId: 'account-b' };
    client.setQueryData(deviceSecurityQueryKeys.summary(accountA), { devices: ['a'] });
    client.setQueryData(deviceSecurityQueryKeys.summary(accountB), { devices: ['b'] });

    await invalidateDeviceSecuritySummary(client, accountA);

    expect(client.getQueryState(deviceSecurityQueryKeys.summary(accountA))?.isInvalidated).toBe(true);
    expect(client.getQueryState(deviceSecurityQueryKeys.summary(accountB))?.isInvalidated).toBe(false);
  });

  it('disposes only the outgoing principal summary and preserves durable mutations', async () => {
    const client = new QueryClient();
    const accountA = { principalId: 'account-a' };
    const accountB = { principalId: 'account-b' };
    client.setQueryData(deviceSecurityQueryKeys.summary(accountA), { devices: ['a'] });
    client.setQueryData(deviceSecurityQueryKeys.summary(accountB), { devices: ['b'] });
    const mutation = client.getMutationCache().build(client, {
      mutationKey: ['outbox', 'account-a', 'device-security'],
      mutationFn: async () => undefined,
    });

    await disposeAccountBoundaryQueries(client, 'account-a');

    expect(client.getQueryData(deviceSecurityQueryKeys.summary(accountA))).toBeUndefined();
    expect(client.getQueryData(deviceSecurityQueryKeys.summary(accountB))).toEqual({ devices: ['b'] });
    expect(client.getMutationCache().find({ mutationId: mutation.mutationId })).toBe(mutation);
  });
});

describe('device-security command confirmation', () => {
  it('does not refresh a summary for a queued command', async () => {
    const refresh = vi.fn(async () => undefined);

    await expect(
      completeDeviceSecurityCommand(async () => ({ queued: true, data: null }), refresh),
    ).resolves.toEqual({ queued: true, data: null });

    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes only after a confirmed command and preserves rejected outcomes', async () => {
    const refresh = vi.fn(async () => undefined);

    await completeDeviceSecurityCommand(async () => ({ queued: false, data: 'confirmed' }), refresh);
    expect(refresh).toHaveBeenCalledOnce();
    await expect(
      completeDeviceSecurityCommand(async () => Promise.reject(new Error('server denied')), refresh),
    ).rejects.toThrow('server denied');
    expect(refresh).toHaveBeenCalledOnce();
  });
});
