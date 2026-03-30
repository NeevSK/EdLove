import { z } from 'zod';

/**
 * UserSchema  Base entity for a user in the sanctuary.
 */
export const UserSchema = z.object({
    id: z.string().uuid(),
    full_name: z.string(),
    email: z.string().email().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
    authority: z.string().nullable().optional(), // POA Role
    roles: z.array(z.string()).default([]),
    school_id: z.string().uuid().nullable().optional(), // Added for tenancy healing
    created_at: z.string(),
    updated_at: z.string(),
    // Metadata
    metadata: z.record(z.string(), z.any()).optional(),
});

export type User = z.infer<typeof UserSchema>;
