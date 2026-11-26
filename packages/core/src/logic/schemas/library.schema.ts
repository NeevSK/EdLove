import { makeModelSchema } from '@repo/schema';
import type { z } from 'zod';

/**
 * LibraryResourceSchema - A node of knowledge in the library.
 * Derived from ZenStack LibraryResource model.
 */
export const LibraryResourceSchema = makeModelSchema('LibraryResource');

/**
 * LibraryCollectionSchema - A curated set of resources.
 * Derived from ZenStack LibraryCollection model.
 */
export const LibraryCollectionSchema = makeModelSchema('LibraryCollection');

/**
 * ResourceEngagementSchema - An interaction with a resource.
 * Derived from ZenStack ResourceEngagement model.
 */
export const ResourceEngagementSchema = makeModelSchema('ResourceEngagement');

/** Database rows (ZenStack models). The domain shapes live in types/Library.ts. */
export type LibraryResourceRow = z.infer<typeof LibraryResourceSchema>;
export type LibraryCollectionRow = z.infer<typeof LibraryCollectionSchema>;
export type ResourceEngagementRow = z.infer<typeof ResourceEngagementSchema>;
