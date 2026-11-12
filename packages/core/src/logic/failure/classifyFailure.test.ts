import { ORPCError } from '@orpc/client';
import { ConflictError, NetworkError } from '@repo/core/effect/Errors';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { AGENT_HINT, classifyFailure, diagnoseFailure, isRetryable, RETRY_POLICY } from './classifyFailure';

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

describe('G1 diagnoseFailure: the developer and agent view', () => {
  it('names the kind, the source code, the retry rule and the next step', () => {
    expect(diagnoseFailure({ status: 409, code: 'CONFLICT' }, 'attendance.save')).toEqual({
      kind: 'ConflictError',
      code: 'CONFLICT',
      retry: 'never',
      agentHint: 'REFETCH_AND_REBASE',
      operation: 'attendance.save',
      requestId: null,
    });
  });

  it('keeps a precise tag it does not classify', () => {
    expect(diagnoseFailure({ _tag: 'DeepLinkTraversalError' })).toMatchObject({
      kind: 'DeepLinkTraversalError',
      agentHint: 'READ_TAG',
    });
  });

  it('marks a defect for escalation', () => {
    expect(diagnoseFailure(new Error('boom'))).toMatchObject({ kind: 'Defect', agentHint: 'LOG_AND_ESCALATE' });
  });

  it('has a hint for every kind', () => {
    expect(Object.keys(AGENT_HINT).sort()).toEqual(Object.keys(RETRY_POLICY).sort());
  });
});

describe('G1 interruptions and request IDs', () => {
  it('never retries cancelled work', async () => {
    const { isInterruption, worthRetrying } = await import('./classifyFailure');
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const cancelled = Object.assign(new Error('cancelled'), { name: 'CancelledError' });
    expect(isInterruption(abort)).toBe(true);
    expect(isInterruption(cancelled)).toBe(true);
    expect(worthRetrying(abort)).toBe(false);
    expect(isInterruption(new Error('boom'))).toBe(false);
  });

  it("carries the server's request ID from v1 error data", () => {
    const error = new ORPCError('SERVICE_UNAVAILABLE', { data: { requestId: 'req-123' } });
    expect(diagnoseFailure(error)).toMatchObject({ kind: 'UnavailableError', requestId: 'req-123' });
  });
});
