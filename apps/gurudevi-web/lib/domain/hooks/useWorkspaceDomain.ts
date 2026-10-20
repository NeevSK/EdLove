'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedCallback, useDebouncedValue, useThrottledInvalidate } from '../../pacer/usePacer';
import {
  type WorkspaceClassroom,
  type WorkspaceStudent,
  stepAttendanceStatus,
} from '../../workspace/attendance';
import { workspaceHexagonalService } from '../adapters/workspace/workspaceHexagonalService';

export interface UseWorkspaceDomainOptions {
  subjectId?: string | null;
  date: string;
  selectedClassroomId?: string | null;
}

export function useWorkspaceDomain({
  subjectId,
  date,
  selectedClassroomId,
}: UseWorkspaceDomainOptions) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const throttledRefresh = useThrottledInvalidate(500);

  // 1. TanStack Query: Classroom list
  const { data: classrooms = [], isLoading: isClassroomsLoading } = useQuery({
    queryKey: ['workspace', 'classrooms', subjectId],
    queryFn: () => (subjectId ? workspaceHexagonalService.getClassrooms(subjectId) : []),
    enabled: Boolean(subjectId),
    staleTime: 5 * 60 * 1000,
  });

  const activeClassroom = useMemo(() => {
    if (!classrooms.length) return null;
    if (selectedClassroomId) {
      return classrooms.find((c) => c.id === selectedClassroomId) ?? classrooms[0];
    }
    return classrooms[0];
  }, [classrooms, selectedClassroomId]);

  // 2. TanStack Query: Attendance Roster
  const {
    data: roster = [],
    isLoading: isRosterLoading,
    error: rosterError,
  } = useQuery({
    queryKey: ['workspace', 'attendance', subjectId, activeClassroom?.id, date],
    queryFn: () =>
      subjectId && activeClassroom
        ? workspaceHexagonalService.getAttendanceRoster(activeClassroom, date, subjectId)
        : [],
    enabled: Boolean(subjectId && activeClassroom),
    staleTime: 30_000,
  });

  // Local student state with optimistic updates
  const [students, setStudents] = useState<readonly WorkspaceStudent[]>([]);

  // TanStack Pacer: Debounced Draft Persistence (prevents storage thrashing on rapid taps)
  const debouncedSaveDraft = useDebouncedCallback(
    (studentsToSave: readonly WorkspaceStudent[]) => {
      if (!subjectId || !activeClassroom) return;
      workspaceHexagonalService.saveDraft(
        { accountId: subjectId, classroomId: activeClassroom.id, date },
        studentsToSave,
      );
    },
    { wait: 400 },
  );

  // 3. TanStack Query Mutation: Submit Attendance
  const submitMutation = useMutation({
    mutationFn: async (studentsToSubmit: readonly WorkspaceStudent[]) => {
      if (!subjectId || !activeClassroom) throw new Error('Cannot submit without active class');
      return workspaceHexagonalService.submitAttendance(
        activeClassroom,
        date,
        subjectId,
        studentsToSubmit,
      );
    },
    onSuccess: () => {
      void throttledRefresh(['workspace', 'attendance', subjectId, activeClassroom?.id, date]);
    },
  });

  const markStudentStatus = useCallback(
    (studentId: string) => {
      setStudents((current) => {
        const base = current.length ? current : roster;
        const next = base.map((s) =>
          s.studentId === studentId || s.id === studentId
            ? { ...s, status: stepAttendanceStatus(s.status) }
            : s,
        );
        debouncedSaveDraft(next);
        return next;
      });
    },
    [roster, debouncedSaveDraft],
  );

  const filteredStudents = useMemo(() => {
    const list = students.length ? students : roster;
    if (!debouncedSearch.trim()) return list;
    const lower = debouncedSearch.toLowerCase();
    return list.filter((s) => (s.name ?? s.studentId ?? '').toLowerCase().includes(lower));
  }, [students, roster, debouncedSearch]);

  return {
    classrooms,
    activeClassroom,
    students: students.length ? students : roster,
    filteredStudents,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    markStudentStatus,
    submitAttendance: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isLoading: isClassroomsLoading || isRosterLoading,
    error: rosterError,
    throttledRefresh,
  };
}
