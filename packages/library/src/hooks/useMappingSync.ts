import type { MappingTopology } from '@repo/core';
import { mappingAPI } from '@repo/core/api';
import { supabase } from '@repo/core/api';;

import { useEffect, useState } from 'react';

/**
 * useMappingSync  Hook for real-time collaborative topology mapping.
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

    loadAndSync();

    // Real-time subscription
    const channel = supabase
      .channel(`topology-resonance-${topologyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mapping_topologies',
          filter: `id=eq.${topologyId}`,
        },
        (payload: any) => {
          console.log('[useMappingSync] Resonance pulse received:', payload.new);
          setTopology(payload.new as MappingTopology);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
