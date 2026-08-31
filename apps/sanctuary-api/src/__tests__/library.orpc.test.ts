import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLibraryCollectionFindManyArgs,
  setMockActiveBond,
  setMockClassroomRelationships,
  setMockLibraryCollections,
  setMockLibraryTemporalRead,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: library via native oRPC', () => {
  const headers = { Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000' };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-library',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockLibraryTemporalRead({ collection: null, resources: [], events: [] });
    setMockLibraryCollections([]);
    setMockClassroomRelationships({
      classrooms: [
        {
          id: 'a23e4567-e89b-12d3-a456-426614174000',
          school_id: 'school-123',
          teacher_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      ],
    });
  });

  it('executes the native procedure and validates an explicit resource DTO list', async () => {
    const body = await createTestORPCClient(headers).library.getResources({
      query: { limit: 10, offset: 0 },
    });

    expect(body).toEqual([]);
  });

  it('executes server-owned library search with typed filters', async () => {
    const body = await createTestORPCClient(headers).library.searchLibrary({
      body: { query: 'fractions', type: 'lesson', subject: 'mathematics', limit: 10 },
    });

    expect(body).toEqual([]);
  });

  it('rejects malformed resource identifiers through oRPC input validation', async () => {
    await expect(
      createTestORPCClient(headers).library.getResource({ params: { id: 'not-a-uuid' } }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects legacy flattened resource-search envelopes', async () => {
    await expect(
      createTestORPCClient(headers).library.searchLibrary({ query: 'fractions' } as never),
    ).rejects.toBeTruthy();
  });

  it('executes native collection reads with an explicit collection DTO', async () => {
    const body = await createTestORPCClient(headers).library.getCollections({
      query: { limit: 10, offset: 0 },
    });

    expect(body).toEqual([]);
  });

  it('applies visibility, grade, search, and pagination filters on the server', async () => {
    setMockLibraryCollections([
      {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        name: 'Mathematics Collection',
        description: 'Grade five resources',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
        visibility: 'public',
        subjects: ['mathematics'],
        topics: [],
        grades: [5],
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        collection_nodes: [],
      },
    ]);
    const body = await createTestORPCClient(headers).library.getCollections({
      query: { visibility: 'public', grades: '5', search: 'Mathematics', limit: 1, offset: 0 },
    });

    expect(body).toHaveLength(1);
    expect(getMockLibraryCollectionFindManyArgs().where.visibility).toBe('public');
    expect(getMockLibraryCollectionFindManyArgs().where.grades).toEqual({ hasSome: [5] });
  });

  it('reconstructs collection membership for temporal collection listings', async () => {
    const resource = {
      id: '923e4567-e89b-12d3-a456-426614174000',
      title: 'Historical Listing Resource',
      type: 'lesson',
      format: 'text',
      subjects: ['mathematics'],
      topics: [],
      grades: [5],
      language: [],
      visibility: 'public',
      creator_id: '123e4567-e89b-12d3-a456-426614174000',
      creator_role: 'teacher',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
      creator: { full_name: 'Mock User', avatar_url: null },
    };
    setMockLibraryCollections([
      {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        name: 'Historical Listing',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
        visibility: 'public',
        subjects: ['mathematics'],
        topics: [],
        grades: [5],
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        creator: { full_name: 'Mock User', avatar_url: null },
        collection_nodes: [],
      },
    ]);
    setMockLibraryTemporalRead({
      collection: null,
      resources: [resource],
      events: [
        {
          id: 'b23e4567-e89b-12d3-a456-426614174000',
          collection_id: 'a23e4567-e89b-12d3-a456-426614174000',
          node_id: resource.id,
          event_type: 'added',
          position: 0,
          occurred_at: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    });

    const body = await createTestORPCClient(headers).library.getCollections({
      query: { view_date: '2026-01-03T00:00:00.000Z' },
    });

    expect(body[0].resources?.map((item) => item.id)).toEqual([resource.id]);
  });

  it('rejects malformed collection identifiers through oRPC input validation', async () => {
    await expect(
      createTestORPCClient(headers).library.getCollection({
        params: { id: 'not-a-uuid' },
        query: {},
      }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('preserves dynamic subject collections as a server-owned read mode', async () => {
    const body = await createTestORPCClient(headers).library.getCollection({
      params: { id: 'subject:mathematics' },
      query: {},
    });

    expect(body.id).toBe('subject:mathematics');
    expect(body.is_virtual).toBe(true);
    expect(body.subjects).toEqual(['mathematics']);
  });

  it('reconstructs explicit collection membership at the requested historical cutoff', async () => {
    const firstResource = {
      id: '923e4567-e89b-12d3-a456-426614174000',
      title: 'Historical Resource',
      type: 'lesson',
      format: 'text',
      subjects: [],
      topics: [],
      grades: [],
      language: [],
      visibility: 'public',
      creator_id: '123e4567-e89b-12d3-a456-426614174000',
      creator_role: 'teacher',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
      creator: { full_name: 'Mock User', avatar_url: null },
    };
    setMockLibraryTemporalRead({
      collection: {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        name: 'Historical Collection',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
        visibility: 'public',
        subjects: [],
        topics: [],
        grades: [],
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        creator: { full_name: 'Mock User', avatar_url: null },
      },
      resources: [firstResource],
      events: [
        {
          id: 'b23e4567-e89b-12d3-a456-426614174000',
          collection_id: 'a23e4567-e89b-12d3-a456-426614174000',
          node_id: firstResource.id,
          event_type: 'added',
          position: 0,
          occurred_at: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    });

    const body = await createTestORPCClient(headers).library.getCollection({
      params: { id: 'a23e4567-e89b-12d3-a456-426614174000' },
      query: { view_date: '2026-01-03T00:00:00.000Z' },
    });

    expect(body.resources?.map((resource) => resource.id)).toEqual([firstResource.id]);
  });

  it('rejects empty resource lifecycle updates at the contract boundary', async () => {
    await expect(
      createTestORPCClient(headers).library.updateResource({
        params: { id: '923e4567-e89b-12d3-a456-426614174000' },
        body: {},
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('does not allow ordinary school capacity to verify resources', async () => {
    await expect(
      createTestORPCClient(headers).library.verifyResource({
        params: { id: '923e4567-e89b-12d3-a456-426614174000' },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('derives library resource authorship from the authenticated context', async () => {
    const body = await createTestORPCClient(headers).library.createResource({
      body: {
        title: 'Native Resource',
        description: 'Created through oRPC',
        type: 'lesson',
        format: 'text',
        subjects: ['mathematics'],
        topics: [],
        grades: [5],
        difficulty: 'beginner',
        language: ['english'],
        visibility: 'public',
        is_community: true,
      },
    });

    expect(body.title).toBe('Native Resource');
    expect(body.creator_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.creator_role).toBe('teacher');
  });

  it('creates collections through the native contract', async () => {
    const body = await createTestORPCClient(headers).library.createCollection({
      body: {
        name: 'Native Collection',
        description: 'Created through oRPC',
        visibility: 'public',
        subjects: ['mathematics'],
        topics: [],
        grades: [5],
        resource_ids: [],
      },
    });

    expect(body.name).toBe('Native Collection');
    expect(body.creator_id).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('makes collection membership writes retry-safe and actor-owned', async () => {
    setMockLibraryTemporalRead({
      collection: {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
      },
      resources: [],
      events: [],
    });
    const body = await createTestORPCClient(headers).library.addToCollection({
      params: { id: 'a23e4567-e89b-12d3-a456-426614174000' },
      body: { resource_id: '923e4567-e89b-12d3-a456-426614174000' },
    });

    expect(body).toEqual({ success: true });
  });

  it('protects collection lifecycle mutations with creator ownership', async () => {
    setMockLibraryTemporalRead({
      collection: {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
      },
      resources: [],
      events: [],
    });
    const client = createTestORPCClient(headers);

    expect(
      await client.library.updateCollection({
        params: { id: 'a23e4567-e89b-12d3-a456-426614174000' },
        body: { name: 'Renamed Collection' },
      }),
    ).toMatchObject({ name: 'Renamed Collection' });
    expect(
      await client.library.removeFromCollection({
        params: {
          id: 'a23e4567-e89b-12d3-a456-426614174000',
          resourceId: '923e4567-e89b-12d3-a456-426614174000',
        },
      }),
    ).toEqual({ success: true });
    await expect(
      client.library.deleteCollection({
        params: { id: 'a23e4567-e89b-12d3-a456-426614174000' },
      }),
    ).resolves.toEqual({ success: true });
  });

  it('rejects collection lifecycle mutations for another creator', async () => {
    setMockLibraryTemporalRead({
      collection: {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        creator_id: '223e4567-e89b-12d3-a456-426614174000',
      },
      resources: [],
      events: [],
    });
    await expect(
      createTestORPCClient(headers).library.updateCollection({
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        name: 'Unauthorized',
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('forks a visible collection through a server transaction and derives the new actor', async () => {
    setMockLibraryTemporalRead({
      collection: {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        name: 'Shared Collection',
        description: 'A source collection',
        creator_id: '223e4567-e89b-12d3-a456-426614174000',
        visibility: 'public',
        subjects: ['mathematics'],
        topics: [],
        grades: [5],
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        creator: { full_name: 'Source User', avatar_url: null },
      },
      resources: [],
      events: [],
    });

    const body = await createTestORPCClient(headers).library.forkCollection({
      params: { id: 'a23e4567-e89b-12d3-a456-426614174000' },
    });

    expect(body.name).toBe('Shared Collection (Fork)');
    expect(body.creator_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.visibility).toBe('private');
  });

  it('records engagement through one transactional native procedure', async () => {
    const body = await createTestORPCClient(headers).library.engage({
      params: { id: '923e4567-e89b-12d3-a456-426614174000' },
      body: { engagement_type: 'bookmark', toggle: true },
    });

    expect(body.resource_id).toBe('923e4567-e89b-12d3-a456-426614174000');
    expect(body.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.engagement_type).toBe('bookmark');
  });

  it('accepts server-owned use engagement without trusting a supplied actor', async () => {
    const body = await createTestORPCClient(headers).library.engage({
      params: { id: '923e4567-e89b-12d3-a456-426614174000' },
      body: {
        engagement_type: 'use',
        classroom_id: 'a23e4567-e89b-12d3-a456-426614174000',
      },
    });

    expect(body.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.engagement_type).toBe('use');
    expect(body.classroom_id).toBe('a23e4567-e89b-12d3-a456-426614174000');
  });

  it('rejects engagement attributed to an unauthorized classroom', async () => {
    await expect(
      createTestORPCClient(headers).library.engage({
        params: { id: '923e4567-e89b-12d3-a456-426614174000' },
        body: {
          engagement_type: 'use',
          classroom_id: 'b23e4567-e89b-12d3-a456-426614174000',
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('derives bookmarked-resource reads from the authenticated user', async () => {
    const body = await createTestORPCClient(headers).library.getBookmarkedResources({
      query: { limit: 10, offset: 0 },
    });

    expect(body).toEqual([]);
  });

  it('returns the public Library topology through Sanctuary', async () => {
    const body = await createTestORPCClient(headers).library.getMapTopology({ query: {} });

    expect(body).toEqual({ nodes: [], links: [] });
  });
});
