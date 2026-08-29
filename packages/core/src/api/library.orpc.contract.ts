import { z } from 'zod';
import { KnowledgeTopologySchema } from '@repo/core/logic/schemas/dashboard.schema';
import {
  LibraryCollectionSchema,
  LibraryResourceSchema,
  ResourceEngagementSchema,
} from '@repo/core/logic/schemas/library.schema';

const collectionIdSchema = z.union([z.uuid(), z.string().regex(/^(subject|topic):.+$/)]);
const libraryAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Library' },
  }) as const;

export const libraryORPCContract = {
  getCounts: {
    method: 'get',
    path: '/library/counts',
    request: { query: z.object({}) },
    responses: {
      200: { schema: z.object({ resource_count: z.number(), collection_count: z.number() }), description: 'Retrieve Library resource and collection counts' },
    },
    metadata: libraryAuthority('read'),
  },

  getResources: {
    method: 'get',
    path: '/library/resources',
    request: {
      query: z.object({
        type: z.string().optional(),
        subject: z.string().optional(),
        topic: z.string().optional(),
        subjects: z.string().optional(),
        topics: z.string().optional(),
        grades: z.string().optional(),
        difficulty: z.string().optional(),
        languages: z.string().optional(),
        visibility: z.string().optional(),
        source: z.enum(['core', 'community']).optional(),
        verified_only: z.coerce.boolean().optional(),
        tags: z.string().optional(),
        sort_by: z.enum(['recent', 'popular', 'most_used', 'most_endorsed', 'most_bookmarked']).optional(),
        view_date: z.string().datetime().optional(),
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
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: LibraryResourceSchema, description: 'Retrieve single resource' },
    },
    metadata: libraryAuthority('read'),
  },

  searchLibrary: {
    method: 'post',
    path: '/library/resources/search',
    request: {
      body: z.object({
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

  getBookmarkedResources: {
    method: 'get',
    path: '/library/resources/bookmarked',
    request: {
      query: z.object({
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        view_date: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(LibraryResourceSchema), description: 'Retrieve bookmarked resources' },
    },
    metadata: libraryAuthority('read'),
  },

  createResource: {
    method: 'post',
    path: '/library/resources',
    request: {
      body: z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        type: z.string().min(1),
        format: z.string().min(1),
        url: z.string().nullable().optional(),
        file_path: z.string().nullable().optional(),
        subjects: z.array(z.string()),
        topics: z.array(z.string()),
        grades: z.array(z.number().int()),
        difficulty: z.string().nullable().optional(),
        language: z.array(z.string()),
        visibility: z.string(),
        is_community: z.boolean(),
      }),
    },
    responses: {
      200: { schema: LibraryResourceSchema, description: 'Create a library resource' },
    },
    metadata: libraryAuthority('create'),
  },

  updateResource: {
    method: 'put',
    path: '/library/resources/:id',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        type: z.string().min(1).optional(),
        format: z.string().min(1).optional(),
        url: z.string().nullable().optional(),
        file_path: z.string().nullable().optional(),
        subjects: z.array(z.string()).optional(),
        topics: z.array(z.string()).optional(),
        grades: z.array(z.number().int()).optional(),
        difficulty: z.string().nullable().optional(),
        language: z.array(z.string()).optional(),
        visibility: z.string().optional(),
        tags: z.array(z.string()).optional(),
        thumbnail_url: z.string().nullable().optional(),
        copyright_notice: z.string().nullable().optional(),
      }).refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
    },
    responses: {
      200: { schema: LibraryResourceSchema, description: 'Update a library resource' },
    },
    metadata: libraryAuthority('update'),
  },

  deleteResource: {
    method: 'delete',
    path: '/library/resources/:id',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Delete a library resource' },
    },
    metadata: libraryAuthority('delete'),
  },

  verifyResource: {
    method: 'post',
    path: '/library/resources/:id/verify',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: LibraryResourceSchema, description: 'Verify a library resource' },
    },
    metadata: libraryAuthority('update'),
  },

  reportBrokenLink: {
    method: 'post',
    path: '/library/resources/:id/broken-link',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Record a failed resource link check' },
    },
    metadata: libraryAuthority('update'),
  },

  engage: {
    method: 'post',
    path: '/library/resources/:id/engage',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({
        engagement_type: z.enum(['view', 'use', 'endorse', 'bookmark']),
        classroom_id: z.uuid().optional(),
        toggle: z.boolean().optional(),
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
      query: z.object({
        creator_id: z.uuid().optional(),
        subject: z.string().optional(),
        search: z.string().optional(),
        visibility: z.string().optional(),
        grades: z.string().optional(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        only_virtual: z.coerce.boolean().optional(),
        exclude_virtual: z.coerce.boolean().optional(),
        view_date: z.string().datetime().optional(),
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
      params: z.object({ id: collectionIdSchema }),
      query: z.object({ view_date: z.string().datetime().optional() }),
    },
    responses: {
      200: { schema: LibraryCollectionSchema, description: 'Retrieve single collection' },
    },
    metadata: libraryAuthority('read'),
  },

  getMapTopology: {
    method: 'get',
    path: '/library/map/topology',
    request: { query: z.object({}) },
    responses: {
      200: { schema: KnowledgeTopologySchema, description: 'Retrieve the public Library knowledge graph' },
    },
    metadata: libraryAuthority('read'),
  },

  createCollection: {
    method: 'post',
    path: '/library/collections',
    request: {
      body: z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        visibility: z.string(),
        subjects: z.array(z.string()),
        topics: z.array(z.string()),
        grades: z.array(z.number().int()),
        resource_ids: z.array(z.uuid()),
      }),
    },
    responses: {
      200: { schema: LibraryCollectionSchema, description: 'Create a library collection' },
    },
    metadata: libraryAuthority('create'),
  },

  addToCollection: {
    method: 'post',
    path: '/library/collections/:id/resources',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({ resource_id: z.uuid() }),
    },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Add a resource to a collection' },
    },
    metadata: libraryAuthority('create'),
  },

  removeFromCollection: {
    method: 'delete',
    path: '/library/collections/:id/resources/:resourceId',
    request: { params: z.object({ id: z.uuid(), resourceId: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Remove a resource from a collection' },
    },
    metadata: libraryAuthority('delete'),
  },

  updateCollection: {
    method: 'put',
    path: '/library/collections/:id',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        visibility: z.string().optional(),
        subjects: z.array(z.string()).optional(),
        topics: z.array(z.string()).optional(),
        grades: z.array(z.number().int()).optional(),
      }).refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
    },
    responses: {
      200: { schema: LibraryCollectionSchema, description: 'Update a library collection' },
    },
    metadata: libraryAuthority('update'),
  },

  deleteCollection: {
    method: 'delete',
    path: '/library/collections/:id',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Delete a library collection' },
    },
    metadata: libraryAuthority('delete'),
  },

  forkCollection: {
    method: 'post',
    path: '/library/collections/:id/fork',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: LibraryCollectionSchema, description: 'Fork a library collection' },
    },
    metadata: libraryAuthority('create'),
  },
};

export type LibraryCollection = z.infer<typeof LibraryCollectionSchema>;
export type LibraryResource = z.infer<typeof LibraryResourceSchema>;
export type ResourceEngagement = z.infer<typeof ResourceEngagementSchema>;