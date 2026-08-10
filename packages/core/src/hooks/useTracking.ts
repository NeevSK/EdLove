import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { identityAPI } from '@repo/core/api/identity';
import { trackingAPI } from '@repo/core/api/tracking';
import { trackProductEvent } from '@repo/core/lib/monitoring/posthog';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import type { ProductAnalyticsContext } from '@repo/core/logic/ports/productAnalytics.port';

/**
 * Hook for tracking feature discovery and exploration status.
 */
export function useTracking() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { context } = usePermissions();
  const analyticsContext = useMemo(
    () => ({
      platform: (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
        ? Platform.OS
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

  useEffect(() => {
    const getUserId = async () => {
      const identity = await identityAPI.identifyActiveCitizen();
      const myId = identity?.id;
      if (myId) setUserId(myId);
    };
    getUserId().catch((e) => {
      console.error('Tracking: Failed to resolve identity', e);
    });
  }, []);

  // Get explored features
  const { data: exploredFeatures = [], isLoading } = useQuery({
    queryKey: ['explored_features', userId],
    queryFn: () => (userId ? trackingAPI.getExploredFeatures(userId) : []),
    enabled: !!userId,
  });

  /**
   * Marks a feature as discovered.
   */
  const discoverFeature = useCallback(
    async (featureName: string) => {
      if (!userId) return;

      // Optimistic check to avoid unnecessary API calls
      if (exploredFeatures.includes(featureName)) return;

      try {
        await trackingAPI.logFeatureUsage(userId, featureName);
        // PostHog Tracking
        trackProductEvent('feature_opened', { feature_id: featureName }, analyticsContext);

        // Invalidate to refresh the explored list
        await queryClient.invalidateQueries({
          queryKey: ['explored_features', userId],
        });
      } catch (error) {
        console.error(`Failed to track discovery for ${featureName}:`, error);
      }
    },
    [userId, exploredFeatures, queryClient, analyticsContext],
  );

  /**
   * Checks if a feature has been discovered.
   */
  const isDiscovered = useCallback(
    (featureName: string) => {
      return exploredFeatures.includes(featureName);
    },
    [exploredFeatures],
  );

  /**
   * Tracks a manual snapshot event.
   */
  const trackSnapshot = useCallback(
    async (label: string, viewDate: string) => {
      if (!userId) return;

      trackProductEvent(
        'feature_action_completed',
        {
          feature_id: 'manual_snapshot',
          action: 'captured',
          has_label: Boolean(label),
          view_date: viewDate,
        },
        analyticsContext,
      );
    },
    [userId, analyticsContext],
  );

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
