/**
 * AttendanceSheet Component
 * 
 * Fast, swipe-based attendance marking interface
 * - Swipe Right: Present (Green Check)
 * - Swipe Left: Absent (Red X)
 * - Long Press: Late (Yellow Clock)
 * - Default: All students marked as Present
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    FlatList,
    Pressable,
    Input,
    InputField,
} from "@/ui";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Check, X, Clock, Search } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';

// Types
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface StudentAttendance {
    id: string;
    student_id: string;
    full_name: string;
    roll_number?: number;
    status: AttendanceStatus;
}

interface AttendanceSheetProps {
    classroomId: string;
    date?: string;
    onAttendanceChange?: (attendance: StudentAttendance[]) => void;
}

// Status configuration
const STATUS_CONFIG = {
    present: {
        color: Theme.colors.sageGreen,
        icon: Check,
        label: 'Present',
    },
    absent: {
        color: Theme.colors.emberRed,
        icon: X,
        label: 'Absent',
    },
    late: {
        color: Theme.colors.amberGlow,
        icon: Clock,
        label: 'Late',
    },
};

export default function AttendanceSheet({
    classroomId,
    date = new Date().toISOString().split('T')[0],
    onAttendanceChange,
}: AttendanceSheetProps) {
    const colors = useThemedColors();
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch students and initialize with 'present' status
    useEffect(() => {
        fetchStudents();
    }, [classroomId]);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // Mock data for now
            const mockStudents = [
                { id: '1', student_id: 's1', full_name: 'Anura Kumara', roll_number: 1 },
                { id: '2', student_id: 's2', full_name: 'Sithum Silva', roll_number: 2 },
                { id: '3', student_id: 's3', full_name: 'Nimal Perera', roll_number: 3 },
            ];

            const studentsWithStatus: StudentAttendance[] = mockStudents.map((student) => ({
                ...student,
                status: 'present' as AttendanceStatus,
            }));

            setStudents(studentsWithStatus);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update student status with optimistic update
    const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
        hapticLight();
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId ? { ...student, status } : student
            )
        );

        // Notify parent component
        const updatedStudents = students.map((student) =>
            student.id === studentId ? { ...student, status } : student
        );
        onAttendanceChange?.(updatedStudents);
    };

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;

        const query = searchQuery.toLowerCase();
        return students.filter(
            (student) =>
                student.full_name.toLowerCase().includes(query) ||
                student.roll_number?.toString().includes(query)
        );
    }, [students, searchQuery]);

    // Count attendance statistics
    const stats = useMemo(() => {
        const present = students.filter((s) => s.status === 'present').length;
        const absent = students.filter((s) => s.status === 'absent').length;
        const late = students.filter((s) => s.status === 'late').length;
        return { present, absent, late, total: students.length };
    }, [students]);

    // Render swipeable student row
    const renderStudentRow = ({ item }: { item: StudentAttendance }) => {
        const StatusIcon = STATUS_CONFIG[item.status].icon;

        return (
            <Swipeable
                renderRightActions={() => (
                    <Box
                        sx={{
                            backgroundColor: STATUS_CONFIG.present.color,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                            borderRadius: Theme.corners.comfortable,
                            marginVertical: 4,
                        }}
                    >
                        <Check color={Theme.colors.white} size={24} />
                    </Box>
                )}
                renderLeftActions={() => (
                    <Box
                        sx={{
                            backgroundColor: STATUS_CONFIG.absent.color,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                            borderRadius: Theme.corners.comfortable,
                            marginVertical: 4,
                        }}
                    >
                        <X color={Theme.colors.white} size={24} />
                    </Box>
                )}
                onSwipeableRightOpen={() => updateStudentStatus(item.id, 'present')}
                onSwipeableLeftOpen={() => updateStudentStatus(item.id, 'absent')}
            >
                <Pressable
                    onLongPress={() => updateStudentStatus(item.id, 'late')}
                    delayLongPress={500}
                >
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                            marginVertical: 4,
                            borderLeftWidth: 4,
                            borderLeftColor: STATUS_CONFIG[item.status].color,
                        }}
                    >
                        <HStack space="md" alignItems="center" justifyContent="space-between">
                            <HStack space="md" alignItems="center" sx={{ flex: 1 }}>
                                {item.roll_number && (
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: Theme.corners.full,
                                            backgroundColor: colors.tertiary,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text color={colors.textSecondary} bold>
                                            {item.roll_number}
                                        </Text>
                                    </Box>
                                )}
                                <VStack sx={{ flex: 1 }}>
                                    <Text
                                        color={colors.text}
                                        size="md"
                                        bold
                                    >
                                        {item.full_name}
                                    </Text>
                                    <Text color={colors.textSecondary} size="xs">
                                        Swipe or long-press to mark
                                    </Text>
                                </VStack>
                            </HStack>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: STATUS_CONFIG[item.status].color,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <StatusIcon color={Theme.colors.white} size={20} />
                            </Box>
                        </HStack>
                    </Box>
                </Pressable>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                <VStack space="md" sx={{ flex: 1, padding: Theme.spacing.md }}>
                    {/* Header with stats */}
                    <Box>
                        <Heading color={colors.text} size="xl" mb="$2">
                            Attendance
                        </Heading>
                        <Text color={colors.textSecondary} size="sm" mb="$4">
                            {date}
                        </Text>

                        {/* Stats Row */}
                        <HStack space="sm" mb="$4">
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.present.color,
                                }}
                            >
                                <Text color={colors.textSecondary} size="xs">
                                    Present
                                </Text>
                                <Text color={colors.text} size="xl" bold>
                                    {stats.present}
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.absent.color,
                                }}
                            >
                                <Text color={colors.textSecondary} size="xs">
                                    Absent
                                </Text>
                                <Text color={colors.text} size="xl" bold>
                                    {stats.absent}
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.late.color,
                                }}
                            >
                                <Text color={colors.textSecondary} size="xs">
                                    Late
                                </Text>
                                <Text color={colors.text} size="xl" bold>
                                    {stats.late}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>

                    {/* Search Bar */}
                    <Box>
                        <Input
                            variant="outline"
                            size="md"
                            sx={{
                                backgroundColor: colors.secondary,
                                borderColor: Theme.colors.transparent,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Box sx={{ paddingLeft: Theme.spacing.sm }}>
                                <Search color={colors.textSecondary} size={20} />
                            </Box>
                            <InputField
                                placeholder="Search by name or roll number..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                color={colors.text}
                                placeholderTextColor={colors.textTertiary}
                            />
                        </Input>
                    </Box>

                    {/* Student List */}
                    <Box sx={{ flex: 1 }}>
                        {isLoading ? (
                            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text color={colors.textSecondary}>Loading students...</Text>
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text color={colors.textSecondary}>
                                    {searchQuery ? 'No students found' : 'No students in this class'}
                                </Text>
                            </Box>
                        ) : (
                            <FlatList
                                data={filteredStudents}
                                renderItem={renderStudentRow}
                                keyExtractor={(item: StudentAttendance) => item.id}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </Box>

                    {/* Legend */}
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <Text color={colors.textSecondary} size="xs" mb="$2">
                            Quick Actions:
                        </Text>
                        <VStack space="xs">
                            <HStack space="sm" alignItems="center">
                                <Text color={colors.text} size="xs">→</Text>
                                <Text color={colors.textSecondary} size="xs">
                                    Swipe Right = Present
                                </Text>
                            </HStack>
                            <HStack space="sm" alignItems="center">
                                <Text color={colors.text} size="xs">←</Text>
                                <Text color={colors.textSecondary} size="xs">
                                    Swipe Left = Absent
                                </Text>
                            </HStack>
                            <HStack space="sm" alignItems="center">
                                <Text color={colors.text} size="xs">⏱</Text>
                                <Text color={colors.textSecondary} size="xs">
                                    Long Press = Late
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </GestureHandlerRootView>
    );
}
