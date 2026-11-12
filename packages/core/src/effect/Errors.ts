import { Schema } from 'effect';

/**
 * Expected failures for @repo/core.
 *
 * Each is a Schema.TaggedError, so it keeps its tag and fields when it crosses the oRPC wire,
 * the outbox or telemetry, and decodes back into the same class. Bugs are defects (Effect.die),
 * never classes here. What the person sees for each tag lives in ./feedback.ts.
 * See docs/architecture/2026-11-11-product-shape-and-tool-ownership.md, section 4.
 */

export class OfflineMutationError extends Schema.TaggedError<OfflineMutationError>()(
  'OfflineMutationError',
  {
    cause: Schema.optional(Schema.Defect()),
    operation: Schema.optional(Schema.String),
  },
) {
  override get message(): string {
    return this.operation
      ? `Offline mutation failed for operation: ${this.operation}`
      : 'Offline mutation failed';
  }
}

export class NetworkError extends Schema.TaggedError<NetworkError>()('NetworkError', {
  cause: Schema.Defect(),
  url: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
}) {}

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  'UnauthorizedError',
  {
    message: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Defect()),
  },
) {}

export class DatabaseQueryError extends Schema.TaggedError<DatabaseQueryError>()(
  'DatabaseQueryError',
  {
    cause: Schema.Defect(),
    query: Schema.optional(Schema.String),
    message: Schema.optional(Schema.String),
  },
) {}

export class SyncTableError extends Schema.TaggedError<SyncTableError>()('SyncTableError', {
  table: Schema.String,
}) {
  override get message(): string {
    return `Unsupported sync table: ${this.table}`;
  }
}

export class SyncDelegateError extends Schema.TaggedError<SyncDelegateError>()(
  'SyncDelegateError',
  {
    modelKey: Schema.String,
  },
) {
  override get message(): string {
    return `Model delegate "${this.modelKey}" not found in transaction context`;
  }
}

export class SyncOperationError extends Schema.TaggedError<SyncOperationError>()(
  'SyncOperationError',
  {
    op: Schema.String,
  },
) {
  override get message(): string {
    return `Unsupported operations mode: ${this.op}`;
  }
}

/*
 * The kinds every raw failure (oRPC, HTTP, Postgres, JWT, Zod) is classified into by
 * logic/failure/classifyFailure.ts. `code` keeps the source's own code (an oRPC code, an
 * HTTP status, a Postgres SQLSTATE) for telemetry; the person never sees it.
 */

/** Signed in, but not allowed to do this (HTTP 403, Postgres 42501, "permission denied"). */
export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()('ForbiddenError', {
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}

/** The thing asked for doesn't exist, or no longer does (HTTP 404). */
export class NotFoundError extends Schema.TaggedError<NotFoundError>()('NotFoundError', {
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}

/** Someone else changed it first (HTTP 409, a version mismatch). Healing decides what next. */
export class ConflictError extends Schema.TaggedError<ConflictError>()('ConflictError', {
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}

/** The input was rejected (HTTP 400 or 422, a Zod failure, a Postgres constraint). */
export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}

/** Too many requests (HTTP 429). `retryAfterMs` comes from the server when it says. */
export class RateLimitedError extends Schema.TaggedError<RateLimitedError>()('RateLimitedError', {
  code: Schema.optional(Schema.String),
  retryAfterMs: Schema.optional(Schema.Number),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}

/** The server is temporarily unable to answer (HTTP 408 or 5xx). Worth retrying. */
export class UnavailableError extends Schema.TaggedError<UnavailableError>()('UnavailableError', {
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect()),
}) {}
