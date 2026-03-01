import { useState, useEffect } from 'react';
import { supabase } from '@repo/core';

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

    useEffect(() => {
        if (!schoolId) {
            setPulse(null);
            setLoading(false);
            return;
        }

        fetchPulse();
    }, [schoolId]);

    const fetchPulse = async () => {
        if (!schoolId) { setLoading(false); return; }
        setLoading(true);
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
            const yesterday = new Date(Date.now() - 86400000).toISOString();

            // Parallel queries — all school-scoped public data (no individual mood data)
            const [
                { count: postsThisWeek },
                { count: postsLastDay },
                { count: libraryActivity },
                { count: groupCount },
                { count: classroomCount },
            ] = await Promise.all([
                supabase.from('community_posts').select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId).gte('created_at', sevenDaysAgo),
                supabase.from('community_posts').select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId).gte('created_at', yesterday),
                supabase.from('library_items').select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId).gte('created_at', sevenDaysAgo),
                supabase.from('community_groups').select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId),
                supabase.from('classrooms').select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId),
            ]);

            const totalVolume = (postsThisWeek ?? 0) + (libraryActivity ?? 0);
            const dailyPosts = postsLastDay ?? 0;
            const weeklyPosts = postsThisWeek ?? 0;

            // Derive resonance score from real activity signals (0-100)
            // Guard against accidental zero anchor (defensive — constant is 50)
            const anchor = RESONANCE_ACTIVITY_ANCHOR > 0 ? RESONANCE_ACTIVITY_ANCHOR : 50;
            const activityScore = Math.min(100, Math.round((totalVolume / anchor) * 100));

            // Trend: compare last-day posts vs weekly average (explicit null guard)
            const weeklyAvgPerDay = (weeklyPosts ?? 0) / 7;
            const trend: 'rising' | 'stable' | 'failing' =
                dailyPosts > weeklyAvgPerDay * RISING_THRESHOLD ? 'rising' :
                dailyPosts < weeklyAvgPerDay * FAILING_THRESHOLD ? 'failing' : 'stable';

            // Aggregate mood is unknown without individual data (privacy-preserving)
            // This field will be populated by a future Edge Function
            const aggregated_mood: PulseMetrics['aggregated_mood'] = 'unknown';

            setPulse({
                resonance_score: activityScore,
                aggregated_mood,
                trend,
                participation_rate: classroomCount ? Math.min(100, Math.round((totalVolume / classroomCount) * PARTICIPATION_SCALE_FACTOR)) : 0,
                top_subjects: [],   // Requires Edge Function aggregation — left empty for now
                interaction_volume: totalVolume,
            });
            setError(null);
        } catch (err) {
            setError('Failed to sync school pulse');
        } finally {
            setLoading(false);
        }
    };

    return { pulse, loading, error, refresh: fetchPulse };
}
