import { assignmentsAPI } from '@repo/core/api/assignments';
import { classroomsAPI } from '@repo/core/api/classrooms';
import {
  ClassroomSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from '@repo/core/logic/schemas/classroom.schema';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

/**
 * useTeacherClassroomsQuery  Fetch all sanctuaries managed by a teacher.
 */
export function useTeacherClassroomsQuery(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const data = await classroomsAPI.getByTeacher(teacherId);
      return z.array(ClassroomSchema).parse(data);
    },
    enabled: !!teacherId,
  });
}

/**
 * useStudentClassroomsQuery  Fetch all sanctuaries joined by a student.
 */
export function useStudentClassroomsQuery(studentId?: string) {
  return useQuery({
    queryKey: ['student-classrooms', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const data = await classroomsAPI.getByStudent(studentId);
      return z.array(ClassroomSchema).parse(data);
    },
    enabled: !!studentId,
  });
}

/**
 * useTeacherStatsQuery  Aggregate stats for a teacher's dashboard.
 */
export function useTeacherStatsQuery(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-stats', teacherId],
    queryFn: async () => {
      if (!teacherId) return TeacherStatsSchema.parse({});
      return classroomsAPI.getTeacherStats(teacherId);
    },
    enabled: !!teacherId,
  });
}

/**
 * useStudentStatsQuery  Aggregate stats for a student's dashboard.
 */
export function useStudentStatsQuery(studentId?: string) {
  return useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: async () => {
      if (!studentId) return StudentStatsSchema.parse({});

      const classrooms = await classroomsAPI.getByStudent(studentId);

      return StudentStatsSchema.parse({
        active_sanctuaries: classrooms.length,
        goals_set: 3, // Logic placeholder
        growth_points: 0, // Should be fetched from useRewards in UI
      });
    },
    enabled: !!studentId,
  });
}

/**
 * useStudentAssignmentsQuery  Fetch upcoming quests for a student.
 */
export function useStudentAssignmentsQuery(studentId?: string) {
  return useQuery({
    queryKey: ['student-assignments', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      return assignmentsAPI.getUpcomingForStudent(studentId);
    },
    enabled: !!studentId,
  });
}
