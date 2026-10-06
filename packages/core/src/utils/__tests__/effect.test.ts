import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { fromSupabase, runEffect } from '../effect';
import { executeMutation$ } from '../mutation';

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

  it('retries a mutation and succeeds within the configured limit', async () => {
    let attempts = 0;
    const result = await Effect.runPromise(
      executeMutation$({
        isConnected: async () => true,
        mutation: async () => {
          attempts += 1;
          if (attempts < 3) throw new Error('temporary failure');
          return 'saved';
        },
        retryCount: 3,
      }),
    );

    expect(result).toBe('saved');
    expect(attempts).toBe(3);
  });

  it('returns a typed offline failure without retrying', async () => {
    const mutation = vi.fn(async () => 'saved');

    const exit = await Effect.runPromiseExit(
      executeMutation$({ isConnected: async () => false, mutation, retryCount: 3 }),
    );
    expect(exit._tag).toBe('Failure');
    expect(JSON.stringify(exit)).toContain('OfflineMutationError');
    expect(mutation).not.toHaveBeenCalled();
  });
});
