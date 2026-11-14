import { educational } from '@repo/core/logic/managers/factory';
import type { Student as EnrollmentRecord } from '@repo/core/logic/schemas/student.schema';

export const classroomStudentsAPI = {
  /**
   * Get all students in a classroom
   */
  async getAll(classroomId: string): Promise<EnrollmentRecord[]> {
    return educational.classroomStudents.getAll(classroomId);
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
    return educational.classroomStudents.addShadowStudent(classroomId, fullName, rollNumber, notes);
  },

  /**
   * Claim a shadow student record using an invite code
   */
  async claimStudent(inviteCode: string): Promise<EnrollmentRecord> {
    return educational.classroomStudents.claimStudent(inviteCode);
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
    return educational.classroomStudents.add(classroomId, studentId, rollNumber, notes);
  },

  /**
   * Update an enrollment record by its ID
   */
  async updateById(
    id: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord> {
    return educational.classroomStudents.updateById(id, updates);
  },

  /**
   * Update a student's enrollment details (by student ID and classroom ID)
   */
  async update(
    classroomId: string,
    studentId: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord> {
    return educational.classroomStudents.update(classroomId, studentId, updates);
  },

  /**
   * Remove an enrollment record by its ID
   */
  async remove(id: string): Promise<void> {
    return educational.classroomStudents.remove(id);
  },
};

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_STUDENTS } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'classroomStudents',
  ghostMethods: ['getAll'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: (_method, args) => {
    const classroomId = args?.[0] as string | undefined;
    if (!classroomId) return MOCK_STUDENTS;
    const filtered = MOCK_STUDENTS.filter((s: any) => s.classroom_id === classroomId);
    return filtered.length > 0 ? filtered : MOCK_STUDENTS;
  },
});
