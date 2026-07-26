import { useStore } from '@/store/useStore';
import { APIError } from '@/types/API';
import { SovereignError } from '@/types/Errors';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@/api/base';

/**
 * LESSONS & STUDENTS API (Sovereign RPC Proxy)
 *
 * Siphons lesson and student management to Sanctuary API.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const lessonsAPI = {
  async create(lesson: any) {
    const state = useStore.getState();
    if (!state.user || state.user.is_anonymous) {
      throw SovereignError.unauthorized('create', 'Lesson');
    }

    const res = await (client.api as any).educational.lessons.$post({
      json: lesson,
    });

    if (!res.ok) {
      throw new APIError('Failed to create lesson', res.status.toString());
    }

    return await res.json();
  },
};

import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase } from '@/api/supabase';

// ... (Students API remains on local manager for now until educational.contract is fully expanded)
export const studentsAPI = {
  async getAll(classroomId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('classroom_students')
      .select('*, student:users!student_id(full_name)')
      .eq('classroom_id', classroomId)
      .order('roll_number', { ascending: true });
    if (error) throw new APIError('Failed to fetch classroom students', error.code);
    return (data || []).map((item: any) => ({
      ...item,
      class_id: item.classroom_id,
      full_name: item.student?.full_name || item.full_name || 'Unregistered Student',
    }));
  },

  async enroll(classroomId: string, studentId: string): Promise<any> {
    const { data, error } = await supabase
      .from('classroom_students')
      .upsert({
        classroom_id: classroomId,
        student_id: studentId,
        status: 'active',
      })
      .select()
      .single();
    if (error) throw new APIError('Failed to enroll student', error.code);
    return data;
  },

  async remove(classroomId: string, studentId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId);
    if (error) throw new APIError('Failed to remove student from classroom', error.code);
  },

  async create(input: {
    full_name: string;
    roll_number?: string;
    notes?: string;
    classroom_id: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert([
        {
          classroom_id: input.classroom_id,
          full_name: input.full_name,
          roll_number: input.roll_number,
          notes: input.notes,
        },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to add student to classroom', error.code);
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async update(id: string, updates: { roll_number?: string; notes?: string }): Promise<any> {
    const { data, error } = await supabase
      .from('classroom_students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom student', error.code);
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async getSchoolLegacyHistory(schoolId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('school_legacy_records')
      .select('*')
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch school legacy history', error.code);
    return data || [];
  },

  async getClassroomLegacyHistory(classroomId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('classroom_legacy_records')
      .select('*, teacher:users(full_name)')
      .eq('classroom_id', classroomId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch classroom legacy history', error.code);
    return (data || []).map((record: any) => ({
      ...record,
      teacher_name: record.teacher?.full_name,
    }));
  },

  async getHistoricalGovernanceRecords(principalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('principal_governance_records')
      .select('*, school:schools(name)')
      .eq('principal_id', principalId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch historical governance records', error.code);
    return (data || []).map((record: any) => ({
      ...record,
      school_name: record.school?.name,
    }));
  },

  async getHistoricalAcademicRecords(studentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('student_academic_records')
      .select('*')
      .eq('student_id', studentId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch historical academic records', error.code);
    return data || [];
  },

  async getHistoricalProfessionalRecords(teacherId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('teacher_professional_records')
      .select('*, school:schools(name)')
      .eq('teacher_id', teacherId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch historical professional records', error.code);
    return (data || []).map((record: any) => ({
      ...record,
      school_name: record.school?.name,
    }));
  },
};
