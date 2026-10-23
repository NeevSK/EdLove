import { gradingAPI, growthSignalsAPI, studentsAPI } from '@repo/core/api/client';
import type { GradeMark } from '@repo/core/logic/schemas/grade-domain.schema';
import { type ClassroomGradingSettings, type StudentGrade } from '@repo/core/types';
import { useStore } from '@repo/core/logic';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type SortOption = 'name' | 'marks' | 'rank';

/** Required scope for every GradeMark read/write. Never derive these from classroomId. */
export interface GradeMarkLifecycleContext {
  schoolId: string;
  academicCycleId: string;
  gradeClassId: string;
  termId: string;
  subjectId: string;
}

function toGradebookRow(mark: GradeMark): StudentGrade {
  // Compatibility view model for the existing table. The source remains GradeMark;
  // classroom_id is intentionally not synthesized because it is not the same identity.
  return {
    ...mark,
    marks: mark.marks_earned,
    grade: mark.letter_grade,
    publication_state: mark.publication_state,
  } as unknown as StudentGrade;
}

export const useGradebook = (
  classroomId: string,
  lifecycleContext?: GradeMarkLifecycleContext,
) => {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [studentNames, setStudentNames] = useState<{ [key: string]: string }>({});
  const [gradingSettings, setGradingSettings] = useState<ClassroomGradingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const currentUser = useStore((state) => state.user);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!lifecycleContext) {
        throw new Error(
          'Gradebook requires GradeMark lifecycle context: schoolId, academicCycleId, gradeClassId, termId, and subjectId.',
        );
      }
      const viewDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
      const [snapshot, studentsData] = await Promise.all([
        gradingAPI.getGradebookSnapshot(lifecycleContext, viewDate),
        studentsAPI.getAll(classroomId),
      ]);

      setGrades(snapshot.gradeMarks.map(toGradebookRow));
      setGradingSettings(snapshot.gradingSettings);

      const names: { [key: string]: string } = {};
      (studentsData as any[]).forEach((student: any) => {
        const idToUse = String(student.id);
        names[idToUse] = student.full_name || 'Student';
      });
      setStudentNames(names);
    } catch (err: any) {
      console.error('Failed to load gradebook data:', err);
      setError(err.message || 'Failed to load gradebook');
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, lifecycleContext]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSettings = async (settings: Omit<ClassroomGradingSettings, 'classroom_id'>) => {
    try {
      const updated = await gradingAPI.updateGradingSettings(classroomId, settings);
      const casted = updated as ClassroomGradingSettings;
      setGradingSettings(casted);
      return casted;
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      setError(err.message || 'Failed to update settings');
      throw err;
    }
  };

  const sortedGrades = useMemo(() => {
    const sorted = [...grades];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) =>
          (studentNames[a.student_id] || '').localeCompare(studentNames[b.student_id] || ''),
        );
      case 'marks':
        return sorted.sort((a, b) => b.marks - a.marks);
      case 'rank':
        return sorted.sort((a, b) => (a.rank || 999) - (b.rank || 999));
      default:
        return sorted;
    }
  }, [grades, sortBy, studentNames]);

  const stats = useMemo(() => {
    const total = grades.length;
    const average = total > 0 ? Math.round(grades.reduce((sum, g) => sum + g.marks, 0) / total) : 0;
    return { totalStudents: total, averageMarks: average };
  }, [grades]);

  const saveDraftGrade = async (
    studentId: string,
    marks: number,
    feedback?: string,
    assignmentId?: string,
    maxPoints?: number,
  ) => {
    if (!lifecycleContext) {
      throw new Error(
        'Saving a GradeMark requires GradeMark lifecycle context: schoolId, academicCycleId, gradeClassId, termId, and subjectId.',
      );
    }
    if (!maxPoints || maxPoints <= 0) {
      throw new Error('Saving a GradeMark requires maxPoints; no default scale is inferred from classroomId.');
    }

    const savedMark = await gradingAPI.saveGradeDraft(
      {
        ...lifecycleContext,
        studentId,
        marksEarned: marks,
        maxPoints,
        ...(assignmentId ? { assignmentId } : {}),
        ...(feedback ? { feedback } : {}),
      },
      {
        actorId: currentUser?.id,
        reason: 'grade_draft',
        accessKind: 'teacher_authoring',
      },
    );
    const saved = toGradebookRow(savedMark);
    // Refresh grades so the table reflects the new entry
    setGrades((prev) => {
      const idx = prev.findIndex(
        (g) => g.student_id === studentId && g.assignment_id === (assignmentId ?? null),
      );
      return idx >= 0 ? prev.map((g, i) => (i === idx ? saved : g)) : [saved, ...prev];
    });
    return saved;
  };

  const handleSave = async (gradingId: string, marks: number, feedback: string) => {
    if (!gradingId) return;
    await saveDraftGrade(gradingId, marks, feedback);
    if (currentUser?.id) {
      growthSignalsAPI.emitSilent({
        user_id: currentUser.id,
        event_type: 'assignment_graded',
        event_metadata: { classroom_id: classroomId },
      });
    }
  };

  const publishGrade = async (gradeId: string) => {
    const publishedMark = await gradingAPI.publishGrade(gradeId, {
      actorId: currentUser?.id,
      reason: 'grade_publish',
      accessKind: 'teacher_authoring',
    });
    const published = toGradebookRow(publishedMark);
    setGrades((prev) => prev.map((grade) => (grade.id === gradeId ? published : grade)));
    return published;
  };

  return {
    grades,
    studentNames,
    gradingSettings,
    isLoading,
    error,
    sortBy,
    setSortBy,
    sortedGrades,
    stats,
    updateSettings,
    submitGrade: handleSave,
    saveDraftGrade,
    publishGrade,
    refreshData: loadData,
  };
};
