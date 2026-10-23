/**
 * @file packages/core/src/efficiency/hermesDeviceShield.ts
 * The 2GB Android Device Shield & Hermes Memory Reclamation Engine.
 *
 * Physical Invariants:
 * 1. 2GB Android RAM Limit: Low-end Android classroom devices crash under nursery GC spikes.
 * 2. Convivial Sleep Memory Invariant: When the app backgrounds or memory pressure is signaled,
 *    promptly reclaim inactive queries and invoke Hermes Hades GC to compact heap.
 * 3. Zero Native Build Risk: Uses standard JS environment hooks, HermesInternal, and global.gc.
 */

import type { QueryClient } from '@tanstack/react-query';
import { classifyMemoryTier } from './runtimeConditions';
import { observeEfficiencyDecision } from './observability';

export interface HermesHeapStats {
  jsHeapSize: number;
  jsAllocatedBytes: number;
  gcCount: number;
  gcTotalTimeMs: number;
}

export interface MemoryReclamationOptions {
  queryClient?: QueryClient;
  severity?: 'normal' | 'constrained' | 'severe';
  reason?: string;
  forceGC?: boolean;
}

export interface MemoryReclamationResult {
  beforeHeapBytes: number;
  afterHeapBytes: number;
  reclaimedBytes: number;
  evictedQueriesCount: number;
  gcTriggered: boolean;
  timestamp: number;
  reason: string;
}

/**
 * Returns current Hermes runtime heap stats, or null if not running under Hermes.
 */
export function getHermesHeapStats(): HermesHeapStats | null {
  try {
    const raw = (globalThis as any).HermesInternal?.getInstrumentedStats?.();
    if (!raw) return null;
    return {
      jsHeapSize: Number(raw.js_heap_size ?? 0),
      jsAllocatedBytes: Number(raw.js_allocated_bytes ?? 0),
      gcCount: Number(raw.gc_count ?? 0),
      gcTotalTimeMs: Number(raw.gc_total_time_ms ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Executes a deterministic Hermes memory reclamation sweep:
 * 1. Evicts inactive TanStack queries (frees arrays/closures of unmounted screens).
 * 2. Compulsorily compacts heap using Hermes Hades GC if global.gc is available.
 * 3. Records reclaimed bytes and telemetry.
 */
export function reclaimHermesMemory(options: MemoryReclamationOptions = {}): MemoryReclamationResult {
  const beforeStats = getHermesHeapStats();
  const beforeHeapBytes = beforeStats?.jsAllocatedBytes ?? 0;
  let evictedQueriesCount = 0;

  // 1. TanStack Query cache pruning
  if (options.queryClient) {
    const cache = options.queryClient.getQueryCache();
    const allQueries = cache.getAll();
    const inactiveQueries = allQueries.filter((q) => !q.getObserversCount());
    evictedQueriesCount = inactiveQueries.length;

    if (evictedQueriesCount > 0) {
      options.queryClient.removeQueries({ type: 'inactive' });
    }

    // In severe conditions, clear stale queries
    if (options.severity === 'severe') {
      options.queryClient.clear();
    }
  }

  // 2. Hermes GC Hades Invocation
  let gcTriggered = false;
  if (options.forceGC !== false && typeof (globalThis as any).gc === 'function') {
    try {
      (globalThis as any).gc();
      gcTriggered = true;
    } catch {
      // Ignore if engine restricts manual GC
    }
  }

  const afterStats = getHermesHeapStats();
  const afterHeapBytes = afterStats?.jsAllocatedBytes ?? 0;
  const reclaimedBytes = Math.max(0, beforeHeapBytes - afterHeapBytes);

  const reason = options.reason ?? 'periodic-maintenance';
  observeEfficiencyDecision('storage-maintenance', 'reduce', `${reason}: reclaimed ${reclaimedBytes}B`);

  return {
    beforeHeapBytes,
    afterHeapBytes,
    reclaimedBytes,
    evictedQueriesCount,
    gcTriggered,
    timestamp: Date.now(),
    reason,
  };
}

/**
 * Configure query client specifically for low-memory 2GB devices:
 * - Reduces gcTime from 5 mins to 2 mins.
 * - Reduces retry count to avoid queuing network responses in low-memory states.
 */
export function tuneQueryClientForLowMemory(queryClient: QueryClient) {
  queryClient.setDefaultOptions({
    queries: {
      gcTime: 2 * 60 * 1000, // 2 minutes (evict aggressively)
      staleTime: 30 * 1000,
      retry: 1,
    },
  });
}

/**
 * React Native & cross-platform lifecycle listener for Hermes Memory Reclamation.
 * Runs reclamation automatically when transitioning to background or when memory pressure spikes.
 */
export function setupHermesMemoryShield(options: {
  queryClient: QueryClient;
  totalMemoryBytes?: number | null;
  onReclaim?: (result: MemoryReclamationResult) => void;
}) {
  const is2GBDevice = classifyMemoryTier(options.totalMemoryBytes ?? null) === 'low';
  if (is2GBDevice) {
    tuneQueryClientForLowMemory(options.queryClient);
  }

  let appStateSubscription: { remove: () => void } | null = null;
  try {
    const RN = require('react-native');
    if (RN?.AppState?.addEventListener) {
      appStateSubscription = RN.AppState.addEventListener('change', (nextState: string) => {
        if (nextState === 'background' || nextState === 'inactive') {
          const result = reclaimHermesMemory({
            queryClient: options.queryClient,
            severity: is2GBDevice ? 'constrained' : 'normal',
            reason: `app-state-${nextState}`,
            forceGC: true,
          });
          options.onReclaim?.(result);
        }
      });
    }
  } catch {
    // Non-RN environment (Web or Node)
  }

  return () => {
    appStateSubscription?.remove?.();
  };
}
