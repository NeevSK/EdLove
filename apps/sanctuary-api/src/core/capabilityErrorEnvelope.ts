import { ORPCError } from '@orpc/server';
import type {
  CapabilityDescriptor,
  ExpectedFailureKind,
} from '@repo/core/api/capabilityFoundation';
import { expectedFailurePolicy } from '@repo/core/api/capabilityFoundation';
import { o } from './orpc';

export type CapabilityFailureCodes = Readonly<Record<string, readonly ExpectedFailureKind[]>>;

function hasDeclaredEnvelope(
  error: ORPCError<string, unknown>,
  descriptor: CapabilityDescriptor,
  allowedKinds: readonly ExpectedFailureKind[],
): boolean {
  if (!error.data || typeof error.data !== 'object') return false;
  const data = error.data as Record<string, unknown>;
  if (data.capability !== descriptor.id) return false;
  return allowedKinds.some((kind) => {
    const policy = expectedFailurePolicy(kind);
    return data.failureKind === policy.kind && data.retryable === policy.retryable;
  });
}

/**
 * Normalizes shared authorization and infrastructure oRPC errors into the
 * capability's declared v1 envelope. It never projects retry advice for an
 * unlisted protocol code.
 */
export function capabilityErrorEnvelope(
  descriptor: CapabilityDescriptor,
  failureCodes: CapabilityFailureCodes,
) {
  return o.middleware(async ({ next }) => {
    try {
      return await next({});
    } catch (error) {
      if (!(error instanceof ORPCError)) throw error;
      const allowedKinds = failureCodes[error.code];
      if (!allowedKinds || allowedKinds.length === 0) throw error;
      if (hasDeclaredEnvelope(error, descriptor, allowedKinds)) throw error;
      const policy = expectedFailurePolicy(allowedKinds[0]);
      throw new ORPCError(error.code, {
        message: error.message,
        data: {
          capability: descriptor.id,
          failureKind: policy.kind,
          retryable: policy.retryable,
        },
      });
    }
  });
}
