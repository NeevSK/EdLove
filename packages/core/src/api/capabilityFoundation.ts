import type { z } from 'zod';

export type CapabilityLifecycle = 'read' | 'draft' | 'proposal' | 'commit' | 'external-effect';

export type CapabilityPrivacyClass = 'minimal' | 'sensitive' | 'restricted';

export type CapabilityEffectPolicy =
  | { kind: 'none' }
  | {
      kind: 'deferred-effect';
      repairRequired: true;
      effectName: string;
      payloadSchema: z.ZodType<Record<string, unknown>>;
    };

export type CapabilityActivityPolicy =
  | { kind: 'none' }
  | { kind: 'product-activity'; purpose: 'ux' | 'support' | 'reliability' | 'governance' };

/** Operational telemetry is aggregate-safe metadata only; it never grants
 * permission to export an underlying domain payload. */
export type CapabilityTelemetryPolicy =
  | { kind: 'none' }
  | { kind: 'operational'; allowedFields: readonly string[] };

/**
 * Stable, transport-neutral policy for one admitted capability. It deliberately
 * describes only the boundary every transport must preserve; domain services
 * retain their own authority and persistence rules.
 */
export interface CapabilityDescriptor {
  id: string;
  lifecycle: CapabilityLifecycle;
  privacy: CapabilityPrivacyClass;
  idempotency: 'not-applicable' | 'required';
  receipt: 'not-applicable' | 'required';
  audit: 'none' | 'minimal' | 'required';
  activity: CapabilityActivityPolicy;
  telemetry: CapabilityTelemetryPolicy;
  effect: CapabilityEffectPolicy;
}

/**
 * A capability-scoped durable operation. The receipt is deliberately agnostic
 * about storage and result shape; its transaction port is the only place where
 * a command may couple receipt settlement to its authoritative write.
 */
export interface OperationReceipt<TResult> {
  operationId: string;
  status: 'pending' | 'completed' | 'failed' | 'conflict';
  payloadHash: string;
  result: TResult | null;
  failureCode?: string | null;
}

export type OperationReceiptClaim<TResult> =
  | { kind: 'claimed'; receipt: OperationReceipt<TResult> }
  | { kind: 'replay'; receipt: OperationReceipt<TResult> }
  | { kind: 'payload-conflict'; receipt: OperationReceipt<TResult> }
  | { kind: 'in-progress'; receipt: OperationReceipt<TResult> }
  | { kind: 'failed'; receipt: OperationReceipt<TResult> }
  | { kind: 'conflict'; receipt: OperationReceipt<TResult> };

export interface OperationReceiptPort<TResult> {
  claim(input: {
    capability: string;
    principalId: string;
    idempotencyKey: string;
    payloadHash: string;
  }): Promise<OperationReceiptClaim<TResult>>;
  complete(input: {
    operationId: string;
    payloadHash: string;
    result: TResult;
  }): Promise<OperationReceipt<TResult>>;
  fail(input: { operationId: string; payloadHash: string; failureCode: string }): Promise<void>;
}

export interface CapabilityTransactionPort<TPorts> {
  run<TResult>(work: (ports: TPorts) => Promise<TResult>): Promise<TResult>;
}

export type ExpectedFailureKind =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not-found'
  | 'conflict'
  | 'in-progress'
  | 'rate-limited'
  | 'dependency-unavailable'
  | 'timeout';

export interface ExpectedFailurePolicy {
  kind: ExpectedFailureKind;
  httpStatus: 400 | 401 | 403 | 404 | 409 | 429 | 503 | 504;
  orpcCode:
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'TOO_MANY_REQUESTS'
    | 'SERVICE_UNAVAILABLE'
    | 'TIMEOUT';
  retryable: boolean;
}

const expectedFailurePolicies: Readonly<Record<ExpectedFailureKind, ExpectedFailurePolicy>> = {
  validation: { kind: 'validation', httpStatus: 400, orpcCode: 'BAD_REQUEST', retryable: false },
  authentication: { kind: 'authentication', httpStatus: 401, orpcCode: 'UNAUTHORIZED', retryable: false },
  authorization: { kind: 'authorization', httpStatus: 403, orpcCode: 'FORBIDDEN', retryable: false },
  'not-found': { kind: 'not-found', httpStatus: 404, orpcCode: 'NOT_FOUND', retryable: false },
  conflict: { kind: 'conflict', httpStatus: 409, orpcCode: 'CONFLICT', retryable: false },
  'in-progress': {
    kind: 'in-progress',
    httpStatus: 503,
    orpcCode: 'SERVICE_UNAVAILABLE',
    retryable: true,
  },
  'rate-limited': {
    kind: 'rate-limited',
    httpStatus: 429,
    orpcCode: 'TOO_MANY_REQUESTS',
    retryable: true,
  },
  'dependency-unavailable': {
    kind: 'dependency-unavailable',
    httpStatus: 503,
    orpcCode: 'SERVICE_UNAVAILABLE',
    retryable: true,
  },
  timeout: { kind: 'timeout', httpStatus: 504, orpcCode: 'TIMEOUT', retryable: true },
};

export function expectedFailurePolicy(kind: ExpectedFailureKind): ExpectedFailurePolicy {
  return expectedFailurePolicies[kind];
}
