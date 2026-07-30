import type { SupabaseClient } from '@supabase/supabase-js';
import type { Classroom } from '@repo/core/logic/schemas/classroom.schema';
import { ClassroomSchema } from '@repo/core/logic/schemas/classroom.schema';
import { APIError } from '@repo/core/types/API';

const withRange = <T>(query: T, params?: { limit?: number; offset?: number }) => {
  if (!params?.limit || !(query as any).limit) return query;
  return (query as any).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
};

export const createClassroomRepository = (supabase: SupabaseClient) => ({
  async getClassroomsByTeacher(
    teacherId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    let query = supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('name', { ascending: true });
    query = withRange(query, params);
    const { data, error } = await query;
    if (error) throw new APIError('Failed to fetch teacher classrooms', error.code, error);
    return (data || []).map((item) => ClassroomSchema.parse(item)) as Classroom[];
  },

  async getClassroomsByStudent(
    studentId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    let query = supabase
      .from('classroom_students')
      .select('classroom:classrooms (*)')
      .eq('student_id', studentId);
    query = withRange(query, params);
    const { data, error } = await query;
    if (error) throw new APIError('Failed to fetch student classrooms', error.code, error);
    return (data || [])
      .map((item: any) => (Array.isArray(item.classroom) ? item.classroom[0] : item.classroom))
      .filter(Boolean)
      .map((item: any) => ClassroomSchema.parse(item)) as Classroom[];
  },

  async getClassroomsBySchool(schoolId: string, params: { limit?: number; offset?: number } = {}) {
    let query = supabase
      .from('classrooms')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });
    query = withRange(query, params);
    const { data, error } = await query;
    if (error) throw new APIError('Failed to fetch school classrooms', error.code, error);
    return (data || []).map((item) => ClassroomSchema.parse(item)) as Classroom[];
  },

  async getAvailableClassroomsByGrade(gradeId: string) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('grade_id', gradeId)
      .is('teacher_id', null)
      .order('name', { ascending: true });
    if (error)
      throw new APIError('Failed to fetch available classrooms for grade', error.code, error);
    return (data || []).map((item) => ClassroomSchema.parse(item)) as Classroom[];
  },

  async getClassroomById(id: string) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new APIError('Failed to fetch classroom', error.code, error);
    return data ? (ClassroomSchema.parse(data) as Classroom) : null;
  },

  async createClassroom(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('classrooms').insert([classroom]).select().single();
    if (error) throw new APIError('Failed to create classroom', error.code, error);
    return ClassroomSchema.parse(data) as Classroom;
  },

  async updateClassroom(id: string, updates: Partial<Classroom>) {
    const { data, error } = await supabase
      .from('classrooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom', error.code, error);
    return ClassroomSchema.parse(data) as Classroom;
  },

  async deleteClassroom(id: string) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete classroom', error.code, error);
  },
});
