import { useState, useEffect, useCallback } from 'react';
import { classroomsAPI, handleAPIError, usePermissions, useMutationQueue } from '@repo/core';
import type { Classroom } from '@repo/core';

export function useClassroomProfile(classroomId: string) {
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(true);
    const { can, context: user } = usePermissions();
    
    // Editable only if current user is the teacher of THIS classroom via POA
    const isTeacher = classroom ? can('manage', 'Classroom', classroom as any) : false;
    const addToQueue = useMutationQueue(state => state.addToQueue);

    const fetchClassroom = useCallback(async () => {
        if (!classroomId) return;
        try {
            setLoading(true);
            const data = await classroomsAPI.getById(classroomId);
            setClassroom(data as any);
        } catch (error) {
            handleAPIError(error);
        } finally {
            setLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchClassroom();
    }, [fetchClassroom]);

    const refresh = useCallback(() => {
        return fetchClassroom();
    }, [fetchClassroom]);

    const updateField = async (field: keyof Classroom, value: any) => {
        if (!isTeacher || !classroom) return { success: false };

        setClassroom(prev => prev ? { ...prev, [field]: value } : null);

        addToQueue({
            type: 'UPDATE',
            scope: 'classroom',
            name: 'updateClassroomField',
            variables: { id: classroom.id, [field]: value }
        });

        try {
            await classroomsAPI.update(classroom.id, { [field]: value });
            return { success: true };
        } catch (error) {
            console.log('= Sync pending for classroom:', field);
            return { success: true, pending: true };
        }
    };

    return {
        classroom,
        loading,
        refresh,
        updateField,
        isEditable: isTeacher
    };
}
