import { useState, useEffect, useCallback } from 'react';
import { supabase, useTemporalStore, getTemporalRange } from '@repo/core';

export interface PulseMetrics {
    resonance_score: number; // 0-100
    aggregated_mood: 'joy' | 'peace' | 'focus' | 'struggle' | 'unknown';
    trend: 'rising' | 'stable' | 'failing';
    participation_rate: number; // percentage
    top_subjects: string[];
    interaction_volume: number;
}

// Thresholds: a day with >20% above the weekly average is "rising"; <50% is "failing"
const RISING_THRESHOLD = 1.2;
const FAILING_THRESHOLD = 0.5;
// 50 weekly interactions across the school = full 100% resonance score
const RESONANCE_ACTIVITY_ANCHOR = 50;
// Interactions per classroom per week considered 100% participation
const PARTICIPATION_SCALE_FACTOR = 10;

export function useSchoolPulse(schoolId?: string) {
    const [pulse, setPulse] = useState<PulseMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // refreshToken is bumped by the manual refresh() to re-run the effect
    const [refreshToken, setRefreshToken] = useState(0);
    const viewDate = useTemporalStore(state => state.viewDate);

    const fetchPulse = useCallback(async (id: string, signal: { cancelled: boolean }, targetDate: string) => {
        setLoading(true);
        try {
            const anchorDate = new Date(targetDate);
            const sevenDaysAgo = new Date(anchorDate.getTime() - 7 * 86400000).toISOString();
            const { start: dayStart, end: dayEnd } = getTemporalRange(targetDate);

            // Parallel queries — all school-scoped public data (no individual mood data)
            const [
                { count: postsThisWeek },
                { count: postsLastDay },
                { count: libraryActivity },
                { count: groupCount },
                { count: classroomCount },
            ] = await Promise.all([
                supabase.from('community_posts').select('id', { count: 'exact', head: true })
                    .eq('school_id', id).gte('created_at', sevenDaysAgo).lte('created_at', dayEnd),
                supabase.from('community_posts').select('id', { count: 'exact', head: true })
                    .eq('school_id', id).gte('created_at', dayStart).lte('created_at', dayEnd),
                supabase.from('library_items').select('id', { count: 'exact', head: true })
                    .eq('school_id', id).gte('created_at', sevenDaysAgo).lte('created_at', dayEnd),
                supabase.from('community_groups').select('id', { count: 'exact', head: true })
                    .eq('school_id', id),
                supabase.from('classrooms').select('id', { count: 'exact', head: true })
                    .eq('school_id', id),
            ]);

            if (signal.cancelled) return;

            // Group activity adds weight to the community signal (each active group = extra interactions)
            const totalVolume = (postsThisWeek ?? 0) + (libraryActivity ?? 0);
            const communityVolume = totalVolume + (groupCount ?? 0);
            const dailyPosts = postsLastDay ?? 0;
            const weeklyPosts = postsThisWeek ?? 0;

            // Derive resonance score from real activity signals (0-100)
            const anchor = RESONANCE_ACTIVITY_ANCHOR > 0 ? RESONANCE_ACTIVITY_ANCHOR : 50;
            const activityScore = Math.min(100, Math.round((communityVolume / anchor) * 100));

            // Trend: compare last-day posts vs weekly average
            const weeklyAvgPerDay = (weeklyPosts ?? 0) / 7;
            const trend: 'rising' | 'stable' | 'failing' =
                dailyPosts > weeklyAvgPerDay * RISING_THRESHOLD ? 'rising' :
                dailyPosts < weeklyAvgPerDay * FAILING_THRESHOLD ? 'failing' : 'stable';

            const aggregated_mood: PulseMetrics['aggregated_mood'] = 'unknown';

            setPulse({
                resonance_score: activityScore,
                aggregated_mood,
                trend,
                participation_rate: classroomCount ? Math.min(100, Math.round((communityVolume / classroomCount) * PARTICIPATION_SCALE_FACTOR)) : 0,
                top_subjects: [],
                interaction_volume: communityVolume,
            });
            setError(null);
        } catch (err) {
            if (!signal.cancelled) setError('Failed to sync school pulse');
        } finally {
            if (!signal.cancelled) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!schoolId) {
            setPulse(null);
            setLoading(false);
            return;
        }
        const signal = { cancelled: false };
        fetchPulse(schoolId, signal, viewDate);
        return () => { signal.cancelled = true; };
    }, [schoolId, refreshToken, fetchPulse, viewDate]);

    return { pulse, loading, error, refresh: () => setRefreshToken(t => t + 1) };
}
