import { ORPCError } from '@orpc/client';
import {
  ConflictError,
  DatabaseQueryError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  OfflineMutationError,
  RateLimitedError,
  UnauthorizedError,
  UnavailableError,
  ValidationError,
} from '@repo/core/effect/Errors';
import { ZodError } from 'zod';

/**
 * One classifier for every raw failure the client meets: oRPC errors, HTTP responses, Supabase
 * and Postgres errors, expired tokens, Zod parse failures and fetch failures.
 *
 * It returns the expected-failure kind (a Schema.TaggedError from effect/Errors.ts), or `null`
 * when the failure is a defect: something no rule recognises, which only telemetry can fix.
 * Retry (effect/Schedules.ts), the outbox (lib/sync/errorClassifier.ts), workspace sync and the
 * person's feedback (lib/failureFeedback.adapter.ts) all read this one answer.
 *
 * The rules and their order come from the classifiers this replaces, so existing behaviour holds:
 * an expired session first, then failures that won't fix themselves, then conflicts, then the
 * transient ones. See docs/architecture/2026-11-12-client-runtime-foundation-plan.md, L3.
 */
export type FailureKind =
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | ConflictError
  | ValidationError
  | RateLimitedError
  | UnavailableError
  | NetworkError
  | OfflineMutationError
  | DatabaseQueryError;

const KINDS = [
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitedError,
  UnavailableError,
  NetworkError,
  OfflineMutationError,
  DatabaseQueryError,
] as const;

/** Postgres SQLSTATEs (https://www.postgresql.org/docs/current/errcodes-appendix.html). */
const PG_CONSTRAINT = new Set(['23505', '23503']); // unique, foreign key
const PG_PRIVILEGE = '42501';
const PG_SCHEMA = new Set(['42P01', '42703']); // missing relation, missing column

const NETWORK_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'NETWORK_ERROR']);

interface RawFailure {
  readonly status: number | undefined;
  readonly code: string;
  readonly message: string;
  readonly retryAfterMs: number | undefined;
}

function read(error: object): RawFailure {
  const record = error as Record<string, unknown>;
  const numeric = (value: unknown) => (typeof value === 'number' ? value : undefined);
  const status = numeric(record.status) ?? numeric(record.statusCode);
  const rawCode = record.code ?? record.status ?? '';
  const message = typeof record.message === 'string' ? record.message.toLowerCase() : '';
  const data = record.data as Record<string, unknown> | undefined;
  const retryAfter = numeric(data?.retryAfterMs) ?? numeric(record.retryAfterMs);
  return { status, code: String(rawCode), message, retryAfterMs: retryAfter };
}

const isAny = (raw: RawFailure, statuses: number[], codes: string[]) =>
  (raw.status !== undefined && statuses.includes(raw.status)) ||
  codes.includes(raw.code) ||
  statuses.some((status) => raw.code === String(status));

const says = (raw: RawFailure, ...phrases: string[]) =>
  phrases.some((phrase) => raw.message.includes(phrase));

/**
 * An interruption: the caller (or the person, by leaving the screen) cancelled the work. It is
 * neither an expected failure nor a defect: it's never retried, shown or reported. Covers fetch's
 * AbortError and TanStack Query's CancelledError.
 */
export function isInterruption(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const name = (error as { name?: unknown }).name;
  return name === 'AbortError' || name === 'CancelledError';
}

export function isFailureKind(error: unknown): error is FailureKind {
  return KINDS.some((Kind) => error instanceof Kind);
}

export function classifyFailure(error: unknown): FailureKind | null {
  if (isFailureKind(error)) return error;
  if (error instanceof ZodError) return new ValidationError({ code: 'ZOD', cause: error });
  if (typeof error !== 'object' || error === null) return null;

  const raw = read(error);
  const source = { code: raw.code || undefined, cause: error };

  // An expired session pauses work until the person signs in again; it never goes to the DLQ.
  if (
    isAny(raw, [401], ['UNAUTHORIZED']) ||
    says(raw, 'jwt expired', 'token expired', 'refresh token')
  ) {
    return new UnauthorizedError({ cause: error });
  }

  // Failures that won't fix themselves on retry.
  if (isAny(raw, [403], ['FORBIDDEN']) || raw.code === PG_PRIVILEGE || says(raw, 'permission denied')) {
    return new ForbiddenError(source);
  }
  if (isAny(raw, [404], ['NOT_FOUND']) || says(raw, 'not found')) {
    return new NotFoundError(source);
  }
  if (isAny(raw, [400, 422], ['BAD_REQUEST', 'UNPROCESSABLE_CONTENT']) || PG_CONSTRAINT.has(raw.code)) {
    return new ValidationError(source);
  }
  if (PG_SCHEMA.has(raw.code)) {
    return new DatabaseQueryError({ cause: error, message: raw.code });
  }

  if (
    isAny(raw, [409], ['CONFLICT']) ||
    says(raw, 'conflict', 'version mismatch', 'stale data')
  ) {
    return new ConflictError(source);
  }

  // Transient: worth retrying.
  if (isAny(raw, [429], ['TOO_MANY_REQUESTS'])) {
    return new RateLimitedError({ ...source, retryAfterMs: raw.retryAfterMs });
  }
  if (
    (raw.status !== undefined && (raw.status === 408 || raw.status >= 500)) ||
    (error instanceof ORPCError && ['SERVICE_UNAVAILABLE', 'INTERNAL_SERVER_ERROR', 'TIMEOUT', 'BAD_GATEWAY', 'GATEWAY_TIMEOUT'].includes(error.code))
  ) {
    return new UnavailableError(source);
  }
  if (error instanceof TypeError || NETWORK_CODES.has(raw.code)) {
    return new NetworkError({ cause: error });
  }

  return null;
}

/**
 * Whether a kind is worth retrying, as a policy: change a value here and every retry path
 * (workspace sync, the outbox, API calls) follows. `serverPaced` waits for the server's
 * `retryAfterMs` when it gives one. Kinds marked `never` resolve another way: sign-in for
 * Unauthorized, healing for Conflict, the outbox's own replay on reconnect for OfflineMutation.
 */
export type RetryRule = 'never' | 'backoff' | 'serverPaced';

export const RETRY_POLICY: { readonly [Tag in FailureKind['_tag']]: RetryRule } = {
  UnauthorizedError: 'never',
  ForbiddenError: 'never',
  NotFoundError: 'never',
  ConflictError: 'never',
  ValidationError: 'never',
  RateLimitedError: 'serverPaced',
  UnavailableError: 'backoff',
  NetworkError: 'backoff',
  OfflineMutationError: 'never',
  DatabaseQueryError: 'never',
};

export function isRetryable(kind: FailureKind): boolean {
  return RETRY_POLICY[kind._tag] !== 'never';
}

/**
 * The developer and agent view of a failure. The person sees a message and a remedy
 * (lib/failureFeedback.adapter.ts); this is the other audience: what kind it is, the source's own
 * code, the retry rule and the next step to try. Every field is flat and holds no identifiers or
 * prose from the payload, so it passes the telemetry privacy filter
 * (monitoring/safeData.ts) as it is.
 */
export type AgentHint =
  | 'REFRESH_SESSION'
  | 'CHECK_CAPABILITY'
  | 'CHECK_ID_OR_DELETION'
  | 'REFETCH_AND_REBASE'
  | 'CHECK_INPUT_AGAINST_CONTRACT'
  | 'BACK_OFF'
  | 'RETRY_WITH_BACKOFF'
  | 'RETRY_ON_CONNECT'
  | 'WAIT_FOR_REPLAY'
  | 'CHECK_LOCAL_SCHEMA'
  | 'READ_TAG'
  | 'LOG_AND_ESCALATE';

export const AGENT_HINT: { readonly [Tag in FailureKind['_tag']]: AgentHint } = {
  UnauthorizedError: 'REFRESH_SESSION',
  ForbiddenError: 'CHECK_CAPABILITY',
  NotFoundError: 'CHECK_ID_OR_DELETION',
  ConflictError: 'REFETCH_AND_REBASE',
  ValidationError: 'CHECK_INPUT_AGAINST_CONTRACT',
  RateLimitedError: 'BACK_OFF',
  UnavailableError: 'RETRY_WITH_BACKOFF',
  NetworkError: 'RETRY_ON_CONNECT',
  OfflineMutationError: 'WAIT_FOR_REPLAY',
  DatabaseQueryError: 'CHECK_LOCAL_SCHEMA',
};

export interface FailureDiagnosis {
  /** The error's own tag when it has one, else the classified kind, else `Defect`. */
  readonly kind: string;
  /** The source's code (oRPC code, HTTP status, Postgres SQLSTATE), when there is one. */
  readonly code: string | null;
  readonly retry: RetryRule;
  readonly agentHint: AgentHint;
  /** Where it happened, as the caller names the operation (never a record ID). */
  readonly operation: string | null;
  /**
   * The server's request ID (`X-Request-ID`, also in v1 error data), to find the server's log
   * line. In-app only: the telemetry filter drops `*_id` keys, so reports don't carry it.
   */
  readonly requestId: string | null;
}

function requestIdOf(error: unknown): string | null {
  for (const candidate of [error, (error as { cause?: unknown } | null)?.cause]) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const data = (candidate as { data?: { requestId?: unknown } }).data;
    if (typeof data?.requestId === 'string') return data.requestId;
  }
  return null;
}

function ownTag(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('_tag' in error)) return undefined;
  return typeof error._tag === 'string' ? error._tag : undefined;
}

export function diagnoseFailure(error: unknown, operation?: string): FailureDiagnosis {
  const kind = classifyFailure(error);
  const tag = ownTag(error);
  const kindCode = kind && 'code' in kind && typeof kind.code === 'string' ? kind.code : undefined;
  const rawCode =
    tag === undefined && typeof error === 'object' && error !== null ? read(error).code : '';
  const sourceCode = kindCode ?? (rawCode || null);
  if (kind && (tag === undefined || tag === kind._tag)) {
    return {
      kind: kind._tag,
      code: sourceCode,
      retry: RETRY_POLICY[kind._tag],
      agentHint: AGENT_HINT[kind._tag],
      operation: operation ?? null,
      requestId: requestIdOf(error),
    };
  }
  // A tagged error outside the classified kinds (deep links, agents, guest storage): its tag
  // already names it precisely.
  if (tag !== undefined) {
    return {
      kind: tag,
      code: null,
      retry: 'never',
      agentHint: 'READ_TAG',
      operation: operation ?? null,
      requestId: requestIdOf(error),
    };
  }
  return {
    kind: 'Defect',
    code: null,
    retry: 'never',
    agentHint: 'LOG_AND_ESCALATE',
    operation: operation ?? null,
    requestId: requestIdOf(error),
  };
}

/**
 * Delay before retry `attempt` (0-based): the server's `retryAfterMs` for a rate limit when it
 * gives one, otherwise exponential backoff with full jitter, capped at 30 s, so a fleet of
 * devices reconnecting after an outage doesn't retry in lockstep.
 */
export function retryDelayMs(attempt: number, error?: unknown, random: () => number = Math.random): number {
  const kind = error === undefined ? null : classifyFailure(error);
  if (kind?._tag === 'RateLimitedError' && kind.retryAfterMs !== undefined) return kind.retryAfterMs;
  const ceiling = Math.min(30_000, 1_000 * 2 ** attempt);
  return Math.floor(random() * ceiling);
}

/**
 * The retry predicate every retry path shares (queries, Effect workflows, API calls,
 * idempotent mutations): transient kinds are retried, kinds retrying can't fix are not, and
 * unrecognised failures (defects) are retried as they always were. Workspace sync is the one
 * stricter caller: it doesn't retry defects (`isRetryableWorkspaceSyncError`).
 */
export function worthRetrying(error: unknown): boolean {
  if (isInterruption(error)) return false;
  const kind = classifyFailure(error);
  return kind === null || isRetryable(kind);
}
