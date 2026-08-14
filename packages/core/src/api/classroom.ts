import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { educationalContract } from '@repo/core/api/educational.contract';
import { useStore } from '@repo/core/store/useStore';
import { APIError } from '@repo/core/types/API';
import { SovereignError } from '@repo/core/types/Errors';

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

import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';

// ... (Students API remains on local manager for now until educational.contract is fully expanded)
export const studentsAPI = {
  async getAll(classroomId: string): Promise<any[]> {
    const res = await (client.api as any).educational.classrooms[':classroomId'].students.$get({
      param: { classroomId },
    });
    if (!res.ok) throw new APIError('Failed to fetch classroom students', res.status.toString());
    return (await res.json()).map((item: any) => ({
      ...item,
      class_id: item.classroom_id,
      full_name: item.full_name || 'Unregistered Student',
    }));
  },

  async enroll(classroomId: string, studentId: string): Promise<any> {
    const res = await (client.api as any).educational.classrooms[
      ':classroomId'
    ].students.enroll.$post({
      param: { classroomId },
      json: { studentId },
    });
    if (!res.ok) throw new APIError('Failed to enroll student', res.status.toString());
    return await res.json();
  },

  async remove(classroomId: string, studentId: string): Promise<void> {
    const students = await this.getAll(classroomId);
    const row = students.find((student) => student.student_id === studentId);
    if (!row?.id) throw new APIError('Student is not enrolled in classroom', 'NOT_FOUND');
    await this.removeById(row.id);
  },

  async create(input: {
    full_name: string;
    roll_number?: string;
    notes?: string;
    classroom_id: string;
  }): Promise<any> {
    const res = await (client.api as any).educational.classrooms[
      ':classroomId'
    ].students.shadow.$post({
      param: { classroomId: input.classroom_id },
      json: {
        fullName: input.full_name,
        rollNumber: input.roll_number ? Number(input.roll_number) : undefined,
      },
    });
    if (!res.ok) throw new APIError('Failed to add student to classroom', res.status.toString());
    const data = await res.json();
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async update(id: string, updates: { roll_number?: string; notes?: string }): Promise<any> {
    const res = await (client.api as any).educational['classroom-students'][':id'].$patch({
      param: { id },
      json: { rollNumber: updates.roll_number ? Number(updates.roll_number) : undefined },
    });
    if (!res.ok) throw new APIError('Failed to update classroom student', res.status.toString());
    const data = await res.json();
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async removeById(id: string): Promise<void> {
    const res = await (client.api as any).educational['classroom-students'][':id'].$delete({
      param: { id },
    });
    if (!res.ok)
      throw new APIError('Failed to remove student from classroom', res.status.toString());
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

void educationalContract;
