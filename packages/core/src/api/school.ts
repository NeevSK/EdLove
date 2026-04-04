// ============================================================================
// SCHOOL API (Protocol-Oriented Authority)
// ============================================================================

import { operationsContract } from './operations.contract';
import { supabase } from '../lib/supabase';
import { APIError } from './types';
import {
    School,
    Section,
    SchoolGrade as Grade,
    SchoolStats
} from '../types';
import { SchoolSchema, SchoolStatsSchema, SectionSchema, GradeSchema } from './schemas/school.schema';

/**
 * API methods for Managing School Institutions.
 * Following Protocol-Oriented Authority.
 */
export const schoolAPI = {
    /**
     * Create a new school
     * @authority create School
     */
    async create(data: { name: string; handle: string; type: 'primary' | 'secondary' | 'mixed'; created_by: string }): Promise<School> {
        try {
            const { data: newSchool, error } = await supabase
                .from('schools')
                .insert([{
                    name: data.name,
                    handle: data.handle,
                    type: data.type,
                    created_by: data.created_by,
                    is_sample: false
                }])
                .select()
                .single();

            if (error) {
                throw new APIError('Failed to create school', error.code, error);
            }

            // Update user's school_id (Delegated to trigger or handled via POA proxy)
            const { error: updateError } = await supabase
                .from('users')
                .update({ school_id: newSchool.id })
                .eq('id', data.created_by);

            if (updateError) console.warn('Failed to auto-assign principal to school:', updateError);

            return SchoolSchema.parse(newSchool) as unknown as School;
        } catch (error: any) {
            throw new APIError('Failed to create school', 'CREATE_FAILED', error);
        }
    },

    /**
     * Get school details
     * @authority read School
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

        return SchoolSchema.parse(data) as unknown as School;
    },

    /**
     * Update school details
     * @authority update School
     */
    async update(id: string, updates: Partial<School>): Promise<School> {
        const { data, error } = await supabase
            .from('schools')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update school', error.code, error);
        }

        return SchoolSchema.parse(data) as unknown as School;
    },

    /**
     * Search for schools by name
     * @authority read School
     */
    async searchSchools(query: string): Promise<School[]> {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10);

        if (error) throw error;
        return (data || []).map(s => SchoolSchema.parse(s)) as unknown as School[];
    },

    /**
     * Get sections for a school.
     * @authority read School
     */
    async getSections(schoolId: string): Promise<Section[]> {
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('school_id', schoolId)
            .order('name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch school sections', error.code, error);
        }

        return (data || []).map((section) => SectionSchema.parse(section)) as unknown as Section[];
    },

    /**
     * Get grades for a section.
     * @authority read School
     */
    async getGrades(sectionId: string): Promise<Grade[]> {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('section_id', sectionId)
            .order('number', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch section grades', error.code, error);
        }

        return (data || []).map((grade) => GradeSchema.parse(grade)) as unknown as Grade[];
    },

    /**
     * Get school statistics for dashboard
     * @authority read School
     */
    async getSchoolStats(schoolId: string, _viewDate?: string): Promise<SchoolStats> {
        // Simplified for POA: Original logic stays but marked with authority
        const { count: studentCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'student');

        const { count: teacherCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'teacher');

        const stats = {
            total_students: studentCount || 0,
            total_teachers: teacherCount || 0,
            total_classrooms: 0, // Placeholder
            total_sections: 0,   // Placeholder
        };

        return SchoolStatsSchema.parse(stats) as unknown as SchoolStats;
    },
    
    /**
     * Get invite codes for a school
     * @authority read School
     */
    async getInviteCodes(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch invite codes', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new section for a school.
     * @authority create School
     */
    async createSection(schoolId: string, name: string): Promise<Section> {
        const { data, error } = await supabase
            .from('sections')
            .insert([{ school_id: schoolId, name }])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create section', error.code, error);
        }

        return SectionSchema.parse(data) as unknown as Section;
    },

    /**
     * Create a new grade for a section.
     * @authority create School
     */
    async createGrade(sectionId: string, number: number): Promise<Grade> {
        const { data, error } = await supabase
            .from('grades')
            .insert([{ section_id: sectionId, number }])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create grade', error.code, error);
        }

        return GradeSchema.parse(data) as unknown as Grade;
    },

    /**
     * Generate a new invite code for a school
     * @authority create School
     */
    async generateInviteCode(schoolId: string, role: string, createdBy: string): Promise<any> {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data, error } = await supabase
            .from('invite_codes')
            .insert([{
                school_id: schoolId,
                role,
                code,
                created_by: createdBy,
                used: false
            }])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to generate invite code', error.code, error);
        }

        return data;
    },
};

// Satisfy linter for POA metadata linking
void operationsContract;

