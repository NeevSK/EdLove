import {
  useStudentAssignmentsQuery,
  useStudentClassroomsQuery,
  useStudentStatsQuery,
} from '@repo/core';
import { assignmentsAPI } from '@repo/core/api';
import { useRewards } from '@repo/core/hooks';
import { useAuthStore } from '@repo/core/logic';

import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * useStudentRegistry: Unified hook for a student's sanctuary landscape.
 */
export function useStudentRegistry() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  const stats = useStudentStatsQuery(userId);
  const sanctuaries = useStudentClassroomsQuery(userId);

  return {
    stats,
    sanctuaries,
    isLoading: stats.isLoading || sanctuaries.isLoading,
  };
}

/**
 * useStudentQuestsPulse: Fetch upcoming assignments and handle submissions.
 */
export function useStudentQuestsPulse() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const queryClient = useQueryClient();

  const quests = useStudentAssignmentsQuery(userId);

  const submitMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      content,
      photoUri,
    }: {
      assignmentId: string;
      content: string;
      photoUri?: string | null;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      return assignmentsAPI.submitSubmission(assignmentId, content, photoUri ?? null);
    },
    onSuccess: () => {
      // Invalidate assignments to reflect submission status (if tracked there)
      queryClient.invalidateQueries({ queryKey: ['student-assignments', userId] });
    },
  });

  return {
    quests,
    submitQuest: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}

/**
 * useStudentGrowthPulse: Monitor rewards and progress.
 */
export function useStudentGrowthPulse() {
  const { rewards, isLoading } = useRewards();

  return {
    points: rewards?.points ?? 0,
    isLoading,
  };
}
