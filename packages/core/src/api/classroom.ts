import { orpcClient } from '@repo/core/api/orpcClient';
import { educationalContract } from '@repo/core/api/educational.contract';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { APIError } from '@repo/core/types/API';
import { SovereignError } from '@repo/core/types/Errors';

/**
 * LESSONS & STUDENTS API (Sovereign RPC Proxy)
 *
 * Siphons lesson and student management to Sanctuary API.
 */


export const lessonsAPI = {
  async create(lesson: any) {
    const state = useAuthStore.getState();
    if (!state.user || state.user.is_anonymous) {
      throw SovereignError.unauthorized('create', 'Lesson');
    }

    try {
      const res = await orpcClient.educational.createLesson({
        body: lesson,
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to create lesson',
        error.status?.toString() || error.code || 'LESSON_CREATE_FAILED',
      );
    }
  },
};

import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';

// ... (Students API remains on local manager for now until educational.contract is fully expanded)
export const studentsAPI = {
  async getAll(classroomId: string): Promise<any[]> {
    const res = await orpcClient.educational.getClassroomStudents({ params: { classroomId } });
    return (res as any[]).map((item: any) => ({
      ...item,
      class_id: item.classroom_id,
      full_name: item.full_name || 'Unregistered Student',
    }));
  },

  async enroll(classroomId: string, studentId: string): Promise<any> {
    const res = await orpcClient.educational.enrollStudent({ params: { classroomId }, body: { studentId } });
    return res;
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
    const data = (await orpcClient.educational.addShadowStudent({
      params: { classroomId: input.classroom_id },
      body: {
        fullName: input.full_name,
        rollNumber: input.roll_number ? Number(input.roll_number) : undefined,
      },
    })) as any;
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async update(
    id: string,
    updates: { full_name?: string; roll_number?: string; notes?: string },
  ): Promise<any> {
    const data = (await orpcClient.educational.updateClassroomStudent({
      params: { id },
      body: {
        fullName: updates.full_name?.trim() || undefined,
        rollNumber: updates.roll_number ? Number(updates.roll_number) : undefined,
      },
    })) as any;
    return {
      ...data,
      class_id: data.classroom_id,
    };
  },

  async removeById(id: string): Promise<void> {
    await orpcClient.educational.removeClassroomStudent({ params: { id }, body: {} });
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

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_LESSONS, MOCK_STUDENTS } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'lessons',
  ghostMethods: ['getAll', 'getByClassroom'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_LESSONS,
});

registerSandboxDomain({
  domain: 'students',
  ghostMethods: ['getAll'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_STUDENTS,
});
