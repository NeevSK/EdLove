import {
  getSchoolRoleForUser,
  getWorkRolesForUser,
  type Membership,
  type ScopeRef,
} from '@repo/core';
import { supabase } from '@repo/core/native';

interface MembershipSeed {
  id: string;
  school_id: string;
  role?: string | null;
  school_role?: string | null;
  work_roles?: string[] | null;
  tenant_kind?: string | null;
  section_id?: string | null;
  grade_id?: string | null;
  classroom_id?: string | null;
}

function buildScopes(user: MembershipSeed): ScopeRef[] {
  const scopes: ScopeRef[] = [];

  if (user.school_id) {
    scopes.push({ type: 'school', id: user.school_id, schoolId: user.school_id });
  }
  if (user.section_id) {
    scopes.push({ type: 'section', id: user.section_id, schoolId: user.school_id });
  }
  if (user.grade_id) {
    scopes.push({ type: 'grade', id: user.grade_id, schoolId: user.school_id });
  }
  if (user.classroom_id) {
    scopes.push({ type: 'classroom', id: user.classroom_id, schoolId: user.school_id });
  }

  return scopes;
}

function buildMembership(user: MembershipSeed): Membership {
  return {
    userId: user.id,
    schoolId: user.school_id,
    schoolRole: getSchoolRoleForUser(user as any),
    workRoles: getWorkRolesForUser(user as any),
    roles: [], // Initialize with empty roles; to be hydrated from backend if needed
    scopes: buildScopes(user),
    status: 'active',
    tenantKind: (user.tenant_kind as Membership['tenantKind']) ?? undefined,
  };
}

export const peopleMembershipsAPI = {
  async getSchoolMemberships(schoolId: string): Promise<Membership[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, school_id, role, school_role, work_roles, tenant_kind, section_id, grade_id')
      .eq('school_id', schoolId);

    if (error) throw error;
    return (data ?? []).map((row) => buildMembership(row as MembershipSeed));
  },

  async getUserMemberships(userId: string): Promise<Membership[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, school_id, role, school_role, work_roles, tenant_kind, section_id, grade_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? [buildMembership(data as MembershipSeed)] : [];
  },
};
