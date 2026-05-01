import { getSchoolRoleForUser, getWorkRolesForUser } from "@repo/core/lib";
import { SchoolRole, User, WorkRole } from '@repo/core/types';
import { supabase } from '@repo/core/api';
;
export interface PeopleDirectoryEntry extends User {
    schoolRole: SchoolRole | null;
    workRoles: WorkRole[];
    personKind: 'staff' | 'student';
}
function mapDirectoryEntry(user: User): PeopleDirectoryEntry {
    const userWithRoles = {
        ...user,
        roles: user.roles || [],
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
    };
    const schoolRole = getSchoolRoleForUser(userWithRoles as any);
    return {
        ...userWithRoles,
        schoolRole,
        workRoles: getWorkRolesForUser(userWithRoles as any),
        personKind: schoolRole === 'student' ? 'student' : 'staff',
    } as PeopleDirectoryEntry;
}
export const peopleDirectoryAPI = {
    async listBySchool(schoolId: string, options?: {
        personKind?: 'all' | 'staff' | 'student';
    }): Promise<PeopleDirectoryEntry[]> {
        let query = supabase
            .from('users')
            .select('*')
            .eq('school_id', schoolId)
            .order('full_name', { ascending: true });
        if (options?.personKind === 'student') {
            query = query.eq('role', 'student');
        }
        else if (options?.personKind === 'staff') {
            query = query.in('role', [
                'principal',
                'section_head',
                'grade_head',
                'teacher',
                'founder',
                'admin',
                'developer',
            ]);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return (data ?? []).map((row) => mapDirectoryEntry(row as User));
    },
    async getPerson(userId: string): Promise<PeopleDirectoryEntry | null> {
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        if (error)
            throw error;
        return data ? mapDirectoryEntry(data as User) : null;
    },
    async listStaff(schoolId: string): Promise<PeopleDirectoryEntry[]> {
        return this.listBySchool(schoolId, { personKind: 'staff' });
    },
    async listStudents(schoolId: string): Promise<PeopleDirectoryEntry[]> {
        return this.listBySchool(schoolId, { personKind: 'student' });
    },
};
