import { z } from 'zod';
import { isEdloveAccountId } from '@repo/core/logic/utils/edloveUuidV8';

export const CanonicalAccountIdSchema = z
  .uuid()
  .refine(isEdloveAccountId, 'Canonical account must be an EdLove Identity/account UUIDv8');

export const CapacitySchema = z.enum([
  'admin',
  'founder',
  'developer',
  'teacher',
  'student',
  'principal',
  'assistantPrincipal',
  'gradeHead',
  'sectionHead',
  'parent',
  'guardian',
  'librarian',
  'nurse',
  'member',
]);

export const IdentityStateSchema = z.enum(['anonymous', 'onboarded', 'verified']);

export const BondSchema = z
  .object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    entity_id: z.string(),
    entity_type: z.enum([
      'PLATFORM',
      'SCHOOL',
      'CLASSROOM',
      'COMMUNITY',
      'PERSONAL',
      'PERSONAL_CLASSROOM',
    ]),
    capacity: CapacitySchema,
    status: z.enum(['active', 'archived', 'pending']).default('active'),
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    valid_from: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    valid_until: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .catchall(z.unknown());

export type Bond = z.infer<typeof BondSchema>;

/** Read-only PowerSync projection of a classroom roster row. */
export const ClassroomStudentProjectionSchema = z
  .object({
    id: z.uuid(),
    classroom_id: z.uuid(),
    student_id: z.uuid().nullable().optional(),
    full_name: z.string().nullable().optional(),
    invite_code: z.string().nullable().optional(),
    roll_number: z.number().int().nullable().optional(),
    enrolled_at: z.coerce.date().transform((d) => d.toISOString()),
    claimed_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    status: z.string().default('active'),
    joined_at: z.coerce.date().transform((d) => d.toISOString()),
    notes: z.string().nullable().optional(),
  })
  .catchall(z.unknown());

export type ClassroomStudentProjection = z.infer<typeof ClassroomStudentProjectionSchema>;

/** Read-only PowerSync projection of institutional membership. */
export const SchoolMembershipProjectionSchema = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    school_id: z.uuid(),
    role: z.string(),
    status: z.string().default('active'),
    start_date: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    end_date: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    is_primary: z.boolean().nullable().optional(),
    deleted_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    deleted_by: z.uuid().nullable().optional(),
    deletion_reason: z.string().nullable().optional(),
    joined_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    left_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
  })
  .catchall(z.unknown());

export type SchoolMembershipProjection = z.infer<typeof SchoolMembershipProjectionSchema>;

/** Online workflow DTO; join requests are not an offline authority. */
export const SchoolJoinRequestSchema = z
  .object({
    id: z.uuid(),
    user_id: z.uuid().nullable().optional(),
    school_id: z.uuid().nullable().optional(),
    role: z.string(),
    status: z.string().default('pending'),
    created_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
    updated_at: z.coerce
      .date()
      .transform((d) => d.toISOString())
      .nullable()
      .optional(),
  })
  .catchall(z.unknown());

export type SchoolJoinRequest = z.infer<typeof SchoolJoinRequestSchema>;

/** Atomic result returned by the school registry claim approval RPC. */
export const SchoolRegistryClaimApprovalSchema = z
  .object({
    success: z.boolean(),
    already_approved: z.boolean().optional(),
    claim_id: z.uuid().optional(),
    school_id: z.uuid().optional(),
    edu_school_id: z.string().optional(),
    reviewed_by: z.uuid().optional(),
    message: z.string().optional(),
  })
  .catchall(z.unknown());

export type SchoolRegistryClaimApproval = z.infer<typeof SchoolRegistryClaimApprovalSchema>;

/** Atomic result returned by the authorized school membership approval RPC. */
export const SchoolJoinApprovalSchema = z
  .object({
    success: z.boolean(),
    already_approved: z.boolean().optional(),
    request_id: z.uuid().optional(),
    user_id: z.uuid().optional(),
    school_id: z.uuid().optional(),
    role: z.string().optional(),
    bond_id: z.uuid().nullable().optional(),
    membership_id: z.uuid().nullable().optional(),
    citizenship: z.string().optional(),
    message: z.string().optional(),
  })
  .catchall(z.unknown());

export type SchoolJoinApproval = z.infer<typeof SchoolJoinApprovalSchema>;

const normalizePerspectiveInput = (value: unknown) => {
  if (!value || typeof value !== 'object') return value;
  const input = value as Record<string, unknown>;

  return {
    ...input,
    activeBond: input.activeBond ?? null,
    availableBonds: input.availableBonds ?? [],
  };
};

export const PerspectiveSchema = z.preprocess(
  normalizePerspectiveInput,
  z.object({
    activeBond: BondSchema.nullable(),
    availableBonds: z.array(BondSchema),
  }),
);

export type Perspective = z.infer<typeof PerspectiveSchema>;
