import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import type {
  LongitudinalEntityType,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '@repo/core/logic/schemas/temporal.schema';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

const parseResponse = async <T>(res: Response, message: string): Promise<T> => {
  if (!res.ok) throw new APIError(message, res.status.toString());
  return (await res.json()) as T;
};

export const longitudinalAPI = {
  /**
   * @policy read Student
   */
  async getStudentTimeline(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalTimeline> {
    return parseResponse<StudentLongitudinalTimeline>(
      await (client.api as any).longitudinal.student.timeline.$get({
        query: { studentId, viewDate, entityTypes },
      }),
      'Failed to fetch student longitudinal timeline',
    );
  },

  /**
   * @policy read Student
   */
  async getStudentSnapshotAsOf(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalSnapshot> {
    return parseResponse<StudentLongitudinalSnapshot>(
      await (client.api as any).longitudinal.student.snapshot.$get({
        query: { studentId, viewDate, entityTypes },
      }),
      'Failed to fetch student longitudinal snapshot',
    );
  },
};

void longitudinalContract;
