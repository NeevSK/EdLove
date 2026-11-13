import { useOfflineStatus } from '@repo/core/offline/resilience.adapter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDebouncedValue, useThrottledInvalidate } from '@repo/core/hooks/usePacer';
import {
  academicAdapter,
  DEFAULT_CANONICAL_ASSIGNMENTS,
} from '../adapters/academic/academic.adapter';
import type { AcademicSubmissionView, AssignmentQuest } from '../ports/academic.port';

export function useAcademicDomain() {
  const { isOnline } = useOfflineStatus();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('asg-wetland-study');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const throttledRefresh = useThrottledInvalidate(500);

  // TanStack Query: Assignments catalog
  const { data: assignments = DEFAULT_CANONICAL_ASSIGNMENTS } = useQuery({
    queryKey: ['academic', 'assignments'],
    queryFn: () => academicAdapter.getAssignments(),
    initialData: DEFAULT_CANONICAL_ASSIGNMENTS,
    staleTime: 60_000,
  });

  // TanStack Query: Student submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['academic', 'submissions'],
    queryFn: () => academicAdapter.getSubmissions(),
    initialData: [],
    staleTime: 30_000,
  });

  // TanStack Query: Gradebook roster
  const { data: roster = [] } = useQuery({
    queryKey: ['academic', 'roster'],
    queryFn: () => academicAdapter.getGradebookRoster(),
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

  const submit = useMutation({
    mutationKey: ['academic', 'submissions', 'submit'],
    mutationFn: (input: { assignmentId: string; content: string; photoUrl?: string }) =>
      academicAdapter.submitAssignment({ ...input, studentId: 'student-current-user' }),
    onSuccess: (_result, { assignmentId }) => {
      void throttledRefresh(['academic', 'submissions']);
      void throttledRefresh(['academic', 'submissions', assignmentId]);
    },
  });

  const grade = useMutation({
    mutationKey: ['academic', 'submissions', 'grade'],
    mutationFn: (input: Parameters<typeof academicAdapter.gradeSubmission>[0]) =>
      academicAdapter.gradeSubmission(input),
    onSuccess: (_result, { assignmentId }) => {
      void throttledRefresh(['academic', 'submissions']);
      void throttledRefresh(['academic', 'submissions', assignmentId]);
    },
  });

  const submitAssignment = (assignmentId: string, content: string, photoUrl?: string) =>
    submit.mutateAsync({ assignmentId, content, photoUrl });

  const gradeSubmission = async (
    submissionId: string,
    marks: number,
    letterGrade: string,
    feedback?: string,
  ) => {
    const target = submissions.find((s) => s.id === submissionId);
    if (!target) return null;
    return grade.mutateAsync({
      submissionId,
      studentId: target.student_id,
      classroomId: target.classroom || 'class-default',
      assignmentId: target.assignment_id,
      marks,
      letterGrade,
      feedback,
    });
  };

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
    isSubmitting: submit.isPending,
    isGrading: grade.isPending,
    isOnline,
    throttledRefresh,
  };
}
