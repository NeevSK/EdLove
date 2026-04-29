import { useMemo } from 'react';
import { createDomainServices } from '../logic/domains/factory';
import { supabase } from '../api/supabase';
import { useStore } from '../store/useStore';

/**
 * useDomainServices Hook
 *
 * Provides initialized domain services using the standard Supabase client.
 * This ensures that all mobile-side operations respect Row Level Security (RLS).
 */
export function useDomainServices() {
  return useMemo(
    () =>
      createDomainServices(supabase, {
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
