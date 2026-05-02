import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { LessonSchema } from '../../../logic/schemas/lesson.schema';
import type { Lesson } from '../../../logic/schemas/lesson.schema';
import { APIError } from '../../../types/API';

export const createLessonRepository = (supabase: SupabaseClient) => ({
  async getLessons(classroomId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('order_index', { ascending: true });
    if (error) throw new APIError('Failed to fetch lessons', error.code, error);
    return z.array(LessonSchema).parse(data || []) as Lesson[];
  },

  async getLessonsByDate(classroomId: string, date: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('classroom_id', classroomId)
      .gte('published_at', date)
      .lt('published_at', `${date}T23:59:59Z`);
    if (error) throw new APIError('Failed to fetch lessons by date', error.code, error);
    return z.array(LessonSchema).parse(data || []) as Lesson[];
  },

  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('lessons').insert([lesson]).select().single();
    if (error) throw new APIError('Failed to create lesson', error.code, error);
    return LessonSchema.parse(data) as Lesson;
  },

  async updateLesson(id: string, updates: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update lesson', error.code, error);
    return LessonSchema.parse(data) as Lesson;
  },

  async deleteLesson(id: string) {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete lesson', error.code, error);
  },
});
