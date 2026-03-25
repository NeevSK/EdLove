import { useState, useEffect } from 'react';
import { naturePathsAPI, BanyanStage } from '../api/naturePaths';
import { usePermissions } from './usePermissions';

/**
 * useBanyanGrowth
 * 
 * A hook to fetch and manage a teacher's or principal's Banyan growth state.
 */
export function useBanyanGrowth() {
    const { context } = usePermissions();
    const userId = context.userId;
    const [banyan, setBanyan] = useState<{
        banyan_stage: BanyanStage;
        peer_mentored_count: number;
        circles_facilitated_count: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBanyan = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const state = await naturePathsAPI.getBanyanState(userId);
            setBanyan(state);
        } catch (error) {
            console.error('[useBanyanGrowth] Error fetching Banyan state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBanyan();
    }, [userId]);

    return {
        banyan,
        isLoading,
        refreshBanyan
    };
};
