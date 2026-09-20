import { getClientDomainServices } from '@repo/core/adapters/clientDomainServices';
import { useMemo } from 'react';

/**
 * useDomainServices Hook
 *
 * Provides initialized domain services.
 */
export function useDomainServices() {
  return useMemo(() => getClientDomainServices(), []);
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
