import { normalizeAcceptedInternalRoute } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import { Data, Effect } from 'effect';

export type AuthCallbackPurpose = 'sign-in' | 'sign-up' | 'recovery' | 'link-identity';

export type AuthCallbackAttempt = Readonly<{
  id: string;
  purpose: AuthCallbackPurpose;
  returnPath: string;
  issuedAt: number;
  expiresAt: number;
  subjectId: string | null;
}>;

export type AuthCallbackAttemptResult =
  | Readonly<{ kind: 'accepted'; attempt: AuthCallbackAttempt }>
  | Readonly<{ kind: 'rejected'; reason: 'missing' | 'expired' | 'replayed' | 'account-changed' }>;

export class InvalidAuthCallbackAttempt extends Data.TaggedError('InvalidAuthCallbackAttempt')<{
  readonly reason: 'id' | 'return-path' | 'ttl';
}> {}

const MAX_ATTEMPT_TTL_MS = 15 * 60 * 1000;
const ATTEMPT_ID = /^[A-Za-z0-9_-]{16,128}$/;

export function issueAuthCallbackAttempt(input: Readonly<{
  id: string;
  purpose: AuthCallbackPurpose;
  returnPath: string;
  issuedAt: number;
  ttlMs: number;
  subjectId: string | null;
}>): Effect.Effect<AuthCallbackAttempt, InvalidAuthCallbackAttempt> {
  return Effect.gen(function* () {
    if (!ATTEMPT_ID.test(input.id)) {
      return yield* Effect.fail(new InvalidAuthCallbackAttempt({ reason: 'id' }));
    }
    if (!Number.isInteger(input.ttlMs) || input.ttlMs <= 0 || input.ttlMs > MAX_ATTEMPT_TTL_MS) {
      return yield* Effect.fail(new InvalidAuthCallbackAttempt({ reason: 'ttl' }));
    }
    const returnPath = normalizeAcceptedInternalRoute(input.returnPath);
    if (!returnPath) return yield* Effect.fail(new InvalidAuthCallbackAttempt({ reason: 'return-path' }));
    return { ...input, returnPath, expiresAt: input.issuedAt + input.ttlMs };
  });
}

export function consumeAuthCallbackAttempt(
  attempt: AuthCallbackAttempt | null,
  now: number,
  activeSubjectId: string | null,
): AuthCallbackAttemptResult {
  if (!attempt) return { kind: 'rejected', reason: 'missing' };
  if (now >= attempt.expiresAt) return { kind: 'rejected', reason: 'expired' };
  if (attempt.subjectId !== activeSubjectId) return { kind: 'rejected', reason: 'account-changed' };
  return { kind: 'accepted', attempt };
}
