import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import { useStore } from '../store/useStore';
import type { TenantContext } from '../types';

export function useTenantContext(): TenantContext {
  const { context } = usePermissions();
  const academicCycleId = useStore((state) => state.academicCycleId);
  const {
    school_id: schoolId,
    section_id: sectionId,
    grade_id: gradeId,
    classroom_id: classroomId,
    tenant_kind: tenantKind,
  } = context;
  const hasSchoolContext = !!schoolId;

  return {
    schoolId,
    tenantKind: tenantKind || 'customer',
    academicCycleId,
    sectionId,
    gradeId,
    classroomId,
    campusId: null,
    hasSchoolContext,
    isDemoTenant: schoolId === 'mock-school',
  };
}
