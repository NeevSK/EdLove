import type { ClassroomGroup as ClassroomGroupRecord } from '../logic/schemas/classroom.schema';
import { educationalServices } from '../native/runtimes/educational.runtime';
import { educationalContract } from './educational.contract';

export type ClassroomGroup = ClassroomGroupRecord;

export const classroomGroupsAPI = {
  /**
   * @authority read ClassroomGroup
   */
  async getAll(classroomId: string): Promise<ClassroomGroup[]> {
    return educationalServices.classroomGroups.getAll(classroomId);
  },

  /**
   * @authority create ClassroomGroup
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
    return educationalServices.classroomGroups.create(classroomId, input);
  },

  /**
   * @authority update ClassroomGroup
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
    return educationalServices.classroomGroups.update(id, updates);
  },

  /**
   * @authority delete ClassroomGroup
   */
  async delete(id: string): Promise<void> {
    return educationalServices.classroomGroups.delete(id);
  },
};

void educationalContract;
