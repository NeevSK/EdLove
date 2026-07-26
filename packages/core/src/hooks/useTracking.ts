import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { identityAPI } from '@/api/identity';
import { trackingAPI } from '@/api/tracking';
import { trackEvent } from '@/lib/monitoring/posthog';

/**
 * Hook for tracking feature discovery and exploration status.
 */
export function useTracking() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

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
        trackEvent('feature_discovered', {
          feature_name: featureName,
          user_id: userId,
        });

        // Invalidate to refresh the explored list
        await queryClient.invalidateQueries({
          queryKey: ['explored_features', userId],
        });
      } catch (error) {
        console.error(`Failed to track discovery for ${featureName}:`, error);
      }
    },
    [userId, exploredFeatures, queryClient],
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

      trackEvent('manual_snapshot_captured', {
        label,
        snapshot_date: viewDate,
        user_id: userId,
      });
    },
    [userId],
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
