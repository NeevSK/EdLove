/**
 * Server reads behind the experience screens (Tier 4): query keys and reads over the
 * UI-experience repository. Event history reads carry the time window in their key and their read,
 * so a change of date, scale or phase is a different query.
 */
import { uiExperience } from '@repo/core/effect/bindings/experience';
import { getTemporalRange } from '@repo/core/logic/utils/temporalUtils';
import type { TemporalView } from '@repo/core/types/Temporal';
import type {
  HeatmapItem,
  JourneyEvent,
  PendingAttendanceItem,
  PendingGradingItem,
  SnapshotMomentRecord,
  StudentGoal,
} from '@repo/core/types/uiExperience';
import { queryOptions } from '@tanstack/react-query';

export type JourneyEventKind = 'mood' | 'journal' | 'growth' | 'rewards' | 'moments';

const journeyReads: Record<
  JourneyEventKind,
  (userId: string, view: TemporalView) => Promise<JourneyEvent[]>
> = {
  mood: (userId, view) => uiExperience.getMoodJourneyEvents(userId, view),
  journal: (userId, view) => uiExperience.getJournalJourneyEvents(userId, view),
  growth: (userId, view) => uiExperience.getGrowthJourneyEvents(userId, view),
  rewards: (userId) => uiExperience.getRewardJourneyEvents(userId),
  moments: (userId) => uiExperience.getMomentJourneyEvents(userId),
};

/** One kind of journey history for the account, in the time window in view. */
export function journeyEventsQuery(
  kind: JourneyEventKind,
  userId: string | null,
  view: TemporalView,
) {
  return queryOptions({
    queryKey: [
      `journey_history_${kind}`,
      userId,
      view.viewDate,
      view.viewScale,
      view.phase,
    ] as const,
    queryFn: (): Promise<JourneyEvent[]> =>
      userId ? journeyReads[kind](userId, view) : Promise.resolve([]),
    enabled: Boolean(userId),
  });
}

/** A year of activity for the heatmap. */
export function temporalHeatmapQuery(userId: string | null, year: number) {
  return queryOptions({
    queryKey: ['temporal_heatmap', userId, year] as const,
    queryFn: (): Promise<HeatmapItem[]> =>
      userId
        ? uiExperience.getTemporalHeatmap(userId, getTemporalRange(`${year}-01-01`, 'year'))
        : Promise.resolve([]),
    enabled: Boolean(userId),
  });
}

export const readStudentGoals = (userId: string): Promise<StudentGoal[]> =>
  uiExperience.getStudentGoals(userId);

export const readPendingActions = (
  teacherId: string,
): Promise<{ attendancePending: PendingAttendanceItem[]; gradingPending: PendingGradingItem[] }> =>
  uiExperience.getPendingActions(teacherId);

export const saveSnapshotMoment = (input: {
  userId: string;
  resonanceDate: string;
  label: string;
  metadata: Record<string, unknown>;
}): Promise<SnapshotMomentRecord> => uiExperience.createSnapshotMoment(input);
