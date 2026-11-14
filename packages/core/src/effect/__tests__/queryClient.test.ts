import { ORPCError } from '@orpc/client';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const presentFailure = vi.hoisted(() => vi.fn());
vi.mock('@repo/core/lib/failureFeedback.adapter', () => ({ presentFailure }));

const { queryClientConfig, shouldRetryQuery } = await import('../bindings/queryClient');

const client = () =>
  new QueryClient(queryClientConfig({ queries: { retryDelay: 0 } }));

beforeEach(() => presentFailure.mockReset());

describe('G1 queryClientConfig: retry by failure kind', () => {
  it('retries transient kinds and defects, up to two retries', () => {
    expect(shouldRetryQuery(0, new ORPCError('SERVICE_UNAVAILABLE'))).toBe(true);
    expect(shouldRetryQuery(1, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(true);
    expect(shouldRetryQuery(2, new ORPCError('SERVICE_UNAVAILABLE'))).toBe(false);
  });

  it('fails at once on kinds that retrying cannot fix', () => {
    for (const code of ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'BAD_REQUEST', 'CONFLICT']) {
      expect(shouldRetryQuery(0, new ORPCError(code))).toBe(false);
    }
  });

  it('runs a forbidden query once, a transient one three times', async () => {
    const qc = client();
    const forbidden = vi.fn().mockRejectedValue(new ORPCError('FORBIDDEN'));
    const flaky = vi.fn().mockRejectedValue(new ORPCError('SERVICE_UNAVAILABLE'));
    await qc.fetchQuery({ queryKey: ['a'], queryFn: forbidden }).catch(() => {});
    await qc.fetchQuery({ queryKey: ['b'], queryFn: flaky, retry: shouldRetryQuery }).catch(() => {});
    expect(forbidden).toHaveBeenCalledTimes(1);
    expect(flaky).toHaveBeenCalledTimes(3);
  });

  it("keeps an app's own settings", () => {
    const qc = new QueryClient(queryClientConfig({ queries: { staleTime: 123 } }));
    expect(qc.getDefaultOptions().queries).toMatchObject({ staleTime: 123, retry: shouldRetryQuery });
    expect(qc.getDefaultOptions().mutations?.retry).toBe(false);
  });
});

describe('G1 queryClientConfig: feedback', () => {
  it('presents a failed mutation, named by its key', async () => {
    const qc = client();
    const error = new ORPCError('CONFLICT');
    await qc
      .getMutationCache()
      .build(qc, { mutationKey: ['attendance', 'save'], mutationFn: () => Promise.reject(error) })
      .execute(undefined)
      .catch(() => {});
    expect(presentFailure).toHaveBeenCalledWith(error, 'attendance.save');
  });

  it('names a v1 procedure by its path', async () => {
    const qc = client();
    const error = new ORPCError('FORBIDDEN');
    await qc
      .getMutationCache()
      .build(qc, {
        mutationKey: ['v1', ['identity', 'createInitialBond'], { type: 'mutation' }],
        mutationFn: () => Promise.reject(error),
      })
      .execute(undefined)
      .catch(() => {});
    expect(presentFailure).toHaveBeenCalledWith(error, 'v1.identity.createInitialBond');
  });

  it('stays out when the caller handles the failure', async () => {
    const qc = client();
    const reject = () => Promise.reject(new ORPCError('CONFLICT'));
    const cache = qc.getMutationCache();
    await cache.build(qc, { mutationFn: reject, onError: () => {} }).execute(undefined).catch(() => {});
    await cache.build(qc, { mutationFn: reject, meta: { feedback: 'silent' } }).execute(undefined).catch(() => {});
    expect(presentFailure).not.toHaveBeenCalled();
  });

  it('presents a query failure only over data already on screen', async () => {
    const qc = client();
    const error = new ORPCError('NOT_FOUND');
    await qc.fetchQuery({ queryKey: ['first'], queryFn: () => Promise.reject(error) }).catch(() => {});
    expect(presentFailure).not.toHaveBeenCalled();

    qc.setQueryData(['shown'], { ok: true });
    await qc
      .fetchQuery({ queryKey: ['shown'], queryFn: () => Promise.reject(error), staleTime: 0 })
      .catch(() => {});
    expect(presentFailure).toHaveBeenCalledWith(error, 'shown');
  });
});
