import { educational } from '@repo/core/logic/managers/factory';
import type { LessonMaterial } from '@repo/core/types';

/**
 * API methods for managing academic materials (PDFs, Links, Notes)
 * Following Protocol-Oriented Authority.
 */
export const lessonMaterialsAPI = {
  /**
   * Get all materials for a classroom
   * @policy read Material
   */
  async getAll(classroomId: string): Promise<LessonMaterial[]> {
    return educational.lessonMaterials.getAll(classroomId) as unknown as LessonMaterial[];
  },

  /**
   * Get materials for a specific lesson
   * @policy read Material
   */
  async getByLesson(lessonId: string): Promise<LessonMaterial[]> {
    return educational.lessonMaterials.getByLesson(lessonId) as unknown as LessonMaterial[];
  },

  /**
   * Create new material
   * @policy create Material
   */
  async create(
    material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<LessonMaterial> {
    return educational.lessonMaterials.create(material) as unknown as LessonMaterial;
  },

  /**
   * Update material
   * @policy update Material
   */
  async update(id: string, updates: Partial<LessonMaterial>): Promise<LessonMaterial> {
    return educational.lessonMaterials.update(id, updates) as unknown as LessonMaterial;
  },

  /**
   * Delete material
   * @policy delete Material
   */
  async delete(id: string): Promise<void> {
    return educational.lessonMaterials.delete(id);
  },
};

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_LESSON_MATERIALS } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'lessonMaterials',
  ghostMethods: ['getAll', 'getByLesson'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_LESSON_MATERIALS,
});
