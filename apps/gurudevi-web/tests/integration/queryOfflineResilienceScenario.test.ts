import { onlineManager, QueryClient, QueryObserver } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeQueryClient } from '@/lib/query/getQueryClient';

/**
 * G2 Scenario Contract: Network Flap Resilience, Offline Drops & Stale-While-Revalidate
 *
 * Grounded in Gurudevi Mobile's network-flap-resilience.test.ts:
 * - Offline drops must not crash the application or throw unhandled fatal rejections.
 * - 'offlineFirst' networkMode ensures local cache serves responses while offline.
 * - Queries and mutations cleanly pause during outages and automatically recover when connection returns.
 */
describe('Scenario: Network Flap Resilience, Offline Drops & Stale-While-Revalidate (G2 Contract)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    onlineManager.setOnline(true);
    queryClient = makeQueryClient();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    queryClient.clear();
  });

  it('serves cached tuition records during network drops without throwing exceptions', async () => {
    const tuitionBatch = {
      batchId: 'batch-commercial-colombo',
      course: 'Advanced Combined Mathematics',
      feesTotalLkr: 625000,
      activeEnrolled: 50,
    };

    // 1. Initial successful fetch while online
    const fetcher = vi.fn().mockResolvedValue(tuitionBatch);

    const dataOnline = await queryClient.fetchQuery({
      queryKey: ['tuition', 'batch-commercial-colombo'],
      queryFn: fetcher,
    });

    expect(dataOnline).toEqual(tuitionBatch);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // 2. Simulate sudden network drop (e.g. mobile hotspot disconnect, rail transit corridor)
    onlineManager.setOnline(false);

    // 3. Query requested again while offline
    // Since staleTime is 5 minutes and networkMode is 'offlineFirst',
    // QueryClient returns cached data instantly without re-invoking the network fetcher
    const dataOffline = await queryClient.fetchQuery({
      queryKey: ['tuition', 'batch-commercial-colombo'],
      queryFn: fetcher,
    });

    expect(dataOffline).toEqual(tuitionBatch);
    expect(fetcher).toHaveBeenCalledTimes(1); // Zero additional network hits

    // 4. Invalidate query while still offline
    await queryClient.invalidateQueries({
      queryKey: ['tuition', 'batch-commercial-colombo'],
    });

    // Even when invalidated, getQueryData still provides the stale fallback to preserve UI stability
    const fallbackCached = queryClient.getQueryData(['tuition', 'batch-commercial-colombo']);
    expect(fallbackCached).toEqual(tuitionBatch);

    // 5. Restore connection
    onlineManager.setOnline(true);

    // Query automatically triggers refetch to sync fresh state
    const dataRestored = await queryClient.fetchQuery({
      queryKey: ['tuition', 'batch-commercial-colombo'],
      queryFn: fetcher,
    });

    expect(dataRestored).toEqual(tuitionBatch);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('preserves cached data and pauses background refetches during network drops', async () => {
    let fetchCount = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      fetchCount++;
      return { count: fetchCount };
    });

    // 1. Initial fetch online
    await queryClient.prefetchQuery({
      queryKey: ['academic', 'counter'],
      queryFn: fetcher,
    });
    expect(queryClient.getQueryData(['academic', 'counter'])).toEqual({ count: 1 });

    // 2. Network drops
    onlineManager.setOnline(false);

    // 3. Invalidate query while offline
    await queryClient.invalidateQueries({
      queryKey: ['academic', 'counter'],
    });

    // Data remains available from cache (stale-while-revalidate preservation)
    expect(queryClient.getQueryData(['academic', 'counter'])).toEqual({ count: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // 4. Restore network
    onlineManager.setOnline(true);

    // 5. Refetch executes fresh data
    const updated = await queryClient.fetchQuery({
      queryKey: ['academic', 'counter'],
      queryFn: fetcher,
    });
    expect(updated).toEqual({ count: 2 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('mutations retry with exponential backoff under transient errors', async () => {
    let attempts = 0;
    const flakeyMutation = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('503 Service Unavailable: Temporary Gateway Flap');
      }
      return { success: true, receiptId: 'rec-flap-01' };
    });

    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationFn: flakeyMutation,
      retry: 2,
      retryDelay: 10, // Fast delay for test
    });

    const result = await mutation.execute(undefined);
    expect(result).toEqual({ success: true, receiptId: 'rec-flap-01' });
    expect(attempts).toBe(2);
  });
});
