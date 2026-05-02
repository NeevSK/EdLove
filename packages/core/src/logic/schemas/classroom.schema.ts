import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

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

export type Classroom = z.infer<typeof ClassroomSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type StudentAssignment = z.infer<typeof StudentAssignmentSchema>;
export type AssignmentSubmission = z.infer<typeof AssignmentSubmissionSchema>;
export type StudentSubmissionSummary = z.infer<typeof StudentSubmissionSummarySchema>;
export type ClassroomGroup = z.infer<typeof ClassroomGroupSchema>;
export type ClassroomStudent = z.infer<typeof ClassroomStudentSchema>;
export type TeacherStats = z.infer<typeof TeacherStatsSchema>;
export type StudentStats = z.infer<typeof StudentStatsSchema>;
export type Echo = z.infer<typeof EchoSchema>;
