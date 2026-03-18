import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUserRole } from './useUserRole';

export interface HeatmapData {
    date: string;
    intensity: number; // 0 to 4 (like GitHub)
    count: number;
}

/**
 * useResonantHeatmap
 * 
 * Aggregates resonance activity into a grid format for yearly/monthly visualization.
 */
export function useResonantHeatmap(year: number) {
    const { userId } = useUserRole();

    const { data: rawData = [], isLoading } = useQuery({
        queryKey: ['resonant_heatmap', userId, year],
        queryFn: async () => {
            if (!userId) return [];

            // Query daily counts from mood_logs and journal_entries
            // In a mature system, this would query temporal_summaries
            const startStr = `${year}-01-01`;
            const endStr = `${year}-12-31`;

            const [moodRes, journalRes] = await Promise.all([
                supabase
                    .from('mood_logs')
                    .select('created_at')
                    .eq('user_id', userId)
                    .gte('created_at', startStr)
                    .lte('created_at', endStr),
                supabase
                    .from('journal_entries')
                    .select('created_at')
                    .eq('user_id', userId)
                    .gte('created_at', startStr)
                    .lte('created_at', endStr)
            ]);

            const countsByDate: Record<string, number> = {};

            const process = (items: any[]) => {
                items.forEach(item => {
                    const d = item.created_at.split('T')[0];
                    countsByDate[d] = (countsByDate[d] || 0) + 1;
                });
            };

            process(moodRes.data || []);
            process(journalRes.data || []);

            return Object.entries(countsByDate).map(([date, count]) => ({
                date,
                count,
                intensity: Math.min(Math.ceil(count / 2), 4) // Scale intensity
            }));
        },
        enabled: !!userId
    });

    const heatmap = useMemo(() => {
        return rawData;
    }, [rawData]);

    return {
        heatmap,
        isLoading
    };
}
