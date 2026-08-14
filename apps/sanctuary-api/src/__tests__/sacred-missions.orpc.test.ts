import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: Sacred Missions', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const schoolId = '223e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-sacred-missions',
      user_id: userId,
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: 'principal',
      status: 'active',
    });
  });

  it('lists manifestos within the authenticated school scope', async () => {
    await expect(
      createTestORPCClient(headers).sacredMissions.list({ school_id: schoolId, limit: 50 }),
    ).resolves.toEqual([]);
  });

  it('creates a manifesto with server-derived creator and school scope', async () => {
    await expect(
      createTestORPCClient(headers).sacredMissions.create({
        school_id: schoolId,
        title: 'A shared intention',
        content: 'Build a kinder school together.',
        vibe: 'visionary',
      }),
    ).resolves.toMatchObject({
      school_id: schoolId,
      creator_id: userId,
      title: 'A shared intention',
    });
  });

  it('rejects unauthenticated Sacred Missions access', async () => {
    await expect(createTestORPCClient().sacredMissions.list({ limit: 50 })).rejects.toBeTruthy();
  });

  it('allows an authenticated user to endorse and remove an in-school manifesto', async () => {
    const client = createTestORPCClient(headers).sacredMissions;
    const manifestoId = 'd23e4567-e89b-12d3-a456-426614174000';
    await expect(client.endorse({ manifestoId, commitment_text: 'I will help.' })).resolves.toEqual(
      { success: true },
    );
    await expect(client.unendorse({ manifestoId })).resolves.toEqual({ success: true });
  });
});
