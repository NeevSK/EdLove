import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

/**
 * SchoolSchema - The educational institution.
 * Derived from ZenStack Model Schema with app-specific enums.
 */
export const SchoolSchema = makeModelSchema('School')
  .extend({
    status: z.enum(['active', 'pending', 'rejected']),
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    deleted_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional()
      .nullable(),
  })
  .catchall(z.unknown());

/**
 * What a school is, organisationally (Neev, 2026-11-13). Institutional schools (government and
 * the like) already exist in the national registry (`EduSchool`, with their official
 * `SchoolType` classification): a principal chooses one and asks to connect. Commercial ones
 * (private, international, tuition) are created by their owner. More kinds, such as a
 * sanctuary, join this list when they exist. Not stored on `School` yet: the model has no column.
 */
export const SchoolKindSchema = z.enum(['institutional', 'commercial']);
export type SchoolKind = z.infer<typeof SchoolKindSchema>;

/**
 * The stage of schooling a school covers, within its kind: one list for every path that
 * collects it (the union of what the provisioning and principal setup machines used). Stored
 * in `School.type`, a free-text column.
 */
export const SchoolLevelSchema = z.enum([
  'k12',
  'primary',
  'secondary',
  'mixed',
  'vocational',
  'higher_ed',
  // From principal setup's list; may move to `SchoolKindSchema` when sanctuary becomes a kind.
  'sanctuary',
]);
export type SchoolLevel = z.infer<typeof SchoolLevelSchema>;

/**
 * SectionSchema - A department or level within a school.
 * Derived from ZenStack Model Schema.
 */
export const SectionSchema = makeModelSchema('Section')
  .extend({
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    deleted_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional()
      .nullable(),
  })
  .catchall(z.unknown());

/**
 * SchoolGradeSchema - A specific level (e.g. Grade 1, Grade 12).
 * Derived from ZenStack Model Schema.
 */
export const SchoolGradeSchema = makeModelSchema('SchoolGrade')
  .extend({
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    deleted_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional()
      .nullable(),
  })
  .catchall(z.unknown());

/**
 * Read-only canonical registry facts. This is intentionally separate from
 * SchoolSchema: registry discovery must not be mistaken for a tenant school.
 */
export const EduSchoolSchema = z.object({
  id: z.string(),
  census_no: z.string(),
  name: z.string(),
  gender: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  type_code: z.string().nullable().optional(),
  province_id: z.string().nullable().optional(),
  district_id: z.string().nullable().optional(),
  gn_division_id: z.string().nullable().optional(),
  postal_unit_id: z.string().nullable().optional(),
  zone_id: z.string().nullable().optional(),
  division_id: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  religion: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  socio_economic_tier: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
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
export type EduSchoolZod = z.infer<typeof EduSchoolSchema>;
export type SchoolStatsZod = z.infer<typeof SchoolStatsSchema>;
