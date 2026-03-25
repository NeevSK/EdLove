import type { Role } from '../permissions/schemas/role.schema';

export type TenantKind = 'internal' | 'customer' | 'demo' | 'sandbox';

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
  roles: Role[];
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
  roles: Role[];
  hasGlobalAccess: boolean;
  isPersonal: boolean;
}

