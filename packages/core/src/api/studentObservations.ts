/**
 * Student Observations API
 *
 * CRUD for qualitative teacher observations about students.
 */

import { APIError } from '@repo/core/types/API';
import { identityAPI } from '@repo/core/api/identity';
import { teacherInsightsAPI } from '@repo/core/api/teacherInsights';

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
   * Get all observations for a specific enrollment.
   * Routed through the teacherInsights seam to preserve private-by-default handling.
   */
  async getForEnrollment(classroomStudentId: string): Promise<StudentObservation[]> {
    const data = await teacherInsightsAPI.listStudentObservationsForEnrollment(classroomStudentId);
    return data.map(({ audit, ...observation }) => observation as StudentObservation);
  },

  /**
   * Get all observations for a classroom.
   */
  async getForClassroom(classroomId: string): Promise<StudentObservation[]> {
    const data = await teacherInsightsAPI.listStudentObservations(classroomId);
    return data.map(({ audit, ...observation }) => observation as StudentObservation);
  },

  /**
   * Create a new observation
   */
  async create(
    observation: Omit<StudentObservation, 'id' | 'created_at' | 'updated_at' | 'author_id'>,
  ): Promise<StudentObservation> {
    const identity = await identityAPI.identifyActiveCitizen();
    const myId = identity?.id;
    if (!myId) throw new APIError('Authentication required');
    const data = await teacherInsightsAPI.createStudentObservation(observation);
    const { audit, ...result } = data;
    return result as StudentObservation;
  },

  /**
   * Finalize an observation and accept the honesty declaration
   */
  async finalize(id: string, acceptDeclaration: boolean): Promise<StudentObservation> {
    const data = await teacherInsightsAPI.finalizeStudentObservation(id, acceptDeclaration);
    const { audit, ...result } = data;
    return result as StudentObservation;
  },

  /**
   * Delete an observation
   */
  async delete(id: string): Promise<void> {
    await teacherInsightsAPI.deleteStudentObservation(id);
  },
};
