import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

/**
 * SchoolSchema - The educational institution.
 * Derived from ZenStack Model Schema with app-specific enums.
 */
export const SchoolSchema = makeModelSchema('School').extend({
  status: z.enum(['active', 'pending', 'rejected']),
});

/**
 * SectionSchema - A department or level within a school.
 * Derived from ZenStack Model Schema.
 */
export const SectionSchema = makeModelSchema('Section');

/**
 * SchoolGradeSchema - A specific level (e.g. Grade 1, Grade 12).
 * Derived from ZenStack Model Schema.
 */
export const SchoolGradeSchema = makeModelSchema('SchoolGrade');

export const SchoolStatsSchema = z.object({
  total_students: z.number().int().nonnegative(),
  total_teachers: z.number().int().nonnegative(),
  total_classrooms: z.number().int().nonnegative(),
  total_sections: z.number().int().nonnegative(),
});

export type SchoolZod = z.infer<typeof SchoolSchema>;
export type SectionZod = z.infer<typeof SectionSchema>;
export type SchoolGradeZod = z.infer<typeof SchoolGradeSchema>;
export type SchoolStatsZod = z.infer<typeof SchoolStatsSchema>;
