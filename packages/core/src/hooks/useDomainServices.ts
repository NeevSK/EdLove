import { useMemo } from 'react';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createDomainServices } from '@repo/core/logic/domains/factory';
import { useStore } from '@repo/core/store/useStore';

/**
 * useDomainServices Hook
 *
 * Provides initialized domain services using the standard Supabase client.
 * This ensures that all mobile-side operations respect Row Level Security (RLS).
 */
export function useDomainServices() {
  return useMemo(
    () =>
      createDomainServices(supabaseClient, {
        educationalSideEffects: {
          getCurrentUserId: async () => useStore.getState().user?.id || null,
          emitGrowthSignal: async (userId, signal, payload) => {
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              console.log(`[GrowthSignal] ${signal} for ${userId}`, payload);
            }
          },
        },
      }),
    [],
  );
}

/**
 * Convenience hooks for specific domains
 */
export function useTeacherInsights() {
  const services = useDomainServices();
  return services.teacherInsights;
}

export function useEducational() {
  const services = useDomainServices();
  return services.educational;
}

export function useClassroomNotes() {
  const services = useDomainServices();
  return services.classroomNotes;
}
