import { z } from 'zod';
import {
  LibraryCollectionSchema,
  LibraryResourceSchema,
  ResourceEngagementSchema,
} from '../logic/schemas/library.schema';
import type { SovereignContract } from './contract';

const libraryAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Library' },
  }) as const;

/**
 * Library & Media Port (Sovereign RPC)
 * Framework-agnostic definition of the Library API.
 */
export const libraryContract = {
  getResources: {
    method: 'get',
    path: '/library/resources',
    request: {
      query: z.strictObject({
        type: z.string().optional(),
        subject: z.string().optional(),
        topic: z.string().optional(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        search: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(LibraryResourceSchema), description: 'Retrieve resources' },
    },
    metadata: libraryAuthority('read'),
  },

  getResource: {
    method: 'get',
    path: '/library/resources/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: { schema: LibraryResourceSchema, description: 'Retrieve single resource' },
    },
    metadata: libraryAuthority('read'),
  },

  searchLibrary: {
    method: 'post',
    path: '/library/resources/search',
    request: {
      body: z.strictObject({
        query: z.string(),
        embedding: z.array(z.number()).optional(),
        type: z.string().optional(),
        subject: z.string().optional(),
        limit: z.number().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(LibraryResourceSchema), description: 'Search library resources' },
    },
    metadata: libraryAuthority('read'),
  },

  engage: {
    method: 'post',
    path: '/library/resources/:id/engage',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z.strictObject({
        engagement_type: z.enum(['view', 'use', 'endorse', 'bookmark']),
        classroom_id: z.uuid().optional(),
      }),
    },
    responses: {
      200: { schema: ResourceEngagementSchema, description: 'Resource engagement recorded' },
    },
    metadata: libraryAuthority('create'),
  },

  getCollections: {
    method: 'get',
    path: '/library/collections',
    request: {
      query: z.strictObject({
        creator_id: z.uuid().optional(),
        subject: z.string().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(LibraryCollectionSchema), description: 'Retrieve collections' },
    },
    metadata: libraryAuthority('read'),
  },

  getCollection: {
    method: 'get',
    path: '/library/collections/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: { schema: LibraryCollectionSchema, description: 'Retrieve single collection' },
    },
    metadata: libraryAuthority('read'),
  },
} as const satisfies SovereignContract;
