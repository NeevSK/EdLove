import { createSchemaFactory } from '@zenstackhq/zod';

import { schema } from '../schema';

export const zodSchemaFactory = createSchemaFactory(schema);

export const makeModelSchema = zodSchemaFactory.makeModelSchema.bind(zodSchemaFactory);
export const makeModelCreateSchema = zodSchemaFactory.makeModelCreateSchema.bind(zodSchemaFactory);
export const makeModelUpdateSchema = zodSchemaFactory.makeModelUpdateSchema.bind(zodSchemaFactory);
export const makeTypeSchema = zodSchemaFactory.makeTypeSchema.bind(zodSchemaFactory);
export const makeEnumSchema = zodSchemaFactory.makeEnumSchema.bind(zodSchemaFactory);

export { createSchemaFactory };

