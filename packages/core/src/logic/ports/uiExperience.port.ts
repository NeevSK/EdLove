import type { TemporalView } from '@repo/core/types/Temporal';
import type {
  HeatmapItem,
  JourneyEvent,
  PendingAttendanceItem,
  PendingGradingItem,
  SnapshotMomentRecord,
  StudentGoal,
} from '@repo/core/types/uiExperience';

/**
 * Reads behind the experience screens. Reads of event history take the time window explicitly;
 * the repository never looks at application state for it.
 */
export interface UIExperienceRepository {
  getMoodJourneyEvents(userId: string, view: TemporalView): Promise<JourneyEvent[]>;
  getJournalJourneyEvents(userId: string, view: TemporalView): Promise<JourneyEvent[]>;
  getGrowthJourneyEvents(userId: string, view: TemporalView): Promise<JourneyEvent[]>;
  getRewardJourneyEvents(userId: string): Promise<JourneyEvent[]>;
  getMomentJourneyEvents(userId: string): Promise<JourneyEvent[]>;
  getStudentGoals(userId: string): Promise<StudentGoal[]>;
  createSnapshotMoment(input: {
    userId: string;
    resonanceDate: string;
    label: string;
    metadata: Record<string, unknown>;
  }): Promise<SnapshotMomentRecord>;
  getPendingActions(teacherId: string): Promise<{
    attendancePending: PendingAttendanceItem[];
    gradingPending: PendingGradingItem[];
  }>;
  getTemporalHeatmap(userId: string, range: { start: string; end: string }): Promise<HeatmapItem[]>;
}
