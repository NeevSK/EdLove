import { mappingAPI } from '@repo/core';
import type { KnowledgeTopology } from '@repo/graphics';
import { useEffect, useState } from 'react';

/**
 * useTopologyPulse  Hook for Principal-level bird's-eye mapping.
 * Fetches aggregated "Pulse" data for an entire school or department.
 */
export function useTopologyPulse(schoolId?: string) {
  const [pulse, setPulse] = useState<KnowledgeTopology | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshPulse = async () => {
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
  };

  useEffect(() => {
    if (schoolId) {
      refreshPulse();
    }
  }, [schoolId]);

  return { pulse, loading, error, refreshPulse };
}
