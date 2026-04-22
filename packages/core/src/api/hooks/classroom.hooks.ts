import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { assignmentsAPI } from '../assignments';
import { classroomsAPI } from '../classrooms';
import {
  ClassroomSchema,
  StudentStatsSchema,
  TeacherStatsSchema,
} from '../schemas/classroom.schema';

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

      // 1. Get classroom IDs
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherId);

      const ids = classrooms?.map((c: any) => c.id) || [];

      // 2. Count total unique students
      const { count: studentCount } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .in('classroom_id', ids);

      // 3. Count pending assignments
      const today = new Date().toISOString().split('T')[0];
      const { count: assignmentCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .in('classroom_id', ids)
        .gte('due_date', today);

      return TeacherStatsSchema.parse({
        total_students: studentCount || 0,
        average_attendance: 94, // Placeholder until attendance system is logic-complete
        pending_assignments: assignmentCount || 0,
        active_classrooms: ids.length,
      });
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
