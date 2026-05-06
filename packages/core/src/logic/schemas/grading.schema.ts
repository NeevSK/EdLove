import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * StudentGradeSchema - A record of academic performance.
 * Derived from ZenStack Grade model.
 */
export const StudentGradeSchema = makeModelSchema('Grade').extend({
  publication_state: z.enum(['draft', 'published']).default('draft'),
  rank: z.number().optional(),
});

/**
 * ClassroomGradingSettingsSchema - Configuration for the classroom's grading logic.
 * Derived from ZenStack ClassroomGradingSettings model.
 */
export const ClassroomGradingSettingsSchema = makeModelSchema('ClassroomGradingSettings').extend({
  grading_mode: z.enum(['marks', 'grade', 'gpa', 'both']).default('both'),
});

export const AssessmentSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  max_points: z.number().default(100),
  passing_score: z.number().default(40),
  created_at: z.iso.datetime(),
});

export const GradebookSnapshotSchema = z.object({
  classroomId: z.string(),
  viewDate: z.string(),
  grades: z.array(StudentGradeSchema),
  gradingSettings: ClassroomGradingSettingsSchema,
});

export const PublishedStudentGradesSnapshotSchema = z.object({
  studentId: z.string(),
  viewDate: z.string(),
  grades: z.array(StudentGradeSchema),
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

export type Grade = z.infer<typeof StudentGradeSchema>;
export type ClassroomGradingSettings = z.infer<typeof ClassroomGradingSettingsSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type GradebookSnapshot = z.infer<typeof GradebookSnapshotSchema>;
export type PublishedStudentGradesSnapshot = z.infer<typeof PublishedStudentGradesSnapshotSchema>;
export type SchoolGradingCompletion = z.infer<typeof SchoolGradingCompletionSchema>;
export type PublishedSchoolGradingCompletion = z.infer<
  typeof PublishedSchoolGradingCompletionSchema
>;

// Aliases for backward compatibility or semantic clarity in classroom package
export type StudentGrade = Grade;
export type StudentGradebookSnapshot = GradebookSnapshot;
