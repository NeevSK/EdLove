import { z } from 'zod';

export const RoleSchema = z.enum([
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
  'guest', // Wanderer
]);

export type Role = z.infer<typeof RoleSchema>;
