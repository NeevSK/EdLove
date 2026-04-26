import { api, useTeacherClassroom } from '@repo/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

type TeacherObservation = Awaited<
  ReturnType<typeof api.teacherInsights.listStudentObservations>
>[number];

export function useTeacherClassroomWorkspaceData(classroomId: string) {
  const classroomState = useTeacherClassroom(classroomId);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [observations, setObservations] = useState<TeacherObservation[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<Error | null>(null);

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
      const [assignmentData, lessonData, materialData, observationData, notes] = await Promise.all([
        api.assignments.getAll(classroomId),
        api.lessons.getAll(classroomId),
        api.lessonMaterials.getAll(classroomId),
        api.teacherInsights.listStudentObservations(classroomId),
        api.classroomNotes.getAll(classroomId),
      ]);

      setAssignments(assignmentData || []);
      setLessons(lessonData || []);
      setMaterials(materialData || []);
      setObservations(observationData || []);
      setNoteCount(notes.length);
    } catch (error) {
      console.error('[useTeacherClassroomWorkspaceData] Failed to load workspace data:', error);
      setWorkspaceError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsWorkspaceLoading(false);
    }
  }, [classroomId]);

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
    isLoading: classroomState.loading || isWorkspaceLoading,
    refreshWorkspace,
  };
}
