import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useResonanceStore } from '../store/useResonanceStore';
import { useUserRole } from './useUserRole';
import { supabase } from '../lib/supabase';

export interface JourneyEvent {
    id: string;
    timestamp: string;
    type: 'mood' | 'journal' | 'growth' | 'impact' | 'system';
    title: string;
    description?: string;
    metadata?: any;
    accentColor?: string;
}

export interface HolisticView {
    date: string;
    events: JourneyEvent[];
    summary: string;
}

/**
 * useJourneyHistory
 * 
 * Aggregates role-specific feature history into a consolidated stream.
 * Supports Daily/Weekly holistic views.
 */
export function useJourneyHistory(section?: string, feature?: string) {
    const { userId, role } = useUserRole();
    const { phase, resonanceDate, viewScale, timelineFocus } = useResonanceStore();

    // Fetch Mood Logs for the current context
    const { data: moodEvents = [], isLoading: moodLoading } = useQuery({
        queryKey: ['journey_history_mood', userId, resonanceDate, viewScale],
        queryFn: async () => {
            if (!userId) return [];
            
            // Build query based on temporal context
            let query = supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId);

            if (viewScale === 'day') {
                query = query.gte('created_at', `${resonanceDate}T00:00:00Z`)
                             .lte('created_at', `${resonanceDate}T23:59:59Z`);
            } else if (viewScale === 'week') {
                const end = new Date(resonanceDate);
                const start = new Date(end);
                start.setDate(start.getDate() - 7);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            } else if (viewScale === 'month') {
                const date = new Date(resonanceDate);
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            } else if (viewScale === 'year') {
                const date = new Date(resonanceDate);
                const start = new Date(date.getFullYear(), 0, 1);
                const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            }

            const { data } = await query.order('created_at', { ascending: false });
            return (data || []).map(item => ({
                id: item.id,
                timestamp: item.created_at,
                type: 'mood',
                title: `Mood: ${item.mood_type}`,
                description: item.note,
                accentColor: '#F6BF8C'
            } as JourneyEvent));
        },
        enabled: !!userId
    });

    // Fetch Journal Entries
    const { data: journalEvents = [], isLoading: journalLoading } = useQuery({
        queryKey: ['journey_history_journal', userId, resonanceDate, viewScale],
        queryFn: async () => {
            if (!userId) return [];
            let query = supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId);

            if (viewScale === 'day') {
                query = query.gte('created_at', `${resonanceDate}T00:00:00Z`)
                             .lte('created_at', `${resonanceDate}T23:59:59Z`);
            } else if (viewScale === 'week') {
                const end = new Date(resonanceDate);
                const start = new Date(end);
                start.setDate(start.getDate() - 7);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            } else if (viewScale === 'month') {
                const date = new Date(resonanceDate);
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            } else if (viewScale === 'year') {
                const date = new Date(resonanceDate);
                const start = new Date(date.getFullYear(), 0, 1);
                const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
                query = query.gte('created_at', start.toISOString())
                             .lte('created_at', end.toISOString());
            }

            const { data } = await query.order('created_at', { ascending: false });
            return (data || []).map(item => ({
                id: item.id,
                timestamp: item.created_at,
                type: 'journal',
                title: item.title || 'Untitled Entry',
                description: item.content?.substring(0, 100),
                accentColor: '#10B981'
            } as JourneyEvent));
        },
        enabled: !!userId
    });

    // Consolidate and Sort
    const events = useMemo(() => {
        const all: JourneyEvent[] = [];
        if (timelineFocus === 'all' || timelineFocus === 'mood') all.push(...moodEvents);
        if (timelineFocus === 'all' || timelineFocus === 'journal') all.push(...journalEvents);
        
        return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [moodEvents, journalEvents, timelineFocus]);

    // Holistic Aggregation
    const holisticView = useMemo(() => {
        if (viewScale === 'day') {
            return {
                date: resonanceDate,
                events,
                summary: events.length > 0 
                    ? `You recorded ${events.length} resonance points today.`
                    : "No resonance points found for this day."
            };
        }

        if (viewScale === 'week') {
            return {
                date: resonanceDate,
                events,
                summary: `Weekly overview: ${events.length} activities captured.`
            };
        }

        if (viewScale === 'month') {
            return {
                date: resonanceDate,
                events,
                summary: `Monthly resonance: ${events.length} milestones identified.`
            };
        }

        return {
            date: resonanceDate,
            events,
            summary: `Yearly journey: ${events.length} signature resonance points preserved.`
        };
    }, [events, viewScale, resonanceDate]);

    return {
        events,
        holisticView,
        isLoading: moodLoading || journalLoading,
        role,
        currentScale: viewScale,
        phase,
        timelineFocus
    };
}
