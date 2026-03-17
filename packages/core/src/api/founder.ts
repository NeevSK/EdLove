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
    },

    /**
     * Get all users across the entire ecosystem (Founder/Admin only)
     */
    async listAllUsers(): Promise<any[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*, schools(name)')
            .order('created_at', { ascending: false });

        if (error) throw new APIError('Failed to list all users', error.code, error);
        return data || [];
    },

    /**
     * Update school metadata globally
     */
    async updateSchoolMetadata(schoolId: string, metadata: any): Promise<School> {
        const { data, error } = await supabase
            .from('schools')
            .update({ metadata })
            .eq('id', schoolId)
            .select()
            .single();

        if (error) throw new APIError('Failed to update school metadata', error.code, error);
        return data;
    },

    /**
     * Get Ecosystem Pulse — aggregate "weather" across all institutions.
     * High-level resonance for Founders.
     */
    async getEcosystemPulse(): Promise<any> {
        const { data: schools, error: schoolError } = await supabase
            .from('schools')
            .select('id, name');

        if (schoolError) throw new APIError('Failed to fetch schools for pulse', schoolError.code, schoolError);

        // In a real implementation, this would be a single optimized RPC.
        // For now, we aggregate known school pulse logic.
        const pulses = await Promise.all((schools || []).map(async (s) => {
            const { data: stats } = await supabase.rpc('get_school_pulse_weather', { p_school_id: s.id });
            return {
                school_id: s.id,
                school_name: s.name,
                weather: stats?.weather || 'steady',
                health: stats?.health_index || 0
            };
        }));

        const radiantCount = pulses.filter(p => p.weather === 'radiant').length;
        const total = pulses.length;
        
        let ecosystemWeather: 'radiant' | 'lush' | 'steady' | 'resting' | 'quiet' = 'steady';
        if (radiantCount / total > 0.6) ecosystemWeather = 'radiant';
        else if (radiantCount / total > 0.3) ecosystemWeather = 'lush';
        
        return {
            weather: ecosystemWeather,
            pulses,
            computed_at: new Date().toISOString()
        };
    },

    /**
     * Get Sentinel Governance — non-repudiable audit logs for critical actions.
     */
    async getSentinelGovernance(): Promise<any[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        // If table doesn't exist yet, return empty for now (Strategic Placeholder)
        if (error && error.code === 'PGRST116') return [];
        if (error) throw new APIError('Failed to fetch sentinel logs', error.code, error);
        
        return data || [];
    }
};
