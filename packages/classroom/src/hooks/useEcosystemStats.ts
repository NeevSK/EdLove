import { useState, useCallback, useEffect } from 'react';
import { useStore, api, School, SafeZustandStorage } from '@repo/core';

const ECOSYSTEM_STATS_CACHE_KEY = 'gurudevi-ecosystem-stats-cache';
const ECOSYSTEM_SCHOOLS_CACHE_KEY = 'gurudevi-ecosystem-schools-cache';

export interface EcosystemStats {
    total_schools: number;
    total_users: number;
    total_students: number;
    total_teachers: number;
    total_principals: number;
    total_classrooms: number;
    active_communities: number;
    ecosystem_health: number;
    // Phase 4 additions from get_ecosystem_stats v2
    active_users_7d: number;
    mood_checkins_7d: number;
    avg_mood_score_7d: number | null;
    total_library_resources: number;
    verified_resources: number;
    total_bookmarks: number;
    total_community_posts: number;
    posts_7d: number;
    attendance_records: number;
    attendance_records_7d: number;
    growth_signals_7d: number;
    // Phase 5 additions: Global Resource Aggregation
    total_inventory_items: number;
    total_inventory_requests: number;
    pending_inventory_requests: number;
    total_echo_feedback: number;
    pending_echo_responses: number;
    avg_student_performance: number | null;
    total_submissions: number;
    submissions_7d: number;
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
                    ecosystem_health: 95,
                    total_principals: 12,
                    active_users_7d: 850,
                    mood_checkins_7d: 320,
                    avg_mood_score_7d: 4.2,
                    total_library_resources: 120,
                    verified_resources: 95,
                    total_bookmarks: 450,
                    total_community_posts: 1200,
                    posts_7d: 156,
                    attendance_records: 4500,
                    attendance_records_7d: 840,
                    growth_signals_7d: 3200,
                    total_inventory_items: 4500,
                    total_inventory_requests: 120,
                    pending_inventory_requests: 45,
                    total_echo_feedback: 85,
                    pending_echo_responses: 12,
                    avg_student_performance: 78.5,
                    total_submissions: 1250,
                    submissions_7d: 145
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
