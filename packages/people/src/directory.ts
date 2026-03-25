import {
  supabase,
  getSchoolRoleForUser,
  getWorkRolesForUser,
  type SchoolRole,
  type User,
  type WorkRole,
} from '@repo/core';

export interface PeopleDirectoryEntry extends User {
  schoolRole: SchoolRole | null;
  workRoles: WorkRole[];
  personKind: 'staff' | 'student';
}

function mapDirectoryEntry(user: User): PeopleDirectoryEntry {
  const schoolRole = getSchoolRoleForUser(user);
  return {
    ...user,
    schoolRole,
    workRoles: getWorkRolesForUser(user),
    personKind: schoolRole === 'student' ? 'student' : 'staff',
  };
}

export const peopleDirectoryAPI = {
  async listBySchool(
    schoolId: string,
    options?: { personKind?: 'all' | 'staff' | 'student' },
  ): Promise<PeopleDirectoryEntry[]> {
    let query = supabase
      .from('users')
      .select('*')
      .eq('school_id', schoolId)
      .order('full_name', { ascending: true });

    if (options?.personKind === 'student') {
      query = query.eq('role', 'student');
    } else if (options?.personKind === 'staff') {
      query = query.in('role', ['principal', 'section_head', 'grade_head', 'teacher', 'founder', 'admin', 'developer']);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapDirectoryEntry(row as User));
  },

  async getPerson(userId: string): Promise<PeopleDirectoryEntry | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data ? mapDirectoryEntry(data as User) : null;
  },

  async listStaff(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'staff' });
  },

  async listStudents(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'student' });
  },
};
