import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
} from '@repo/core/effect/Errors';
import { describe, expect, it } from 'vitest';
import { UPLOAD_POLICY, decideUploadFailure } from './uploadDecision';

describe('decideUploadFailure / G1 pure decision table', () => {
  it.each([
    ['network', new NetworkError({ cause: new Error('offline') }), { _tag: 'Retry', reason: 'transient' }],
    ['rate limited', new RateLimitedError({}), { _tag: 'Retry', reason: 'transient' }],
    ['expired session', new UnauthorizedError({}), { _tag: 'Retry', reason: 'signIn' }],
    ['forbidden', new ForbiddenError({}), { _tag: 'Reject', reason: 'forbidden' }],
    ['gone', new NotFoundError({}), { _tag: 'Reject', reason: 'notFound' }],
    ['invalid', new ValidationError({}), { _tag: 'Reject', reason: 'invalid' }],
    ['conflict', new ConflictError({}), { _tag: 'Reject', reason: 'conflict' }],
    ['HTTP 503', Object.assign(new Error('down'), { status: 503 }), { _tag: 'Retry', reason: 'transient' }],
    ['interrupted', new DOMException('aborted', 'AbortError'), { _tag: 'Stop' }],
  ])('%s', (_name, error, decision) => {
    expect(decideUploadFailure(error, 1)).toEqual(decision);
  });

  it('holds a conflict when the policy says so', () => {
    expect(decideUploadFailure(new ConflictError({}), 1, { ...UPLOAD_POLICY, conflict: 'hold' })).toEqual(
      { _tag: 'Retry', reason: 'conflict' },
    );
  });

  it('retries an unclassified failure, then rejects it at the limit', () => {
    const bug = new Error('bug');
    expect(decideUploadFailure(bug, UPLOAD_POLICY.maxDefectAttempts - 1)._tag).toBe('Retry');
    expect(decideUploadFailure(bug, UPLOAD_POLICY.maxDefectAttempts)).toEqual({
      _tag: 'Reject',
      reason: 'defect',
    });
  });
});
