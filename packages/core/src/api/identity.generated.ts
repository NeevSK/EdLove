/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from identity.schema.json
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

export type Capacity = z.infer<typeof CapacitySchema>;

export const BondSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
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
  status: z.enum(['active', 'archived', 'pending']),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Bond = z.infer<typeof BondSchema>;

export const IdentitySchema = z.object({
  id: z.uuid(),
  email: z.email().or(z.literal('')),
  name: z.string().optional(),
  display_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  identity_state: z.string().optional(),
  activeBond: BondSchema.nullable().optional(),
  availableBonds: z.array(BondSchema),
});

export type Identity = z.infer<typeof IdentitySchema>;

export const FacetedProfileSchema = z.object({
  school_id: z.uuid().nullable().optional(),
  profile_completed: z.boolean().optional(),
  full_name: z.string().optional(),
  display_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  identity_state: z.string().optional(),
  email: z.email().or(z.literal('')).optional(),
  tenant_kind: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
});

export type FacetedProfile = z.infer<typeof FacetedProfileSchema>;
