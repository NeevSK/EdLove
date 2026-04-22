import { SafeZustandStorage } from '../lib/storageWrapper';
import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import { useTemporalStore } from '../store/useTemporalStore';

/**
 * createTemporalProxy
 *
 * A high-powered Proxy kernel that intercepts API calls to manage:
 * 1. Temporal Shield: Prevents mutations in past phases.
 * 2. Offline Bridge: Intercepts reads and redirects to local cache if offline.
 * 3. Temporal Lens: Automatically applies temporal filters to query builders.
 */
export function createTemporalProxy<T extends object>(moduleName: string, target: T): T {
  return new Proxy(target, {
    get(obj: any, prop: string) {
      const { phase, isOffline, viewDate, viewScale } = useTemporalStore.getState();

      // 1. Temporal Shield: prevent mutations in the past
      const isMutation =
        prop.startsWith('update') ||
        prop.startsWith('delete') ||
        prop.startsWith('insert') ||
        prop.startsWith('upsert');

      if (phase === 'past' && isMutation) {
        return async () => {
          console.warn(`[Temporal Shield] Blocked mutation '${prop}' in past phase.`);
          throw new Error('Cannot modify history while viewing a past temporal context.');
        };
      }

      // 2. Offline Bridge: Intercept select calls if offline
      if (isOffline && (prop === 'select' || prop.startsWith('get'))) {
        return async (..._args: any[]) => {
          if (__DEV__) {
            console.log(`[Offline Bridge] Intercepting request for ${moduleName}.${prop}`);
          }
          const cacheKey = `offline-${moduleName}-${prop}-${viewDate}-${viewScale}`;
          const cached = await SafeZustandStorage.getItem(cacheKey);
          if (cached) return { data: JSON.parse(cached), error: null };

          // Fallback or partial data logic could go here
          return { data: [], error: { message: 'Offline: No local cache found' } };
        };
      }

      const originalMethod = obj[prop];
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          // 3. Automated Temporal Lens (Contextual Injection)
          // If the method returns a query builder (Supabase-like), we wrap it
          const result = await originalMethod.apply(obj, args);

          // If it looks like a PostgrestFilterBuilder, apply automated temporal filtering.
          if (result && typeof result === 'object' && 'select' in result && 'url' in result) {
            return applyTemporalFilter(result, {
              column: 'created_at',
              mode: 'event_time',
              capability: 'event_stream',
            });
          }

          return result;
        };
      }

      return originalMethod;
    },
  });
}
