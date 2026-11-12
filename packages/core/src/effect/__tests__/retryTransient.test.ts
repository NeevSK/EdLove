import { ORPCError } from '@orpc/client';
import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { classifyFailure } from '../../logic/failure/classifyFailure';
import { SupabaseQueryError } from '../../adapters/supabaseIdentity.adapter';
import { UnauthorizedError } from '../Errors';
import { retryPolicy, retryTransient } from '../Schedules';

const attempts = async (error: unknown) => {
  let calls = 0;
  await Effect.runPromiseExit(
    Effect.suspend(() => {
      calls += 1;
      return Effect.fail(error);
    }).pipe(Effect.retry(retryTransient(retryPolicy(2)))),
  );
  return calls;
};

describe('G1 retryTransient: Effect retries only what retrying can fix', () => {
  it('retries a transient failure through the whole schedule', async () => {
    expect(await attempts(new ORPCError('SERVICE_UNAVAILABLE'))).toBe(3);
  });

  it('fails at once when retrying cannot help', async () => {
    expect(await attempts(new UnauthorizedError({}))).toBe(1);
    expect(await attempts(new ORPCError('FORBIDDEN'))).toBe(1);
  });

  it('keeps retrying what it cannot recognise, as before', async () => {
    expect(await attempts(new Error('socket hang up'))).toBe(3);
  });
});

describe('G1 SupabaseQueryError carries the Postgres code', () => {
  it('lets the classifier read a privilege error as forbidden', () => {
    const error = new SupabaseQueryError({ message: 'denied', code: '42501' });
    expect(classifyFailure(error)?._tag).toBe('ForbiddenError');
  });
});
