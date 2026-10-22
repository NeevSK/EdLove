import {
  getDemoClassrooms,
  MOCK_ASSIGNMENTS,
  MOCK_STUDENT_STATS,
} from '@repo/core/api/client';
import { useAuthStore, useStore } from '@repo/core/logic';

import { useMemo } from 'react';
import {
  useStudentGrowthPulse,
  useStudentQuestsPulse,
  useStudentRegistry,
} from '@repo/classroom/hooks/useStudentDashboardHooks';

export function useStudentWorkspaceData(forceDemo?: boolean) {
  const isDemoMode = useStore((state) => state.isDemoMode);
  const isExplorerMode = useAuthStore((state) => state.isExplorerMode);
  const user = useAuthStore((state) => state.user);
  const isGuest = Boolean(user?.is_anonymous);
  const isDemoExperience = isDemoMode || forceDemo === true || isExplorerMode || isGuest;

  const registry = useStudentRegistry();
  const questsPulse = useStudentQuestsPulse();
  const growthPulse = useStudentGrowthPulse();

  const realClassrooms = registry.sanctuaries.data ?? [];
  const realAssignments = questsPulse.quests.data ?? [];

  const classrooms =
    realClassrooms.length > 0
      ? realClassrooms
      : isDemoExperience
        ? getDemoClassrooms()
        : [];

  const assignments =
    realAssignments.length > 0
      ? realAssignments
      : isDemoExperience
        ? (MOCK_ASSIGNMENTS as any)
        : [];

  const pendingAssignments = assignments.filter(
    (assignment: { submitted?: boolean }) => !assignment.submitted,
  ).length;

  const stats = useMemo(
    () =>
      isDemoExperience &&
      (!registry.stats.data ||
        (registry.stats.data.active_sanctuaries === 0 && registry.stats.data.growth_points === 0))
        ? {
            enrolledClasses: classrooms.length,
            pendingAssignments,
            growthPoints:
              growthPulse.points > 0 ? growthPulse.points : MOCK_STUDENT_STATS.growth_points,
          }
        : {
            enrolledClasses: classrooms.length,
            pendingAssignments,
            growthPoints: growthPulse.points,
          },
    [
      classrooms.length,
      growthPulse.points,
      isDemoExperience,
      pendingAssignments,
      registry.stats.data,
    ],
  );

  return {
    assignments,
    classrooms,
    isDemoExperience,
    hasDataError: Boolean(
      registry.stats.error ||
        registry.sanctuaries.error ||
        questsPulse.quests.error ||
        growthPulse.error,
    ),
    isLoading:
      !isDemoExperience &&
      (registry.isLoading || questsPulse.quests.isLoading || growthPulse.isLoading),
    stats,
  };
}
