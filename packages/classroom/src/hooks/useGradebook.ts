import { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentGrade, ClassroomGradingSettings, api, ClassroomStudent, useStore } from '@repo/core';

export type SortOption = 'name' | 'marks' | 'rank';

export const useGradebook = (classroomId: string) => {
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [gradingSettings, setGradingSettings] = useState<ClassroomGradingSettings | null>(null);
    const [studentNames, setStudentNames] = useState<{ [studentId: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('rank');
    const currentUser = useStore((state) => state.user);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const viewDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
            const [snapshot, studentsData] = await Promise.all([
                api.grading.getGradebookSnapshot(classroomId, viewDate),
                api.classroomStudents.getAll(classroomId)
            ]);

            setGrades(snapshot.grades);
            setGradingSettings(snapshot.gradingSettings);

            const names: { [key: string]: string } = {};
            studentsData.forEach((student: ClassroomStudent) => {
                const idToUse = student.student_id || student.id;
                names[idToUse] = student.full_name;
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
            const updated = await api.grading.updateGradingSettings(classroomId, settings);
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
                return sorted.sort((a, b) =
                    (studentNames[a.student_id] || '').localeCompare(
                        studentNames[b.student_id] || ''
                    )
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
        const average = total > 0
            ? Math.round(grades.reduce((sum, g) => sum + g.marks, 0) / total)
            : 0;
        return { totalStudents: total, averageMarks: average };
    }, [grades]);

    const saveDraftGrade = async (
        studentId: string,
        marks: number,
        feedback?: string,
        assignmentId?: string,
    ) => {
        const saved = await api.grading.saveGradeDraft(studentId, classroomId, marks, assignmentId, feedback, {
            actorId: currentUser?.id,
            reason: 'grade_draft',
            accessKind: 'teacher_authoring',
        });
        // Refresh grades so the table reflects the new entry
        setGrades(prev => {
            const idx = prev.findIndex(g => g.student_id === studentId && g.assignment_id === (assignmentId ?? null));
            return idx >= 0
                ? prev.map((g, i) => (i === idx ? saved : g))
                : [saved, ...prev];
        });
        return saved;
    };

    const publishGrade = async (gradeId: string) => {
        const published = await api.grading.publishGrade(gradeId, {
            actorId: currentUser?.id,
            reason: 'grade_publish',
            accessKind: 'teacher_authoring',
        });
        setGrades(prev => prev.map((grade) => (grade.id === gradeId ? published : grade)));
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
        submitGrade: saveDraftGrade,
        saveDraftGrade,
        publishGrade,
        refreshData: loadData,
    };
};
