import {
  type ClassroomGradingSettings,
  gradingAPI,
  growthSignalsAPI,
  type StudentGrade,
  studentsAPI,
  useStore,
} from '@repo/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type SortOption = 'name' | 'marks' | 'rank';

export const useGradebook = (classroomId: string) => {
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
      const viewDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
      const [snapshot, studentsData] = await Promise.all([
        gradingAPI.getGradebookSnapshot(classroomId, viewDate),
        studentsAPI.getAll(classroomId),
      ]);

      setGrades(snapshot.grades);
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
  }, [classroomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSettings = async (settings: Omit<ClassroomGradingSettings, 'classroom_id'>) => {
    try {
      const updated = await gradingAPI.updateGradingSettings(classroomId, settings);
      setGradingSettings(updated);
      return updated;
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
  ) => {
    const saved = await gradingAPI.saveGradeDraft(
      studentId,
      classroomId,
      marks,
      assignmentId,
      feedback,
      {
        actorId: currentUser?.id,
        reason: 'grade_draft',
        accessKind: 'teacher_authoring',
      },
    );
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
    const published = await gradingAPI.publishGrade(gradeId, {
      actorId: currentUser?.id,
      reason: 'grade_publish',
      accessKind: 'teacher_authoring',
    });
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
