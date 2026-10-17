import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('events API: sovereign Inngest relay', () => {
  it('dispatches a well-formed platform event and returns success', async () => {
    const client = createTestORPCClient();
    const result = await client.events.dispatch({
      body: {
        name: 'wellbeing/mood.logged',
        data: {
          studentId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          moodScore: 4,
        },
      },
    });

    expect(result).toEqual({
      success: true,
      event: 'wellbeing/mood.logged',
    });
  });

  it('rejects an empty event name at the contract boundary', async () => {
    const client = createTestORPCClient();
    await expect(
      client.events.dispatch({
        body: {
          name: '',
          data: {},
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
