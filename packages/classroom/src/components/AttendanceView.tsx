import React, { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@repo/ui';
import AttendanceSheet from './AttendanceSheet';
import { StudentAttendance } from '@repo/core';
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
            const data = await api.classroomStudents.getAll(classroomId);

            // Transform to Attendance format and set default status
            // TODO: In a real app, we would fetch *existing* attendance for today if available
            const attendanceData: StudentAttendance[] = data.map((student: ClassroomStudent) => ({
                id: student.id,
                student_id: student.student_id || student.id,
                full_name: student.full_name,
                roll_number: student.roll_number,
                status: 'present',
            }));

            setStudents(attendanceData);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
        // Sync local state
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
