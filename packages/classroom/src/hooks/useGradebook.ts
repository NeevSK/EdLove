import { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentGrade, ClassroomGradingSettings, api, ClassroomStudent } from '@repo/core';

export type SortOption = 'name' | 'marks' | 'rank';

export const useGradebook = (classroomId: string) => {
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [gradingSettings, setGradingSettings] = useState<ClassroomGradingSettings | null>(null);
    const [studentNames, setStudentNames] = useState<{ [studentId: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('rank');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [gradesData, settingsData, studentsData] = await Promise.all([
                api.grading.getClassroomGrades(classroomId),
                api.grading.getGradingSettings(classroomId),
                api.classroomStudents.getAll(classroomId)
            ]);

            setGrades(gradesData);
            setGradingSettings(settingsData);

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
                return sorted.sort((a, b) =>
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

    const submitGrade = async (
        studentId: string,
        marks: number,
        feedback?: string,
        assignmentId?: string,
    ) => {
        const saved = await api.grading.submitGrade(studentId, classroomId, marks, assignmentId, feedback);
        // Refresh grades so the table reflects the new entry
        setGrades(prev => {
            const idx = prev.findIndex(g => g.student_id === studentId && g.assignment_id === (assignmentId ?? null));
            return idx >= 0
                ? prev.map((g, i) => (i === idx ? saved : g))
                : [saved, ...prev];
        });
        return saved;
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
        submitGrade,
        refreshData: loadData,
    };
};
