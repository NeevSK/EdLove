import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../api/supabase';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import { applyTemporalFilter } from '../logic/utils/temporalUtils';
import { useTemporalStore } from '../store/useTemporalStore';

import type { UserGrowthState } from '../api/userGrowthState';
import type { UserRewardsSnapshot } from '../logic/domains/profile/ports';

export interface JourneyEvent {
  id: string;
  timestamp: string;
  type: 'mood' | 'journal' | 'growth' | 'reward' | 'moment' | 'impact' | 'system';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
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
export function useJourneyHistory(_section?: string, _feature?: string) {
  const { context } = usePermissions();
  const { user_id: userId, active_bond: activeBond } = context;
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
            title: `Growth moved through ${(item.snapshot as unknown as UserGrowthState)?.bhumi_stage ?? 'journey'}`,
            description:
              [
                (item.snapshot as unknown as UserGrowthState)?.banyan_stage
                  ? `Banyan ${(item.snapshot as unknown as UserGrowthState).banyan_stage}`
                  : null,
                (item.snapshot as unknown as UserGrowthState)?.river_stage
                  ? `River ${(item.snapshot as unknown as UserGrowthState).river_stage}`
                  : null,
                (item.snapshot as unknown as UserGrowthState)?.crystal_tier
                  ? `Crystal ${(item.snapshot as unknown as UserGrowthState).crystal_tier}`
                  : null,
              ]
                .filter(Boolean)
                .join(' " ') || 'Growth state updated',
            metadata: item.snapshot as Record<string, unknown>,
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
            description: `${(item.snapshot as unknown as UserRewardsSnapshot)?.points ?? 0} growth points " ${Array.isArray((item.snapshot as unknown as UserRewardsSnapshot)?.badges) ? (item.snapshot as unknown as UserRewardsSnapshot).badges.length : 0} badges`,
            metadata: item.snapshot as Record<string, unknown>,
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
    activeBond,
    currentScale: viewScale,
    phase,
    timelineFocus,
  };
}
