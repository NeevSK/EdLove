import { z } from 'zod';

export const SchoolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  handle: z.string().nullable(),
  type: z.string(), // Legacy field
  status: z.enum(['active', 'pending', 'rejected']),
  tenant_kind: z.string().optional(),
  official_type: z.string().optional(),
  province_id: z.string().uuid().optional(),
  district_id: z.string().uuid().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  student_type: z.string().optional(),
  religious_affiliation: z.string().optional(),
  student_count: z.number().int().nonnegative().optional(),
  avatar_url: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const SectionSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string().datetime(),
});

export const SchoolGradeSchema = z.object({
  id: z.string().uuid(),
  section_id: z.string().uuid(),
  number: z.number().int().min(1).max(13),
  created_at: z.string().datetime(),
});

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
