import { APIError } from '../types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from './base';
import type { StudentAttendancePulse } from './staffManagement';

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
    date: string,
  ) {
    const res = await (client.api as any).attendance.$post({
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
    const res = await (client.api as any).attendance.$get({
      query: { classroom_id, date },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch attendance', res.status.toString());
    }

    return await res.json();
  },

  async getSchoolAttendancePulse(
    school_id: string,
    classroom_id?: string,
    view_date?: string,
  ): Promise<StudentAttendancePulse> {
    const res = await (client.api as any).attendance.pulse.$get({
      query: {
        school_id,
        classroom_id: classroom_id ?? undefined,
        view_date: view_date ?? undefined,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch attendance pulse', res.status.toString());
    }

    return (await res.json()) as StudentAttendancePulse;
  },

  async getAttendanceReport(
    school_id: string,
    start_date: string,
    end_date: string,
    classroom_id?: string,
  ): Promise<any> {
    const res = await (client.api as any).attendance.report.$get({
      query: {
        school_id,
        start_date,
        end_date,
        classroom_id: classroom_id ?? undefined,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch attendance report', res.status.toString());
    }

    return await res.json();
  },
};
