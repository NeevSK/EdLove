import { selectLatestTemporalRecordsAsOf, toTemporalCutoff } from '../lib/temporalEvents';
import type {
  LongitudinalEntityType,
  StudentLongitudinalEvent,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '../logic/schemas/temporal.schema';
import { StudentLongitudinalEventSchema } from '../logic/schemas/temporal.schema';
import { APIError } from '../types/API';
import { longitudinalContract } from './longitudinal.contract';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

async function listEvents(
  studentId: string,
  viewDate: string,
  entityTypes?: LongitudinalEntityType[],
): Promise<StudentLongitudinalEvent[]> {
  let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
    .from('student_longitudinal_events')
    .select('*')
    .eq('student_id', studentId)
    .lte('occurred_at', toTemporalCutoff(viewDate))
    .order('occurred_at', { ascending: false })
    .order('recorded_at', { ascending: false });

  if (entityTypes?.length) {
    query = query.in('entity_type', entityTypes);
  }

  const { data, error } = await query;
  if (error) {
    throw new APIError('Failed to fetch student longitudinal timeline', error.code, error);
  }

  return (data ?? []).map((row) => {
    const parsed = StudentLongitudinalEventSchema.parse(row);
    return {
      ...parsed,
      snapshot: parsed.metadata,
    };
  }) as StudentLongitudinalEvent[];
}

export const longitudinalAPI = {
  /**
   * @authority read Student
   */
  async getStudentTimeline(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalTimeline> {
    const events = await listEvents(studentId, viewDate, entityTypes);
    return {
      studentId,
      viewDate,
      events,
    };
  },

  /**
   * @authority read Student
   */
  async getStudentSnapshotAsOf(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalSnapshot> {
    const events = await listEvents(studentId, viewDate, entityTypes);

    return {
      studentId,
      viewDate,
      records: selectLatestTemporalRecordsAsOf(events, viewDate, {
        getEntityKey: (event) => `${event.entity_type}:${event.entity_id}`,
        getEffectiveTo: (event) => event.effective_to,
      }) as StudentLongitudinalEvent[],
    };
  },
};

void longitudinalContract;
