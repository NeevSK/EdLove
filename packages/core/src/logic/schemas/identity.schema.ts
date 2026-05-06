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
  id: z.string(),
  userId: z.string(),
  entityId: z.string(),
  entityType: z.enum(['PLATFORM', 'SCHOOL', 'CLASSROOM', 'COMMUNITY']),
  capacity: CapacitySchema,
  status: z.enum(['active', 'archived', 'pending']).default('active'),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const PerspectiveSchema = z.object({
  activeBond: BondSchema,
  availableBonds: z.array(BondSchema),
});
