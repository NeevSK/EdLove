import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import { journeyEventsQuery } from '@repo/core/store/queries/experienceQueries';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import type { JourneyEvent } from '@repo/core/types/uiExperience';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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
  const { context } = useSanctuaryFeature();
  const { userId, activeBond } = context;
  const phase = useTemporalStore((s) => s.phase);
  const viewDate = useTemporalStore((s) => s.viewDate);
  const viewScale = useTemporalStore((s) => s.viewScale);
  const timelineFocus = useTemporalStore((s) => s.timelineFocus);
  const view = useMemo(() => ({ viewDate, phase, viewScale }), [viewDate, phase, viewScale]);

  const { data: moodEvents = [], isLoading: moodLoading } = useQuery(
    journeyEventsQuery('mood', userId, view),
  );

  const { data: journalEvents = [], isLoading: journalLoading } = useQuery(
    journeyEventsQuery('journal', userId, view),
  );

  const { data: growthEvents = [], isLoading: growthLoading } = useQuery(
    journeyEventsQuery('growth', userId, view),
  );

  const { data: rewardEvents = [], isLoading: rewardLoading } = useQuery(
    journeyEventsQuery('rewards', userId, view),
  );

  const { data: momentEvents = [], isLoading: momentLoading } = useQuery(
    journeyEventsQuery('moments', userId, view),
  );

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
