import { useState, useEffect } from 'react';
import { naturePathsAPI, RiverStage, CrystalTier } from '../api/naturePaths';
import { useUserRole } from './useUserRole';

/**
 * useNaturePaths
 * 
 * A hook to fetch and manage a student's nature path state (River & Crystal).
 */
export const useNaturePaths = () => {
    const { userId } = useUserRole();
    const [paths, setPaths] = useState<{
        river_stage: RiverStage;
        crystal_tier: CrystalTier;
        crystals_found_count: number;
        fractal_moments_count: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPaths = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const state = await naturePathsAPI.getStudentPathState(userId);
            setPaths(state);
        } catch (error) {
            console.error('[useNaturePaths] Error fetching paths:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshPaths();
    }, [userId]);

    return {
        paths,
        isLoading,
        refreshPaths
    };
};
