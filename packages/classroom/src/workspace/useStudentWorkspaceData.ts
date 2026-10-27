import {
  useStudentGrowthPulse,
  useStudentQuestsPulse,
  useStudentRegistry,
} from '@repo/classroom/hooks/useStudentDashboardHooks';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { useAuthStore } from '@repo/core/store';
import { useMemo } from 'react';

export function useStudentWorkspaceData(forceDemo?: boolean) {
  const isDemoMode = useExperienceState((state) => state.isDemoMode);
  const isExplorerMode = useExperienceState((state) => state.isExplorerMode);
  const user = useAuthStore((state) => state.user);
  const isGuest = Boolean(user?.is_anonymous);
  const isDemoExperience = isDemoMode || forceDemo === true || isExplorerMode || isGuest;

  const registry = useStudentRegistry();
  const questsPulse = useStudentQuestsPulse();
  const growthPulse = useStudentGrowthPulse();

  const classrooms =
    registry.sanctuaries.data ??
    (isDemoExperience ? getSandboxSamples<any[]>('classrooms', 'getByTeacher', [], []) : []);
  const assignments =
    questsPulse.quests.data ??
    (isDemoExperience ? getSandboxSamples<any[]>('assignments', 'getAll', [], []) : []);

  const pendingAssignments = assignments.filter(
    (assignment: { submitted?: boolean }) => !assignment.submitted,
  ).length;

  const defaultGrowthPoints =
    getSandboxSamples<any>('school', 'getSchoolStats', [], { growth_points: 120 })?.growth_points ??
    120;

  const stats = useMemo(
    () =>
      isDemoExperience &&
      (!registry.stats.data ||
        (registry.stats.data.active_sanctuaries === 0 && registry.stats.data.growth_points === 0))
        ? {
            enrolledClasses: classrooms.length,
            pendingAssignments,
            growthPoints:
              growthPulse.points > 0 ? growthPulse.points : defaultGrowthPoints,
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
