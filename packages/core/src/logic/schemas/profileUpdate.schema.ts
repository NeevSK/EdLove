import { z } from 'zod';

const name = z.string().trim().min(1).max(200);

export const UserProfilePatchSchema = z.strictObject({
  display_name: name.optional(),
  full_name: name.optional(),
  first_name: z.string().trim().max(100).nullable().optional(),
  last_name: z.string().trim().max(100).nullable().optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,30}$/)
    .nullable()
    .optional(),
  avatar_url: z.url().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  capacity_label: z.string().trim().max(200).nullable().optional(),
  bio: z.string().max(10_000).nullable().optional(),
  index_number: z.string().trim().max(100).nullable().optional(),
  nic_number: z.string().trim().max(100).nullable().optional(),
  public_profile: z.boolean().optional(),
  experience_years: z.number().int().min(0).max(100).nullable().optional(),
  subjects_taught: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
  qualifications: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
});

export const CompleteProfileSchema = UserProfilePatchSchema.extend({ display_name: name });
export type UserProfilePatch = z.infer<typeof UserProfilePatchSchema>;
export interface ProfileCompletionDetails {
  displayName?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  capacityLabel?: string | null;
  bio?: string | null;
  indexNumber?: string | null;
  nicNumber?: string | null;
}

export function profileWriteData(patch: UserProfilePatch): UserProfilePatch {
  const displayName = patch.display_name ?? patch.full_name;
  return displayName ? { ...patch, display_name: displayName, full_name: displayName } : patch;
}
