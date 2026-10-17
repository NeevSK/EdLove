'use client';

import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue, useThrottledInvalidate } from '../../pacer/usePacer';
import {
  academicHexagonalService,
  DEFAULT_CANONICAL_ASSIGNMENTS,
} from '../adapters/academic/academicHexagonalService';
import type { AcademicSubmissionView, AssignmentQuest } from '../ports/academic.port';

export function useAcademicDomain() {
  const { isOnline } = useOfflineStatus();
  const [assignments, setAssignments] = useState<AssignmentQuest[]>(DEFAULT_CANONICAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<AcademicSubmissionView[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('asg-wetland-study');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const throttledRefresh = useThrottledInvalidate(500);

  useEffect(() => {
    async function loadData() {
      const loadedAssignments = await academicHexagonalService.getAssignments();
      setAssignments(loadedAssignments);

      const loadedSubmissions = await academicHexagonalService.getSubmissions();
      setSubmissions(loadedSubmissions);
    }
    void loadData();
  }, []);

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

        const refreshed = await academicHexagonalService.getSubmissions();
        setSubmissions(refreshed);

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

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, status: 'graded', marks, grade: letterGrade, feedback }
            : s,
        ),
      );

      void throttledRefresh(['academic', 'submissions', targetSub.assignment_id]);

      return result;
    },
    [submissions, throttledRefresh],
  );

  return {
    assignments,
    submissions,
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
