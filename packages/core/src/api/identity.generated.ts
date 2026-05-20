/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from identity.schema.json
 * [MANUAL-OVERRIDE] Enhanced for ReBAC bonds and perspectives.
 */

import { z } from 'zod';

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
  'staff',
  'member',
]);

export const BondSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  entity_id: z.string(),
  entity_type: z.enum(['PLATFORM', 'SCHOOL', 'CLASSROOM', 'COMMUNITY', 'PERSONAL']),
  capacity: CapacitySchema,
  status: z.enum(['active', 'archived', 'pending']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const IdentitySchema = z.object({
  id: z.uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  activeBond: BondSchema.nullable(),
  availableBonds: z.array(BondSchema),
});

export type Identity = z.infer<typeof IdentitySchema>;
export type Bond = z.infer<typeof BondSchema>;

export const FacetedProfileSchema = z.object({
  school_id: z.uuid().nullable().optional(),
  profile_completed: z.boolean().optional(),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  tenant_kind: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
});

export type FacetedProfile = z.infer<typeof FacetedProfileSchema>;
