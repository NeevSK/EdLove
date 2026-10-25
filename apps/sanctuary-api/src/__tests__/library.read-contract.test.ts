import {
  LibraryCollectionReadSchema,
  LibraryResourceReadSchema,
} from '@repo/core/api/library.orpc.contract';
import { describe, expect, it } from 'vitest';

const resource = {
  id: '923e4567-e89b-12d3-a456-426614174000',
  title: 'Fractions',
  type: 'lesson',
  format: 'text',
  subjects: ['mathematics'],
  topics: [],
  grades: [5],
  language: ['english'],
  visibility: 'public',
  creator_id: '123e4567-e89b-8101-8000-426614174000',
  creator_role: 'teacher',
  verified: false,
  is_community: true,
  tags: [],
  views: 0,
  uses_count: 0,
  endorsements: 0,
  bookmarks: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  creator_name: 'Teacher',
  creator_avatar_url: null,
};

const collection = {
  id: 'a23e4567-e89b-12d3-a456-426614174000',
  name: 'Fractions',
  creator_id: '123e4567-e89b-8101-8000-426614174000',
  visibility: 'public',
  subjects: ['mathematics'],
  topics: [],
  grades: [5],
  resource_ids: [resource.id],
  sequence_order: [0],
  is_official: false,
  forks: 0,
  used_by_count: 0,
  endorsements: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  creator_name: 'Teacher',
  creator_avatar_url: null,
  nodes: [resource],
  resources: [resource],
};

describe('library read output contracts', () => {
  it('accepts nested resource DTOs and rejects unknown nested resource fields', () => {
    expect(LibraryResourceReadSchema.safeParse(resource).success).toBe(true);
    expect(
      LibraryCollectionReadSchema.safeParse({
        ...collection,
        resources: [{ ...resource, internal_note: 'not part of the DTO' }],
      }).success,
    ).toBe(false);
  });

  it('rejects unknown collection output keys', () => {
    expect(
      LibraryCollectionReadSchema.safeParse({ ...collection, compatibility_alias: true }).success,
    ).toBe(false);
  });

  it('distinguishes persistent and virtual collection identities', () => {
    expect(LibraryCollectionReadSchema.safeParse(collection).success).toBe(true);
    expect(
      LibraryCollectionReadSchema.safeParse({
        ...collection,
        id: 'subject:mathematics',
        creator_id: 'system',
        is_virtual: true,
      }).success,
    ).toBe(true);
    expect(
      LibraryCollectionReadSchema.safeParse({
        ...collection,
        id: 'subject:mathematics',
        creator_id: 'system',
      }).success,
    ).toBe(false);
    expect(LibraryCollectionReadSchema.safeParse({ ...collection, is_virtual: true }).success).toBe(
      false,
    );
    expect(
      LibraryCollectionReadSchema.safeParse({
        ...collection,
        id: 'virtual:mathematics',
        creator_id: 'system',
        is_virtual: true,
      }).success,
    ).toBe(false);
  });
});
