import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createDomainServices, type DomainServices } from '@repo/core/logic/domains/factory';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { createSupabaseAttendanceProjectionRepository } from './supabase/attendanceProjectionRepository';
import { createSupabaseEducationalRepository } from './supabase/educational';
import { createSupabaseClassroomNotesRepository } from './supabase/educational/classroomNotesRepository';
import { createSupabaseFounderRepository } from './supabase/founderRepository';
import { createSupabaseGradingProjectionRepository } from './supabase/gradingProjectionRepository';
import { createSupabaseGuardianRepository } from './supabase/guardianRepository';
import { createSupabasePrincipalWorkspaceRepository } from './supabase/principalWorkspaceRepository';
import { createSupabaseTeacherInsightsRepository } from './supabase/teacherInsightsRepository';
import { createSupabaseWorkspaceLayoutRepository } from './supabase/workspaceLayoutRepository';

let clientDomainServicesInstance: DomainServices | null = null;

/**
 * Returns the singleton DomainServices initialized with the client-bound Supabase client.
 */
export function getClientDomainServices(): DomainServices {
  if (!clientDomainServicesInstance) {
    clientDomainServicesInstance = createDomainServices(
      {
        attendance: createSupabaseAttendanceProjectionRepository(supabaseClient),
        classroomNotes: createSupabaseClassroomNotesRepository(supabaseClient),
        educational: createSupabaseEducationalRepository(supabaseClient),
        founder: createSupabaseFounderRepository(supabaseClient),
        grading: createSupabaseGradingProjectionRepository(supabaseClient),
        guardian: createSupabaseGuardianRepository(supabaseClient),
        principal: createSupabasePrincipalWorkspaceRepository(supabaseClient),
        teacherInsights: createSupabaseTeacherInsightsRepository(supabaseClient),
        workspaceLayout: createSupabaseWorkspaceLayoutRepository(supabaseClient),
      },
      {
        educationalSideEffects: {
          getCurrentUserId: async () => useAuthStore.getState().user?.id || null,
          emitGrowthSignal: async (userId, signal, payload) => {
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
            }
          },
        },
      },
    );
  }
  return clientDomainServicesInstance;
}
