/**
 * usePendingActions  Real pending work for the teacher's PulseDashboard.
 *
 * Returns two lists:
 *   - attendancePending: classrooms where today's attendance has NOT been recorded yet
 *   - gradingPending:    assignments whose due_date is today-or-past and that have at
 *                        least one submission without a grade
 *
 * Both lists are capped at 5 items so the dashboard stays concise.
 * Gracefully degrades on any DB error  returns empty arrays rather than throwing.
 */

import { uiExperience } from '@repo/core/logic/managers/factory';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

export interface PendingActionsResult {
  attendancePending: PendingAttendanceItem[];
  gradingPending: PendingGradingItem[];
  isLoading: boolean;
  refresh: () => void;
}

export function usePendingActions(teacherId: string | null | undefined): PendingActionsResult {
  const [attendancePending, setAttendancePending] = useState<PendingAttendanceItem[]>([]);
  const [gradingPending, setGradingPending] = useState<PendingGradingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setIsLoading(true);

    try {
      const result = await uiExperience.getPendingActions(teacherId);
      setAttendancePending(result.attendancePending);
      setGradingPending(result.gradingPending);
    } catch {
      // Silently degrade — PulseDashboard shows nothing rather than crashing
      setAttendancePending([]);
      setGradingPending([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    load().catch((e) => {
      console.error('PendingActions: Failed to load data', e);
    });
  }, [load]);

  return useMemo(
    () => ({ attendancePending, gradingPending, isLoading, refresh: load }),
    [attendancePending, gradingPending, isLoading, load],
  );
}
