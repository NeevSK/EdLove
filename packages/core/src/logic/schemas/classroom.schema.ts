import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

/**
 * ClassroomSchema - A sacred space for learning.
 * Derived from ZenStack Model Schema.
 */
export const ClassroomSchema = makeModelSchema('Classroom');

/**
 * AssignmentSchema - A challenge for growth.
 * Derived from ZenStack Model Schema.
 */
export const AssignmentSchema = makeModelSchema('Assignment');

/**
 * LessonSchema - A unit of instruction.
 */
export const LessonSchema = makeModelSchema('Lesson');

export const StudentAssignmentSchema = AssignmentSchema.extend({
  classroom: z.string().optional().nullable(),
  submitted: z.boolean().default(false),
});

export const AssignmentSubmissionSchema = z.object({
  id: z.uuid(),
  assignment_id: z.uuid(),
  student_id: z.uuid(),
  content: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  submitted_at: z.iso.datetime(),
});

export const StudentSubmissionSummarySchema = AssignmentSubmissionSchema.extend({
  assignment_title: z.string(),
  classroom_id: z.uuid(),
  classroom: z.string().optional().nullable(),
  due_date: z.iso.datetime().optional().nullable(),
});

export const ClassroomGroupSchema = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  student_ids: z.array(z.uuid()).optional().default([]),
  created_at: z.iso.datetime().optional().nullable(),
  updated_at: z.iso.datetime().optional().nullable(),
});

/**
 * ClassroomStudentSchema - Relationship between a student and a classroom.
 * Derived from ZenStack Model Schema.
 */
export const ClassroomStudentSchema = makeModelSchema('ClassroomStudent');

export const TeacherStatsSchema = z.object({
  total_students: z.number().default(0),
  average_attendance: z.number().default(0),
  pending_assignments: z.number().default(0),
  active_classrooms: z.number().default(0),
});

export const StudentStatsSchema = z.object({
  active_sanctuaries: z.number().default(0),
  goals_set: z.number().default(0),
  growth_points: z.number().default(0),
});

export const EchoSchema = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  school_id: z.uuid(),
  student_id: z.uuid(),
  content: z.string(),
  is_anonymous: z.boolean().default(false),
  is_read: z.boolean().default(false),
  teacher_response: z.string().optional().nullable(),
  responded_by: z.uuid().optional().nullable(),
  responded_at: z.iso.datetime().optional().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const StudentAcademicRecordSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  school_id: z.string().uuid(),
  academic_year: z.string(),
  grade_number: z.number().optional().nullable(),
  subject: z.string().optional().nullable(),
  handle: z.string().optional().nullable(),
  avg_grade: z.number().optional().nullable(),
  highest_grade: z.number().optional().nullable(),
  lowest_grade: z.number().optional().nullable(),
  assignments_total: z.number(),
  assignments_submitted: z.number(),
  teacher_note: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TeacherProfessionalRecordSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  school_id: z.string().uuid(),
  school_name: z.string().optional().nullable(),
  academic_year: z.string(),
  designation: z.string(),
  subjects: z.array(z.string()).default([]),
  classrooms_count: z.number().default(0),
  students_count: z.number().default(0),
  avg_classroom_performance: z.number().optional().nullable(),
  achievements: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PrincipalGovernanceRecordSchema = z.object({
  id: z.string().uuid(),
  principal_id: z.string().uuid(),
  school_id: z.string().uuid(),
  school_name: z.string().optional().nullable(),
  academic_year: z.string(),
  capacity: z.string(),
  staff_count: z.number().default(0),
  student_count: z.number().default(0),
  key_initiatives: z.array(z.string()).default([]),
  institutional_growth_score: z.number().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SchoolLegacyRecordSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  academic_year: z.string(),
  total_students: z.number().default(0),
  total_staff: z.number().default(0),
  avg_performance: z.number().optional().nullable(),
  graduation_rate: z.number().optional().nullable(),
  milestones: z.array(z.string()).default([]),
  leadership: z
    .object({
      principal_id: z.string().uuid().optional(),
      principal_name: z.string().optional(),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ClassroomLegacyRecordSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  academic_year: z.string(),
  teacher_id: z.string().uuid(),
  teacher_name: z.string().optional(),
  student_count: z.number().default(0),
  avg_performance: z.number().optional().nullable(),
  top_achievements: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Classroom = z.infer<typeof ClassroomSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type StudentAssignment = z.infer<typeof StudentAssignmentSchema>;
export type AssignmentSubmission = z.infer<typeof AssignmentSubmissionSchema>;
export type StudentSubmissionSummary = z.infer<typeof StudentSubmissionSummarySchema>;
export type ClassroomGroup = z.infer<typeof ClassroomGroupSchema>;
export type ClassroomStudent = z.infer<typeof ClassroomStudentSchema>;
export type TeacherStats = z.infer<typeof TeacherStatsSchema>;
export type StudentStats = z.infer<typeof StudentStatsSchema>;
export type Echo = z.infer<typeof EchoSchema>;
export type StudentAcademicRecord = z.infer<typeof StudentAcademicRecordSchema>;
export type TeacherProfessionalRecord = z.infer<typeof TeacherProfessionalRecordSchema>;
export type PrincipalGovernanceRecord = z.infer<typeof PrincipalGovernanceRecordSchema>;
export type SchoolLegacyRecord = z.infer<typeof SchoolLegacyRecordSchema>;
export type ClassroomLegacyRecord = z.infer<typeof ClassroomLegacyRecordSchema>;
