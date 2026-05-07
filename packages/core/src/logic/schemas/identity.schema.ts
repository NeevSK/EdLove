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
  entity_type: z.enum(['PLATFORM', 'SCHOOL', 'CLASSROOM', 'COMMUNITY', 'PERSONAL', 'GUEST']),
  capacity: CapacitySchema,
  status: z.enum(['active', 'archived', 'pending']).default('active'),
  created_at: z.coerce.date().transform(d => d.toISOString()).optional(),
  updated_at: z.coerce.date().transform(d => d.toISOString()).optional(),
  valid_from: z.coerce.date().transform(d => d.toISOString()).optional(),
  valid_until: z.coerce.date().transform(d => d.toISOString()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}).catchall(z.unknown());

export type Bond = z.infer<typeof BondSchema>;

export const PerspectiveSchema = z.object({
  active_bond: BondSchema,
  available_bonds: z.array(BondSchema),
});
