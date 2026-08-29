import { api } from '@repo/core/api/client';
import { workspaceLayoutServices } from '@repo/core/api/runtimes/workspaceLayout.runtime';
import { useTeacherClassroom } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';
import type { WorkspaceLayoutRecord } from '@repo/core/logic/schemas/workspace-layout.schema';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

type TeacherObservation = Awaited<
  ReturnType<typeof api.teacherInsights.listStudentObservations>
>[number];

export function useTeacherClassroomWorkspaceData(classroomId: string) {
  const classroomState = useTeacherClassroom(classroomId);
  const currentUserId = useStore((state) => state.user?.id ?? '');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [observations, setObservations] = useState<TeacherObservation[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<Error | null>(null);
  const [layout, setLayout] = useState<WorkspaceLayoutRecord | null>(null);

  const layoutTarget = Platform.OS === 'web' ? 'web' : 'mobile';

  const refreshWorkspace = useCallback(async () => {
    if (!classroomId) {
      setAssignments([]);
      setLessons([]);
      setMaterials([]);
      setObservations([]);
      setNoteCount(0);
      setIsWorkspaceLoading(false);
      return;
    }

    setIsWorkspaceLoading(true);
    setWorkspaceError(null);

    try {
      const [assignmentData, lessonData, materialData, observationData, notes, layoutData] =
        await Promise.all([
          api.assignments.getAll(classroomId),
          api.lessons.getAll(classroomId),
          api.lessonMaterials.getAll(classroomId),
          api.teacherInsights.listStudentObservations(classroomId),
          api.classroomNotes.getAll(classroomId),
          workspaceLayoutServices.getLayout(currentUserId, classroomId, layoutTarget),
        ]);

      setAssignments(assignmentData || []);
      setLessons(lessonData || []);
      setMaterials(materialData || []);
      setObservations(observationData || []);
      setNoteCount(notes.length);
      setLayout(layoutData);
    } catch (error) {
      console.error('[useTeacherClassroomWorkspaceData] Failed to load workspace data:', error);
      setWorkspaceError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsWorkspaceLoading(false);
    }
  }, [classroomId, layoutTarget, currentUserId]);

  const updateLayout = useCallback(
    async (newOrder: string[]) => {
      if (!layout || !currentUserId) return;

      const updated = await workspaceLayoutServices.upsertLayout({
        userId: currentUserId,
        workspaceId: classroomId,
        layoutTarget,
        order: newOrder,
        hidden: layout.hidden,
        pinned: layout.pinned,
        zoneBySurface: layout.zone_by_surface as Record<string, string | number>,
        layoutVersion: layout.layout_version as 1,
        updatedAt: new Date().toISOString(),
      } as unknown as Parameters<typeof workspaceLayoutServices.upsertLayout>[0]);

      setLayout(updated);
    },
    [layout, classroomId, layoutTarget, currentUserId],
  );

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const summary = useMemo(() => {
    const concernCount = observations.filter((item) => item.observation_type === 'concern').length;
    const positiveCount = observations.filter(
      (item) => item.observation_type === 'positive',
    ).length;

    return {
      studentCount: classroomState.students.length,
      assignmentCount: assignments.length,
      lessonCount: lessons.length,
      materialCount: materials.length,
      observationCount: observations.length,
      concernCount,
      positiveCount,
      noteCount,
    };
  }, [
    assignments.length,
    classroomState.students.length,
    lessons.length,
    materials.length,
    noteCount,
    observations,
  ]);

  return {
    ...classroomState,
    assignments,
    lessons,
    materials,
    noteCount,
    observations,
    summary,
    workspaceError,
    layout,
    isLoading: classroomState.loading || isWorkspaceLoading,
    refreshWorkspace,
    updateLayout,
  };
}
