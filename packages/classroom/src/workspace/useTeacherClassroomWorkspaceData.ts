import { api } from '@repo/core/api/client';
import { useTeacherClassroom } from '@repo/core/hooks';
import { useWorkspaceLayoutSync } from '@repo/core/native/useWorkspaceLayoutSync';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

const NO_SURFACE_DEFINITIONS: [] = [];

/** Classroom reads use Query; layout edits use the shared durable patch protocol. */
export function useTeacherClassroomWorkspaceData(classroomId: string) {
  const classroomState = useTeacherClassroom(classroomId);
  const currentUserId = useAuthStore((state) => state.user?.id ?? '');
  const layoutState = useWorkspaceLayoutSync({
    workspaceId: classroomId,
    userId: currentUserId,
    surfaces: NO_SURFACE_DEFINITIONS,
  });
  const reads = useQuery({
    queryKey: ['teacher-classroom-workspace', currentUserId, classroomId],
    enabled: Boolean(currentUserId && classroomId),
    queryFn: async () => {
      const [assignments, lessons, materials, observations, notes] = await Promise.all([
        api.assignments.getAll(classroomId),
        api.lessons.getAll(classroomId),
        api.lessonMaterials.getAll(classroomId),
        api.teacherInsights.listStudentObservations(classroomId),
        api.classroomNotes.getAll(classroomId),
      ]);
      return { assignments, lessons, materials, observations, noteCount: notes.length };
    },
  });
  const assignments = reads.data?.assignments ?? [];
  const lessons = reads.data?.lessons ?? [];
  const materials = reads.data?.materials ?? [];
  const observations = reads.data?.observations ?? [];
  const noteCount = reads.data?.noteCount ?? 0;
  const refreshWorkspace = useCallback(async () => {
    await Promise.all([reads.refetch(), layoutState.refreshFromRemote()]);
  }, [reads.refetch, layoutState.refreshFromRemote]);

  return {
    ...classroomState,
    assignments,
    lessons,
    materials,
    noteCount,
    observations,
    summary: {
      studentCount: classroomState.students.length,
      assignmentCount: assignments.length,
      lessonCount: lessons.length,
      materialCount: materials.length,
      observationCount: observations.length,
      noteCount,
      concernCount: observations.filter(
        (item: { observation_type: string }) => item.observation_type === 'concern',
      ).length,
      positiveCount: observations.filter(
        (item: { observation_type: string }) => item.observation_type === 'positive',
      ).length,
    },
    workspaceError: reads.error ?? layoutState.syncError,
    layout: layoutState.layout,
    isLoading: classroomState.loading || reads.isLoading || !layoutState.isHydrated,
    refreshWorkspace,
    updateLayout: layoutState.saveSurfaceOrder,
  };
}
