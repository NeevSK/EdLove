export type TemporalPoint = string;

/** The zoom levels a time view can show. */
export type TemporalScale = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface TemporalBounds {
  occurredAt: TemporalPoint;
  recordedAt: TemporalPoint;
  effectiveFrom?: TemporalPoint | null;
  effectiveTo?: TemporalPoint | null;
}

export interface LongitudinalRecord<TSnapshot = Record<string, unknown>> extends TemporalBounds {
  id: string;
  student_id: string;
  school_id?: string | null;
  classroom_id?: string | null;
  entity_type: 'enrollment' | 'attendance' | 'grade' | 'guardian_relationship' | 'observation';
  entity_id: string;
  operation: 'insert' | 'update' | 'delete';
  source_table: string;
  snapshot: TSnapshot;
  recorded_by?: string | null;
}

/** Where the view sits relative to today. */
export type TemporalPhase = 'past' | 'present' | 'future';
export type TemporalViewMode = 'spotlight' | 'timeline';
/** Whether reads may reach the network or must use what is cached. */
export type TemporalReadPolicy = 'live' | 'cached-only';
/** What kind of truth a record holds over time; only some kinds can be filtered by a time window. */
export type TemporalCapability =
  | 'snapshot'
  | 'event_stream'
  | 'business_fact'
  | 'effective_dated'
  | 'audit_history';

/** The time window a read is for: the date in view, its scale, and whether it is the present. */
export interface TemporalView {
  viewDate: string;
  phase: TemporalPhase;
  viewScale: TemporalScale;
}
