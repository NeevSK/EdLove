import { supabase } from '../lib/supabase';
import { APIError } from './types';
import {
    School,
    Section,
    SchoolGrade as Grade,
    Announcement,
    InviteCode,
    SchoolStats,
    UserRole
} from '../types';

// ============================================================================
// SCHOOL API (Principal Functions)
// ============================================================================

export const schoolAPI = {
    /**
     * Create a new school
     * User will be automatically assigned as principal via trigger or separate call
     */
    async create(data: { name: string; type: 'primary' | 'secondary' | 'mixed'; created_by: string }): Promise<School> {
        try {
            const { data: newSchool, error } = await supabase
                .from('schools')
                .insert([{
                    name: data.name,
                    type: data.type,
                    created_by: data.created_by,
                    is_sample: false
                }])
                .select()
                .single();

            if (error) {
                throw new APIError('Failed to create school', error.code, error);
            }

            // Update user's school_id
            const { error: updateError } = await supabase
                .from('users')
                .update({ school_id: newSchool.id })
                .eq('id', data.created_by);

            if (updateError) console.warn('Failed to auto-assign principal to school:', updateError);

            return newSchool;
        } catch (error: any) {
            throw new APIError('Failed to create school', 'CREATE_FAILED', error);
        }
    },

    /**
     * Create a new section in the school
     */
    async createSection(schoolId: string, name: string): Promise<Section> {
        const { data, error } = await supabase
            .from('sections')
            .insert([
                {
                    school_id: schoolId,
                    name,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create section', error.code, error);
        }

        return data;
    },

    /**
     * Get all sections for a school
     */
    async getSections(schoolId: string): Promise<Section[]> {
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('school_id', schoolId)
            .order('name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch sections', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new grade in a section
     */
    async createGrade(sectionId: string, number: number): Promise<Grade> {
        if (number < 1 || number > 13) {
            throw new APIError('Grade number must be between 1 and 13', 'INVALID_GRADE');
        }

        const { data, error } = await supabase
            .from('grades')
            .insert([
                {
                    section_id: sectionId,
                    number,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create grade', error.code, error);
        }

        return data;
    },

    /**
     * Get all grades for a section
     */
    async getGrades(sectionId: string): Promise<Grade[]> {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('section_id', sectionId)
            .order('number', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch grades', error.code, error);
        }

        return data || [];
    },

    /**
     * Broadcast a school-wide announcement
     */
    async broadcastAnnouncement(
        schoolId: string,
        authorId: string,
        content: string,
        isPinned: boolean = false
    ): Promise<Announcement> {
        const { data, error } = await supabase
            .from('announcements')
            .insert([
                {
                    school_id: schoolId,
                    author_id: authorId,
                    content,
                    is_pinned: isPinned,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create announcement', error.code, error);
        }

        return data;
    },

    /**
     * Generate an invite code
     */
    async generateInviteCode(
        school_id: string,
        role: UserRole,
        createdBy: string
    ): Promise<InviteCode> {
        // Generate a random 8-character code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();

        const { data, error } = await supabase
            .from('invite_codes')
            .insert([
                {
                    code,
                    school_id,
                    role,
                    created_by: createdBy,
                    used: false,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to generate invite code', error.code, error);
        }

        return data;
    },

    /**
     * Get all active invite codes for a school
     */
    async getInviteCodes(schoolId: string): Promise<InviteCode[]> {
        const { data, error } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('school_id', schoolId)
            .eq('used', false)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch invite codes', error.code, error);
        }

        return data || [];
    },

    /**
     * Get school statistics for dashboard
     */
    async getSchoolStats(schoolId: string): Promise<SchoolStats> {
        // Get total students
        const { count: studentCount, error: studentError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'student');

        if (studentError) {
            throw new APIError('Failed to fetch student count', studentError.code, studentError);
        }

        // Get total teachers
        const { count: teacherCount, error: teacherError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'teacher');

        if (teacherError) {
            throw new APIError('Failed to fetch teacher count', teacherError.code, teacherError);
        }

        // Get total classrooms
        const { count: classroomCount, error: classroomError } = await supabase
            .from('classrooms')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId);

        if (classroomError) {
            throw new APIError('Failed to fetch classroom count', classroomError.code, classroomError);
        }

        // Get total sections
        const { count: sectionCount, error: sectionError } = await supabase
            .from('sections')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId);

        if (sectionError) {
            throw new APIError('Failed to fetch section count', sectionError.code, sectionError);
        }

        return {
            total_students: studentCount || 0,
            total_teachers: teacherCount || 0,
            total_classrooms: classroomCount || 0,
            total_sections: sectionCount || 0,
        };
    },

    /**
     * Get all students in a school
     */
    async getStudentsBySchool(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, role')
            .eq('school_id', schoolId)
            .eq('role', 'student')
            .order('full_name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch school students', error.code, error);
        }

        return data || [];
    },

    /**
     * Get school details
     */
    async getSchool(schoolId: string): Promise<School> {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single();

        if (error) {
            throw new APIError('Failed to fetch school', error.code, error);
        }

        return data;
    },

    /**
     * Search for schools by name
     */
    async searchSchools(query: string): Promise<School[]> {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10);

        if (error) throw error;
        return data || [];
    }
};
