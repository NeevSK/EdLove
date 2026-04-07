import React, { useEffect, useState, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import AttendanceSheet from '../components/AttendanceSheet';
import { StudentAttendance, AttendanceStatus } from '@repo/core';
import { api, useStore, useSafeMutation, growthSignalsAPI } from '@repo/core';
import { Theme, hapticSuccess, Button, ButtonText, Spinner, Text, Box, VStack } from '@repo/ui';

type AttendanceScreenRouteProp = {
    key: string;
    name: "Attendance";
    params: {
        classroomId: string;
        classroomName: string;
    };
};

export default function AttendanceScreen() {
    const route = useRoute<AttendanceScreenRouteProp>();
    const { classroomId } = route.params;

    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            // Build a lookup map: student_id -> saved status
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
        } catch (err) {
            setError('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const showToast = useStore(state => state.showToast);
    const currentUser = useStore(state => state.user);

    const saveMutation = useSafeMutation(
        async (updatedAttendance: StudentAttendance[]) => {
            const records = updatedAttendance.map(s => ({
                classroom_id: classroomId,
                student_id: s.student_id, // Use student_id from StudentAttendance
                status: s.status,
                date: new Date().toISOString().split('T')[0] || '',
            }));
            return api.attendance.batchRecord(records, {
                actorId: currentUser?.id,
                reason: 'daily_roll_call',
                accessKind: 'teacher_marking',
            });
        },
        {
            onSuccess: () => {
                hapticSuccess();
                showToast('Attendance saved successfully', 'success');
                // Growth signal  fire-and-forget
                if (currentUser?.id) {
                    growthSignalsAPI.emitSilent(currentUser.id, 'attendance_marked', { classroom_id: classroomId });
                }
            },
            onError: (err: any) => {
                showToast(err.message || 'Failed to save attendance', 'error');
            }
        }
    );

    const handleAttendanceChange = (updatedAttendance: StudentAttendance[]) => {
        setStudents(updatedAttendance);
    };

    const handleSave = () => {
        saveMutation.mutate(students);
    };

    if (isLoading) {
        return (
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.ink }}>
                <Spinner color={Theme.colors.sanctuarySaffron} />
                <Text color={Theme.colors.starlightGray} sx={{ marginTop: 16 }}>Loading class list...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.ink }}>
                <Text color={Theme.colors.emberRed}>{error}</Text>
            </Box>
        );
    }

    return (
        <VStack sx={{ flex: 1, backgroundColor: Theme.colors.ink }}>
            <AttendanceSheet
                classroomId={classroomId}
                initialStudents={students}
                onAttendanceChange={handleAttendanceChange}
            />
            <Box sx={{ padding: 16, backgroundColor: Theme.colors.ink }}>
                <Button
                    onPress={handleSave}
                    disabled={saveMutation.isLoading}
                    sx={{
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.comfortable,
                        padding: 16,
                        minHeight: 56,
                        justifyContent: 'center'
                    }}
                >
                    <ButtonText color="white" sx={{ fontWeight: '700' }}>
                        {saveMutation.isLoading ? 'Syncing...' : 'Complete Marking'}
                    </ButtonText>
                </Button>
            </Box>
        </VStack>
    );
}
