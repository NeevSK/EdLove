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

import { supabaseClient } from '@repo/core/adapters/supabaseClient';
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

const MAX_ITEMS = 5;

export function usePendingActions(teacherId: string | null | undefined): PendingActionsResult {
  const [attendancePending, setAttendancePending] = useState<PendingAttendanceItem[]>([]);
  const [gradingPending, setGradingPending] = useState<PendingGradingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setIsLoading(true);
    // Use local date to avoid timezone mismatch (e.g. UTC vs Asia/Colombo)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayEnd = `${today}T23:59:59`;

    try {
      //  1. Classrooms owned by this teacher
      const { data: classrooms, error: clsErr } = await supabaseClient
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', teacherId)
        .limit(20);

      if (clsErr || !classrooms?.length) {
        setAttendancePending([]);
        setGradingPending([]);
        return;
      }

      const classroomIds = classrooms.map((c) => c.id);

      //  2. Classrooms that already have attendance today
      const { data: markedToday } = await supabaseClient
        .from('attendance')
        .select('classroom_id')
        .in('classroom_id', classroomIds)
        .eq('date', today);

      const markedIds = new Set((markedToday ?? []).map((r: any) => r.classroom_id));

      const pending = classrooms
        .filter((c) => !markedIds.has(c.id))
        .slice(0, MAX_ITEMS)
        .map((c) => ({ classroomId: c.id, classroomName: c.name }));

      setAttendancePending(pending);

      //  3. Assignments due today or overdue with ungraded submissions
      const { data: assignments } = await supabaseClient
        .from('assignments')
        .select('id, title, classroom_id, due_date')
        .in('classroom_id', classroomIds)
        .lte('due_date', todayEnd)
        .limit(30);

      if (!assignments?.length) {
        setGradingPending([]);
        return;
      }

      const assignmentIds = assignments.map((a) => a.id);

      // Submissions with no grade (graded_at IS NULL or grade IS NULL)
      const { data: ungraded } = await supabaseClient
        .from('submissions')
        .select('assignment_id')
        .in('assignment_id', assignmentIds)
        .is('graded_at', null);

      if (!ungraded?.length) {
        setGradingPending([]);
        return;
      }

      // Count ungraded per assignment
      const countMap: Record<string, number> = {};
      for (const s of ungraded) {
        countMap[s.assignment_id] = (countMap[s.assignment_id] ?? 0) + 1;
      }

      // Build classroom name lookup
      const clsMap: Record<string, string> = {};
      for (const c of classrooms) clsMap[c.id] = c.name;

      const pendingGrading = assignments
        .filter((a) => countMap[a.id])
        .slice(0, MAX_ITEMS)
        .map((a) => ({
          assignmentId: a.id,
          assignmentTitle: a.title,
          classroomId: a.classroom_id,
          classroomName: clsMap[a.classroom_id] ?? '',
          ungradedCount: countMap[a.id] ?? 0,
        }));

      setGradingPending(pendingGrading);
    } catch {
      // Silently degrade  PulseDashboard shows nothing rather than crashing
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
