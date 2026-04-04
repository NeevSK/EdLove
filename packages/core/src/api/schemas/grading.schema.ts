import { z } from 'zod';

export const GradeSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  assignment_id: z.string().uuid().optional().nullable(),
  student_id: z.string().uuid(),
  graded_by: z.string().uuid(),
  marks: z.number(),
  grade: z.string(),
  gpa: z.number(),
  feedback: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  publication_state: z.enum(['draft', 'published']).default('draft').optional(),
  published_at: z.string().datetime().optional().nullable(),
  published_by: z.string().uuid().optional().nullable(),
  publication_action: z.string().optional().nullable(),
  rank: z.number().optional().nullable(),
});

export const ClassroomGradingSettingsSchema = z.object({
  classroom_id: z.string().uuid(),
  grading_mode: z.enum(['marks', 'grade', 'gpa', 'both']).default('both').optional(),
  show_ranks: z.boolean().default(true).optional(),
});

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  max_points: z.number().default(100),
  passing_score: z.number().default(40),
  created_at: z.string().datetime(),
});

export const GradebookSnapshotSchema = z.object({
  classroomId: z.string(),
  viewDate: z.string(),
  grades: z.array(GradeSchema),
  gradingSettings: ClassroomGradingSettingsSchema,
});

export const PublishedStudentGradesSnapshotSchema = z.object({
  studentId: z.string(),
  viewDate: z.string(),
  grades: z.array(GradeSchema),
});

export const SchoolGradingCompletionSchema = z.object({
  schoolId: z.string(),
  viewDate: z.string(),
  totalClassrooms: z.number().int().min(0),
  classroomsWithGrades: z.number().int().min(0),
  classroomsWithoutGrades: z.number().int().min(0),
  gradedEntries: z.number().int().min(0),
});

export const PublishedSchoolGradingCompletionSchema = z.object({
  schoolId: z.string(),
  viewDate: z.string(),
  totalClassrooms: z.number().int().min(0),
  classroomsWithPublishedGrades: z.number().int().min(0),
  classroomsWithoutPublishedGrades: z.number().int().min(0),
  publishedEntries: z.number().int().min(0),
});

export type Grade = z.infer<typeof GradeSchema>;
export type ClassroomGradingSettings = z.infer<typeof ClassroomGradingSettingsSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type GradebookSnapshot = z.infer<typeof GradebookSnapshotSchema>;
export type PublishedStudentGradesSnapshot = z.infer<typeof PublishedStudentGradesSnapshotSchema>;
export type SchoolGradingCompletion = z.infer<typeof SchoolGradingCompletionSchema>;
export type PublishedSchoolGradingCompletion = z.infer<typeof PublishedSchoolGradingCompletionSchema>;

// Aliases for backward compatibility or semantic clarity in classroom package
export type StudentGrade = Grade;
export type StudentGradebookSnapshot = GradebookSnapshot;
