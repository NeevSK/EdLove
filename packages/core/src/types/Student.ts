import { z } from 'zod';

// Keep the bulk interface for now if not yet schema-tized, or derive it.
export const BulkStudentSchema = z.object({
  name: z.string(),
  index_number: z.string(),
  notes: z.string(),
});

export type BulkStudent = z.infer<typeof BulkStudentSchema>;
