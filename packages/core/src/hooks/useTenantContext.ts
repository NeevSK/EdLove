import { useMemo } from 'react';
import { usePermissions } from '../permissions/hooks/usePermissions';
import type { TenantContext } from '../types';

export function useTenantContext(): TenantContext {
  const { context } = usePermissions();
  const { schoolId, sectionId, gradeId, classroomId, tenantKind } = context;
  const hasSchoolContext = !!schoolId;

  return useMemo(
    () => ({
      schoolId,
      tenantKind,
      academicCycleId: null, // This was being accessed as (user as any)?.academic_cycle_id
      sectionId,
      gradeId,
      classroomId,
      campusId: null, // This was being accessed as (user as any)?.campus_id
      hasSchoolContext,
      isDemoTenant: schoolId === 'mock-school',
    }),
    [hasSchoolContext, schoolId, sectionId, gradeId, classroomId, tenantKind],
  );
}
