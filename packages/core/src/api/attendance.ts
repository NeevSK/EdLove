import { 
  createSovereignClient, 
  SOVEREIGN_API_URL, 
  type AppType 
} from './base';
import { APIError } from '../types/API';

/**
 * ATTENDANCE API (Sovereign RPC Proxy)
 * 
 * Siphons Attendance tracking to the Sanctuary API.
 * [BREAKING] Renamed methods to force loud failure in UI.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const attendanceAPI = {
  /**
   * [LOUD-FAILURE] Renamed from record.
   */
  async upsertAttendanceRecord(
    classroom_id: string,
    student_id: string,
    status: string,
    date: string
  ) {
    const res = await client.api.attendance.$post({
      json: {
        classroom_id,
        student_id,
        status,
        date,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to record attendance', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from getByDate.
   */
  async fetchClassroomAttendance(classroom_id: string, date?: string) {
    const res = await client.api.attendance.$get({
      query: { classroom_id, date },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch attendance', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Method removed. Use operationsAPI.getAttendancePulse.
   */
  async getSchoolAttendancePulse(): Promise<never> {
    throw new Error('attendanceAPI.getSchoolAttendancePulse is DEPRECATED. Use operationsAPI.');
  },
};
