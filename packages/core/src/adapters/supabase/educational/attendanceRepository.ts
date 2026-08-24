import {
  type Attendance as AttendanceRecord,
  AttendanceSchema,
} from '@repo/core/logic/schemas/attendance.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const createAttendanceRepository = (supabase: SupabaseClient) => ({
  async getAttendanceByDate(classroomId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('date', date);
    if (error) throw new APIError('Failed to fetch attendance', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },

  async recordAttendance(classroomId: string, studentId: string, status: string, date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        { classroom_id: classroomId, student_id: studentId, status, date },
        { onConflict: 'classroom_id,student_id,date' },
      )
      .select()
      .single();
    if (error) throw new APIError('Failed to record attendance', error.code, error);
    return AttendanceSchema.parse(data) as AttendanceRecord;
  },

  async batchRecordAttendance(
    records: Array<{
      classroom_id: string;
      student_id: string;
      status: string;
      date: string;
    }>,
  ) {
    if (records.length === 0) return [];
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'classroom_id,student_id,date' })
      .select();
    if (error) throw new APIError('Failed to batch record attendance', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },

  async getAttendanceForStudent(studentId: string, classroomId?: string) {
    let query = supabase.from('attendance').select('*').eq('student_id', studentId);
    if (classroomId) query = query.eq('classroom_id', classroomId);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw new APIError('Failed to fetch student attendance history', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },
});
