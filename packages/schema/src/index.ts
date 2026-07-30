/**
 * @repo/schema - The Sovereign Brain of the Polymath Platform.
 *
 * This package is a dependency-free Shared Kernel (L0) that exports
 * the ORM metadata and Zod validation factories.
 */

// Input Types
export * from '@repo/schema/generated/orm/input';

// Model Types
export * from '@repo/schema/generated/orm/models';
// ORM Metadata
export { schema } from '@repo/schema/generated/orm/schema';

// Zod Factory - Derivative of the Schema
import { createSchemaFactory } from '@zenstackhq/zod';
import { schema } from '@repo/schema/generated/orm/schema';

const factory = createSchemaFactory(schema);
export const makeModelSchema = factory.makeModelSchema.bind(factory);
export const makeTypeSchema = factory.makeTypeSchema.bind(factory);
export const makeEnumSchema = factory.makeEnumSchema.bind(factory);
