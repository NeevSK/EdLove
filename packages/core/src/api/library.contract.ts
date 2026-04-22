import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import {
  LibraryCollectionSchema,
  LibraryResourceSchema,
  ResourceEngagementSchema,
} from './schemas/library.schema';

const c = initContract();

const authority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Library' } });

export const libraryContract = c.router({
  getResources: {
    method: 'GET',
    path: '/library/resources',
    query: z.object({
      type: z.string().optional(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
      search: z.string().optional(),
    }),
    responses: { 200: z.array(LibraryResourceSchema) },
    metadata: authority('read'),
  },
  searchMapUniverse: {
    method: 'GET',
    path: '/library/map/search',
    query: z.object({ query: z.string(), limit: z.coerce.number().optional() }),
    responses: { 200: z.array(z.any()) },
    metadata: authority('read'),
  },
  searchResourcesLocal: {
    method: 'GET',
    path: '/library/resources/search-local',
    query: z.object({ query: z.string(), limit: z.coerce.number().optional() }),
    responses: { 200: z.array(LibraryResourceSchema) },
    metadata: authority('read'),
  },
  searchLibrary: {
    method: 'POST',
    path: '/library/resources/search',
    body: z.object({
      query: z.string(),
      embedding: z.array(z.number()).optional(),
      type: z.string().optional(),
      subject: z.string().optional(),
      limit: z.number().optional(),
    }),
    responses: { 200: z.array(LibraryResourceSchema) },
    metadata: authority('read'),
  },
  getResource: {
    method: 'GET',
    path: '/library/resources/:id',
    responses: { 200: LibraryResourceSchema },
    metadata: authority('read'),
  },
  createResource: {
    method: 'POST',
    path: '/library/resources',
    body: z.record(z.string(), z.any()),
    responses: { 201: LibraryResourceSchema },
    metadata: authority('create'),
  },
  updateResource: {
    method: 'PATCH',
    path: '/library/resources/:id',
    body: z.record(z.string(), z.any()),
    responses: { 200: LibraryResourceSchema },
    metadata: authority('update'),
  },
  deleteResource: {
    method: 'DELETE',
    path: '/library/resources/:id',
    responses: { 204: z.void() },
    metadata: authority('delete'),
  },
  engage: {
    method: 'POST',
    path: '/library/resources/:id/engage',
    body: z.object({
      engagement_type: z.enum(['view', 'use', 'endorse', 'bookmark']),
      classroom_id: z.string().optional(),
    }),
    responses: { 200: ResourceEngagementSchema.or(z.any()) },
    metadata: authority('create'),
  },
  verifyResource: {
    method: 'POST',
    path: '/library/resources/:id/verify',
    body: z.object({ verified_by: z.string() }),
    responses: { 200: LibraryResourceSchema },
    metadata: authority('update'),
  },
  getBookmarkedResources: {
    method: 'GET',
    path: '/library/resources/bookmarks',
    query: z.object({ user_id: z.string() }),
    responses: { 200: z.array(LibraryResourceSchema) },
    metadata: authority('read'),
  },

  getCollections: {
    method: 'GET',
    path: '/library/collections',
    query: z.object({
      creator_id: z.string().optional(),
      subject: z.string().optional(),
      search: z.string().optional(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    }),
    responses: { 200: z.array(LibraryCollectionSchema) },
    metadata: authority('read'),
  },
  getCollection: {
    method: 'GET',
    path: '/library/collections/:id',
    responses: { 200: LibraryCollectionSchema },
    metadata: authority('read'),
  },
  createCollection: {
    method: 'POST',
    path: '/library/collections',
    body: z.record(z.string(), z.any()),
    responses: { 201: LibraryCollectionSchema },
    metadata: authority('create'),
  },
  addToCollection: {
    method: 'POST',
    path: '/library/collections/:collectionId/resources',
    body: z.object({ node_id: z.string() }),
    responses: { 201: z.object({ ok: z.boolean() }) },
    metadata: authority('update'),
  },
  removeFromCollection: {
    method: 'DELETE',
    path: '/library/collections/:collectionId/resources/:resourceId',
    responses: { 204: z.void() },
    metadata: authority('update'),
  },
  updateCollection: {
    method: 'PATCH',
    path: '/library/collections/:id',
    body: z.record(z.string(), z.any()),
    responses: { 200: LibraryCollectionSchema },
    metadata: authority('update'),
  },
  forkCollection: {
    method: 'POST',
    path: '/library/collections/:collectionId/fork',
    body: z.object({ user_id: z.string() }),
    responses: { 201: LibraryCollectionSchema },
    metadata: authority('create'),
  },
  deleteCollection: {
    method: 'DELETE',
    path: '/library/collections/:id',
    responses: { 204: z.void() },
    metadata: authority('delete'),
  },

  getMapTopology: {
    method: 'GET',
    path: '/library/map/topology',
    responses: { 200: z.any() },
    metadata: authority('read'),
  },
  reportBrokenLink: {
    method: 'POST',
    path: '/library/resources/:id/report-broken-link',
    body: z.object({}),
    responses: { 200: z.object({ ok: z.boolean() }).or(z.any()) },
    metadata: authority('update'),
  },
  getResonantKnowledge: {
    method: 'GET',
    path: '/library/resources/:id/resonance',
    responses: { 200: z.array(z.any()) },
    metadata: authority('read'),
  },
  getGeoTopology: {
    method: 'GET',
    path: '/library/geo/topology',
    responses: { 200: z.any() },
    metadata: authority('read'),
  },
});
