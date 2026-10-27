'use client';

import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue, useThrottledInvalidate } from '../../pacer/usePacer';
import {
  academicHexagonalService,
  DEFAULT_CANONICAL_ASSIGNMENTS,
} from '../adapters/academic/academicHexagonalService';
import type { AcademicSubmissionView, AssignmentQuest } from '../ports/academic.port';

export function useAcademicDomain() {
  const { isOnline } = useOfflineStatus();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('asg-wetland-study');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const throttledRefresh = useThrottledInvalidate(500);

  // TanStack Query: Assignments catalog
  const { data: assignments = DEFAULT_CANONICAL_ASSIGNMENTS } = useQuery({
    queryKey: ['academic', 'assignments'],
    queryFn: () => academicHexagonalService.getAssignments(),
    initialData: DEFAULT_CANONICAL_ASSIGNMENTS,
    staleTime: 60_000,
  });

  // TanStack Query: Student submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['academic', 'submissions'],
    queryFn: () => academicHexagonalService.getSubmissions(),
    initialData: [],
    staleTime: 30_000,
  });

  // TanStack Query: Gradebook roster
  const { data: roster = [] } = useQuery({
    queryKey: ['academic', 'roster'],
    queryFn: () => academicHexagonalService.getGradebookRoster(),
    initialData: [],
    staleTime: 60_000,
  });

  const filteredSubmissions = useMemo(() => {
    if (!debouncedSearch.trim()) return submissions;
    const lower = debouncedSearch.toLowerCase();
    return submissions.filter(
      (s) =>
        s.student_id.toLowerCase().includes(lower) ||
        s.assignment_id.toLowerCase().includes(lower) ||
        (s.grade && s.grade.toLowerCase().includes(lower)) ||
        (s.feedback && s.feedback.toLowerCase().includes(lower)),
    );
  }, [submissions, debouncedSearch]);

  const submitAssignment = useCallback(
    async (assignmentId: string, content: string, photoUrl?: string) => {
      setIsSubmitting(true);
      try {
        const result = await academicHexagonalService.submitAssignment({
          assignmentId,
          studentId: 'student-current-user',
          content,
          photoUrl,
        });

        // Throttle query invalidation using TanStack Pacer
        void throttledRefresh(['academic', 'submissions']);
        void throttledRefresh(['academic', 'submissions', assignmentId]);

        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [throttledRefresh],
  );

  const gradeSubmission = useCallback(
    async (submissionId: string, marks: number, letterGrade: string, feedback?: string) => {
      const targetSub = submissions.find((s) => s.id === submissionId);
      if (!targetSub) return null;

      const result = await academicHexagonalService.gradeSubmission({
        submissionId,
        studentId: targetSub.student_id,
        classroomId: targetSub.classroom || 'class-default',
        assignmentId: targetSub.assignment_id,
        marks,
        letterGrade,
        feedback,
      });

      // Throttle query invalidation using TanStack Pacer
      void throttledRefresh(['academic', 'submissions']);
      void throttledRefresh(['academic', 'submissions', targetSub.assignment_id]);

      return result;
    },
    [submissions, throttledRefresh],
  );

  return {
    assignments,
    submissions,
    roster,
    filteredSubmissions,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedAssignmentId,
    setSelectedAssignmentId,
    submitAssignment,
    gradeSubmission,
    isSubmitting,
    isOnline,
    throttledRefresh,
  };
}
