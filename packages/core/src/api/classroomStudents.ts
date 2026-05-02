import type { Student as EnrollmentRecord } from '../logic/schemas/student.schema';
import { educationalServices } from './runtimes/educational.runtime';
import { educationalContract } from './educational.contract';

export const classroomStudentsAPI = {
  /**
   * Get all students in a classroom
   */
  async getAll(classroomId: string): Promise<EnrollmentRecord[]> {
    return educationalServices.classroomStudents.getAll(classroomId);
  },

  /**
   * Add a shadow student (manual entry)
   */
  async addShadowStudent(
    classroomId: string,
    fullName: string,
    rollNumber?: string,
    notes?: string,
  ): Promise<EnrollmentRecord> {
    return educationalServices.classroomStudents.addShadowStudent(
      classroomId,
      fullName,
      rollNumber,
      notes,
    );
  },

  /**
   * Claim a shadow student record using an invite code
   */
  async claimStudent(inviteCode: string): Promise<EnrollmentRecord> {
    return educationalServices.classroomStudents.claimStudent(inviteCode);
  },

  /**
   * Add a student to a classroom
   */
  async add(
    classroomId: string,
    studentId: string,
    rollNumber?: string,
    notes?: string,
  ): Promise<EnrollmentRecord> {
    return educationalServices.classroomStudents.add(classroomId, studentId, rollNumber, notes);
  },

  /**
   * Update an enrollment record by its ID
   */
  async updateById(
    id: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord> {
    return educationalServices.classroomStudents.updateById(id, updates);
  },

  /**
   * Update a student's enrollment details (by student ID and classroom ID)
   * Legacy method - prefer updateById if record ID is available
   */
  async update(
    classroomId: string,
    studentId: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord> {
    return educationalServices.classroomStudents.update(classroomId, studentId, updates);
  },

  /**
   * Remove an enrollment record by its ID
   */
  async remove(id: string): Promise<void> {
    return educationalServices.classroomStudents.remove(id);
  },
};

void educationalContract;
