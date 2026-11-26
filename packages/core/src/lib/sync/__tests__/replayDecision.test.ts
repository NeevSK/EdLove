import { ORPCError } from '@orpc/client';
import { describe, expect, it } from 'vitest';
import { decideReplayFailure, REPLAY_POLICY } from '../replayDecision';

const now = 1_000_000;
const decide = (error: unknown, retries?: number) =>
  decideReplayFailure(error, retries, { now, random: () => 0.5 });

describe('G1 decideReplayFailure: one set of replay rules for every drain', () => {
  it('pauses on an expired session instead of spending retries', () => {
    expect(decide(new ORPCError('UNAUTHORIZED'), 1)).toEqual({
      _tag: 'AuthPaused',
      retryCount: 2,
      backoffUntil: now + REPLAY_POLICY.authPauseMs,
    });
  });

  it('holds a conflict for resolution, never the dead-letter queue', () => {
    expect(decide({ status: 409 })).toEqual({ _tag: 'Conflict', retryCount: 1 });
  });

  it('dead-letters a permanent failure at once', () => {
    expect(decide({ status: 403 })).toEqual({ _tag: 'Failed', retryCount: 1, reason: 'PERMANENT_FAILURE' });
    expect(decide({ status: 422 })).toMatchObject({ _tag: 'Failed', reason: 'PERMANENT_FAILURE' });
  });

  it('retries a transient failure with jittered backoff', () => {
    expect(decide(new ORPCError('SERVICE_UNAVAILABLE'))).toEqual({
      _tag: 'Retrying',
      retryCount: 1,
      backoffUntil: now + 1_000, // half of the 2 s ceiling for the first retry
    });
  });

  it('dead-letters a transient failure once retries run out', () => {
    expect(decide(new ORPCError('SERVICE_UNAVAILABLE'), REPLAY_POLICY.maxRetries - 1)).toEqual({
      _tag: 'Failed',
      retryCount: REPLAY_POLICY.maxRetries,
      reason: 'MAX_RETRIES_EXCEEDED',
    });
  });
});
