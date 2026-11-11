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
