import { createAttendanceProjectionServices } from '@repo/core/logic/domains/attendanceProjection/services';
import { createClassroomNotesServices } from '@repo/core/logic/domains/classroomNotes/services';
import type { EducationalSideEffects } from '@repo/core/logic/domains/educational/ports';
import { createEducationalServices } from '@repo/core/logic/domains/educational/services';
import { createFounderServices } from '@repo/core/logic/domains/founder/services';
import { createGradingProjectionServices } from '@repo/core/logic/domains/gradingProjection/services';
import { createGuardianServices } from '@repo/core/logic/domains/guardian/services';
import { createPrincipalWorkspaceServices } from '@repo/core/logic/domains/principalWorkspace/services';
import { createTeacherInsightsServices } from '@repo/core/logic/domains/teacherInsights/services';
import { createWorkspaceLayoutServices } from '@repo/core/logic/domains/workspaceLayout/services';
export interface DomainRepositories {
  attendance: Parameters<typeof createAttendanceProjectionServices>[0];
  classroomNotes: Parameters<typeof createClassroomNotesServices>[0];
  educational: Parameters<typeof createEducationalServices>[0];
  founder: Parameters<typeof createFounderServices>[0];
  grading: Parameters<typeof createGradingProjectionServices>[0];
  guardian: Parameters<typeof createGuardianServices>[0];
  principal: Parameters<typeof createPrincipalWorkspaceServices>[0];
  teacherInsights: Parameters<typeof createTeacherInsightsServices>[0];
  workspaceLayout: Parameters<typeof createWorkspaceLayoutServices>[0];
}

export const createDomainServices = (
  repo: DomainRepositories,
  overrides?: {
    educationalSideEffects?: EducationalSideEffects;
  },
) => {
  const educationalSideEffects: EducationalSideEffects = overrides?.educationalSideEffects ?? {
    getCurrentUserId: async () => null,
    emitGrowthSignal: async () => {},
  };

  return {
    attendance: createAttendanceProjectionServices(repo.attendance),
    classroomNotes: createClassroomNotesServices(repo.classroomNotes),
    educational: createEducationalServices(repo.educational, educationalSideEffects),
    founder: createFounderServices(repo.founder),
    grading: createGradingProjectionServices(repo.grading),
    guardian: createGuardianServices(repo.guardian),
    principal: createPrincipalWorkspaceServices(repo.principal),
    teacherInsights: createTeacherInsightsServices(repo.teacherInsights),
    workspaceLayout: createWorkspaceLayoutServices(repo.workspaceLayout),
  };
};

export type DomainServices = ReturnType<typeof createDomainServices>;
