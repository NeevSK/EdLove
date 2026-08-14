/**
 * Student Potential Analysis API
 *
 * Handles multi-perspective analysis for students, focusing on finding potential.
 */

import { APIError } from '@repo/core/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { studentPotentialContract } from '@repo/core/api/studentPotential.contract';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

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
    const response = await (client.api as any).studentPotential.students[':studentId'].classrooms[
      ':classroomId'
    ].$get({ param: { studentId, classroomId } });
    if (!response.ok) throw new APIError('Failed to fetch potential analysis', response.status.toString());
    const data = await response.json();
    if (!data) return null;
    const { audit, visibility, ...analysis } = data;
    return analysis as StudentPotentialAnalysis;
  },

  /**
   * Get all analyses for a student across all classrooms
   */
  async getAllForStudent(studentId: string): Promise<StudentPotentialAnalysis[]> {
    const response = await (client.api as any).studentPotential.students[':studentId'].$get({
      param: { studentId },
    });
    if (!response.ok) {
      throw new APIError('Failed to fetch all potential analyses', response.status.toString());
    }
    return (await response.json()).map((row: any) => {
      const { audit, visibility, ...analysis } = studentPotentialContract.listForStudent.responses[200].schema.element.parse(row);
      return analysis as StudentPotentialAnalysis;
    });
  },

  /**
   * Upsert potential analysis through the Sanctuary boundary.
   */
  async upsert(input: CreatePotentialAnalysisInput): Promise<StudentPotentialAnalysis> {
    const response = await (client.api as any).studentPotential.students[':studentId'].$put({
      param: { studentId: input.student_id },
      json: input,
    });
    if (!response.ok) throw new APIError('Failed to save potential analysis', response.status.toString());
    const data = await response.json();
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
      const response = await (client.api as any).ai['student-potential'].$post({
        json: { studentName, analysis },
      });
      if (!response.ok) throw new Error(`AI gateway returned ${response.status}`);
      const body = await response.json();
      if (body?.reply) return body.reply as string;
      throw new Error('No reply from AI scout');
    } catch (error) {
      console.error('[studentPotentialAPI] AI Insight error:', error);
      return 'Unable to reach the AI Potential Scout right now. Please try again later.';
    }
  },
};
