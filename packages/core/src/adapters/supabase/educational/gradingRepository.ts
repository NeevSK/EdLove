import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  ClassroomGradingSettingsSchema,
  StudentGradeSchema,
} from '../../../logic/schemas/grading.schema';
import type { ClassroomGradingSettings, Grade } from '../../../logic/schemas/grading.schema';
import { APIError } from '../../../types/API';

export const createGradingRepository = (supabase: SupabaseClient) => ({
  async upsertGrade(input: {
    student_id: string;
    classroom_id: string;
    assignment_id?: string;
    marks: number;
    grade: string;
    gpa: number;
    feedback?: string;
    graded_by: string;
    created_at: string;
    updated_at: string;
  }) {
    const { data, error } = await supabase.from('grades').upsert(input).select().single();
    if (error) throw new APIError('Failed to submit grade', error.code, error);
    return StudentGradeSchema.parse(data) as Grade;
  },

  async getGradeById(gradeId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('id', gradeId)
      .maybeSingle();
    if (error) throw new APIError('Failed to fetch grade', error.code, error);
    return data ? (StudentGradeSchema.parse(data) as Grade) : null;
  },

  async updateGrade(
    gradeId: string,
    updates: {
      marks?: number;
      grade?: string;
      gpa?: number;
      feedback?: string | null;
      updated_at: string;
    },
  ) {
    const { data, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', gradeId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update grade', error.code, error);
    return StudentGradeSchema.parse(data) as Grade;
  },

  async getGradesByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch report card', error.code, error);
    return z.array(StudentGradeSchema).parse(data || []) as Grade[];
  },

  async getGradesByClassroom(classroomId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('marks', { ascending: false });
    if (error) throw new APIError('Failed to fetch classroom grades', error.code, error);
    return z.array(StudentGradeSchema).parse(data || []) as Grade[];
  },

  async getGradingSettings(classroomId: string) {
    const { data, error } = await supabase
      .from('classroom_grading_settings')
      .select('*')
      .eq('classroom_id', classroomId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new APIError('Failed to fetch grading settings', error.code, error);
    }
    return ClassroomGradingSettingsSchema.parse(data) as ClassroomGradingSettings;
  },

  async upsertGradingSettings(classroomId: string, settings: Partial<ClassroomGradingSettings>) {
    const { data, error } = await supabase
      .from('classroom_grading_settings')
      .upsert({ classroom_id: classroomId, ...settings })
      .select()
      .single();
    if (error) throw new APIError('Failed to update grading settings', error.code, error);
    return ClassroomGradingSettingsSchema.parse(data) as ClassroomGradingSettings;
  },

  async deleteGrade(gradeId: string) {
    const { error } = await supabase.from('grades').delete().eq('id', gradeId);
    if (error) throw new APIError('Failed to delete grade', error.code, error);
  },
});
