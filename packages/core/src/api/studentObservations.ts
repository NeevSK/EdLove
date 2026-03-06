/**
 * Student Observations API
 * 
 * CRUD for qualitative teacher observations about students.
 */

import { supabase } from '../lib/supabase';
import { APIError } from './types';

export interface StudentObservation {
    id: string;
    classroom_id: string;
    classroom_student_id: string;
    student_id?: string;
    author_id: string;
    content: string;
    observation_type: 'positive' | 'growth' | 'neutral' | 'concern';
    visibility: 'private' | 'student_visible' | 'handover_visible';
    is_finalized: boolean;
    honesty_declaration_accepted: boolean;
    created_at: string;
    updated_at: string;
    author?: {
        full_name: string;
    };
}

export const studentObservationsAPI = {
    /**
     * Get all observations for a specific enrollment
     */
    async getForEnrollment(classroomStudentId: string): Promise<StudentObservation[]> {
        const { data, error } = await supabase
            .from('student_observations')
            .select(`
                *,
                author:users!author_id (
                    full_name
                )
            `)
            .eq('classroom_student_id', classroomStudentId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch student observations', error.code, error);
        }

        return data || [];
    },

    /**
     * Get all observations for a classroom
     */
    async getForClassroom(classroomId: string): Promise<StudentObservation[]> {
        const { data, error } = await supabase
            .from('student_observations')
            .select(`
                *,
                author:users!author_id (
                    full_name
                )
            `)
            .eq('classroom_id', classroomId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch classroom observations', error.code, error);
        }

        return data || [];
    },

    /**
     * Get all observations for a global student profile
     */
    async getForStudent(studentId: string): Promise<StudentObservation[]> {
        const { data, error } = await supabase
            .from('student_observations')
            .select(`
                *,
                author:users!author_id (
                    full_name
                ),
                classroom:classrooms(name)
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch global student observations', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new observation
     */
    async create(observation: Omit<StudentObservation, 'id' | 'created_at' | 'updated_at' | 'author_id'>): Promise<StudentObservation> {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new APIError('Authentication required');

        const { data, error } = await supabase
            .from('student_observations')
            .insert([
                {
                    ...observation,
                    author_id: user.data.user.id
                }
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create observation', error.code, error);
        }

        return data;
    },

    /**
     * Finalize an observation and accept the honesty declaration
     */
    async finalize(id: string, acceptDeclaration: boolean): Promise<StudentObservation> {
        if (!acceptDeclaration) throw new APIError('Honesty declaration must be accepted to finalize');

        const { data, error } = await supabase
            .from('student_observations')
            .update({
                is_finalized: true,
                honesty_declaration_accepted: true
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to finalize observation', error.code, error);
        }

        return data;
    },

    /**
     * Delete an observation
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('student_observations')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete observation', error.code, error);
        }
    }
};
