import {
  type FounderEcosystemStats,
  useFounderEcosystemStats,
} from '@repo/admin/bridge/founderWorkspace';
import type { School } from '@repo/core/types';

export type EcosystemStats = FounderEcosystemStats;

/**
 * useEcosystemStats Hook
 *
 * Transitional wrapper that keeps the legacy classroom import path while
 * founder-owned workspace data flows through the admin bridge.
 */
export function useEcosystemStats() {
  return useFounderEcosystemStats() as {
    stats: EcosystemStats | null;
    schools: School[];
    isLoading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
  };
}
