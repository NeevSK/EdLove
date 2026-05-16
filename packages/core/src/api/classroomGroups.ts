import type { ClassroomGroup as ClassroomGroupRecord } from '../logic/schemas/classroom.schema';
import { educational } from '../logic/managers/factory';

export type ClassroomGroup = ClassroomGroupRecord;

export const classroomGroupsAPI = {
  /**
   * @policy read ClassroomGroup
   */
  async getAll(classroomId: string): Promise<ClassroomGroup[]> {
    return educational.classroomGroups.getAll(classroomId);
  },

  /**
   * @policy create ClassroomGroup
   */
  async create(
    classroomId: string,
    input: {
      name: string;
      description?: string | null;
      student_ids?: string[];
      color?: string | null;
    },
  ): Promise<ClassroomGroup> {
    return educational.classroomGroups.create(classroomId, input);
  },

  /**
   * @policy update ClassroomGroup
   */
  async update(
    id: string,
    updates: {
      name?: string;
      description?: string | null;
      student_ids?: string[];
      color?: string | null;
    },
  ): Promise<ClassroomGroup> {
    return educational.classroomGroups.update(id, updates);
  },

  /**
   * @policy delete ClassroomGroup
   */
  async delete(id: string): Promise<void> {
    return educational.classroomGroups.delete(id);
  },
};

