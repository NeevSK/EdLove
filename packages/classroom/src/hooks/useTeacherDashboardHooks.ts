import { assignmentsAPI, classroomsAPI, echoAPI, interceptApiCall } from '@repo/core/api/client';
import {
  useTeacherClassroomsQuery,
  useTeacherStatsQuery,
} from '@repo/core/api/hooks/classroom.hooks';
import { type Assignment, type Echo, type TeacherStats, useAuthStore } from '@repo/core/logic';

import { useQuery } from '@tanstack/react-query';

/**
 * useTeacherRegistry: Unified hook for a teacher's sanctuary landscape.
 * Leverages typed oRPC v2 contracts for automatic cache invalidation and zero key mismatch.
 */
export function useTeacherRegistry() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  const stats = useTeacherStatsQuery(userId);
  const sanctuaries = useTeacherClassroomsQuery(userId);

  return {
    stats,
    sanctuaries,
    isLoading: stats.isLoading || sanctuaries.isLoading,
  };
}

/**
 * useTeacherAssignmentsPulse: Monitor active quests across all sanctuaries.
 */
export function useTeacherAssignmentsPulse() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  // Fetching from a unified view (Pulse) rather than per-classroom
  return useQuery<Assignment[]>({
    queryKey: ['teacher-assignments-pulse', userId],
    queryFn: async () => {
      // Fetch all classrooms first
      const classrooms = await classroomsAPI.getTeacherClassrooms(userId!);
      const allAssignments = await Promise.all(
        classrooms.map((c: any) => assignmentsAPI.getAll(c.id)),
      );
      return allAssignments.flat() as Assignment[];
    },
    enabled: !!userId,
  });
}

/**
 * useTeacherEchoesPulse: Listen to student resonance signals.
 */
export function useTeacherEchoesPulse() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<Echo[]>({
    queryKey: ['teacher-echoes', userId],
    queryFn: async () => {
      if (!userId) return [];
      const classrooms = await classroomsAPI.getTeacherClassrooms(userId);
      if (!classrooms || classrooms.length === 0) {
        const intercepted = interceptApiCall('echo', 'getTeacherEchoes', [userId]);
        return (intercepted ? await intercepted : []) as Echo[];
      }
      const allEchoes = await Promise.all(
        classrooms.map((c: any) => echoAPI.getEchoesByClassroom(c.id)),
      );
      const flat = allEchoes.flat();
      if (flat.length === 0) {
        const intercepted = interceptApiCall('echo', 'getTeacherEchoes', [userId]);
        return (intercepted ? await intercepted : []) as Echo[];
      }
      return flat as Echo[];
    },
    enabled: !!userId,
  });
}

/**
 * useTeacherTemporalSnapshot: View past and future snapshots.
 */
export function useTeacherTemporalSnapshot() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ['teacher-temporal-snapshot', userId],
    queryFn: async () => {
      if (!userId) return [];
      const intercepted = interceptApiCall('teacherDashboard', 'getTemporalSnapshot', [userId]);
      if (intercepted) {
        return intercepted;
      }
      return [];
    },
    enabled: !!userId,
  });
}

/**
 * Atomic invalidation for teacher dashboard pulse queries.
 */
export function invalidateTeacherPulseQueries(queryClient: any, userId?: string) {
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: ['teacher-assignments-pulse', userId] });
    void queryClient.invalidateQueries({ queryKey: ['teacher-echoes', userId] });
    void queryClient.invalidateQueries({ queryKey: ['teacher-temporal-snapshot', userId] });
  } else {
    void queryClient.invalidateQueries({ queryKey: ['teacher-assignments-pulse'] });
    void queryClient.invalidateQueries({ queryKey: ['teacher-echoes'] });
    void queryClient.invalidateQueries({ queryKey: ['teacher-temporal-snapshot'] });
  }
}

