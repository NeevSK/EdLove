import { selectLatestTemporalRecordsAsOf, toTemporalCutoff } from '../lib/temporalEvents';
import type {
  LongitudinalEntityType,
  StudentLongitudinalEvent,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '../logic/schemas/temporal.schema';
import { StudentLongitudinalEventSchema } from '../logic/schemas/temporal.schema';
import { supabase } from './supabase';
import { APIError } from '../types/API';
import { longitudinalContract } from './longitudinal.contract';

async function listEvents(
  studentId: string,
  viewDate: string,
  entityTypes?: LongitudinalEntityType[],
): Promise<StudentLongitudinalEvent[]> {
  let query = supabase
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

  return (data ?? []).map((row) => StudentLongitudinalEventSchema.parse(row));
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
