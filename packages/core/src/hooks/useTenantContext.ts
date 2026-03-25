import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { getTenantKind } from '../lib/capabilities';
import type { TenantContext } from '../types';

export function useTenantContext(): TenantContext {
  const { context } = usePermissions();
  const { schoolId, user } = context;
  const hasSchoolContext = !!schoolId;

  return useMemo(
    () => ({
      schoolId,
      tenantKind: getTenantKind({
        schoolId,
        tenantKind: (user as any)?.tenant_kind ?? null,
      }),
      academicCycleId: (user as any)?.academic_cycle_id ?? null,
      sectionId: (user as any)?.section_id ?? null,
      gradeId: (user as any)?.grade_id ?? null,
      classroomId: (user as any)?.classroom_id ?? null,
      campusId: (user as any)?.campus_id ?? null,
      hasSchoolContext,
      isDemoTenant: schoolId === 'mock-school',
    }),
    [hasSchoolContext, schoolId, user],
  );
}
