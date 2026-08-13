import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

/**
 * StudentSchema - A learner in the sanctuary.
 * Derived from ZenStack ClassroomStudent model ( Enrollment context ).
 */
export const StudentSchema = makeModelSchema('ClassroomStudent').extend({
  full_name: z.string(), // Joined from User
  roll_number: z.number().nullable().optional(),
  is_claimed: z.boolean().nullable().optional(),
  invite_code: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  updated_at: z.coerce.date().optional(),
});

export type Student = z.infer<typeof StudentSchema>;
