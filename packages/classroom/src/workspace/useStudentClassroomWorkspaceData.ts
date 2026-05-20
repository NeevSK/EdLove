import { api } from '@repo/core/api';
import { type Assignment, type Lesson, type LessonMaterial, useAuthStore } from '@repo/core/logic';
import type { Classroom } from '@repo/core/types';

import { useCallback, useEffect, useState } from 'react';

type StudentSubmissionSummary = Awaited<
  ReturnType<typeof api.assignments.getSubmissionHistoryForStudent>
>[number];

type StudentClassroomWorkspaceData = {
  classroom: Classroom | null;
  lessons: Lesson[];
  materials: LessonMaterial[];
  assignments: Assignment[];
  submissions: StudentSubmissionSummary[];
  noteCount: number;
  personalNoteCount: number;
};

const EMPTY_STATE: StudentClassroomWorkspaceData = {
  classroom: null,
  lessons: [],
  materials: [],
  assignments: [],
  submissions: [],
  noteCount: 0,
  personalNoteCount: 0,
};

export function useStudentClassroomWorkspaceData(classroomId: string) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const [data, setData] = useState<StudentClassroomWorkspaceData>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!classroomId) {
      setData(EMPTY_STATE);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [classroom, lessons, materials, assignments, notes, submissions] = await Promise.all([
        api['classrooms'].getById(classroomId),
        api['lessons'].getAll(classroomId),
        api['lessonMaterials'].getAll(classroomId),
        api['assignments'].getAll(classroomId),
        api['classroomNotes'].getAll(classroomId),
        userId
          ? api['assignments'].getSubmissionHistoryForStudent(userId, classroomId)
          : Promise.resolve([]),
      ]);

      setData({
        classroom: classroom as any,
        lessons: lessons as any,
        materials: materials as any,
        assignments: assignments as any,
        submissions: submissions as any,
        noteCount: notes.length,
        personalNoteCount: notes.filter(
          (note: { note_type?: string }) => note.note_type === 'personal',
        ).length,
      });
    } catch (err: any) {
      console.error('Failed to load student classroom workspace', err);
      setError(err?.message ?? 'Failed to load student classroom workspace');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submittedAssignmentIds = new Set(
    data.submissions.map((submission) => submission.assignment_id),
  );

  return {
    ...data,
    error,
    isLoading,
    pendingAssignments: data.assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment.id),
    ).length,
    recentSubmissions: data.submissions.slice(0, 3),
    submittedAssignmentIds,
    refresh,
  };
}
