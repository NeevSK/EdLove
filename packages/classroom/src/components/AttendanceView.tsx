import React, { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@repo/ui';
import AttendanceSheet from './AttendanceSheet';
import { StudentAttendance, AttendanceStatus } from '@repo/core';
import { api, ClassroomStudent } from '@repo/core';
import { Theme } from '@repo/ui';

interface AttendanceViewProps {
    classroomId: string;
}

export default function AttendanceView({ classroomId }: AttendanceViewProps) {
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
    }, [classroomId]);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Load student roster and any already-saved attendance for today in parallel
            const [roster, todayRecords] = await Promise.all([
                api.classroomStudents.getAll(classroomId),
                api.attendance.getByDate(classroomId, today)
                    .catch(() => [] as { student_id: string; status: AttendanceStatus }[]),
            ]);

            // Build a lookup map: student_id → saved status
            const savedStatus = new Map<string, AttendanceStatus>(
                (todayRecords as { student_id: string; status: AttendanceStatus }[])
                    .map(r => [r.student_id, r.status])
            );

            const attendanceData: StudentAttendance[] = (roster as ClassroomStudent[]).map(student => ({
                id: student.id,
                student_id: student.student_id || student.id,
                full_name: student.full_name,
                roll_number: student.roll_number,
                // Restore saved status; default to 'present' for unmarked students
                status: savedStatus.get(student.student_id || student.id) ?? 'present',
            }));

            setStudents(attendanceData);
        } catch (err) {
            setError('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    };

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

    if (error) {
        return (
            <Box sx={{ flex: 1, padding: 32, alignItems: 'center' }}>
                <Text color={Theme.colors.errorText}>{error}</Text>
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
