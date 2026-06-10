import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Material as LessonMaterial } from '../../../logic/schemas/material.schema';
import { MaterialSchema } from '../../../logic/schemas/material.schema';
import { APIError } from '../../../types/API';

export const createMaterialRepository = (supabase: SupabaseClient) => ({
  async getMaterials(classroomId: string) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('is_pinned', { ascending: false });
    if (error) throw new APIError('Failed to fetch lesson materials', error.code, error);
    return z.array(MaterialSchema).parse(data || []) as LessonMaterial[];
  },

  async getMaterialsByLesson(lessonId: string) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('is_pinned', { ascending: false });
    if (error) throw new APIError('Failed to fetch materials for lesson', error.code, error);
    return z.array(MaterialSchema).parse(data || []) as LessonMaterial[];
  },

  async createMaterial(material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .insert([material])
      .select()
      .single();
    if (error) throw new APIError('Failed to create lesson material', error.code, error);
    return MaterialSchema.parse(data) as LessonMaterial;
  },

  async updateMaterial(id: string, updates: Partial<LessonMaterial>) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update lesson material', error.code, error);
    return MaterialSchema.parse(data) as LessonMaterial;
  },

  async deleteMaterial(id: string) {
    const { error } = await supabase.from('lesson_materials').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete lesson material', error.code, error);
  },
});
