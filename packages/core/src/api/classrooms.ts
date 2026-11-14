import { classroomRepository } from '@repo/core/adapters/supabase/educational/classroomRepository';
import { orpcClient } from '@repo/core/api/orpcClient';
import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import {
  MOCK_CLASSROOMS,
  MOCK_STUDENT_STATS,
  MOCK_TEACHER_STATS,
} from '@repo/core/api/mockData';
import { APIError } from '@repo/core/types/API';

/**
 * CLASSROOMS API (Sovereign RPC Proxy)
 *
 * This module siphons Classroom structural requests to the Sanctuary API.
 */

export const classroomsAPI = {
  async getTeacherClassrooms(teacher_id: string) {
    return this.getByTeacher(teacher_id);
  },

  async update(id: string, updates: any) {
    try {
      const res = await orpcClient.educational.updateClassroom({
        params: { id },
        body: { id, ...updates },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to update classroom',
        error.status?.toString() || error.code || 'CLASSROOM_UPDATE_FAILED',
      );
    }
  },

  async create(classroom: any) {
    try {
      const res = await orpcClient.educational.createClassroom({
        body: classroom,
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to create classroom',
        error.status?.toString() || error.code || 'CLASSROOM_CREATE_FAILED',
      );
    }
  },

  async delete(id: string) {
    try {
      await orpcClient.educational.deleteClassroom({
        params: { id },
      });
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to delete classroom',
        error.status?.toString() || error.code || 'CLASSROOM_DELETE_FAILED',
      );
    }
  },

  async getByTeacher(teacher_id: string, params: { limit?: number; offset?: number } = {}) {
    try {
      const res = await orpcClient.educational.getByTeacher({
        query: {
          teacher_id,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch classrooms by teacher',
        error.status?.toString() || error.code || 'CLASSROOMS_FETCH_FAILED',
      );
    }
  },

  async getByStudent(student_id: string) {
    try {
      const res = await orpcClient.educational.getByStudent({
        query: { student_id },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch classrooms by student',
        error.status?.toString() || error.code || 'CLASSROOMS_FETCH_FAILED',
      );
    }
  },

  async getBySchool(school_id: string, params: { limit?: number; offset?: number } = {}) {
    return classroomRepository.getClassroomsBySchool(school_id, params);
  },

  async getAvailableByGrade(grade_id: string) {
    return classroomRepository.getAvailableClassroomsByGrade(grade_id);
  },

  async getClassroomCapacitySummary(id: string) {
    try {
      const classroom = await classroomRepository.getClassroomById(id);
      const enrolledCount = await classroomRepository.getEnrolledCount(id);
      const capacity = (classroom as any)?.capacity ?? 40;
      return {
        id,
        capacity,
        enrolledCount,
        availableSeats: Math.max(0, capacity - enrolledCount),
        isFull: enrolledCount >= capacity,
      };
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to calculate classroom capacity summary',
        error.status?.toString() || error.code || 'CAPACITY_SUMMARY_FAILED',
      );
    }
  },

  async getTeacherStats(id: string) {
    try {
      const res = await orpcClient.educational.getTeacherStats({
        params: { id },
      });
      return res;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch teacher statistics',
        error.status?.toString() || error.code || 'CLASSROOMS_STATS_FAILED',
      );
    }
  },

  async getById(id: string) {
    try {
      const res = await orpcClient.educational.getById({
        params: { id },
      });
      return res;
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NOT_FOUND') return null;
      throw new APIError(
        error.message || 'Failed to fetch classroom',
        error.status?.toString() || error.code || 'CLASSROOM_FETCH_FAILED',
      );
    }
  },
};

// ---------------------------------------------------------------------------
// Sandbox ghost-seeding registration for this domain.
// The resonantProxy reads this config instead of a hardcoded if-block.
// ---------------------------------------------------------------------------
registerSandboxDomain({
  domain: 'classrooms',
  ghostMethods: ['getByTeacher', 'getByStudent', 'getBySchool', 'getTeacherStats', 'getStudentStats'],
  isEmpty: (method, data) => {
    if (method === 'getTeacherStats') {
      return !data || (data as any).active_classes === 0;
    }
    if (method === 'getStudentStats') {
      return !data || ((data as any).active_sanctuaries === 0 && (data as any).goals_set === 0);
    }
    return isEmptyArray(data);
  },
  getSamples: (method) => {
    if (method === 'getTeacherStats') return { ...MOCK_TEACHER_STATS, is_sample: true };
    if (method === 'getStudentStats') return { ...MOCK_STUDENT_STATS, is_sample: true };
    return MOCK_CLASSROOMS;
  },
});

import {
  MOCK_CLASSROOM_DETAIL_ASSIGNMENTS,
  MOCK_CLASSROOM_DETAIL_LESSONS,
  MOCK_CLASSROOM_DETAIL_OBSERVATIONS,
  MOCK_CLASSROOM_DETAIL_STUDENTS,
} from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'classroomDetail',
  ghostMethods: ['getStudents', 'getLessons', 'getAssignments', 'getObservations'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: (method) => {
    if (method === 'getStudents') return MOCK_CLASSROOM_DETAIL_STUDENTS;
    if (method === 'getLessons') return MOCK_CLASSROOM_DETAIL_LESSONS;
    if (method === 'getAssignments') return MOCK_CLASSROOM_DETAIL_ASSIGNMENTS;
    return MOCK_CLASSROOM_DETAIL_OBSERVATIONS;
  },
});

