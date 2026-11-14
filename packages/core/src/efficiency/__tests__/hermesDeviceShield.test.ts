/**
 * @file packages/core/src/efficiency/__tests__/hermesDeviceShield.test.ts
 * Unit tests for The 2GB Android Device Shield & Hermes Memory Reclamation Engine.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  getHermesHeapStats,
  reclaimHermesMemory,
  tuneQueryClientForLowMemory,
  setupHermesMemoryShield,
} from '../hermesDeviceShield';

describe('hermesDeviceShield', () => {
  let queryClient: QueryClient;
  const originalHermes = (globalThis as any).HermesInternal;
  const originalGc = (globalThis as any).gc;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    (globalThis as any).HermesInternal = originalHermes;
    (globalThis as any).gc = originalGc;
    vi.restoreAllMocks();
  });

  describe('getHermesHeapStats', () => {
    it('returns null when HermesInternal is not present', () => {
      delete (globalThis as any).HermesInternal;
      expect(getHermesHeapStats()).toBeNull();
    });

    it('returns structured stats when HermesInternal is present', () => {
      (globalThis as any).HermesInternal = {
        getInstrumentedStats: () => ({
          js_heap_size: 10485760,
          js_allocated_bytes: 8388608,
          gc_count: 5,
          gc_total_time_ms: 120,
        }),
      };

      const stats = getHermesHeapStats();
      expect(stats).toEqual({
        jsHeapSize: 10485760,
        jsAllocatedBytes: 8388608,
        gcCount: 5,
        gcTotalTimeMs: 120,
      });
    });
  });

  describe('reclaimHermesMemory', () => {
    it('evicts inactive queries from queryClient', () => {
      const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
      const mockQuery = {
        getObserversCount: () => 0, // Inactive query
        isActive: () => false,
      };
      vi.spyOn(queryClient.getQueryCache(), 'getAll').mockReturnValue([mockQuery as any]);

      const result = reclaimHermesMemory({
        queryClient,
        reason: 'test-reclamation',
      });

      expect(removeQueriesSpy).toHaveBeenCalledWith({ type: 'inactive' });
      expect(result.evictedQueriesCount).toBe(1);
      expect(result.reason).toBe('test-reclamation');
    });

    it('invokes global.gc when available', () => {
      const gcMock = vi.fn();
      (globalThis as any).gc = gcMock;

      const result = reclaimHermesMemory({
        queryClient,
        forceGC: true,
      });

      expect(gcMock).toHaveBeenCalled();
      expect(result.gcTriggered).toBe(true);
    });

    it('clears queryClient in severe conditions', () => {
      const clearSpy = vi.spyOn(queryClient, 'clear');

      reclaimHermesMemory({
        queryClient,
        severity: 'severe',
      });

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('tuneQueryClientForLowMemory', () => {
    it('configures conservative gcTime and staleTime on queryClient', () => {
      const setDefaultOptionsSpy = vi.spyOn(queryClient, 'setDefaultOptions');

      tuneQueryClientForLowMemory(queryClient);

      expect(setDefaultOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queries: expect.objectContaining({
            gcTime: 120000,
            staleTime: 30000,
            retry: 1,
          }),
        }),
      );
    });
  });

  describe('setupHermesMemoryShield', () => {
    it('tunes queryClient when device memory is 2GB (low)', () => {
      const setDefaultOptionsSpy = vi.spyOn(queryClient, 'setDefaultOptions');

      const cleanup = setupHermesMemoryShield({
        queryClient,
        totalMemoryBytes: 2 * 1024 * 1024 * 1024, // 2GB RAM
      });

      expect(setDefaultOptionsSpy).toHaveBeenCalled();
      cleanup();
    });
  });
});
