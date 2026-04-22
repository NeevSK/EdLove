import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { useTemporalStore } from '../store/useTemporalStore';
import { applyTemporalFilter } from '../utils/temporalUtils';

export interface JourneyEvent {
  id: string;
  timestamp: string;
  type: 'mood' | 'journal' | 'growth' | 'reward' | 'moment' | 'impact' | 'system';
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
  const { context } = usePermissions();
  const { userId, authority } = context;
  const { phase, viewDate, viewScale, timelineFocus } = useTemporalStore();

  // Fetch Mood Logs for the current context
  const { data: moodEvents = [], isLoading: moodLoading } = useQuery({
    queryKey: ['journey_history_mood', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase.from('mood_logs').select('*').eq('user_id', userId);
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
      });

      const { data } = await query.order('created_at', { ascending: false });
      return (data || []).map(
        (item) =>
          ({
            id: item.id,
            timestamp: item.created_at,
            type: 'mood',
            title: `Mood: ${item.mood_type}`,
            description: item.note,
            accentColor: '#F6BF8C',
          }) as JourneyEvent,
      );
    },
    enabled: !!userId,
  });

  // Fetch Journal Entries
  const { data: journalEvents = [], isLoading: journalLoading } = useQuery({
    queryKey: ['journey_history_journal', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase.from('journal_entries').select('*').eq('user_id', userId);
      query = applyTemporalFilter(query, {
        column: 'created_at',
        mode: 'event_time',
        capability: 'event_stream',
      });

      const { data } = await query.order('created_at', { ascending: false });
      return (data || []).map(
        (item) =>
          ({
            id: item.id,
            timestamp: item.created_at,
            type: 'journal',
            title: item.title || 'Untitled Entry',
            description: item.content?.substring(0, 100),
            accentColor: '#10B981',
          }) as JourneyEvent,
      );
    },
    enabled: !!userId,
  });

  const { data: growthEvents = [], isLoading: growthLoading } = useQuery({
    queryKey: ['journey_history_growth', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('user_growth_state_versions')
        .select('id, operation, recorded_at, snapshot')
        .eq('user_id', userId);

      query = applyTemporalFilter(query, {
        column: 'recorded_at',
        mode: 'event_time',
        capability: 'audit_history',
      });

      const { data } = await query.order('recorded_at', { ascending: false });
      return (data || []).map(
        (item) =>
          ({
            id: item.id,
            timestamp: item.recorded_at,
            type: 'growth',
            title: `Growth moved through ${(item.snapshot as any)?.bhumi_stage ?? 'journey'}`,
            description:
              [
                (item.snapshot as any)?.banyan_stage
                  ? `Banyan ${(item.snapshot as any).banyan_stage}`
                  : null,
                (item.snapshot as any)?.river_stage
                  ? `River ${(item.snapshot as any).river_stage}`
                  : null,
                (item.snapshot as any)?.crystal_tier
                  ? `Crystal ${(item.snapshot as any).crystal_tier}`
                  : null,
              ]
                .filter(Boolean)
                .join(' " ') || 'Growth state updated',
            metadata: item.snapshot as any,
            accentColor: '#D97706',
          }) as JourneyEvent,
      );
    },
    enabled: !!userId,
  });

  const { data: rewardEvents = [], isLoading: rewardLoading } = useQuery({
    queryKey: ['journey_history_rewards', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('user_rewards_versions')
        .select('id, operation, recorded_at, snapshot')
        .eq('user_id', userId);

      query = applyTemporalFilter(query, {
        column: 'recorded_at',
        mode: 'event_time',
        capability: 'audit_history',
      });

      const { data } = await query.order('recorded_at', { ascending: false });
      return (data || []).map(
        (item) =>
          ({
            id: item.id,
            timestamp: item.recorded_at,
            type: 'reward',
            title: `Rewards ${item.operation}`,
            description: `${(item.snapshot as any)?.points ?? 0} growth points " ${Array.isArray((item.snapshot as any)?.badges) ? (item.snapshot as any).badges.length : 0} badges`,
            metadata: item.snapshot as any,
            accentColor: '#7C3AED',
          }) as JourneyEvent,
      );
    },
    enabled: !!userId,
  });

  const { data: momentEvents = [], isLoading: momentLoading } = useQuery({
    queryKey: ['journey_history_moments', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('whispered_moments')
        .select('id, moment_key, moment_name_en, moment_name_si, awarded_at')
        .eq('user_id', userId);

      query = applyTemporalFilter(query, {
        column: 'awarded_at',
        mode: 'event_time',
        capability: 'event_stream',
      });

      const { data } = await query.order('awarded_at', { ascending: false });
      return (data || []).map(
        (item) =>
          ({
            id: item.id,
            timestamp: item.awarded_at,
            type: 'moment',
            title: item.moment_name_en || item.moment_key,
            description: item.moment_name_si,
            metadata: {
              key: item.moment_key,
              name_en: item.moment_name_en,
              name_si: item.moment_name_si,
            },
            accentColor: '#0EA5E9',
          }) as JourneyEvent,
      );
    },
    enabled: !!userId,
  });

  // Consolidate and Sort
  const events = useMemo(() => {
    const all: JourneyEvent[] = [];
    if (timelineFocus === 'all' || timelineFocus === 'mood') all.push(...moodEvents);
    if (timelineFocus === 'all' || timelineFocus === 'journal') all.push(...journalEvents);
    if (timelineFocus === 'all' || timelineFocus === 'growth' || timelineFocus === 'journey')
      all.push(...growthEvents);
    if (timelineFocus === 'all' || timelineFocus === 'reward' || timelineFocus === 'journey')
      all.push(...rewardEvents);
    if (timelineFocus === 'all' || timelineFocus === 'moment' || timelineFocus === 'journey')
      all.push(...momentEvents);

    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [moodEvents, journalEvents, growthEvents, rewardEvents, momentEvents, timelineFocus]);

  // Holistic Aggregation
  const holisticView = useMemo(() => {
    if (viewScale === 'day') {
      return {
        date: viewDate,
        events,
        summary:
          events.length > 0
            ? `You recorded ${events.length} history points today.`
            : 'No history points found for this day.',
      };
    }

    if (viewScale === 'week') {
      return {
        date: viewDate,
        events,
        summary: `Weekly overview: ${events.length} activities captured.`,
      };
    }

    if (viewScale === 'month') {
      return {
        date: viewDate,
        events,
        summary: `Monthly history: ${events.length} milestones identified.`,
      };
    }

    return {
      date: viewDate,
      events,
      summary: `Yearly journey: ${events.length} signature history points preserved.`,
    };
  }, [events, viewScale, viewDate]);

  return {
    events,
    holisticView,
    isLoading: moodLoading || journalLoading || growthLoading || rewardLoading || momentLoading,
    authority,
    currentScale: viewScale,
    phase,
    timelineFocus,
  };
}
