import { z } from 'zod';
import type { StudentSchema } from '../logic/schemas/student.schema';

/**
 * Student - Authoritative domain type.
 * Derived from StudentSchema in logic/schemas.
 */
export type Student = z.infer<typeof StudentSchema>;

// Keep the bulk interface for now if not yet schema-tized, or derive it.
export const BulkStudentSchema = z.object({
  name: z.string(),
  index_number: z.string(),
  notes: z.string(),
});

export type BulkStudent = z.infer<typeof BulkStudentSchema>;
