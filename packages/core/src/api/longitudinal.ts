import { orpcClient } from '@repo/core/api/orpcClient';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import type {
  LongitudinalEntityType,
  StudentLongitudinalSnapshot,
  StudentLongitudinalTimeline,
} from '@repo/core/logic/schemas/temporal.schema';
import { APIError } from '@repo/core/types/API';

export const longitudinalAPI = {
  /**
   * @policy read Student
   */
  async getStudentTimeline(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalTimeline> {
    try {
      const res = await orpcClient.longitudinal.getStudentTimeline({
        query: { studentId, viewDate, entityTypes },
      });
      return res as StudentLongitudinalTimeline;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch student longitudinal timeline',
        error.status?.toString() || error.code || 'LONGITUDINAL_FETCH_FAILED',
      );
    }
  },

  /**
   * @policy read Student
   */
  async getStudentSnapshotAsOf(
    studentId: string,
    viewDate: string,
    entityTypes?: LongitudinalEntityType[],
  ): Promise<StudentLongitudinalSnapshot> {
    try {
      const res = await orpcClient.longitudinal.getStudentSnapshotAsOf({
        query: { studentId, viewDate, entityTypes },
      });
      return res as StudentLongitudinalSnapshot;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch student longitudinal snapshot',
        error.status?.toString() || error.code || 'LONGITUDINAL_FETCH_FAILED',
      );
    }
  },
};

void longitudinalContract;
