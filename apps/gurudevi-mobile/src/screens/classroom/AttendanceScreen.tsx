import React, { useEffect, useState } from 'react';
import { Box, VStack, Spinner, Text } from '@/ui';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '../../types/navigation';
import AttendanceSheet from '../../components/classroom/AttendanceSheet';
import { StudentAttendance } from '../../types/attendance';
import { api, ClassroomStudent } from '../../lib/api';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { useSafeMutation } from '../../hooks/useSafeMutation';
import { useStore } from '../../store/useStore';
import { hapticSuccess } from '../../utils/haptics';
import { Button, ButtonText } from '@/ui';

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
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();

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
            const attendanceData: StudentAttendance[] = data.map((student: ClassroomStudent) => ({
                id: student.id,
                student_id: student.student_id || student.id, // Use enrollment ID if student_id is null (shadow student)
                full_name: student.full_name,
                roll_number: student.roll_number,
                status: 'present', // Default to present as per BDD
            }));

            setStudents(attendanceData);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load student list');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = useStore(state => state.showToast);

    const saveMutation = useSafeMutation(
        async (updatedAttendance: StudentAttendance[]) => {
            const records = updatedAttendance.map(s => ({
                classroom_id: classroomId,
                student_id: s.id,
                status: s.status,
                date: new Date().toISOString().split('T')[0],
            }));
            return api.attendance.batchRecord(records);
        },
        {
            onSuccess: () => {
                hapticSuccess();
                showToast('Attendance saved successfully', 'success');
            },
            onError: (err) => {
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
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.voidIndigo }}>
                <Spinner color={Theme.colors.sanctuarySaffron} />
                <Text color={Theme.colors.pearlGray} mt="$4">Loading class list...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.voidIndigo }}>
                <Text color={Theme.colors.emberRed}>{error}</Text>
            </Box>
        );
    }

    return (
        <VStack sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <AttendanceSheet
                classroomId={classroomId}
                initialStudents={students}
                onAttendanceChange={handleAttendanceChange}
            />
            <Box p="$4" bg={Theme.colors.voidIndigo}>
                <Button
                    size="lg"
                    onPress={handleSave}
                    disabled={saveMutation.isLoading}
                    sx={{
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.comfortable
                    }}
                >
                    <ButtonText color="white" bold>
                        {saveMutation.isLoading ? 'Syncing...' : 'Complete Marking'}
                    </ButtonText>
                </Button>
            </Box>
        </VStack>
    );
}
