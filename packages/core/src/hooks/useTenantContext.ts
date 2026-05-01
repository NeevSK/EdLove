import { useStore } from '../store/useStore';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import type { TenantContext } from '../types';

export function useTenantContext(): TenantContext {
  const { context } = usePermissions();
  const academicCycleId = useStore((state) => state.academicCycleId);
  const { schoolId, sectionId, gradeId, classroomId, tenantKind } = context;
  const hasSchoolContext = !!schoolId;

  return {
    schoolId,
    tenantKind,
    academicCycleId,
    sectionId,
    gradeId,
    classroomId,
    campusId: null,
    hasSchoolContext,
    isDemoTenant: schoolId === 'mock-school',
  };
}
