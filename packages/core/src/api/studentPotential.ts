/**
 * Student Potential Analysis API
 *
 * Handles multi-perspective analysis for students, focusing on finding potential.
 */

import { SOVEREIGN_API_URL } from '@repo/core/api/base';
import { authenticatedSovereignFetch } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { studentPotentialContract } from '@repo/core/api/studentPotential.contract';


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
    const data = await orpcClient.studentPotential.getForClassroom({
      params: { studentId, classroomId },
    });
    if (!data) return null;
    const { audit, visibility, ...analysis } = data;
    return analysis as StudentPotentialAnalysis;
  },

  /**
   * Get all analyses for a student across all classrooms
   */
  async getAllForStudent(studentId: string): Promise<StudentPotentialAnalysis[]> {
    const response = await orpcClient.studentPotential.listForStudent({
      params: { studentId },
    });
    return response.map((row: any) => {
      const { audit, visibility, ...analysis } =
        studentPotentialContract.listForStudent.responses[200].schema.element.parse(row);
      return analysis as StudentPotentialAnalysis;
    });
  },

  /**
   * Upsert potential analysis through the Sanctuary boundary.
   */
  async upsert(input: CreatePotentialAnalysisInput): Promise<StudentPotentialAnalysis> {
    const response = await orpcClient.studentPotential.upsert({
      params: { studentId: input.student_id },
      body: input,
    });
    const { audit, visibility, ...analysis } = response;
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
      const response = await authenticatedSovereignFetch(`${SOVEREIGN_API_URL}/api/ai/student-potential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, analysis }),
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
