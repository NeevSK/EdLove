/**
 * AttendanceSheet Component
 * 
 * Fast, swipe-based attendance marking interface
 * - Swipe Right: Present (Green Check)
 * - Swipe Left: Absent (Red X)
 * - Long Press: Late (Yellow Clock)
 * - Default: All students marked as Present
 */

import React, { useEffect } from 'react';
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
} from '@repo/ui';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Check, X, Clock, Search } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { hapticLight } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useAttendance } from '../hooks/useAttendance';

// Types
import { AttendanceStatus } from '../types/attendance';
import type { StudentAttendance } from '../types/attendance';

interface AttendanceSheetProps {
    classroomId: string;
    date?: string;
    initialStudents?: StudentAttendance[];
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
    initialStudents = [],
    onAttendanceChange,
}: AttendanceSheetProps) {
    const colors = useThemedColors();
    const {
        students,
        setStudents,
        searchQuery,
        setSearchQuery,
        updateStudentStatus,
        filteredStudents,
        stats
    } = useAttendance(initialStudents);

    // We shouldn't need this local loading state if parent handles it, 
    // but if we do internal fetch, we might need it. 
    // For now let's keep it simple: if initialStudents is empty, we *could* fetch.
    // But useAttendance doesn't handle fetching.

    // Let's add a quick internal fetch effect here *only* if needed, 
    // or just rely on parent. BDD says "Parent passes data". 
    // I'll keep the internal fetch purely as a fallback for pure component testing/storybook.

    useEffect(() => {
        if (initialStudents.length === 0 && students.length === 0) {
            // Fallback mock fetch
            const mockStudents: StudentAttendance[] = [
                { id: '1', student_id: 's1', full_name: 'Anura Kumara', roll_number: '1', status: 'present' },
                { id: '2', student_id: 's2', full_name: 'Sithum Silva', roll_number: '2', status: 'present' },
                { id: '3', student_id: 's3', full_name: 'Nimal Perera', roll_number: '3', status: 'present' },
            ];
            setStudents(mockStudents);
        }
    }, [initialStudents, students.length, setStudents]);

    // Notify parent on change
    useEffect(() => {
        if (onAttendanceChange) {
            onAttendanceChange(students);
        }
    }, [students, onAttendanceChange]);

    const handleUpdateStatus = (id: string, status: AttendanceStatus) => {
        hapticLight();
        updateStudentStatus(id, status);
    };

    // Render swipeable student row
    const renderStudentRow = ({ item }: { item: StudentAttendance }) => {
        const status = item.status as keyof typeof STATUS_CONFIG;
        const StatusIcon = STATUS_CONFIG[status].icon;

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
                onSwipeableRightOpen={() => handleUpdateStatus(item.id, 'present')}
                onSwipeableLeftOpen={() => handleUpdateStatus(item.id, 'absent')}
            >
                <Pressable
                    onLongPress={() => handleUpdateStatus(item.id, 'late')}
                    delayLongPress={500}
                >
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: 16,
                            marginVertical: 4,
                            borderLeftWidth: 4,
                            borderLeftColor: (STATUS_CONFIG as any)[item.status].color,
                        }}
                    >
                        <HStack alignItems="center" justifyContent="space-between" sx={{ gap: 12 }}>
                            <HStack alignItems="center" sx={{ flex: 1, gap: 12 }}>
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
                                        <Text color={colors.textSecondary} sx={{ fontWeight: '700' }}>
                                            {item.roll_number}
                                        </Text>
                                    </Box>
                                )}
                                <VStack sx={{ flex: 1 }}>
                                    <Text
                                        color={colors.text}
                                        sx={{ fontSize: 16, fontWeight: '700' }}
                                    >
                                        {item.full_name}
                                    </Text>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                        Swipe or long-press to mark
                                    </Text>
                                </VStack>
                            </HStack>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: (STATUS_CONFIG as any)[status].color,
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
                <VStack sx={{ flex: 1, padding: 16, gap: 12 }}>
                    {/* Header with stats */}
                    <Box>
                        <Heading color={colors.text} sx={{ fontSize: 20, marginBottom: 8 }}>
                            Attendance
                        </Heading>
                        <Text color={colors.textSecondary} sx={{ fontSize: 14, marginBottom: 16 }}>
                            {date}
                        </Text>

                        {/* Stats Row */}
                        <HStack sx={{ gap: 8, marginBottom: 16 }}>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: 12,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.present.color,
                                }}
                            >
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                    Present
                                </Text>
                                <Text color={colors.text} sx={{ fontSize: 20, fontWeight: '700' }}>
                                    {stats.present}
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: 12,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.absent.color,
                                }}
                            >
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                    Absent
                                </Text>
                                <Text color={colors.text} sx={{ fontSize: 20, fontWeight: '700' }}>
                                    {stats.absent}
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.secondary,
                                    padding: 12,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: STATUS_CONFIG.late.color,
                                }}
                            >
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                    Late
                                </Text>
                                <Text color={colors.text} sx={{ fontSize: 20, fontWeight: '700' }}>
                                    {stats.late}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>

                    {/* Search Bar */}
                    <Box>
                        <Input
                            sx={{
                                backgroundColor: colors.secondary,
                                borderColor: Theme.colors.transparent,
                                borderRadius: Theme.corners.comfortable,
                                height: 48,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <Box sx={{ paddingLeft: 12 }}>
                                <Search color={colors.textSecondary} size={20} />
                            </Box>
                            <InputField
                                placeholder="Search by name or roll number..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                color={colors.text}
                                placeholderTextColor={colors.textTertiary}
                                sx={{ flex: 1 }}
                            />
                        </Input>
                    </Box>

                    {/* Student List */}
                    <Box sx={{ flex: 1 }}>
                        {filteredStudents.length === 0 ? (
                            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text color={colors.textSecondary}>
                                    {searchQuery ? 'No students found' : 'No students in this class'}
                                </Text>
                            </Box>
                        ) : (
                            <FlatList<StudentAttendance>
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
                            padding: 16,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <Text color={colors.textSecondary} sx={{ fontSize: 12, marginBottom: 8 }}>
                            Quick Actions:
                        </Text>
                        <VStack sx={{ gap: 4 }}>
                            <HStack alignItems="center" sx={{ gap: 8 }}>
                                <Text color={colors.text} sx={{ fontSize: 12 }}>→</Text>
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                    Swipe Right = Present
                                </Text>
                            </HStack>
                            <HStack alignItems="center" sx={{ gap: 8 }}>
                                <Text color={colors.text} sx={{ fontSize: 12 }}>←</Text>
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                    Swipe Left = Absent
                                </Text>
                            </HStack>
                            <HStack alignItems="center" sx={{ gap: 8 }}>
                                <Text color={colors.text} sx={{ fontSize: 12 }}>⏱</Text>
                                <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
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
