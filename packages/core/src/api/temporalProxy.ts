import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { applyTemporalFilter } from '@repo/core/logic/utils/temporalUtils';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';

/** Admission belongs to invocation: a saved callback can outlive its selected date. */
export function createTemporalProxy<T extends object>(moduleName: string, target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const originalMethod: unknown = Reflect.get(obj, prop, receiver);
      if (typeof prop !== 'string' || typeof originalMethod !== 'function') return originalMethod;

      return async (...args: unknown[]) => {
        const { phase, readPolicy, viewDate, viewScale } = useTemporalStore.getState();

        const isMutation =
          prop.startsWith('update') ||
          prop.startsWith('delete') ||
          prop.startsWith('insert') ||
          prop.startsWith('upsert');

        if (phase === 'past' && isMutation) {
          console.warn(`[Temporal Shield] Blocked mutation '${prop}' in past phase.`);
          throw new Error('Cannot modify history while viewing a past temporal context.');
        }

        // This is a user policy; it does not claim the device has lost connectivity.
        if (readPolicy === 'cached-only' && (prop === 'select' || prop.startsWith('get'))) {
          if (__DEV__) {
            console.log(`[Offline Bridge] Intercepting request for ${moduleName}.${prop}`);
          }
          const cacheKey = `offline-${moduleName}-${prop}-${viewDate}-${viewScale}`;
          const cached = await SafeZustandStorage.getItem(cacheKey);
          if (cached) return { data: JSON.parse(cached), error: null };

          return { data: [], error: { message: 'Offline: No local cache found' } };
        }

        const result: unknown = await Reflect.apply(originalMethod, obj, args);

        if (isTemporalQuery(result)) {
          return applyTemporalFilter(result, {
            column: 'created_at',
            mode: 'event_time',
            capability: 'event_stream',
          });
        }

        return result;
      };
    },
  });
}

function isTemporalQuery(value: unknown): value is Parameters<typeof applyTemporalFilter>[0] {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'select' in value &&
      'url' in value &&
      'gte' in value &&
      typeof value.gte === 'function' &&
      'lte' in value &&
      typeof value.lte === 'function',
  );
}
