import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { useStore } from '@repo/core/store/useStore';
import type { TenantContext } from '@repo/core/types';

export function useTenantContext(): TenantContext {
  const { context } = usePermissions();
  const academicCycleId = useStore((state) => state.academicCycleId);
  const { schoolId, sectionId, gradeId, classroomId, tenantKind } = context;
  const resolvedSchoolId = schoolId || null;
  const hasSchoolContext = !!resolvedSchoolId;

  return {
    schoolId: resolvedSchoolId,
    tenantKind: (tenantKind || 'customer') as TenantContext['tenantKind'],
    academicCycleId,
    sectionId: sectionId || null,
    gradeId: gradeId || null,
    classroomId: classroomId || null,
    campusId: null,
    hasSchoolContext,
    isDemoTenant: resolvedSchoolId === 'mock-school',
  };
}
