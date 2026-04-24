import { z } from 'zod';
import type {
  EducationalRepository,
  EnrollmentRecord,
} from '../../logic/domains/educational/ports';
import type { Attendance as AttendanceRecord } from '../../logic/schemas/attendance.schema';
import { AttendanceSchema } from '../../logic/schemas/attendance.schema';
import type {
  Assignment,
  AssignmentSubmission,
  Classroom,
  ClassroomGroup,
  ClassroomStudent,
  StudentAssignment,
  StudentSubmissionSummary,
} from '../../logic/schemas/classroom.schema';
import {
  AssignmentSchema,
  AssignmentSubmissionSchema,
  ClassroomGroupSchema,
  ClassroomSchema,
  ClassroomStudentSchema,
  StudentAssignmentSchema,
  StudentSubmissionSummarySchema,
} from '../../logic/schemas/classroom.schema';
import type { ClassroomGradingSettings, Grade } from '../../logic/schemas/grading.schema';
import {
  ClassroomGradingSettingsSchema,
  StudentGradeSchema,
} from '../../logic/schemas/grading.schema';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lesson } from '../../logic/schemas/lesson.schema';
import { LessonSchema } from '../../logic/schemas/lesson.schema';
import type { Material as LessonMaterial } from '../../logic/schemas/material.schema';
import { MaterialSchema } from '../../logic/schemas/material.schema';
import { StudentSchema } from '../../logic/schemas/student.schema';
import { APIError } from '../../types/API';

const withRange = <T>(query: T, params?: { limit?: number; offset?: number }) => {
  if (!params?.limit || !(query as any).limit) return query;
  return (query as any).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
};

export const createSupabaseEducationalRepository = (
  supabase: SupabaseClient,
): EducationalRepository => ({
  async getClassroomsByTeacher(teacherId, params = {}) {
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
  async getClassroomsByStudent(studentId, params = {}) {
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
  async getClassroomsBySchool(schoolId, params = {}) {
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
  async getAvailableClassroomsByGrade(gradeId) {
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
  async getClassroomById(id) {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new APIError('Failed to fetch classroom', error.code, error);
    return data ? (ClassroomSchema.parse(data) as Classroom) : null;
  },
  async createClassroom(classroom) {
    const { data, error } = await supabase.from('classrooms').insert([classroom]).select().single();
    if (error) throw new APIError('Failed to create classroom', error.code, error);
    return ClassroomSchema.parse(data) as Classroom;
  },
  async updateClassroom(id, updates) {
    const { data, error } = await supabase
      .from('classrooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom', error.code, error);
    return ClassroomSchema.parse(data) as Classroom;
  },
  async deleteClassroom(id) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete classroom', error.code, error);
  },

  async getLessons(classroomId) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('order_index', { ascending: true });
    if (error) throw new APIError('Failed to fetch lessons', error.code, error);
    return z.array(LessonSchema).parse(data || []) as Lesson[];
  },
  async getLessonsByDate(classroomId, date) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('classroom_id', classroomId)
      .gte('published_at', date)
      .lt('published_at', `${date}T23:59:59Z`);
    if (error) throw new APIError('Failed to fetch lessons by date', error.code, error);
    return z.array(LessonSchema).parse(data || []) as Lesson[];
  },
  async createLesson(lesson) {
    const { data, error } = await supabase.from('lessons').insert([lesson]).select().single();
    if (error) throw new APIError('Failed to create lesson', error.code, error);
    return LessonSchema.parse(data) as Lesson;
  },
  async updateLesson(id, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update lesson', error.code, error);
    return LessonSchema.parse(data) as Lesson;
  },
  async deleteLesson(id) {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete lesson', error.code, error);
  },

  async getAssignments(classroomId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('due_date', { ascending: true });
    if (error) throw new APIError('Failed to fetch assignments', error.code, error);
    return z.array(AssignmentSchema).parse(data || []) as Assignment[];
  },
  async getAssignmentsByLesson(lessonId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('due_date', { ascending: true });
    if (error) throw new APIError('Failed to fetch assignments for lesson', error.code, error);
    return z.array(AssignmentSchema).parse(data || []) as Assignment[];
  },
  async getUpcomingAssignmentsForStudent(studentId) {
    const { data: myClasses, error: classesError } = await supabase
      .from('classroom_students')
      .select('classroom_id')
      .eq('student_id', studentId);

    if (classesError)
      throw new APIError(
        'Failed to fetch student classrooms for assignments',
        classesError.code,
        classesError,
      );

    const ids = (myClasses ?? []).map((row: any) => row.classroom_id).filter(Boolean);
    if (ids.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('assignments')
      .select('*, classrooms(name)')
      .in('classroom_id', ids)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(6);

    if (error)
      throw new APIError('Failed to fetch upcoming assignments for student', error.code, error);

    const assignmentRows = (data ?? []).map((item: any) => AssignmentSchema.parse(item));
    const assignmentIds = assignmentRows.map((assignment) => assignment.id);
    const { data: submissions, error: submissionsError } =
      assignmentIds.length > 0
        ? await supabase
            .from('submissions')
            .select('assignment_id')
            .eq('student_id', studentId)
            .in('assignment_id', assignmentIds)
        : { data: [], error: null };

    if (submissionsError)
      throw new APIError(
        'Failed to fetch assignment submissions for student',
        submissionsError.code,
        submissionsError,
      );

    const submittedIds = new Set(
      (submissions ?? []).map((submission: any) => submission.assignment_id),
    );

    return assignmentRows.map((assignment, index) =>
      StudentAssignmentSchema.parse({
        ...assignment,
        classroom: (data?.[index] as any)?.classrooms?.name ?? null,
        submitted: submittedIds.has(assignment.id),
      }),
    ) as StudentAssignment[];
  },
  async getStudentSubmissionHistory(studentId, classroomId) {
    let query = supabase
      .from('submissions')
      .select(
        'id, assignment_id, student_id, content, photo_url, submitted_at, assignments!inner(id, title, classroom_id, due_date, classrooms(name))',
      )
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (classroomId) {
      query = query.eq('assignments.classroom_id', classroomId);
    }

    const { data, error } = await query.limit(24);
    if (error) throw new APIError('Failed to fetch student submission history', error.code, error);

    return (data ?? []).map((item: any) =>
      StudentSubmissionSummarySchema.parse({
        id: item.id,
        assignment_id: item.assignment_id,
        student_id: item.student_id,
        content: item.content,
        photo_url: item.photo_url,
        submitted_at: item.submitted_at,
        assignment_title: item.assignments?.title ?? 'Assignment',
        classroom_id: item.assignments?.classroom_id,
        classroom: item.assignments?.classrooms?.name ?? null,
        due_date: item.assignments?.due_date ?? null,
      }),
    ) as StudentSubmissionSummary[];
  },
  async createAssignmentSubmission(input) {
    const { data, error } = await supabase.from('submissions').insert([input]).select().single();
    if (error) throw new APIError('Failed to submit assignment', error.code, error);
    return AssignmentSubmissionSchema.parse(data) as AssignmentSubmission;
  },
  async createAssignment(assignment) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single();
    if (error) throw new APIError('Failed to create assignment', error.code, error);
    return AssignmentSchema.parse(data) as Assignment;
  },
  async updateAssignment(id, updates) {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update assignment', error.code, error);
    return AssignmentSchema.parse(data) as Assignment;
  },
  async deleteAssignment(id) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete assignment', error.code, error);
  },

  async getClassroomGroups(classroomId) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch classroom groups', error.code, error);
    return z.array(ClassroomGroupSchema).parse(data || []) as ClassroomGroup[];
  },
  async createClassroomGroup(input) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .insert([input])
      .select()
      .single();
    if (error) throw new APIError('Failed to create classroom group', error.code, error);
    return ClassroomGroupSchema.parse(data) as ClassroomGroup;
  },
  async updateClassroomGroup(id, updates) {
    const { data, error } = await supabase
      .from('classroom_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom group', error.code, error);
    return ClassroomGroupSchema.parse(data) as ClassroomGroup;
  },
  async deleteClassroomGroup(id) {
    const { error } = await supabase.from('classroom_groups').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete classroom group', error.code, error);
  },

  async getSimpleStudents(classroomId) {
    const { data, error } = await supabase
      .from('classroom_students')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('joined_at', { ascending: true });
    if (error) throw new APIError('Failed to fetch classroom students', error.code, error);
    return z.array(ClassroomStudentSchema).parse(data || []) as ClassroomStudent[];
  },
  async enrollStudent(classroomId, studentId) {
    const { data, error } = await supabase
      .from('classroom_students')
      .upsert({ classroom_id: classroomId, student_id: studentId, status: 'active' })
      .select()
      .single();
    if (error) throw new APIError('Failed to enroll student', error.code, error);
    return ClassroomStudentSchema.parse(data) as ClassroomStudent;
  },
  async removeStudent(classroomId, studentId) {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId);
    if (error) throw new APIError('Failed to remove student from classroom', error.code, error);
  },

  async getEnrollmentRecords(classroomId) {
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
  async addShadowStudent(classroomId, fullName, rollNumber, notes) {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert([{ classroom_id: classroomId, full_name: fullName, roll_number: rollNumber, notes }])
      .select()
      .single();
    if (error) throw new APIError('Failed to add shadow student', error.code, error);
    return StudentSchema.parse({ ...data, class_id: data.classroom_id }) as EnrollmentRecord;
  },
  async claimStudent(inviteCode, studentId) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update({ student_id: studentId, claimed_at: new Date().toISOString() })
      .eq('invite_code', inviteCode)
      .is('student_id', null)
      .select()
      .single();
    if (error) throw new APIError('Failed to claim student record', error.code, error);
    return StudentSchema.parse({ ...data, class_id: data.classroom_id }) as EnrollmentRecord;
  },
  async addStudent(classroomId, studentId, rollNumber, notes) {
    const { data, error } = await supabase
      .from('classroom_students')
      .insert([
        { classroom_id: classroomId, student_id: studentId, roll_number: rollNumber, notes },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to add student to classroom', error.code, error);
    return StudentSchema.parse({ ...data, class_id: data.classroom_id }) as EnrollmentRecord;
  },
  async updateEnrollmentRecordById(id, updates) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom student', error.code, error);
    return StudentSchema.parse({ ...data, class_id: data.classroom_id }) as EnrollmentRecord;
  },
  async updateEnrollmentRecord(classroomId, studentId, updates) {
    const { data, error } = await supabase
      .from('classroom_students')
      .update(updates)
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update classroom student', error.code, error);
    return StudentSchema.parse({ ...data, class_id: data.classroom_id }) as EnrollmentRecord;
  },
  async deleteEnrollmentRecord(id) {
    const { error } = await supabase.from('classroom_students').delete().eq('id', id);
    if (error) throw new APIError('Failed to remove student from classroom', error.code, error);
  },

  async getTeacherStats(teacherId) {
    // Implementation for teacher stats - could be a RPC or a complex query
    // For now, return a placeholder or implement basic count
    const { data, error } = await supabase.rpc('get_teacher_stats', { p_teacher_id: teacherId });
    if (error) {
      // Fallback if RPC doesn't exist
      const { count: classroomCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);
      return {
        classrooms: classroomCount || 0,
        students: 0, // Simplified fallback
        active_lessons: 0,
      };
    }
    return data;
  },

  async getMaterials(classroomId) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('is_pinned', { ascending: false });
    if (error) throw new APIError('Failed to fetch lesson materials', error.code, error);
    return z.array(MaterialSchema).parse(data || []) as LessonMaterial[];
  },
  async getMaterialsByLesson(lessonId) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('is_pinned', { ascending: false });
    if (error) throw new APIError('Failed to fetch materials for lesson', error.code, error);
    return z.array(MaterialSchema).parse(data || []) as LessonMaterial[];
  },
  async createMaterial(material) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .insert([material])
      .select()
      .single();
    if (error) throw new APIError('Failed to create lesson material', error.code, error);
    return MaterialSchema.parse(data) as LessonMaterial;
  },
  async updateMaterial(id, updates) {
    const { data, error } = await supabase
      .from('lesson_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update lesson material', error.code, error);
    return MaterialSchema.parse(data) as LessonMaterial;
  },
  async deleteMaterial(id) {
    const { error } = await supabase.from('lesson_materials').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete lesson material', error.code, error);
  },

  async upsertGrade(input) {
    const { data, error } = await supabase.from('grades').upsert(input).select().single();
    if (error) throw new APIError('Failed to submit grade', error.code, error);
    return StudentGradeSchema.parse(data) as Grade;
  },
  async getGradeById(gradeId) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('id', gradeId)
      .maybeSingle();
    if (error) throw new APIError('Failed to fetch grade', error.code, error);
    return data ? (StudentGradeSchema.parse(data) as Grade) : null;
  },
  async updateGrade(gradeId, updates) {
    const { data, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', gradeId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update grade', error.code, error);
    return StudentGradeSchema.parse(data) as Grade;
  },
  async getGradesByStudent(studentId) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch report card', error.code, error);
    return z.array(StudentGradeSchema).parse(data || []) as Grade[];
  },
  async getGradesByClassroom(classroomId) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('marks', { ascending: false });
    if (error) throw new APIError('Failed to fetch classroom grades', error.code, error);
    return z.array(StudentGradeSchema).parse(data || []) as Grade[];
  },
  async getGradingSettings(classroomId) {
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
  async upsertGradingSettings(classroomId, settings) {
    const { data, error } = await supabase
      .from('classroom_grading_settings')
      .upsert({ classroom_id: classroomId, ...settings })
      .select()
      .single();
    if (error) throw new APIError('Failed to update grading settings', error.code, error);
    return ClassroomGradingSettingsSchema.parse(data) as ClassroomGradingSettings;
  },
  async deleteGrade(gradeId) {
    const { error } = await supabase.from('grades').delete().eq('id', gradeId);
    if (error) throw new APIError('Failed to delete grade', error.code, error);
  },

  async getAttendanceByDate(classroomId, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('date', date);
    if (error) throw new APIError('Failed to fetch attendance', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },
  async recordAttendance(classroomId, studentId, status, date) {
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
  async batchRecordAttendance(records) {
    if (records.length === 0) return [];
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'classroom_id,student_id,date' })
      .select();
    if (error) throw new APIError('Failed to batch record attendance', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },
  async getAttendanceForStudent(studentId, classroomId) {
    let query = supabase.from('attendance').select('*').eq('student_id', studentId);
    if (classroomId) query = query.eq('classroom_id', classroomId);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw new APIError('Failed to fetch student attendance history', error.code, error);
    return z.array(AttendanceSchema).parse(data || []) as AttendanceRecord[];
  },
});
