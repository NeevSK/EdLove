import { z } from 'zod';

export const CapacitySchema = z.enum([
  'student',
  'teacher',
  'gradeHead',
  'sectionHead',
  'principal',
  'assistantPrincipal',
  'parent',
  'guardian',
  'admin',
  'developer',
  'founder',
  'librarian',
  'nurse',
  'member',
]);

export type Capacity = z.infer<typeof CapacitySchema>;
