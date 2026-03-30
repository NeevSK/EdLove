import { z } from 'zod';

/**
 * StudentSchema  A learner in the sanctuary.
 */
export const StudentSchema = z.object({
    id: z.string().uuid(),
    class_id: z.string().uuid(),
    student_id: z.string().uuid().nullable().optional(),
    full_name: z.string(),
    roll_number: z.string().nullable().optional(),
    index_number: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    parent_phone: z.string().nullable().optional(),
    guardian_name: z.string().nullable().optional(),
    is_claimed: z.boolean().nullable().optional(),
    invite_code: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Student = z.infer<typeof StudentSchema>;
export type ClassroomStudent = Student;
