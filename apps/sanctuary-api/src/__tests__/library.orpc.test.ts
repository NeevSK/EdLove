import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

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
  });

  it('executes the native procedure and validates an explicit resource DTO list', async () => {
    const body = await createTestORPCClient(headers).library.getResources({ limit: 10, offset: 0 });

    expect(body).toEqual([]);
  });

  it('rejects malformed resource identifiers through oRPC input validation', async () => {
    await expect(createTestORPCClient(headers).library.getResource({ id: 'not-a-uuid' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('executes native collection reads with an explicit collection DTO', async () => {
    const body = await createTestORPCClient(headers).library.getCollections({ limit: 10, offset: 0 });

    expect(body).toEqual([]);
  });

  it('rejects malformed collection identifiers through oRPC input validation', async () => {
    await expect(createTestORPCClient(headers).library.getCollection({ id: 'not-a-uuid' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('derives library resource authorship from the authenticated context', async () => {
    const body = await createTestORPCClient(headers).library.createResource({
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
    });

    expect(body.title).toBe('Native Resource');
    expect(body.creator_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.creator_role).toBe('teacher');
  });

  it('creates collections through the native contract', async () => {
    const body = await createTestORPCClient(headers).library.createCollection({
      name: 'Native Collection',
      description: 'Created through oRPC',
      visibility: 'public',
      subjects: ['mathematics'],
      topics: [],
      grades: [5],
      resource_ids: [],
    });

    expect(body.name).toBe('Native Collection');
    expect(body.creator_id).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('records engagement through one transactional native procedure', async () => {
    const body = await createTestORPCClient(headers).library.engage({
      id: '923e4567-e89b-12d3-a456-426614174000',
      engagement_type: 'bookmark',
      toggle: true,
    });

    expect(body.resource_id).toBe('923e4567-e89b-12d3-a456-426614174000');
    expect(body.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(body.engagement_type).toBe('bookmark');
  });

  it('derives bookmarked-resource reads from the authenticated user', async () => {
    const body = await createTestORPCClient(headers).library.getBookmarkedResources({ limit: 10, offset: 0 });

    expect(body).toEqual([]);
  });
});
