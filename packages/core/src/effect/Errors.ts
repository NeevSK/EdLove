import * as Data from 'effect/Data';

/**
 * Common typed domain errors for @repo/core.
 * Built with Data.TaggedError for compile-time exhaustive pattern matching.
 *
 * v4 migration note:
 * Data.TaggedError is fully compatible with v3 and v4 for non-serialized errors.
 * If errors cross RPC / JSON network boundaries in the future, migrate to Schema.TaggedErrorClass.
 */

export class OfflineMutationError extends Data.TaggedError('OfflineMutationError')<{
  readonly cause: unknown;
  readonly operation?: string;
}> {
  override get message(): string {
    return this.operation
      ? `Offline mutation failed for operation: ${this.operation}`
      : 'Offline mutation failed';
  }
}

export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly cause: unknown;
  readonly url?: string;
  readonly message?: string;
}> {}

export class UnauthorizedError extends Data.TaggedError('UnauthorizedError')<{
  readonly message?: string;
  readonly cause?: unknown;
}> {}

export class DatabaseQueryError extends Data.TaggedError('DatabaseQueryError')<{
  readonly cause: unknown;
  readonly query?: string;
  readonly message?: string;
}> {}

export class SyncTableError extends Data.TaggedError('SyncTableError')<{
  readonly table: string;
}> {
  override get message(): string {
    return `Unsupported sync table: ${this.table}`;
  }
}

export class SyncDelegateError extends Data.TaggedError('SyncDelegateError')<{
  readonly modelKey: string;
}> {
  override get message(): string {
    return `Model delegate "${this.modelKey}" not found in transaction context`;
  }
}

export class SyncOperationError extends Data.TaggedError('SyncOperationError')<{
  readonly op: string;
}> {
  override get message(): string {
    return `Unsupported operations mode: ${this.op}`;
  }
}
