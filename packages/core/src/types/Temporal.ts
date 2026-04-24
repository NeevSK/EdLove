export type TemporalPoint = string;

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
