import { useCallback } from 'react';
import { storage } from '@repo/core';
import { usePermissions } from '@repo/core';

const USAGE_STATS_KEY = 'self_feature_usage_stats';
const PINNED_FEATURES_KEY = 'self_pinned_features';

interface FeatureStats {
    [featureId: string]: {
        lastUsed: number;
        count: number;
    };
}

/**
 * Hook to manage local feature usage tracking and pinning.
 * Adheres to the Reparative Mindset by ensuring immediate availability 
 * via local storage while maintaining external resonance.
 */
export function useFeatureActivity() {
    const { context } = usePermissions();
    const { userId } = context;

    const getStats = useCallback((): FeatureStats => {
        if (!userId) return {};
        const key = `${USAGE_STATS_KEY}_${userId}`;
        const stored = storage.getString(key);
        return stored ? JSON.parse(stored) : {};
    }, [userId]);

    const trackFeatureAccess = useCallback((featureId: string) => {
        if (!userId) return;
        const key = `${USAGE_STATS_KEY}_${userId}`;
        const stats = getStats();
        
        const now = Date.now();
        stats[featureId] = {
            lastUsed: now,
            count: (stats[featureId]?.count || 0) + 1
        };

        storage.set(key, JSON.stringify(stats));
    }, [userId, getStats]);

    const getPinnedFeatures = useCallback((): string[] => {
        if (!userId) return [];
        const key = `${PINNED_FEATURES_KEY}_${userId}`;
        const stored = storage.getString(key);
        return stored ? JSON.parse(stored) : [];
    }, [userId]);

    const togglePin = useCallback((featureId: string) => {
        if (!userId) return;
        const key = `${PINNED_FEATURES_KEY}_${userId}`;
        const pinned = getPinnedFeatures();
        
        const isPinned = pinned.includes(featureId);
        const nextPinned = isPinned 
            ? pinned.filter(id => id !== featureId)
            : [...pinned, featureId];

        storage.set(key, JSON.stringify(nextPinned));
        return !isPinned;
    }, [userId, getPinnedFeatures]);

    return {
        getStats,
        trackFeatureAccess,
        getPinnedFeatures,
        togglePin,
    };
}
