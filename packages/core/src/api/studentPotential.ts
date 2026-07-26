/**
 * Student Potential Analysis API
 *
 * Handles multi-perspective analysis for students, focusing on finding potential.
 */

import { APIError } from '@/types/API';
import { identityAPI } from '@/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { teacherInsightsAPI } from '@/api/teacherInsights';

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

export type CreatePotentialAnalysisInput = Omit<
  StudentPotentialAnalysis,
  'id' | 'teacher_id' | 'created_at' | 'updated_at'
>;

export const studentPotentialAPI = {
  /**
   * Get analysis for a specific student in a classroom (by current teacher).
   * Routed through the teacherInsights seam.
   */
  async getForStudent(
    studentId: string,
    classroomId: string,
  ): Promise<StudentPotentialAnalysis | null> {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) return null;
    const data = await teacherInsightsAPI.getStudentPotential(studentId, classroomId);
    if (!data) return null;
    const { audit, visibility, ...analysis } = data;
    return analysis as StudentPotentialAnalysis;
  },

  /**
   * Get all analyses for a student across all classrooms
   */
  async getAllForStudent(studentId: string): Promise<StudentPotentialAnalysis[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
   * Upsert potential analysis through the teacherInsights seam.
   */
  async upsert(input: CreatePotentialAnalysisInput): Promise<StudentPotentialAnalysis> {
    const data = await teacherInsightsAPI.upsertStudentPotential(input);
    const { audit, visibility, ...analysis } = data;
    return analysis as StudentPotentialAnalysis;
  },

  /**
   * Get AI-driven insights and intervention suggestions based on current analysis
   */
  async getAIInsights(
    studentName: string,
    analysis: Partial<StudentPotentialAnalysis>,
  ): Promise<string> {
    try {
      const response = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.functions.invoke(
        'ai-assistant',
        {
          body: {
            message: `Analyze potential for student "${studentName}" based on these dimensions: Cognitive: ${analysis.cognitive_flow}%, Emotional: ${analysis.emotional_resonance}%, Social: ${analysis.social_weaving}%, Creative: ${analysis.creative_spark}%, Practical: ${analysis.practical_mastery}%. Current Silver Lining: "${analysis.silver_lining || 'None recorded'}". Provide 3 nurturing intervention suggestions.`,
            context: {
              type: 'student_potential_insight',
              studentName,
              analysis,
            },
          },
        },
      );

      if (response.data?.reply) return response.data.reply;
      throw new Error('No reply from AI scout');
    } catch (error) {
      console.error('[studentPotentialAPI] AI Insight error:', error);
      return 'Unable to reach the AI Potential Scout right now. Please try again later.';
    }
  },
};
