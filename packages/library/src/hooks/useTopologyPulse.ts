import { mappingAPI } from '@repo/core/api/client';
import type { KnowledgeTopology } from '@repo/graphics/types';
import { useCallback, useEffect, useState } from 'react';
/**
 * useTopologyPulse  Hook for Principal-level bird's-eye mapping.
 * Fetches aggregated "Pulse" data for an entire school or department.
 */
export function useTopologyPulse(schoolId?: string) {
  const [pulse, setPulse] = useState<KnowledgeTopology | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const refreshPulse = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await mappingAPI.getSchoolPulse(schoolId);
      setPulse(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);
  useEffect(() => {
    let active = true;
    if (schoolId) {
      const load = async () => {
        await Promise.resolve();
        if (active) {
          await refreshPulse();
        }
      };
      void load();
    }
    return () => {
      active = false;
    };
  }, [schoolId, refreshPulse]);
  return { pulse, loading, error, refreshPulse };
}
