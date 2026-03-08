import { useEffect, useState } from 'react';
import { supabase, identityAPI } from '@repo/core';
import { trackingAPI } from '../api/tracking';
import { trackEvent } from '../lib/monitoring/posthog';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for tracking feature discovery and exploration status.
 */
export function useTracking() {
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUserId = async () => {
            const myId = await identityAPI.getMyInternalId();
            if (myId) setUserId(myId);
        };
        getUserId();
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
    const discoverFeature = async (featureName: string) => {
        if (!userId) return;

        // Optimistic check to avoid unnecessary API calls
        if (exploredFeatures.includes(featureName)) return;

        try {
            await trackingAPI.logFeatureUsage(userId, featureName);
            // PostHog Tracking
            trackEvent('feature_discovered', { feature_name: featureName, user_id: userId });

            // Invalidate to refresh the explored list
            queryClient.invalidateQueries({ queryKey: ['explored_features', userId] });
        } catch (error) {
            console.error(`Failed to track discovery for ${featureName}:`, error);
        }
    };

    /**
     * Checks if a feature has been discovered.
     */
    const isDiscovered = (featureName: string) => {
        return exploredFeatures.includes(featureName);
    };

    return {
        exploredFeatures,
        isLoading,
        discoverFeature,
        isDiscovered
    };
}
