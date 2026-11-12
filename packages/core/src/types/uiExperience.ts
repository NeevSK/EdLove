/** Read models behind the journey, goals, snapshot, pending-work and heatmap screens. */

export interface JourneyEvent {
  id: string;
  timestamp: string;
  type: 'mood' | 'journal' | 'growth' | 'reward' | 'moment' | 'impact' | 'system';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  accentColor?: string;
}

export interface StudentGoal {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  target_date: string;
}

export interface SnapshotMomentRecord {
  id: string;
  user_id: string;
  resonance_date: string;
  label: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PendingAttendanceItem {
  classroomId: string;
  classroomName: string;
}

export interface PendingGradingItem {
  assignmentId: string;
  assignmentTitle: string;
  classroomId: string;
  classroomName: string;
  ungradedCount: number;
}

export interface HeatmapItem {
  date: string;
  intensity: number;
  count: number;
}
