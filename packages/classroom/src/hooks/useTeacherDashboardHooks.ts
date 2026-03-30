import { useQuery } from '@tanstack/react-query';
import { 
    useAuthStore, 
    TeacherStats,
    classroomsAPI,
    assignmentsAPI,
    Echo,
    Assignment
} from '@repo/core';

/**
 * useTeacherRegistry: Unified hook for a teacher's sanctuary landscape.
 */
export function useTeacherRegistry() {
    const user = useAuthStore(state => state.user);
    const userId = user?.id;

    const stats = useQuery<TeacherStats>({
        queryKey: ['teacher-stats', userId],
        queryFn: () => classroomsAPI.getTeacherStats(userId!),
        enabled: !!userId,
    });

    const sanctuaries = useQuery({
        queryKey: ['teacher-sanctuaries', userId],
        queryFn: () => classroomsAPI.getTeacherClassrooms(userId!),
        enabled: !!userId,
    });

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
    const user = useAuthStore(state => state.user);
    const userId = user?.id;

    // Fetching from a unified view (Pulse) rather than per-classroom
    return useQuery<Assignment[]>({
        queryKey: ['teacher-assignments-pulse', userId],
        queryFn: async () => {
            // Fetch all classrooms first
            const classrooms = await classroomsAPI.getTeacherClassrooms(userId!);
            const allAssignments = await Promise.all(
                classrooms.map(c => assignmentsAPI.getAll(c.id))
            );
            return allAssignments.flat();
        },
        enabled: !!userId,
    });
}

/**
 * useTeacherEchoesPulse: Listen to student resonance signals.
 */
export function useTeacherEchoesPulse() {
    const user = useAuthStore(state => state.user);
    const userId = user?.id;

    return useQuery<Echo[]>({
        queryKey: ['teacher-echoes', userId],
        queryFn: () => {
             // Mocking for now, as echoAPI is still being solidified 
             // but we have EchoSchema ready for it.
             return Promise.resolve([]);
        },
        enabled: !!userId,
    });
}

/**
 * useTeacherTemporalSnapshot: View past and future snapshots.
 */
export function useTeacherTemporalSnapshot() {
    const user = useAuthStore(state => state.user);
    const userId = user?.id;

    return useQuery({
        queryKey: ['teacher-temporal-snapshot', userId],
        queryFn: () => {
            // Logic for temporal snapshots across sanctuaries
            return Promise.resolve([]);
        },
        enabled: !!userId,
    });
}
