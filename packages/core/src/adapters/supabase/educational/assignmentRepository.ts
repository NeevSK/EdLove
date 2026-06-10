import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type {
  Assignment,
  AssignmentSubmission,
  StudentAssignment,
  StudentSubmissionSummary,
} from '../../../logic/schemas/classroom.schema';
import {
  AssignmentSchema,
  AssignmentSubmissionSchema,
  StudentAssignmentSchema,
  StudentSubmissionSummarySchema,
} from '../../../logic/schemas/classroom.schema';
import { APIError } from '../../../types/API';

export const createAssignmentRepository = (supabase: SupabaseClient) => ({
  async getAssignments(classroomId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('due_date', { ascending: true });
    if (error) throw new APIError('Failed to fetch assignments', error.code, error);
    return z.array(AssignmentSchema).parse(data || []) as Assignment[];
  },

  async getAssignmentsByLesson(lessonId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('due_date', { ascending: true });
    if (error) throw new APIError('Failed to fetch assignments for lesson', error.code, error);
    return z.array(AssignmentSchema).parse(data || []) as Assignment[];
  },

  async getUpcomingAssignmentsForStudent(studentId: string) {
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

    const ids = (myClasses ?? []).map((row) => row.classroom_id).filter(Boolean);
    if (ids.length === 0) return [];

    // POTENTIAL_HYDRATION_RISK: 'today' depends on the local clock.
    // If crossing midnight during hydration, this could cause a query result mismatch.
    const today = new Date().toISOString().split('T')[0] || '';
    const { data, error } = await supabase
      .from('assignments')
      .select('*, classrooms(name)')
      .in('classroom_id', ids)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(6);

    if (error)
      throw new APIError('Failed to fetch upcoming assignments for student', error.code, error);

    const assignmentRows = (data ?? []).map((item: unknown) => AssignmentSchema.parse(item));
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
      (submissions ?? []).map((submission: { assignment_id: string }) => submission.assignment_id),
    );

    return assignmentRows.map((assignment, index) =>
      StudentAssignmentSchema.parse({
        ...assignment,
        classroom:
          (data?.[index] as { classrooms?: { name: string } | null } | undefined)?.classrooms
            ?.name ?? null,
        submitted: submittedIds.has(assignment.id),
      }),
    ) as StudentAssignment[];
  },

  async getStudentSubmissionHistory(studentId: string, classroomId?: string) {
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

    interface RawSubmissionRow {
      id: string;
      assignment_id: string;
      student_id: string;
      content: string | null;
      photo_url: string | null;
      submitted_at: string;
      assignments: {
        id: string;
        title: string;
        classroom_id: string;
        due_date: string | null;
        classrooms: { name: string } | null;
      } | null;
    }

    return ((data as unknown as RawSubmissionRow[]) || []).map((item) =>
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

  async createAssignmentSubmission(input: {
    assignment_id: string;
    student_id: string;
    content?: string | null;
    photo_url?: string | null;
    submitted_at: string;
  }) {
    const { data, error } = await supabase.from('submissions').insert([input]).select().single();
    if (error) throw new APIError('Failed to submit assignment', error.code, error);
    return AssignmentSubmissionSchema.parse(data) as AssignmentSubmission;
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single();
    if (error) throw new APIError('Failed to create assignment', error.code, error);
    return AssignmentSchema.parse(data) as Assignment;
  },

  async updateAssignment(id: string, updates: Partial<Assignment>) {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update assignment', error.code, error);
    return AssignmentSchema.parse(data) as Assignment;
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete assignment', error.code, error);
  },
  async getRecentGradesOverviewForStudent(studentId: string, limit = 4) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, grade, feedback, submitted_at, assignments(title), classrooms(name)')
      .eq('student_id', studentId)
      .not('grade', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) throw new APIError('Failed to fetch recent grades', error.code, error);

    return ((data as Record<string, any>[] | null) ?? []).map((row) => ({
      ...row,
      assignments: Array.isArray(row.assignments) ? row.assignments[0] : row.assignments || null,
      classrooms: Array.isArray(row.classrooms) ? row.classrooms[0] : row.classrooms || null,
    }));
  },
});
