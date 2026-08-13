import { selectLatestTemporalRecordsAsOf, toTemporalCutoff } from '@repo/core/lib/temporalEvents';
import type {
  LongitudinalEntityType,
  StudentLongitudinalEvent,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '@repo/core/logic/schemas/temporal.schema';
import { StudentLongitudinalEventSchema } from '@repo/core/logic/schemas/temporal.schema';
import { APIError } from '@repo/core/types/API';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

async function listEvents(
  studentId: string,
  viewDate: string,
  entityTypes?: LongitudinalEntityType[],
): Promise<StudentLongitudinalEvent[]> {
  const { data: enrollmentRows, error: enrollmentError } = await supabaseClient
    .from('classroom_students')
    .select('classroom_id')
    .eq('student_id', studentId)
    .eq('status', 'active');

  if (enrollmentError) {
    throw new APIError('Failed to resolve student classroom scope', enrollmentError.code, enrollmentError);
  }

  const allowedClassroomIds = (enrollmentRows ?? [])
    .map((row) => row.classroom_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (allowedClassroomIds.length === 0) {
    throw new APIError('Student has no active classroom scope', 'NO_CLASSROOM_SCOPE');
  }

  let query = supabaseClient
    .from('student_longitudinal_events')
    .select('*')
    .eq('student_id', studentId)
    .in('classroom_id', allowedClassroomIds)
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

  const unauthorizedClassroom = (data ?? []).find(
    (row) =>
      typeof row.classroom_id === 'string' &&
      !allowedClassroomIds.includes(row.classroom_id),
  );
  if (unauthorizedClassroom) {
    throw new APIError('Longitudinal event outside student classroom scope', 'CLASSROOM_SCOPE_DENIED');
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
   * @policy read Student
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
   * @policy read Student
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
