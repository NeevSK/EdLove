import React, { useEffect, useState, useCallback } from 'react';
import { Box, Spinner, Text } from '@repo/ui';
import AttendanceSheet from './AttendanceSheet';
import { StudentAttendance, AttendanceStatus } from '@repo/core';
import { api } from '@repo/core';
import { Theme } from '@repo/ui';

interface AttendanceViewProps {
    classroomId: string;
}

export default function AttendanceView({ classroomId }: AttendanceViewProps) {
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Load student roster and any already-saved attendance for today in parallel
            const [roster, snapshot] = await Promise.all([
                api.classroomStudents.getAll(classroomId),
                api.attendance.getClassroomAttendanceSnapshot(classroomId, today || '')
                    .catch(() => ({ records: [] as { student_id: string; status: AttendanceStatus }[] })),
            ]);

            // Build a lookup map: student_id → saved status
            const savedStatus = new Map<string, AttendanceStatus>(
                (snapshot.records as { student_id: string; status: AttendanceStatus }[])
                    .map(r => [r.student_id, r.status])
            );

            const attendanceData: StudentAttendance[] = (roster as any[]).map(student => ({
                id: student.id,
                student_id: student.student_id || student.id,
                full_name: student.full_name || 'Unknown Student',
                roll_number: student.roll_number || null,
                // Restore saved status; default to 'present' for unmarked students
                status: (savedStatus.get(student.student_id || student.id) as any) ?? 'present',
            })) as StudentAttendance[];

            setStudents(attendanceData);
        } catch (Error) {
            console.error('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
        setStudents(updatedAttendance);
    };

    if (isLoading) {
        return (
            <Box sx={{ flex: 1, padding: 32, alignItems: 'center' }}>
                <Spinner color={Theme.colors.sanctuarySaffron} />
                <Text color={Theme.colors.textSecondary} sx={{ marginTop: 16 }}>Loading class list...</Text>
            </Box>
        );
    }

    if (students.length === 0 && !isLoading) {
        return (
            <Box sx={{ flex: 1, padding: 32, alignItems: 'center' }}>
                <Text color={Theme.colors.textSecondary}>No students found in this classroom.</Text>
            </Box>
        );
    }

    return (
        <AttendanceSheet
            classroomId={classroomId}
            initialStudents={students}
            onAttendanceChange={handleAttendanceChange}
        />
    );
}
