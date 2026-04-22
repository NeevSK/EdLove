import { createSchemaFactory } from '@zenstackhq/zod';
import { schema } from './schema';

/**
 * Sovereign Zod Factory
 * Derived from ZenStack ZModel (Sovereign Core SSOT)
 */
export const factory = createSchemaFactory(schema);

// --- Model Schemas ---
export const ZModelSchemas = {
  User: factory.makeModelSchema('User'),
  Classroom: factory.makeModelSchema('Classroom'),
  Assignment: factory.makeModelSchema('Assignment'),
  Grade: factory.makeModelSchema('Grade'),
  Post: factory.makeModelSchema('Post'),
  Group: factory.makeModelSchema('Group'),
  Lesson: factory.makeModelSchema('Lesson'),
  School: factory.makeModelSchema('School'),
  StudentProfile: factory.makeModelSchema('StudentProfile'),
  TeacherProfile: factory.makeModelSchema('TeacherProfile'),
  Section: factory.makeModelSchema('Section'),
  GradeLevel: factory.makeModelSchema('GradeLevel'),
};

// --- CRUD Options ---
export const ZCreateSchemas = {
  User: factory.makeModelCreateSchema('User'),
  Classroom: factory.makeModelCreateSchema('Classroom'),
};

export const ZUpdateSchemas = {
  User: factory.makeModelUpdateSchema('User'),
  Classroom: factory.makeModelUpdateSchema('Classroom'),
};
