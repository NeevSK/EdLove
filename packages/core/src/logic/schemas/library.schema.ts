import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

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

export type LibraryResource = z.infer<typeof LibraryResourceSchema>;
export type LibraryCollection = z.infer<typeof LibraryCollectionSchema>;
export type ResourceEngagement = z.infer<typeof ResourceEngagementSchema>;
