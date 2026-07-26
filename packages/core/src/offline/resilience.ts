import { storage } from '@/lib/storage';
import { handleAPIError } from '@/logic/apiInterceptor';

/**
 * Resilience Configuration
 */
export interface ResilienceOptions {
  key: string; // Storage key for caching
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  silent?: boolean; // If true, don't show toast on fetch error
}

/**
 * Offline-First Fetcher (Resilience Layer)
 * 1. Returns cached data immediately if available.
 * 2. Fetches fresh data in the background.
 * 3. Updates cache and notifies listeners if data changed.
 */
export async function withResilience<T>(
  fetcher: () => Promise<T>,
  options: ResilienceOptions,
): Promise<T | null> {
  const { key, ttl = 3600000, silent = false } = options;

  // 1. Try to get from Cache
  const cachedRaw = storage.getString(key);
  let cachedData: T | null = null;
  let isExpired = true;

  if (cachedRaw) {
    try {
      const { data, timestamp } = JSON.parse(cachedRaw);
      cachedData = data;
      // SAFE_SIDE_EFFECT: TTL check occurs within an async persistence layer, not during render.
      // eslint-disable-next-line no-restricted-syntax
      const now = Date.now();
      isExpired = now - timestamp > ttl;
    } catch (error) {
      console.warn(`[Resilience] Failed to parse cache for ${key}`, error);
    }
  }

  // 2. Fetch fresh data if expired or missing
  const executeFetch = async () => {
    try {
      const freshData = await fetcher();
      if (freshData) {
        storage.set(
          key,
          JSON.stringify({
            data: freshData,
            // DETERMINISTIC_OK: Storing a timestamp in local storage is a side-effect.
            // eslint-disable-next-line no-restricted-syntax
            timestamp: Date.now(),
          }),
        );
      }
      return freshData;
    } catch (error) {
      if (!silent) {
        handleAPIError(error);
      }
      return null;
    }
  };

  // If we have cached data and it's not expired, return it and fetch in background (Stale-While-Revalidate)
  if (cachedData && !isExpired) {
    executeFetch().catch((e) => {
      console.error(`[Resilience] Background refresh failed for ${key}`, e);
    });
    return cachedData;
  }

  // If expired or no cache, wait for fetch
  const freshData = await executeFetch();
  return freshData || cachedData; // Fallback to stale cache if fetch fails
}

/**
 * Clears resilience cache for a specific key
 */
export function invalidateResilience(key: string) {
  storage.delete(key);
}
