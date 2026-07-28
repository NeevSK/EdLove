import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { fromSupabase, runEffect } from '../effect';

describe('Effect boundaries', () => {
  it('converts a typed Effect failure into APIError at the Promise boundary', async () => {
    await expect(
      runEffect(Effect.fail(new Error('attendance unavailable')), 'ATTENDANCE_UNAVAILABLE'),
    ).rejects.toThrow('attendance unavailable');
  });

  it('unwraps a successful Supabase response', async () => {
    await expect(
      Effect.runPromise(
        fromSupabase(async () => ({ data: { id: 'user-1' }, error: null }), 'getUser'),
      ),
    ).resolves.toEqual({ id: 'user-1' });
  });

  it('turns a Supabase error response into a typed failure', async () => {
    const error = vi.fn(async () => ({ data: null, error: { message: 'row missing' } }));

    await expect(Effect.runPromise(fromSupabase(error, 'getUser'))).rejects.toThrow('row missing');
  });

  it('turns a null Supabase response into a labelled failure', async () => {
    await expect(
      Effect.runPromise(fromSupabase(async () => ({ data: null, error: null }), 'getUser')),
    ).rejects.toThrow('getUser returned null');
  });
});
