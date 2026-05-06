/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from identity.schema.json
 */

import { z } from 'zod';

export const IdentitySchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().optional(),
});

export type Identity = z.infer<typeof IdentitySchema>;

export const FacetedProfileSchema = z.object({
  school_id: z.uuid().nullable().optional(),
  profile_completed: z.boolean().optional(),
  full_name: z.string().optional(),
  email: z.email().optional(),
  tenant_kind: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
});

export type FacetedProfile = z.infer<typeof FacetedProfileSchema>;

