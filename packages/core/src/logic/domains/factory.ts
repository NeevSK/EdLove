// Repositories
import { createSupabaseAttendanceProjectionRepository } from '@repo/core/adapters/supabase/attendanceProjectionRepository';
import { createSupabaseEducationalRepository } from '@repo/core/adapters/supabase/educational';
import { createSupabaseClassroomNotesRepository } from '@repo/core/adapters/supabase/educational/classroomNotesRepository';
import { createSupabaseFounderRepository } from '@repo/core/adapters/supabase/founderRepository';
import { createSupabaseGradingProjectionRepository } from '@repo/core/adapters/supabase/gradingProjectionRepository';
import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { createSupabasePrincipalWorkspaceRepository } from '@repo/core/adapters/supabase/principalWorkspaceRepository';
import { createSupabaseTeacherInsightsRepository } from '@repo/core/adapters/supabase/teacherInsightsRepository';
import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
// Services
import { createAttendanceProjectionServices } from '@repo/core/logic/domains/attendanceProjection/services';
import { createClassroomNotesServices } from '@repo/core/logic/domains/classroomNotes/services';
// Ports
import type { EducationalSideEffects } from '@repo/core/logic/domains/educational/ports';
import { createEducationalServices } from '@repo/core/logic/domains/educational/services';
import { createFounderServices } from '@repo/core/logic/domains/founder/services';
import { createGradingProjectionServices } from '@repo/core/logic/domains/gradingProjection/services';
import { createGuardianServices } from '@repo/core/logic/domains/guardian/services';
import { createPrincipalWorkspaceServices } from '@repo/core/logic/domains/principalWorkspace/services';
import { createTeacherInsightsServices } from '@repo/core/logic/domains/teacherInsights/services';
import { createWorkspaceLayoutServices } from '@repo/core/logic/domains/workspaceLayout/services';
// Neutral client contract for table query/mutation builders
export interface IDataQueryClient {
  from: (table: string) => any;
  rpc?: (fn: string, params?: Record<string, any>) => any;
  [key: string]: any;
}

/**
 * The 'Alchemist' Domain Factory.
 * Centralizes service initialization by injecting a database query client or repositories.
 * Supports provider-neutral data access without leaking vendor SDK types into domain logic.
 */
export const createDomainServices = (
  client: IDataQueryClient,
  overrides?: {
    educationalSideEffects?: EducationalSideEffects;
  },
) => {
  // 1. Initialize Repositories (Data Access Layer)
  const queryClient = client as any;
  const repo = {
    attendance: createSupabaseAttendanceProjectionRepository(queryClient),
    classroomNotes: createSupabaseClassroomNotesRepository(queryClient),
    educational: createSupabaseEducationalRepository(queryClient),
    founder: createSupabaseFounderRepository(queryClient),
    grading: createSupabaseGradingProjectionRepository(queryClient),
    guardian: createSupabaseGuardianRepository(queryClient),
    principal: createSupabasePrincipalWorkspaceRepository(queryClient),
    teacherInsights: createSupabaseTeacherInsightsRepository(queryClient),
    workspaceLayout: createSupabaseWorkspaceLayoutRepository(queryClient),
  };

  // 1.1 Side Effects (Defaults or Overrides)
  const educationalSideEffects: EducationalSideEffects = overrides?.educationalSideEffects ?? {
    getCurrentUserId: async () => null,
    emitGrowthSignal: async () => {},
  };

  // 2. Initialize Logic Services (Domain Layer)
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
