import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Classroom } from '../types';
import type { Student } from '../types';

/**
 * useTeacherClassroom: A sovereign hook for managing classroom data fetching and state.
 * Encapsulates the logic for loading a classroom's core data, students, and handling refreshes.
 */
export function useTeacherClassroom(classroomId: string) {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = useCallback(async () => {
        if (!classroomId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const [classData, studentData] = await Promise.all([
                api.classrooms.getById(classroomId),
                api.classroomStudents.getAll(classroomId),
            ]);
            
            setClassroom(classData as Classroom);
            setStudents((studentData as unknown as Student[]) || []);
        } catch (err) {
            console.error('[useTeacherClassroom] Failed to load data:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const refreshStudents = useCallback(async () => {
        try {
            const studentData = await api.classroomStudents.getAll(classroomId);
            setStudents(studentData as unknown as Student[]);
        } catch (err) {
            console.error('[useTeacherClassroom] Failed to refresh students:', err);
        }
    }, [classroomId]);

    return {
        classroom,
        students,
        loading,
        error,
        refresh: loadData,
        refreshStudents,
    };
}
