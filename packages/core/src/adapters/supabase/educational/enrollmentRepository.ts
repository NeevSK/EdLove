import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { EnrollmentRecord } from '@/logic/domains/educational/ports';
import type { ClassroomGroup, ClassroomStudent } from '@/logic/schemas/classroom.schema';
import {
  ClassroomGroupSchema,
  ClassroomStudentSchema,
} from '@/logic/schemas/classroom.schema';
import { StudentSchema } from '@/logic/schemas/student.schema';
import { APIError } from '@/types/API';

export const createEnrollmentRepository = (supabase: SupabaseClient) => ({
  async getClassroomGroups(classroomId: string) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch classroom groups', error.code, error);
    return z.array(ClassroomGroupSchema).parse(data || []) as ClassroomGroup[];
  },

  async createClassroomGroup(input: {
    classroom_id: string;
    name: string;
    description?: string | null;
    student_ids?: string[];
    color?: string | null;
  }) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .insert([input])
      .select()
      .single();
    if (error) throw new APIError('Failed to create classroom group', error.code, error);
    return ClassroomGroupSchema.parse(data) as ClassroomGroup;
  },

  async updateClassroomGroup(
    id: string,
    updates: {
      name?: string;
      description?: string | null;
      student_ids?: string[];
      color?: string | null;
    },
  ) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom group', error.code, error);
    return ClassroomGroupSchema.parse(data) as ClassroomGroup;
  },

  async deleteClassroomGroup(id: string) {
    const { error } = await supabase.from('classroom_groups').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete classroom group', error.code, error);
  },

  async getSimpleStudents(classroomId: string) {
    const { data, error } = await supabase
      .from('classroom_students')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('joined_at', { ascending: true });
    if (error) throw new APIError('Failed to fetch classroom students', error.code, error);
    return z.array(ClassroomStudentSchema).parse(data || []) as ClassroomStudent[];
  },

  async enrollStudent(classroomId: string, studentId: string) {
    const { data, error } = await supabase
      .from('classroom_students')
      .upsert({
        classroom_id: classroomId,
        student_id: studentId,
        status: 'active',
      })
      .select()
      .single();
    if (error) throw new APIError('Failed to enroll student', error.code, error);
    return ClassroomStudentSchema.parse(data) as ClassroomStudent;
  },

  async removeStudent(classroomId: string, studentId: string) {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId);
    if (error) throw new APIError('Failed to remove student from classroom', error.code, error);
  },

  async getEnrollmentRecords(classroomId: string) {
    const { data, error } = await supabase
      .from('classroom_students')
      .select('*, student:users!student_id(full_name)')
      .eq('classroom_id', classroomId)
      .order('roll_number', { ascending: true });
    if (error) throw new APIError('Failed to fetch classroom students', error.code, error);
    return (data || []).map((item: any) => {
      const student = {
        ...item,
        class_id: item.classroom_id,
        full_name: item.student?.full_name || item.full_name || 'Unregistered Student',
      };
      return StudentSchema.parse(student);
    }) as EnrollmentRecord[];
  },

  async addShadowStudent(
    classroomId: string,
    fullName: string,
    rollNumber?: string,
    notes?: string,
  ) {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert([
        {
          classroom_id: classroomId,
          full_name: fullName,
          roll_number: rollNumber,
          notes,
        },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to add shadow student', error.code, error);
    return StudentSchema.parse({
      ...data,
      class_id: data.classroom_id,
    }) as EnrollmentRecord;
  },

  async claimStudent(inviteCode: string, studentId: string) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update({ student_id: studentId, claimed_at: new Date().toISOString() })
      .eq('invite_code', inviteCode)
      .is('student_id', null)
      .select()
      .single();
    if (error) throw new APIError('Failed to claim student record', error.code, error);
    return StudentSchema.parse({
      ...data,
      class_id: data.classroom_id,
    }) as EnrollmentRecord;
  },

  async addStudent(classroomId: string, studentId: string, rollNumber?: string, notes?: string) {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert([
        {
          classroom_id: classroomId,
          student_id: studentId,
          roll_number: rollNumber,
          notes,
        },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to add student to classroom', error.code, error);
    return StudentSchema.parse({
      ...data,
      class_id: data.classroom_id,
    }) as EnrollmentRecord;
  },

  async updateEnrollmentRecordById(id: string, updates: { roll_number?: string; notes?: string }) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom student', error.code, error);
    return StudentSchema.parse({
      ...data,
      class_id: data.classroom_id,
    }) as EnrollmentRecord;
  },

  async updateEnrollmentRecord(
    classroomId: string,
    studentId: string,
    updates: { roll_number?: string; notes?: string },
  ) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update(updates)
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom student', error.code, error);
    return StudentSchema.parse({
      ...data,
      class_id: data.classroom_id,
    }) as EnrollmentRecord;
  },

  async deleteEnrollmentRecord(id: string) {
    const { error } = await supabase.from('classroom_students').delete().eq('id', id);
    if (error) throw new APIError('Failed to remove student from classroom', error.code, error);
  },

  async getHistoricalAcademicRecords(studentId: string) {
    const { data, error } = await supabase
      .from('student_academic_records')
      .select('*')
      .eq('student_id', studentId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch historical academic records', error.code, error);
    return data as any[]; // Schema validation happens in the service layer
  },

  async getHistoricalProfessionalRecords(teacherId: string) {
    const { data, error } = await supabase
      .from('teacher_professional_records')
      .select('*, school:schools(name)')
      .eq('teacher_id', teacherId)
      .order('academic_year', { ascending: false });

    if (error)
      throw new APIError('Failed to fetch historical professional records', error.code, error);

    return (data || []).map((record) => ({
      ...record,
      school_name: record.school?.name,
    })) as any[];
  },

  async getHistoricalGovernanceRecords(principalId: string) {
    const { data, error } = await supabase
      .from('principal_governance_records')
      .select('*, school:schools(name)')
      .eq('principal_id', principalId)
      .order('academic_year', { ascending: false });

    if (error)
      throw new APIError('Failed to fetch historical governance records', error.code, error);

    return (data || []).map((record) => ({
      ...record,
      school_name: record.school?.name,
    })) as any[];
  },

  async getSchoolLegacyHistory(schoolId: string) {
    const { data, error } = await supabase
      .from('school_legacy_records')
      .select('*')
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch school legacy history', error.code, error);
    return data || [];
  },

  async getClassroomLegacyHistory(classroomId: string) {
    const { data, error } = await supabase
      .from('classroom_legacy_records')
      .select('*, teacher:users(full_name)')
      .eq('classroom_id', classroomId)
      .order('academic_year', { ascending: false });

    if (error) throw new APIError('Failed to fetch classroom legacy history', error.code, error);
    return (data || []).map((record) => ({
      ...record,
      teacher_name: record.teacher?.full_name,
    }));
  },

  async requestSchoolJoin(userId: string, schoolId: string, capacity: string) {
    const { data, error } = await supabase
      .from('school_join_requests')
      .insert([{ user_id: userId, school_id: schoolId, capacity, status: 'pending' }])
      .select()
      .single();
    if (error) throw new APIError('Failed to request school join', error.code, error);
    return data;
  },

  async updateSchoolJoinRequest(requestId: string, status: string) {
    const { data, error } = await supabase
      .from('school_join_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update school join request', error.code, error);
    return data;
  },

  async requestClassroomJoin(
    userId: string,
    classroomId: string,
    capacity: string,
    subjectLabel?: string,
  ) {
    const { data, error } = await supabase
      .from('classroom_join_requests')
      .insert([
        {
          user_id: userId,
          classroom_id: classroomId,
          capacity,
          subject_label: subjectLabel,
          status: 'pending',
        },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to request classroom join', error.code, error);
    return data;
  },

  async updateClassroomJoinRequest(requestId: string, status: string) {
    const { data, error } = await supabase
      .from('classroom_join_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom join request', error.code, error);
    return data;
  },

  async getClassroomJoinRequest(requestId: string) {
    const { data, error } = await supabase
      .from('classroom_join_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    if (error) throw new APIError('Failed to fetch classroom join request', error.code, error);
    return data;
  },
});
