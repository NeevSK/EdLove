import { useResonanceStore } from '../store/useResonanceStore';
import { applyResonanceFilter } from '../utils/temporalUtils';
import { SafeZustandStorage } from '../lib/storageWrapper';


/**
 * createResonantProxy
 * 
 * A high-powered Proxy kernel that intercepts API calls to manage:
 * 1. Resonance Shield: Prevents mutations in past phases.
 * 2. Offline Bridge: Intercepts reads and redirects to local cache if offline.
 * 3. Temporal Lens: Automatically applies temporal filters to query builders.
 */
export function createResonantProxy<T extends object>(moduleName: string, target: T): T {
    return new Proxy(target, {
        get(obj: any, prop: string) {
            const { phase, isOffline, resonanceDate } = useResonanceStore.getState();

            // 1. Resonance Shield: Prevent mutations in the past
            const isMutation = prop.startsWith('update') || 
                             prop.startsWith('delete') || 
                             prop.startsWith('insert') ||
                             prop.startsWith('upsert');
            
            if (phase === 'past' && isMutation) {
                return async () => {
                   console.warn(`[Resonance Shield] Blocked mutation '${prop}' in past phase.`);
                   throw new Error("Cannot modify history. You are in a past resonance.");
                };
            }

            // 2. Offline Bridge: Intercept select calls if offline
            if (isOffline && (prop === 'select' || prop.startsWith('get'))) {
                return async (...args: any[]) => {
                    console.log(`[Offline Bridge] Intercepting request for ${moduleName}.${prop}`);
                    const cacheKey = `offline-${moduleName}-${prop}-${resonanceDate}`;
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

                    // If it looks like a PostgrestFilterBuilder, apply automated resonance filtering
                    if (result && typeof result === 'object' && 'select' in result && 'url' in result) {
                        return applyResonanceFilter(result);
                    }

                    return result;
                };
            }

            return originalMethod;
        }
    });
}
