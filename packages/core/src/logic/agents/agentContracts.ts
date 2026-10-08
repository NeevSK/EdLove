import { Data, Schema } from 'effect';

/**
 * Coordination Gap Schema
 * Represents an operational gap discovered by autonomous school agents.
 */
export const CoordinationGapSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(['relief', 'timetable', 'resource']),
  title: Schema.String,
  description: Schema.String,
  priority: Schema.Literals(['low', 'medium', 'high']),
  suggestedAction: Schema.String,
  context: Schema.Record(Schema.String, Schema.Unknown),
});

export type CoordinationGap = typeof CoordinationGapSchema.Type;

/**
 * Relief Query Parameters Schema
 */
export const ReliefQuerySchema = Schema.Struct({
  schoolId: Schema.String,
  sectionId: Schema.optional(Schema.String),
});

export type ReliefQuery = typeof ReliefQuerySchema.Type;

/**
 * Classroom Row Schema for Attendance Audits
 */
export const ClassroomRowSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

export type ClassroomRow = typeof ClassroomRowSchema.Type;

// ─── Typed Agent Domain Errors ───────────────────────────────────────

export class AgentDatabaseError extends Data.TaggedError('AgentDatabaseError')<{
  readonly message: string;
  readonly operation: string;
}> {}

export class AgentTimeoutError extends Data.TaggedError('AgentTimeoutError')<{
  readonly message: string;
  readonly timeoutMs: number;
}> {}

export class AgentSchemaError extends Data.TaggedError('AgentSchemaError')<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export type AgentDomainError = AgentDatabaseError | AgentTimeoutError | AgentSchemaError;
