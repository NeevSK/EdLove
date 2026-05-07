/**
 * @repo/schema - The Sovereign Brain of the Polymath Platform.
 * 
 * This package is a dependency-free Shared Kernel (L0) that exports
 * the ORM metadata and Zod validation factories.
 */

// ORM Metadata
export { schema } from './generated/orm/schema';

// Model Types
export * from './generated/orm/models';

// Input Types
export * from './generated/orm/input';

// Zod Factory - Derivative of the Schema
import { createSchemaFactory } from '@zenstackhq/zod';
import { schema } from './generated/orm/schema';

const factory = createSchemaFactory(schema);
export const makeModelSchema = factory.makeModelSchema.bind(factory);
export const makeTypeSchema = factory.makeTypeSchema.bind(factory);
export const makeEnumSchema = factory.makeEnumSchema.bind(factory);
