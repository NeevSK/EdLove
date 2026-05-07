import { educationalServices } from './runtimes/educational.runtime';
import type { LessonMaterial } from '../types';
import { educationalContract } from './educational.contract';

/**
 * API methods for managing academic materials (PDFs, Links, Notes)
 * Following Protocol-Oriented Authority.
 */
export const lessonMaterialsAPI = {
  /**
   * Get all materials for a classroom
   * @authority read Material
   */
  async getAll(classroomId: string): Promise<LessonMaterial[]> {
    return educationalServices.lessonMaterials.getAll(classroomId) as Promise<LessonMaterial[]>;
  },

  /**
   * Get materials for a specific lesson
   * @authority read Material
   */
  async getByLesson(lessonId: string): Promise<LessonMaterial[]> {
    return educationalServices.lessonMaterials.getByLesson(lessonId) as Promise<LessonMaterial[]>;
  },

  /**
   * Create new material
   * @authority create Material
   */
  async create(
    material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<LessonMaterial> {
    return educationalServices.lessonMaterials.create(material as any) as Promise<LessonMaterial>;
  },

  /**
   * Update material
   * @authority update Material
   */
  async update(id: string, updates: Partial<LessonMaterial>): Promise<LessonMaterial> {
    return educationalServices.lessonMaterials.update(
      id,
      updates as any,
    ) as Promise<LessonMaterial>;
  },

  /**
   * Delete material
   * @authority delete Material
   */
  async delete(id: string): Promise<void> {
    return educationalServices.lessonMaterials.delete(id);
  },
};

// Satisfy linter for POA metadata linking
void educationalContract;
