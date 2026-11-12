import { ORPCError } from '@orpc/client';
import { ConflictError, NetworkError } from '@repo/core/effect/Errors';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { classifyFailure, isRetryable, RETRY_POLICY } from './classifyFailure';

const tag = (error: unknown) => classifyFailure(error)?._tag ?? 'defect';

describe('G1 classifyFailure: one answer for every raw failure', () => {
  it.each([
    [{ status: 401 }, 'UnauthorizedError'],
    [new ORPCError('UNAUTHORIZED'), 'UnauthorizedError'],
    [new Error('JWT expired'), 'UnauthorizedError'],
    [new Error('invalid refresh token'), 'UnauthorizedError'],
    [{ status: 403 }, 'ForbiddenError'],
    [{ code: '42501', message: 'x' }, 'ForbiddenError'],
    [new Error('permission denied for table bonds'), 'ForbiddenError'],
    [{ statusCode: 404 }, 'NotFoundError'],
    [new ORPCError('NOT_FOUND'), 'NotFoundError'],
    [{ status: 400 }, 'ValidationError'],
    [{ status: 422 }, 'ValidationError'],
    [{ code: '23505', message: 'duplicate key' }, 'ValidationError'],
    [new ZodError([]), 'ValidationError'],
    [{ code: '42P01', message: 'x' }, 'DatabaseQueryError'],
    [{ status: 409 }, 'ConflictError'],
    [new Error('version mismatch'), 'ConflictError'],
    [{ status: 429 }, 'RateLimitedError'],
    [new ORPCError('TOO_MANY_REQUESTS'), 'RateLimitedError'],
    [{ status: 408 }, 'UnavailableError'],
    [{ status: 503 }, 'UnavailableError'],
    [new ORPCError('SERVICE_UNAVAILABLE'), 'UnavailableError'],
    [new TypeError('Failed to fetch'), 'NetworkError'],
    [{ code: 'ECONNRESET' }, 'NetworkError'],
  ])('%o is %s', (error, expected) => {
    expect(tag(error)).toBe(expected);
  });

  it('treats what no rule recognises as a defect', () => {
    expect(tag(new Error('boom'))).toBe('defect');
    expect(tag('oops')).toBe('defect');
    expect(tag(null)).toBe('defect');
    expect(tag({})).toBe('defect');
  });

  it('passes a kind through unchanged', () => {
    const conflict = new ConflictError({ message: 'edited elsewhere' });
    expect(classifyFailure(conflict)).toBe(conflict);
  });

  it('keeps the source code and cause for telemetry', () => {
    const raw = { code: '23505', message: 'duplicate key' };
    const kind = classifyFailure(raw);
    expect(kind).toMatchObject({ _tag: 'ValidationError', code: '23505', cause: raw });
  });

  it('carries a server retry-after on rate limits', () => {
    const kind = classifyFailure({ status: 429, data: { retryAfterMs: 2_000 } });
    expect(kind).toMatchObject({ _tag: 'RateLimitedError', retryAfterMs: 2_000 });
  });
});

describe('G1 RETRY_POLICY: which kinds are worth retrying', () => {
  it('retries only transient kinds', () => {
    const retried = Object.entries(RETRY_POLICY)
      .filter(([, rule]) => rule !== 'never')
      .map(([kind]) => kind)
      .sort();
    expect(retried).toEqual(['NetworkError', 'RateLimitedError', 'UnavailableError']);
  });

  it('answers through isRetryable', () => {
    expect(isRetryable(new NetworkError({ cause: new TypeError('x') }))).toBe(true);
    expect(isRetryable(new ConflictError({}))).toBe(false);
  });
});
