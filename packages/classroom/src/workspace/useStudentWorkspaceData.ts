import { useStore } from '@repo/core/logic';

import { useMemo } from 'react';
import {
  useStudentGrowthPulse,
  useStudentQuestsPulse,
  useStudentRegistry,
} from '../hooks/useStudentDashboardHooks';

const DEMO_STATS = {
  enrolledClasses: 3,
  pendingAssignments: 2,
  growthPoints: 340,
};

export function useStudentWorkspaceData(forceDemo?: boolean) {
  const isDemoMode = useStore((state: any) => state.isDemoMode);
  const isDemoExperience = isDemoMode || forceDemo === true;

  const registry = useStudentRegistry();
  const questsPulse = useStudentQuestsPulse();
  const growthPulse = useStudentGrowthPulse();

  const classrooms = registry.sanctuaries.data ?? [];
  const assignments = questsPulse.quests.data ?? [];
  const pendingAssignments = assignments.filter((assignment: any) => !assignment.submitted).length;

  const stats = useMemo(
    () =>
      isDemoExperience
        ? DEMO_STATS
        : {
            enrolledClasses: classrooms.length,
            pendingAssignments,
            growthPoints: growthPulse.points,
          },
    [classrooms.length, growthPulse.points, isDemoExperience, pendingAssignments],
  );

  return {
    assignments,
    classrooms,
    isDemoExperience,
    isLoading:
      !isDemoExperience &&
      (registry.isLoading || questsPulse.quests.isLoading || growthPulse.isLoading),
    stats,
  };
}
