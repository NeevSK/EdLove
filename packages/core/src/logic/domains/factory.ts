import type { SupabaseClient } from '@supabase/supabase-js';

// Repositories
import { createSupabaseAttendanceProjectionRepository } from '@/adapters/supabase/attendanceProjectionRepository';
import { createSupabaseEducationalRepository } from '@/adapters/supabase/educational';
import { createSupabaseClassroomNotesRepository } from '@/adapters/supabase/educational/classroomNotesRepository';
import { createSupabaseFounderRepository } from '@/adapters/supabase/founderRepository';
import { createSupabaseGradingProjectionRepository } from '@/adapters/supabase/gradingProjectionRepository';
import { createSupabaseGuardianRepository } from '@/adapters/supabase/guardianRepository';
import { createSupabasePrincipalWorkspaceRepository } from '@/adapters/supabase/principalWorkspaceRepository';
import { createSupabaseTeacherInsightsRepository } from '@/adapters/supabase/teacherInsightsRepository';
import { createSupabaseWorkspaceLayoutRepository } from '@/adapters/supabase/workspaceLayoutRepository';
// Services
import { createAttendanceProjectionServices } from '@/logic/domains/attendanceProjection/services';
import { createClassroomNotesServices } from '@/logic/domains/classroomNotes/services';
// Ports
import type { EducationalSideEffects } from '@/logic/domains/educational/ports';
import { createEducationalServices } from '@/logic/domains/educational/services';
import { createFounderServices } from '@/logic/domains/founder/services';
import { createGradingProjectionServices } from '@/logic/domains/gradingProjection/services';
import { createGuardianServices } from '@/logic/domains/guardian/services';
import { createPrincipalWorkspaceServices } from '@/logic/domains/principalWorkspace/services';
import { createTeacherInsightsServices } from '@/logic/domains/teacherInsights/services';
import { createWorkspaceLayoutServices } from '@/logic/domains/workspaceLayout/services';

/**
 * The 'Alchemist' Domain Factory.
 * Centralizes service initialization by injecting the appropriate Supabase client.
 * Supports both RLS-bound Mobile and 'God Mode' Service Role clients.
 */
export const createDomainServices = (
  supabase: SupabaseClient,
  overrides?: {
    educationalSideEffects?: EducationalSideEffects;
  },
) => {
  // 1. Initialize Repositories (Data Access Layer)
  const repo = {
    attendance: createSupabaseAttendanceProjectionRepository(supabase),
    classroomNotes: createSupabaseClassroomNotesRepository(supabase),
    educational: createSupabaseEducationalRepository(supabase),
    founder: createSupabaseFounderRepository(supabase),
    grading: createSupabaseGradingProjectionRepository(supabase),
    guardian: createSupabaseGuardianRepository(supabase),
    principal: createSupabasePrincipalWorkspaceRepository(supabase),
    teacherInsights: createSupabaseTeacherInsightsRepository(supabase),
    workspaceLayout: createSupabaseWorkspaceLayoutRepository(supabase),
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
