import { uiExperience } from '@repo/core/logic/managers/factory';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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
 * Aggregates capacity-specific feature history into a consolidated stream.
 * Supports Daily/Weekly holistic views.
 */
export function useJourneyHistory(_section?: string, _feature?: string) {
  const { context } = usePermissions();
  const { userId, activeBond } = context;
  const { phase, viewDate, viewScale, timelineFocus } = useTemporalStore();

  // Fetch Mood Logs for the current context
  const { data: moodEvents = [], isLoading: moodLoading } = useQuery({
    queryKey: ['journey_history_mood', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      return uiExperience.getMoodJourneyEvents(userId);
    },
    enabled: !!userId,
  });

  // Fetch Journal Entries
  const { data: journalEvents = [], isLoading: journalLoading } = useQuery({
    queryKey: ['journey_history_journal', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      return uiExperience.getJournalJourneyEvents(userId);
    },
    enabled: !!userId,
  });

  const { data: growthEvents = [], isLoading: growthLoading } = useQuery({
    queryKey: ['journey_history_growth', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      return uiExperience.getGrowthJourneyEvents(userId);
    },
    enabled: !!userId,
  });

  const { data: rewardEvents = [], isLoading: rewardLoading } = useQuery({
    queryKey: ['journey_history_rewards', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      return uiExperience.getRewardJourneyEvents(userId);
    },
    enabled: !!userId,
  });

  const { data: momentEvents = [], isLoading: momentLoading } = useQuery({
    queryKey: ['journey_history_moments', userId, viewDate, viewScale],
    queryFn: async () => {
      if (!userId) return [];
      return uiExperience.getMomentJourneyEvents(userId);
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
