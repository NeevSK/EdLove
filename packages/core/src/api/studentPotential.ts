/**
 * Student Potential Analysis API
 * 
 * Handles multi-perspective analysis for students, focusing on finding potential.
 */

import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError } from './types';

export interface StudentPotentialAnalysis {
    id: string;
    student_id: string;
    teacher_id: string;
    classroom_id: string;
    
    // Dimensions
    cognitive_flow: number;
    emotional_resonance: number;
    social_weaving: number;
    creative_spark: number;
    practical_mastery: number;
    
    silver_lining: string | null;
    potential_notes: any[];
    
    created_at: string;
    updated_at: string;
}

export type CreatePotentialAnalysisInput = Omit<StudentPotentialAnalysis, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>;

export const studentPotentialAPI = {
    /**
     * Get analysis for a specific student in a classroom (by current teacher)
     */
    async getForStudent(studentId: string, classroomId: string): Promise<StudentPotentialAnalysis | null> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) return null;

        const { data, error } = await supabase
            .from('student_potential_analysis')
            .select('*')
            .eq('student_id', studentId)
            .eq('classroom_id', classroomId)
            .eq('teacher_id', myId)
            .maybeSingle();

        if (error) {
            throw new APIError('Failed to fetch student potential analysis', error.code, error);
        }

        return data as StudentPotentialAnalysis | null;
    },

    /**
     * Get all analyses for a student across all classrooms
     */
    async getAllForStudent(studentId: string): Promise<StudentPotentialAnalysis[]> {
        const { data, error } = await supabase
            .from('student_potential_analysis')
            .select(`
                *,
                teacher:users!teacher_id (full_name),
                classroom:classrooms(name)
            `)
            .eq('student_id', studentId)
            .order('updated_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch all potential analyses', error.code, error);
        }

        return (data || []) as StudentPotentialAnalysis[];
    },

    /**
     * Upsert potential analysis using the RPC for atomic operations
     */
    async upsert(input: CreatePotentialAnalysisInput): Promise<StudentPotentialAnalysis> {
        const { data, error } = await supabase.rpc('upsert_student_potential_analysis', {
            p_student_id: input.student_id,
            p_classroom_id: input.classroom_id,
            p_cognitive_flow: input.cognitive_flow,
            p_emotional_resonance: input.emotional_resonance,
            p_social_weaving: input.social_weaving,
            p_creative_spark: input.creative_spark,
            p_practical_mastery: input.practical_mastery,
            p_silver_lining: input.silver_lining
        });

        if (error) {
            throw new APIError('Failed to save student potential analysis', error.code, error);
        }

        return data as StudentPotentialAnalysis;
    }
};
