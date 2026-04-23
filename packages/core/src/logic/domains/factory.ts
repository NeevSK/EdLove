import type { SupabaseClient } from '@supabase/supabase-js';

// Repositories
import { createSupabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { createSupabaseFounderRepository } from '../../adapters/supabase/founderRepository';
import { createSupabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { createSupabasePrincipalWorkspaceRepository } from '../../adapters/supabase/principalWorkspaceRepository';
import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { createSupabaseWorkspaceLayoutRepository } from '../../adapters/supabase/workspaceLayoutRepository';

// Ports
import type { EducationalSideEffects } from './educational/ports';

// Services
import { createAttendanceProjectionServices } from './attendanceProjection/services';
import { createClassroomNotesServices } from './classroomNotes/services';
import { createEducationalServices } from './educational/services';
import { createFounderServices } from './founder/services';
import { createGradingProjectionServices } from './gradingProjection/services';
import { createGuardianServices } from './guardian/services';
import { createPrincipalWorkspaceServices } from './principalWorkspace/services';
import { createTeacherInsightsServices } from './teacherInsights/services';
import { createWorkspaceLayoutServices } from './workspaceLayout/services';

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
