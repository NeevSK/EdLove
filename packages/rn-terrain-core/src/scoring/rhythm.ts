export interface RhythmSignals {
  release_cadence_days: number; // avg days between releases (12mo)
  commit_cadence_days: number; // avg days between meaningful commits
  issue_response_cadence_days: number; // avg days to maintainer response

  days_since_normal_release: number; // current gap vs expected cadence
  days_since_normal_commit: number;
  release_deviation_factor: number; // current_gap / normal_cadence
  commit_deviation_factor: number; // e.g. 3.5x = 3.5x longer than normal

  rhythm_status: 'normal' | 'slow' | 'concerning' | 'silent';
}

export function calculateRhythmStatus(deviationFactor: number): RhythmSignals['rhythm_status'] {
  if (deviationFactor <= 1.5) return 'normal';
  if (deviationFactor <= 2.5) return 'slow';
  if (deviationFactor <= 4.0) return 'concerning';
  return 'silent';
}
