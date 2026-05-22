import { APIError } from '../types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from './base';

/**
 * GRADING API (Sovereign RPC Proxy)
 *
 * This module siphons Grading requests to the Sanctuary API.
 * [BREAKING] Renamed methods to enforce Sovereign naming standards.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const gradingAPI = {
  /**
   * [LOUD-FAILURE] Renamed from getReportCard.
   */
  async fetchStudentReport(studentId: string) {
    const res = await (client.api as any).grading['report-card'].$get({
      query: { studentId },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch report card', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from submitGrade.
   */
  async recordAcademicMark(params: {
    studentId: string;
    classroomId: string;
    marks: number;
    assignmentId?: string;
    feedback?: string;
  }) {
    const res = await (client.api as any).grading.$post({
      json: params,
    });

    if (!res.ok) {
      throw new APIError('Failed to submit grade', res.status.toString());
    }

    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from publishGrade.
   */
  async finalizeAcademicRecord(id: string) {
    const res = await (client.api as any).grading[':id'].publish.$post({
      param: { id },
    });

    if (!res.ok) {
      throw new APIError('Failed to publish grade', res.status.toString());
    }

    return await res.json();
  },
};
