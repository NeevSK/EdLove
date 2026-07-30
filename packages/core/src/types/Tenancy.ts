import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import type { TenantKind } from '@repo/core/logic/schemas/user.schema';

export type { TenantKind };

export type ScopeType =
  | 'platform'
  | 'school'
  | 'section'
  | 'grade'
  | 'classroom'
  | 'student'
  | 'staff'
  | 'asset'
  | 'guardian';

export interface ScopeRef {
  type: ScopeType;
  id: string;
  schoolId?: string | null;
}

export interface Membership {
  id?: string;
  userId: string;
  schoolId: string;
  schoolRole?: string | null;
  workRoles?: string[] | null;
  roles: Capacity[];
  scopes: ScopeRef[];
  status?: 'active' | 'inactive' | 'invited';
  tenantKind?: TenantKind;
}

export interface TenantContext {
  schoolId: string | null;
  tenantKind: TenantKind;
  academicCycleId?: string | null;
  sectionId?: string | null;
  gradeId?: string | null;
  classroomId?: string | null;
  campusId?: string | null;
  hasSchoolContext: boolean;
  isDemoTenant: boolean;
}

export interface PlatformAccessContext {
  userId: string | null;
  schoolId: string | null;
  sectionId?: string | null;
  gradeId?: string | null;
  tenantKind: TenantKind;
  roles: Capacity[];
  hasGlobalAccess: boolean;
  isPersonal: boolean;
}
