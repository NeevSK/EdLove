import { z } from 'zod';

export const ClassroomSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid().optional().nullable(),
  grade_id: z.string().uuid().optional().nullable(),
  teacher_id: z.string().uuid().optional().nullable(),
  section_id: z.string().uuid().optional().nullable(),
  name: z.string(),
  handle: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  color_theme: z.string().optional().nullable(),
  syllabus_version: z.string().optional().nullable(),
  is_archived: z.boolean().default(false),
  academic_year: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  classroom_id: z.string().uuid(),
  lesson_id: z.string().uuid().optional().nullable(),
  due_date: z.string().datetime().optional().nullable(),
  max_points: z.number().default(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const StudentAssignmentSchema = AssignmentSchema.extend({
  classroom: z.string().optional().nullable(),
  submitted: z.boolean().default(false),
});

export const AssignmentSubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  content: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  submitted_at: z.string().datetime(),
});

export const StudentSubmissionSummarySchema = AssignmentSubmissionSchema.extend({
  assignment_title: z.string(),
  classroom_id: z.string().uuid(),
  classroom: z.string().optional().nullable(),
  due_date: z.string().datetime().optional().nullable(),
});

export const ClassroomGroupSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  student_ids: z.array(z.string().uuid()).optional().default([]),
  created_at: z.string().datetime().optional().nullable(),
  updated_at: z.string().datetime().optional().nullable(),
});

export const ClassroomStudentSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: z.enum(['active', 'left', 'suspended']).default('active'),
  joined_at: z.string().datetime(),
});

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
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  school_id: z.string().uuid(),
  student_id: z.string().uuid(),
  content: z.string(),
  is_anonymous: z.boolean().default(false),
  is_read: z.boolean().default(false),
  teacher_response: z.string().optional().nullable(),
  responded_by: z.string().uuid().optional().nullable(),
  responded_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
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
