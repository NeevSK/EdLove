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
  'staff',
  'member',
  'guest', // Wanderer
]);

export type Capacity = z.infer<typeof CapacitySchema>;
