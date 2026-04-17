import { supabase } from '@repo/core';
import { APIError, StaffAttendance, StaffLeave } from '@repo/core';

export const staffAPI = { 
    /**
     * Check-in staff
     */
    async checkIn(userId: string, schoolId: string, notes?: string) {
        const { data, error } = await supabase
            .from('staff_attendance')
            .insert({
                user_id: userId,
                school_id: schoolId,
                notes,
                check_in: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to check in', error.code, error);
        }

        return data as StaffAttendance;
    },

    /**
     * Check-out staff
     */
    async checkOut(userId: string) {
        // Find most recent active check-in
        const { data: latest, error: fetchError } = await supabase
            .from('staff_attendance')
            .select('id')
            .eq('user_id', userId)
            .is('check_out', null)
            .order('check_in', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !latest) {
            throw new APIError('No active check-in found', fetchError?.code);
        }

        const { data, error } = await supabase
            .from('staff_attendance')
            .update({ check_out: new Date().toISOString() })
            .eq('id', latest.id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to check out', error.code, error);
        }

        return data as StaffAttendance;
    },

    /**
     * Get staff attendance history
     */
    async getAttendance(userId: string) {
        const { data, error } = await supabase
            .from('staff_attendance')
            .select('*')
            .eq('user_id', userId)
            .order('check_in', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch attendance', error.code, error);
        }

        return data as StaffAttendance[];
    },

    /**
     * Submit leave request
     */
    async submitLeave(leave: Omit<StaffLeave, 'id' | 'status' | 'created_at'>) {
        const { data, error } = await supabase
            .from('staff_leaves')
            .insert(leave)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to submit leave request', error.code, error);
        }

        return data as StaffLeave;
    },

    /**
     * Get staff leaves
     */
    async getLeaves(userId: string) {
        const { data, error } = await supabase
            .from('staff_leaves')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch leaves', error.code, error);
        }

        return data as StaffLeave[];
    };
