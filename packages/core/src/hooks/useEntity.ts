import { api } from '@repo/core/api/client'; // Use common API
import type {
  EntityInstance,
  EntityMode,
  EntityType,
} from '@repo/core/logic/entities/entity-protocol';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseEntityOptions {
  type: EntityType;
  id?: string;
  mode?: EntityMode;
  initialData?: any;
}

export function useEntity<T = any>(options: UseEntityOptions | EntityType, legacyId?: string) {
  // Handle both new object-based and legacy positional arguments
  const config =
    typeof options === 'string'
      ? { type: options, id: legacyId, mode: 'view' as EntityMode }
      : options;

  const { type, id, mode = 'view' } = config;

  const [instance, setInstance] = useState<EntityInstance<T> | null>(null);
  const [isLoading, setIsLoading] = useState(!!id && mode !== 'create');
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id || mode === 'create') return;
    setIsLoading(true);
    try {
      // In a real app, this would fetch from API based on type
      const data = await (api as any)[type].get(id);
      setInstance({
        id,
        type,
        definition: { type } as any, // Should come from a registry
        data,
      });
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [type, id, mode]);

  useEffect(() => {
    refresh().catch((err) => {
      console.error(`Entity: Failed to load ${type}:${id}`, err);
    });
  }, [refresh, type, id]);

  const create = useCallback(
    async (data: T) => {
      setIsLoading(true);
      try {
        const result = await (api as any)[type].create(data);
        setIsLoading(false);
        return result;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    [type],
  );

  const updateInstance = useCallback(
    async (updates: Partial<T>) => {
      if (!id) return null;
      setIsLoading(true);
      try {
        const result = await (api as any)[type].update(id, updates);
        setInstance((prev) => (prev ? { ...prev, data: { ...prev.data, ...result } } : null));
        setIsLoading(false);
        return result;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    [type, id],
  );

  return useMemo(
    () => ({
      instance,
      updateInstance,
      create,
      isLoading,
      error,
      refresh,
    }),
    [instance, updateInstance, create, isLoading, error, refresh],
  );
}
