import { supabase } from '../lib/supabase';
import { APIError } from './types';
import { School } from '../types';

/**
 * Founder API
 * Ecosystem-wide management for Founders and Admins.
 */
export const founderAPI = {
    /**
     * Get aggregate ecosystem statistics
     */
    async getEcosystemStats(): Promise<any> {
        try {
            const { data, error } = await supabase.rpc('get_ecosystem_stats');

            if (error) {
                throw new APIError('Failed to fetch ecosystem stats', error.code, error);
            }

            return data;
        } catch (error: any) {
            throw new APIError('Failed to fetch ecosystem stats', 'FETCH_FAILED', error);
        }
    },

    /**
     * Get all schools in the ecosystem
     */
    async getAllSchools(): Promise<School[]> {
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                throw new APIError('Failed to fetch all schools', error.code, error);
            }

            return data || [];
        } catch (error: any) {
            throw new APIError('Failed to fetch all schools', 'FETCH_FAILED', error);
        }
    },

    /**
     * Create a school globally (Founder bypass)
     */
    async createSchool(data: { name: string; type: string; created_by: string }): Promise<School> {
        const { data: newSchool, error } = await supabase
            .from('schools')
            .insert([{ ...data, is_sample: false }])
            .select()
            .single();

        if (error) throw new APIError('Founder failed to create school', error.code, error);
        return newSchool;
    },

    /**
     * Create a classroom globally (Tracks creator as Owner)
     */
    async createClassroom(data: { school_id: string; name: string; grade_number: number; created_by: string }): Promise<any> {
        const { data: newClass, error } = await supabase
            .from('classrooms')
            .insert([data])
            .select()
            .single();

        if (error) throw new APIError('Founder failed to create classroom', error.code, error);
        return newClass;
    },

    /**
     * Create a community group globally
     */
    async createGroup(data: { name: string; description: string; school_id: string }): Promise<any> {
        const { data: newGroup, error } = await supabase
            .from('communities')
            .insert([data])
            .select()
            .single();

        if (error) throw new APIError('Founder failed to create group', error.code, error);
        return newGroup;
    }
};
