import { useState, useCallback, useEffect } from 'react';
import { useStore, api, School, SafeZustandStorage } from '@repo/core';

const ECOSYSTEM_STATS_CACHE_KEY = 'gurudevi-ecosystem-stats-cache';
const ECOSYSTEM_SCHOOLS_CACHE_KEY = 'gurudevi-ecosystem-schools-cache';

export interface EcosystemStats {
    total_schools: number;
    total_users: number;
    total_students: number;
    total_teachers: number;
    total_classrooms: number;
    active_communities: number;
    ecosystem_health: number;
}

/**
 * useEcosystemStats Hook
 * 
 * Manages platform-level statistics and school lists for Founders/Admins.
 * Features:
 * - Local-first caching for instant UI.
 * - Background sync with Supabase RPC.
 */
export function useEcosystemStats() {
    const isOnline = useStore(state => state.isOnline);
    const isDemoMode = useStore(state => state.isDemoMode);

    const [stats, setStats] = useState<EcosystemStats | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial load from cache
    useEffect(() => {
        const loadCache = async () => {
            try {
                const [cachedStats, cachedSchools] = await Promise.all([
                    SafeZustandStorage.getItem(ECOSYSTEM_STATS_CACHE_KEY),
                    SafeZustandStorage.getItem(ECOSYSTEM_SCHOOLS_CACHE_KEY)
                ]);

                if (cachedStats) setStats(JSON.parse(cachedStats));
                if (cachedSchools) setSchools(JSON.parse(cachedSchools));
            } catch (e) {
                console.warn('Failed to load ecosystem cache', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCache();
    }, []);

    // Refresh from API
    const refreshData = useCallback(async () => {
        try {
            if (isDemoMode) {
                // Mock data for demo mode
                const mockStats: EcosystemStats = {
                    total_schools: 12,
                    total_users: 1450,
                    total_students: 1200,
                    total_teachers: 150,
                    total_classrooms: 48,
                    active_communities: 24,
                    ecosystem_health: 95
                };
                setStats(mockStats);
                setSchools([]); // Demo mode usually handles specific school data elsewhere
                return;
            }

            const [statsData, schoolsData] = await Promise.all([
                api.founder.getEcosystemStats(),
                api.founder.getAllSchools(),
            ]);

            setStats(statsData);
            setSchools(schoolsData);

            // Persist to cache
            await Promise.all([
                SafeZustandStorage.setItem(ECOSYSTEM_STATS_CACHE_KEY, JSON.stringify(statsData)),
                SafeZustandStorage.setItem(ECOSYSTEM_SCHOOLS_CACHE_KEY, JSON.stringify(schoolsData))
            ]);

            setError(null);
        } catch (e: any) {
            console.error('Failed to refresh ecosystem data', e);
            setError(e.message || 'Failed to sync platform data');
        } finally {
            setIsLoading(false);
        }
    }, [isDemoMode]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        stats,
        schools,
        isLoading,
        error,
        refreshData
    };
}
