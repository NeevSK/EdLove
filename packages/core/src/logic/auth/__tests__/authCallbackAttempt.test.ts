import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { consumeAuthCallbackAttempt, issueAuthCallbackAttempt } from '../authCallbackAttempt';

const input = { id: 'a'.repeat(16), purpose: 'sign-in' as const, returnPath: '/self', issuedAt: 100, ttlMs: 1_000, subjectId: null };

describe('auth callback attempt contract', () => {
  it('issues only bounded attempts with a safe internal return path', () => {
    expect(Effect.runSync(issueAuthCallbackAttempt(input))).toMatchObject({ returnPath: '/self', expiresAt: 1100 });
    expect(
      Effect.runSync(Effect.result(issueAuthCallbackAttempt({ ...input, returnPath: 'https://evil.example' }))),
    ).toMatchObject({ _tag: 'Failure', failure: { _tag: 'InvalidAuthCallbackAttempt', reason: 'return-path' } });
  });

  it('rejects expiry, account changes, and absent attempts before exchange', () => {
    const attempt = Effect.runSync(issueAuthCallbackAttempt({ ...input, subjectId: 'account-a' }));
    expect(consumeAuthCallbackAttempt(attempt, 1100, 'account-a')).toEqual({ kind: 'rejected', reason: 'expired' });
    expect(consumeAuthCallbackAttempt(attempt, 500, 'account-b')).toEqual({ kind: 'rejected', reason: 'account-changed' });
    expect(consumeAuthCallbackAttempt(null, 500, null)).toEqual({ kind: 'rejected', reason: 'missing' });
  });
});
