import { type MappingTopology, mappingAPI } from '@repo/core/api/client';

import { useEffect, useState } from 'react';

/**
 * useMappingSync — Hook for real-time collaborative topology mapping.
 * Subscribes to changes in mapping_topologies for a specific ID.
 */
export function useMappingSync(topologyId?: string) {
  const [topology, setTopology] = useState<MappingTopology | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!topologyId) return;

    const loadAndSync = async () => {
      setLoading(true);
      try {
        const data = await mappingAPI.getById(topologyId);
        setTopology(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    void loadAndSync();

    // Real-time subscription via sovereign realtime port
    let unsub: (() => Promise<void>) | null = null;
    let isCancelled = false;

    void import('@repo/core/logic/managers/misc.factory')
      .then(({ realtime }) => {
        if (isCancelled || !realtime || typeof realtime.subscribe !== 'function') return;
        const sub = realtime.subscribe(
          `topology-resonance-${topologyId}`,
          {
            event: 'UPDATE',
            table: 'mapping_topologies',
            filter: `id=eq.${topologyId}`,
          },
          (payload: any) => {
            console.log('[useMappingSync] Resonance pulse received:', payload.new);
            if (payload.new) {
              setTopology(payload.new as MappingTopology);
            }
          },
        );
        unsub = sub.unsubscribe;
      })
      .catch((err) => {
        console.warn('[useMappingSync] subscription error:', err);
      });

    return () => {
      isCancelled = true;
      if (unsub) void unsub();
    };
  }, [topologyId]);

  const updateTopology = async (updates: Partial<MappingTopology>) => {
    if (!topologyId) return;
    try {
      const result = await mappingAPI.upsert({ ...updates, id: topologyId });
      setTopology(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { topology, loading, error, updateTopology };
}
