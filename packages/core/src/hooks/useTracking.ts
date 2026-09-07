import { identityAPI } from '@repo/core/api/identity';
import { trackingAPI } from '@repo/core/api/tracking';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import type { ProductAnalyticsContext } from '@repo/core/logic/ports/productAnalytics.port';
import { trackProductEvent } from '@repo/core/monitoring';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EXPLORED_FEATURES_CACHE_PREFIX = 'gurudevi-explored-features-cache';

// Session-level set to guard against redundant API calls across component re-renders
const sessionDiscoveredFeatures = new Set<string>();
const inFlightDiscovery = new Map<string, Promise<void>>();

/**
 * Hook for tracking feature discovery and exploration status.
 */
export function useTracking() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { context } = usePermissions();

  const analyticsContext = useMemo(
    () => ({
      platform: (typeof window !== 'undefined'
        ? 'web'
        : typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PLATFORM
          ? (process.env.EXPO_PUBLIC_PLATFORM as ProductAnalyticsContext['platform'])
          : 'unknown') as ProductAnalyticsContext['platform'],
      identity_mode: context.isAnonymous ? ('anonymous' as const) : ('authenticated' as const),
      citizenship: context.citizenship,
      onboarding_completed: Boolean(context.onboarding_completed),
      active_capacity: context.activeBond?.capacity ?? null,
      active_entity_type: context.activeEntityType ?? null,
      school_type: context.schoolType ?? null,
      personal_pricing_tier:
        context.pricing_tier === 'PRO' || context.pricing_tier === 'INSTITUTIONAL'
          ? context.pricing_tier
          : ('FREE' as const),
      effective_entitlement_scope: context.effective_entitlement_scope ?? 'individual',
      effective_entitlement_tier: context.effective_entitlement_tier ?? 'FREE',
      analytics_schema_version: 1 as const,
    }),
    [context],
  );

  // Keep refs for callback stability
  const analyticsContextRef = useRef(analyticsContext);
  analyticsContextRef.current = analyticsContext;

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  useEffect(() => {
    let active = true;
    const getUserId = async () => {
      try {
        const identity = await identityAPI.identifyActiveCitizen();
        const myId = identity?.id;
        if (active && myId) {
          setUserId(myId);
        }
      } catch (e) {
        console.warn('Tracking: Failed to resolve identity', e);
      }
    };
    getUserId();
    return () => {
      active = false;
    };
  }, []);

  // Get explored features with local cache fallback and resilience
  const { data: exploredFeatures = [], isLoading } = useQuery({
    queryKey: ['explored_features', userId],
    queryFn: async () => {
      if (!userId) return [];
      const cacheKey = `${EXPLORED_FEATURES_CACHE_PREFIX}-${userId}`;
      let cached: string[] = [];
      try {
        const raw = await SafeZustandStorage.getItem(cacheKey);
        if (raw) cached = JSON.parse(raw);
      } catch {
        // Ignore cache parse error
      }

      try {
        const remote = await trackingAPI.getExploredFeatures(userId);
        if (remote && remote.length > 0) {
          const merged = Array.from(new Set([...cached, ...remote]));
          void SafeZustandStorage.setItem(cacheKey, JSON.stringify(merged));
          merged.forEach((f) => sessionDiscoveredFeatures.add(f));
          return merged;
        }
      } catch {
        // Network failure; fallback to cache
      }

      cached.forEach((f) => sessionDiscoveredFeatures.add(f));
      return cached;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const exploredFeaturesRef = useRef(exploredFeatures);
  exploredFeaturesRef.current = exploredFeatures;

  /**
   * Marks a feature as discovered.
   * Fully stabilized callback: safe to pass in useEffect dependency arrays without causing loops.
   */
  const discoverFeature = useCallback(async (featureName: string) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    // Fast memory/session check
    if (
      sessionDiscoveredFeatures.has(featureName) ||
      exploredFeaturesRef.current.includes(featureName)
    ) {
      return;
    }

    // Mark in session memory immediately
    sessionDiscoveredFeatures.add(featureName);

    // Always record client product analytics event
    try {
      trackProductEvent('feature_opened', { feature_id: featureName }, analyticsContextRef.current);
    } catch {
      // Non-blocking telemetry
    }

    // Deduplicate in-flight network requests
    const flightKey = `${currentUserId}:${featureName}`;
    if (inFlightDiscovery.has(flightKey)) {
      return inFlightDiscovery.get(flightKey);
    }

    const task = (async () => {
      try {
        // Optimistically update React Query cache
        const qc = queryClientRef.current;
        qc.setQueryData<string[]>(['explored_features', currentUserId], (prev = []) => {
          if (prev.includes(featureName)) return prev;
          const next = [...prev, featureName];
          const cacheKey = `${EXPLORED_FEATURES_CACHE_PREFIX}-${currentUserId}`;
          void SafeZustandStorage.setItem(cacheKey, JSON.stringify(next));
          return next;
        });

        await trackingAPI.logFeatureUsage(currentUserId, featureName);
      } catch (error) {
        console.warn(`[useTracking] Failed to record discovery for ${featureName}:`, error);
      } finally {
        inFlightDiscovery.delete(flightKey);
      }
    })();

    inFlightDiscovery.set(flightKey, task);
    return task;
  }, []);

  /**
   * Checks if a feature has been discovered.
   */
  const isDiscovered = useCallback(
    (featureName: string) => {
      return (
        sessionDiscoveredFeatures.has(featureName) ||
        exploredFeatures.includes(featureName)
      );
    },
    [exploredFeatures],
  );

  /**
   * Tracks a manual snapshot event.
   */
  const trackSnapshot = useCallback(async (label: string, viewDate: string) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    trackProductEvent(
      'feature_action_completed',
      {
        feature_id: 'manual_snapshot',
        action: 'captured',
        has_label: Boolean(label),
        view_date: viewDate,
      },
      analyticsContextRef.current,
    );
  }, []);

  return useMemo(
    () => ({
      exploredFeatures,
      isLoading,
      discoverFeature,
      isDiscovered,
      trackSnapshot,
    }),
    [exploredFeatures, isLoading, discoverFeature, trackSnapshot, isDiscovered],
  );
}

