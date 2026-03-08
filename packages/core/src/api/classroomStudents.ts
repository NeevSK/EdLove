/**
 * Classroom Students API
 * 
 * API methods for managing students in classrooms
 */

import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError } from './types';
import type { ClassroomStudent } from './types';

export const classroomStudentsAPI = {
    /**
     * Get all students in a classroom
     */
    async getAll(classroomId: string): Promise<ClassroomStudent[]> {
        const { data, error } = await supabase
            .from('classroom_students')
            .select(`
                *,
                student:users!student_id (
                    full_name
                )
            `)
            .eq('classroom_id', classroomId)
            .order('roll_number', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch classroom students', error.code, error);
        }

        return (data || []).map(item => ({
            ...item,
            full_name: (item.student as any)?.full_name || item.full_name || 'Unregistered Student'
        }));
    },

    /**
     * Add a shadow student (manual entry)
     */
    async addShadowStudent(
        classroomId: string,
        fullName: string,
        rollNumber?: number,
        notes?: string
    ): Promise<ClassroomStudent> {
        const { data, error } = await supabase
            .from('classroom_students')
            .insert([
                {
                    classroom_id: classroomId,
                    full_name: fullName,
                    roll_number: rollNumber,
                    notes: notes,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to add shadow student', error.code, error);
        }

        return data;
    },

    /**
     * Claim a shadow student record using an invite code
     */
    async claimStudent(inviteCode: string): Promise<ClassroomStudent> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Authentication required to claim record');

        const { data, error } = await supabase
            .from('classroom_students')
            .update({
                student_id: myId,
                claimed_at: new Date().toISOString()
            })
            .eq('invite_code', inviteCode)
            .is('student_id', null)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to claim student record', error.code, error);
        }

        return data;
    },

    /**
     * Add a student to a classroom
     */
    async add(
        classroomId: string,
        studentId: string,
        rollNumber?: number,
        notes?: string
    ): Promise<ClassroomStudent> {
        const { data, error } = await supabase
            .from('classroom_students')
            .insert([
                {
                    classroom_id: classroomId,
                    student_id: studentId,
                    roll_number: rollNumber,
                    notes: notes,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to add student to classroom', error.code, error);
        }

        return data;
    },

    /**
     * Update an enrollment record by its ID
     */
    async updateById(
        id: string,
        updates: { roll_number?: number; notes?: string }
    ): Promise<ClassroomStudent> {
        const { data, error } = await supabase
            .from('classroom_students')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update classroom student', error.code, error);
        }

        return data;
    },

    /**
     * Update a student's enrollment details (by student ID and classroom ID)
     * Legacy method - prefer updateById if record ID is available
     */
    async update(
        classroomId: string,
        studentId: string,
        updates: { roll_number?: number; notes?: string }
    ): Promise<ClassroomStudent> {
        const { data, error } = await supabase
            .from('classroom_students')
            .update(updates)
            .eq('classroom_id', classroomId)
            .eq('student_id', studentId)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update classroom student', error.code, error);
        }

        return data;
    },

    /**
     * Remove an enrollment record by its ID
     */
    async remove(id: string): Promise<void> {
        const { error } = await supabase
            .from('classroom_students')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to remove student from classroom', error.code, error);
        }
    },
};
