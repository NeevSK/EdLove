/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from identity.schema.json
 */

import { z } from 'zod';

export const IdentitySchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: z.string(),
  name: z.string().optional(),
});

export type Identity = z.infer<typeof IdentitySchema>;

export const FacetedProfileSchema = z.object({
  school_id: z.uuid().nullable().optional(),
  profile_completed: z.boolean().optional(),
  role: z.string().optional(),
  full_name: z.string().optional(),
  email: z.email().optional(),
  platform_roles: z.array(z.string()).optional(),
  school_role: z.string().optional(),
  work_roles: z.array(z.string()).optional(),
  tenant_kind: z.string().optional(),
});

export type FacetedProfile = z.infer<typeof FacetedProfileSchema>;

