import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherRepository } from '@/logic/domains/teacher/ports';
import { APIError } from '@/types/API';

export const createSupabaseTeacherRepository = (supabase: SupabaseClient): TeacherRepository => ({
  async getTasks(teacherId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch tasks', error.code, error);
    return data || [];
  },

  async createTask(title: string, teacherId: string, description?: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          teacher_id: teacherId,
          is_completed: false,
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create task', error.code, error);
    return data;
  },

  async updateTaskStatus(id: string, status: boolean) {
    const { error } = await supabase.from('tasks').update({ is_completed: status }).eq('id', id);
    if (error) throw new APIError('Failed to update task status', error.code, error);
  },

  async updateTask(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new APIError('Failed to update task', error.code, error);
    return data;
  },

  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete task', error.code, error);
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
});
